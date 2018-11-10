<template lang="html">
  <report title="REPORTS.BALANCE.TITLE" color="danger" icon="fa-line-chart">
    <p class="subtitle is-5">{{ 'REPORTS.COMMON.TIME_SPAN' | translate}}</p>
    <div class="field has-addons">
      <div class="control">
        <a class="button is-primary is-tag">
          <icon fa="fa-calendar"/>
        </a>
      </div>
      <div class="control select is-primary">
        <select v-model="options.period" @change="throwPeriod()">
          <option v-for="time in timesSpan" :value="time.value">{{time.label | translate}}</option>
        </select>
      </div>
    </div>
    <p class="subtitle is-5">{{ 'REPORTS.COMMON.TIME_SPAN' | translate}}</p>
    <div class="field has-addons">
      <div class="control">
        <a class="button is-primary is-tag">
          <icon fa="fa-arrows-h"/>
        </a>
      </div>
      <div class="control select is-primary">
        <select v-model="options.aggreg" @change="throwAggreg()">
          <option v-for="aggreg in aggregTypes" :value="aggreg.value">{{aggreg.label | translate}}</option>
        </select>
      </div>
    </div>
    <hr>
    <p class="subtitle is-5">{{ 'REPORTS.COMMON.CUSTOM_TIME_SPAN' | translate}}</p>
    <div class="field columns">

      <div class="control field has-addons column">
        <div class="control">
          <a class="button is-primary is-tag">
            <icon fa="fa-calendar-minus-o"/>
          </a>
        </div>
        <div class="control" style="width: 10vw">
          <input class="input"
                 type="text"
                 v-model="firstCustomDate"
                 @change="throwCustom()"
                 @keydown.up="addOneDay('firstCustomDate')"
                 @keydown.down="subtractOneDay('firstCustomDate')"
                 :placeholder="'REPORTS.COMMON.PLACEHOLDERS.PICK_DATE' | translate">
        </div>
      </div>
      <div class="control field has-addons column">
        <div class="control">
          <a class="button is-primary is-tag">
            <icon fa="fa-calendar-plus-o"/>
          </a>
        </div>
        <div class="control" style="width: 10vw">
          <input class="input"
                 type="text"
                 v-model="lastCustomDate"
                 @change="throwCustom()"
                 @keydown.up="addOneDay('lastCustomDate')"
                 @keydown.down="subtractOneDay('lastCustomDate')"
                 :placeholder="'REPORTS.COMMON.PLACEHOLDERS.PICK_DATE' | translate">
        </div>
      </div>

    </div>
  </report>
</template>

<script>
  import icon from '@/components/common/icon'
  import report from '@/reports/components/report'

  import { ipcRenderer } from 'electron'
  import Database from '@/assets/Database.class'
  import chartJS from 'chart.js' // eslint-disable-line
  import moment from 'moment'
  import Vue from 'vue'
  import Migrator from '../../util/migrator'

  // Use datepart SQL to filter by week / month / day / quarter /
  // https://docs.microsoft.com/en-us/sql/t-sql/functions/datepart-transact-sql?view=sql-server-2017

  const colors = [ // eslint-disable-line
    {backgroundColor: 'rgba(50, 115, 221,0.2)', borderColor: '#3273dc'},
    {backgroundColor: 'rgba(50, 221, 72, 0.2)', borderColor: '#32dd61'},
    {backgroundColor: 'rgba(221, 188, 50, 0.2)', borderColor: '#d9dd32'},
    // {backgroundColor: 'rgba(221, 50, 50, 0.2)', borderColor: '#dd3232'},
    {backgroundColor: 'rgba(125, 50, 221, 0.2)', borderColor: '#5e32dd'}
  ]

  export default {
    components: {icon, report},
    data: function () {
      return {
        db: null,
        myChart: null,
        firstCustomDate: null,
        lastCustomDate: null,
        accounts: [],
        options: {
          period: 'thismonth',
          aggreg: 'W',
          firstDate: moment().startOf('month').format('YYYY-MM-DD'),
          lastDate: moment().endOf('month').format('YYYY-MM-DD'),
          allDates: false
        },
        aggregTypes: [
          {value: 'Y', label: 'TIME.Y'},
          {value: 'W', label: 'TIME.W'},
          {value: 'm', label: 'TIME.M'}
        ],
        timesSpan: [
          {value: 'thismonth', label: 'TIME.TM'},
          {value: 'lastmonth', label: 'TIME.LM'},
          {value: 'thisquarter', label: 'TIME.TQ'},
          {value: 'lastquarter', label: 'TIME.LQ'},
          {value: 'thisyear', label: 'TIME.TY'},
          {value: 'lastyear', label: 'TIME.LY'},
          {value: '', label: 'TIME.*'}
        ],
        config: {
          type: 'line',
          data: {datasets: []},
          options: {
            legend: {
              position: 'bottom'
            },
            fill: 'bottom',
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  parser: this.$root.settings.dateFormat,
                  tooltipFormat: this.$root.settings.dateFormat
                },
                scaleLabel: {
                  display: true,
                  labelString: Vue.filter('translate')('CHART.DATE')
                }
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: Vue.filter('translate')('CHART.VALUE')
                }
              }]
            }
          }
        }
      }
    },
    methods: {
      getAccounts: function (vm) {
        return new Promise(function (resolve, reject) {
          vm.accounts = []
          let dbAccounts = null
          try {
            dbAccounts = vm.db.exec('SELECT * FROM Accounts')
          } catch (e) {
            dbAccounts = []
          } finally {
            for (let i = 0; i < dbAccounts.length; i++) {
              vm.accounts.push(dbAccounts[i])
            }
            resolve(vm)
          }
        })
      },

      updateConfig: function () {
        this.firstCustomDate = moment(this.options.firstDate, 'YYYY-MM-DD').format(this.$root.settings.dateFormat)
        this.lastCustomDate = moment(this.options.lastDate, 'YYYY-MM-DD').format(this.$root.settings.dateFormat)
        let tmpColors
        for (let i = 0; i < this.accounts.length; i++) {
          let data = null
          try {
            if (this.options.allDates) {
              data = this.db.exec(`SELECT date, SUM(amount) as amount FROM OPERATION WHERE account_name="${this.accounts[i].name}" GROUP BY strftime('%${this.options.aggreg}', date)`)
            } else {
              data = this.db.exec(`SELECT date, SUM(amount) as amount FROM OPERATION WHERE account_name="${this.accounts[i].name}" AND date BETWEEN "${this.options.firstDate}" AND "${this.options.lastDate}" GROUP BY strftime('%${this.options.aggreg}', date)`)
            }
          } catch (e) {
            data = [{date: moment().format('YYYY-MM-DD'), amount: 0}]
          } finally {
            tmpColors = this.getColors()
            if (typeof this.config.data.datasets[i] === 'undefined') {
              this.config.data.datasets.push({
                label: this.accounts[i].name,
                backgroundColor: tmpColors.backgroundColor,
                borderColor: tmpColors.borderColor,
                borderWidth: 1,
                data: []
              })
            } else {
              this.config.data.datasets[i].data = []
            }
            for (let j = 0; j < data.length; j++) {
              this.config.data.datasets[i].data.push({
                x: moment(data[j].date, 'YYYY-MM-DD').format(this.$root.settings.dateFormat),
                y: data[j].amount.toFixed(2)
              })
            }
            while (this.config.data.datasets[i].data.length !== data.length) {
              this.config.data.datasets[i].data.pop()
            }
          }
        }
      },

      throwPeriod: function () {
        this.options.allDates = false
        switch (this.options.period) {
          case 'thismonth':
            this.options.firstDate = moment().startOf('month').format('YYYY-MM-DD')
            this.options.lastDate = moment().endOf('month').format('YYYY-MM-DD')
            break
          case 'lastmonth':
            this.options.firstDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
            this.options.lastDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
            break
          case 'thisquarter':
            this.options.firstDate = moment().startOf('quarter').format('YYYY-MM-DD')
            this.options.lastDate = moment().endOf('quarter').format('YYYY-MM-DD')
            break
          case 'lastquarter':
            this.options.firstDate = moment().subtract(1, 'quarter').startOf('quarter').format('YYYY-MM-DD')
            this.options.lastDate = moment().subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD')
            break
          case 'thisyear':
            this.options.firstDate = moment().startOf('year').format('YYYY-MM-DD')
            this.options.lastDate = moment().endOf('year').format('YYYY-MM-DD')
            break
          case 'lastyear':
            this.options.firstDate = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD')
            this.options.lastDate = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD')
            break
          default:
            this.options.allDates = true
        }
        this.updateConfig()
        this.myChart.update()
      },

      throwAggreg: function () {
        this.updateConfig()
        this.myChart.update()
      },

      throwCustom: function () {
        this.options.firstDate = moment(this.firstCustomDate, this.$root.settings.dateFormat).format('YYYY-MM-DD')
        this.options.lastDate = moment(this.lastCustomDate, this.$root.settings.dateFormat).format('YYYY-MM-DD')
        this.updateConfig()
        this.myChart.update()
      },

      addOneDay: function (date) {
        this[date] = moment(this[date], this.$root.settings.dateFormat).add(1, 'days').format(this.$root.settings.dateFormat)
        this.throwCustom()
      },

      subtractOneDay: function (date) {
        this[date] = moment(this[date], this.$root.settings.dateFormat).subtract(1, 'days').format(this.$root.settings.dateFormat)
        this.throwCustom()
      },

      getColors: function () {
        const tmp = colors.shift()
        colors.push(tmp)
        return tmp
      }
    },
    mounted: function () {
      const ctx = document.getElementById('myChart')

      if (!this.$root.settings.lastfile) {
        this.db = new Database()
      } else {
        try {
          this.db = new Database(this.$root.settings.lastfile)
        } catch (e) {
          console.warn(e.message)
          this.db = new Database()
        }
      }
      // TODO only on app start
      Migrator.migrate(this.db)
      this.getAccounts(this).then(function (vm) {
      })
      this.updateConfig()
      if (this.$root.settings.theme === 'dark') {
        this.config.options.legend.labels = {fontColor: 'rgb(237, 237, 237)'}
      }
      this.myChart = new Chart(ctx, this.config) // eslint-disable-line
      ipcRenderer.send('open-report', 'balanceWin')
    }
  }
</script>
