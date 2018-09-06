<template lang="html">
  <report title="REPORTS.CHRONO.TITLE" color="primary" icon="fa-area-chart">
    <span>{{ 'REPORTS.COMMON.TIME_SPAN' | translate }}:</span>
    <div class="field has-addons">
      <div class="control">
        <a class="button is-primary is-tag"><icon fa="fa-calendar"/></a>
      </div>
      <div class="control select is-primary">
        <select v-model="options.period" @change="throwPeriod()">
          <option v-for="time in timesSpan" :value="time.value">{{time.label | translate}}</option>
        </select>
      </div>
    </div>
    <input id="floorData" type="checkbox" name="floorData" class="switch is-rounded" v-model="options.floor" @change="throwFloor()">
    <label for="floorData">{{ 'REPORTS.CHRONO.FLOOR_DATA' | translate}}</label>
    <hr>
    <p class="subitle is-5">{{ 'REPORTS.COMMON.CUSTOM_TIME_SPAN' | translate }}:</p>
    <div class="field columns">
      <div class="control field has-addons column">
        <div class="control">
          <a class="button is-primary is-tag"><icon fa="fa-calendar-minus-o"/></a>
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
          <a class="button is-primary is-tag"><icon fa="fa-calendar-plus-o"/></a>
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
import path from 'path'
import Vue from 'vue'

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
  components: { icon, report },
  data: function () {
    return {
      db: null,
      myChart: null,
      firstCustomDate: null,
      lastCustomDate: null,
      accounts: [],
      options: {
        floor: false,
        period: 'thismonth',
        firstDate: moment().startOf('month').format('YYYY-MM-DD'),
        lastDate: moment().endOf('month').format('YYYY-MM-DD'),
        allDates: false
      },
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
      let chartFirstDate
      let lastDate
      for (let i = 0; i < this.accounts.length; i++) {
        let data = null
        try {
          if (this.options.allDates) {
            data = this.db.exec(`SELECT date as 'date', amount FROM ChronoBase WHERE account="${this.accounts[i].name}" GROUP BY date`)
          } else {
            data = this.db.exec(`SELECT date as 'date', amount FROM ChronoBase WHERE account="${this.accounts[i].name}" AND date BETWEEN "${this.options.firstDate}" AND "${this.options.lastDate}" GROUP BY date`)
          }
        } catch (e) {
          data = [{date: moment().format('YYYY-MM-DD'), amount: 0}]
        } finally {
          tmpColors = this.getColors()
          chartFirstDate = moment(data[0].date, 'YYYY-MM-DD').isAfter(moment(this.options.firstDate, 'YYYY-MM-DD')) ? data[0].date : this.options.firstDate
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
          let negative = false
          for (let j = 0; j < data.length; j++) {
            this.config.data.datasets[i].data.push({
              x: moment(data[j].date, 'YYYY-MM-DD').format(this.$root.settings.dateFormat),
              y: data[j].amount.toFixed(2)
            })
            if (data[j].amount < 0) {
              negative = true
              this.options.floor = (data[j].amount < 0) ? true : this.options.floor
              // TODO: disable floor !
            } else if (!negative) {
              // TODO: enable floor !
            }
            lastDate = data[j].date
          }
          while (this.config.data.datasets[i].data.length !== data.length) {
            this.config.data.datasets[i].data.pop()
          }
        }
      }
      let alreadyWarning = false
      for (var i = 0; i < this.config.data.datasets.length; i++) {
        if (this.config.data.datasets[i].label === Vue.filter('translate')('REPORTS.CHRONO.WARNING_ZONE')) {
          alreadyWarning = true
        }
      }

      for (i = 0; i < this.config.data.datasets.length; i++) {
        for (var j = 0; j < this.config.data.datasets[i].data.length; j++) {
          chartFirstDate = (moment(this.config.data.datasets[i].data[j].x, this.$root.settings.dateFormat).isBefore(moment(chartFirstDate, 'YYYY-MM-DD'))) ? moment(this.config.data.datasets[i].data[j].x, this.$root.settings.dateFormat).format('YYYY-MM-DD') : chartFirstDate
          lastDate = (moment(this.config.data.datasets[i].data[j].x, this.$root.settings.dateFormat).isAfter(moment(lastDate, 'YYYY-MM-DD'))) ? moment(this.config.data.datasets[i].data[j].x, this.$root.settings.dateFormat).format('YYYY-MM-DD') : lastDate
        }
      }

      if (this.options.floor && !alreadyWarning) {
        this.options.floor = true
        this.config.data.datasets.push({
          label: Vue.filter('translate')('REPORTS.CHRONO.WARNING_ZONE'),
          backgroundColor: 'rgba(221, 50, 50, 0.2)',
          borderColor: '#dd3232',
          borderWidth: 1,
          pointRadius: 0,
          fill: 'bottom',
          data: [
            {x: moment(chartFirstDate, 'YYYY-MM-DD').format(this.$root.settings.dateFormat), y: 0},
            {x: moment(lastDate, 'YYYY-MM-DD').format(this.$root.settings.dateFormat), y: 0}
          ]
        })
      } else {
        for (i = 0; i < this.config.data.datasets.length; i++) {
          if (this.config.data.datasets[i].label === Vue.filter('translate')('REPORTS.CHRONO.WARNING_ZONE')) {
            this.config.data.datasets.pop()
            this.options.floor = false
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

    throwCustom: function () {
      this.options.firstDate = moment(this.firstCustomDate, this.$root.settings.dateFormat).format('YYYY-MM-DD')
      this.options.lastDate = moment(this.lastCustomDate, this.$root.settings.dateFormat).format('YYYY-MM-DD')
      this.updateConfig()
      this.myChart.update()
    },

    throwFloor: function () {
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
    const dbPath = path.join(__static, 'data/template.sqlite')
    const ctx = document.getElementById('myChart')

    if (!this.$root.settings.lastfile) {
      this.db = new Database(dbPath)
    } else {
      try {
        this.db = new Database(this.$root.settings.lastfile)
      } catch (e) {
        console.warn(e.message)
        this.db = new Database(dbPath)
      }
    }
    this.getAccounts(this)
    // <!-- HERE -->
    this.updateConfig()
    if (this.$root.settings.theme === 'dark') {
      this.config.options.legend.labels = {fontColor: 'rgb(237, 237, 237)'}
    }
    this.myChart = new Chart(ctx, this.config) // eslint-disable-line
    ipcRenderer.send('open-report', 'chronoWin')
  }
}
</script>
