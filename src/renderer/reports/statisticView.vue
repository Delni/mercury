<template lang="html">
  <report title="REPORTS.STATISTIC.TITLE" color="warning" icon="chart-pie">
      <div class="columns">
        <span class="column">
          {{ 'REPORTS.STATISTIC.DISPLAY' | translate}}
          <toggle-button
              :test="options.type === 'doughnut'"
              :callback="toggleType"
              icon-left="chart-pie"
              icon-right="chart-bar"/>
        </span>
        <span class="column">
          {{ 'REPORTS.STATISTIC.ORDER' | translate}}
          <toggle-button
              :test="options.order === 's'"
              :callback="toggleOrder"
              icon-left="sort-numeric-up"
              icon-right="sort-alpha-up"/>
        </span>
        <span class="column">
          {{ 'REPORTS.STATISTIC.LEGEND' | translate}}
          <toggle-button
              :test="options.percent"
              :callback="toggleLegend"
              icon-left="percent"
              icon-right="hashtag"/>
        </span>
      </div>
      <label for="nb-cat">{{ 'REPORTS.STATISTIC.CATEGORIES' | translate}} ({{options.nbCat}}) :</label>
      <input class="progress" type="range" name="nb-cat" v-model="options.nbCat" min="3" max="12" @change="throwCategories()">
      <span>{{'REPORTS.COMMON.TIME_SPAN' | translate}}:</span>
      <div class="field has-addons">
        <div class="control">
          <a class="button is-primary is-tag"><font-awesome-icon icon="calendar"/></a>
        </div>
        <div class="control select is-primary">
          <select v-model="period" @change="throwPeriod()">
            <option v-for="time in timesSpan" :value="time.value">{{time.label | translate}}</option>
          </select>
        </div>
      </div>
      <div class="field">
        <input id="appendPrevious" type="checkbox" name="appendPrevious" class="switch is-rounded" v-model="options.previous" @change="throwPrevious()">
        <label for="appendPrevious">{{ 'REPORTS.STATISTIC.PREVIOUS' | translate}}</label>
      </div>
  </report>
</template>

<script>
import toggleButton from '@/reports/components/toggleButton'
import report from '@/reports/components/report'

import { ipcRenderer } from 'electron'
import Database from '@/assets/Database.class'
import chartJS from 'chart.js' // eslint-disable-line
import moment from 'moment'
import path from 'path'
import Vue from 'vue'

export default {
  components: { toggleButton, report },
  data: function () {
    return {
      db: null,
      myChart: null,
      accounts: [],
      period: 'thismonth',
      options: {
        nbCat: 6,
        period: 'month',
        periodOffset: 0,
        firstDate: moment().startOf('month').format('YYYY-MM-DD'),
        lastDate: moment().endOf('month').format('YYYY-MM-DD'),
        allDates: false,
        order: 's',
        percent: true,
        previous: false,
        type: 'doughnut'
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
        type: 'doughnut',
        data: {
          datasets: [{
            data: null,
            backgroundColor: [
              'rgba(20, 91, 213, 0.8)',
              'rgba(0, 209, 178, 0.8)',
              'rgba(41, 235, 0, 0.8)',
              'rgba(177, 249, 0, 0.8)',
              'rgba(255, 248, 0, 0.8)',
              'rgba(255, 206, 0, 0.8)',
              'rgba(255, 164, 0, 0.8)',
              'rgba(255, 106, 0, 0.8)',
              'rgba(241, 0, 77, 0.8)',
              'rgba(205, 1, 212, 0.8)',
              'rgba(101, 19, 215, 0.8)',
              'rgba(62, 27, 217, 0.8)'
            ],
            borderWidth: 0,
            label: 'Dataset 1'
          }],
          labels: null
        },
        options: {
          responsive: true,
          legend: {
            position: 'bottom'
          },
          title: {
            display: false
          },
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      }
    }
  },
  methods: {
    toggleType: function () {
      const ctx = document.getElementById('myChart')
      if (this.myChart) {
        this.myChart.destroy()
      }

      if (this.options.type === 'doughnut') {
        this.options.type = 'bar'
      } else {
        this.options.type = 'doughnut'
      }

      let tmp = Vue.util.extend({}, this.config)
      tmp.type = this.options.type
      if (this.options.type === 'doughnut') {
        delete tmp.options.scales
      } else {
        tmp.options.scales = {
          xAxes: [{display: false}]
        }
      }
      this.config = tmp
      this.myChart = new Chart(ctx, tmp) // eslint-disable-line
    },

    toggleOrder: function () {
      if (this.options.order === 's') {
        this.options.order = 'category'
      } else {
        this.options.order = 's'
      }
      if (this.myChart !== null) {
        this.updateConfig()
        this.myChart.update()
      }
    },

    toggleLegend: function () {
      this.options.percent = !this.options.percent
      if (this.myChart !== null) {
        this.updateConfig()
        this.myChart.update()
      }
    },

    throwPrevious: function () {
      if (this.myChart !== null) {
        this.updateConfig()
        this.myChart.update()
      }
    },

    throwCategories: function () {
      if (this.myChart !== null) {
        this.updateConfig()
        this.myChart.update()
      }
      ipcRenderer.send('slider-display', this.options.nbCat)
    },

    throwPeriod: function () {
      this.options.allDates = false
      switch (this.period) {
        case 'thismonth':
          this.options.period = 'month'
          this.options.periodOffset = 0
          break
        case 'lastmonth':
          this.options.period = 'month'
          this.options.periodOffset = 1
          break
        case 'thisquarter':
          this.options.period = 'quarter'
          this.options.periodOffset = 0
          break
        case 'lastquarter':
          this.options.period = 'quarter'
          this.options.periodOffset = 1
          break
        case 'thisyear':
          this.options.period = 'year'
          this.options.periodOffset = 0
          break
        case 'lastyear':
          this.options.period = 'year'
          this.options.periodOffset = 1
          break
        default:
          this.options.allDates = true
      }
      this.options.firstDate = moment().startOf(this.options.period).format('YYYY-MM-DD')
      this.options.lastDate = moment().endOf(this.options.period).format('YYYY-MM-DD')
      this.updateConfig()
      this.myChart.update()
    },

    updateConfig: function () {
      let dataDb
      const lowDate = moment(this.options.firstDate, 'YYYY-MM-DD').subtract(this.options.periodOffset, this.options.period).format('YYYY-MM-DD')
      const highDate = moment(this.options.lastDate, 'YYYY-MM-DD').subtract(this.options.periodOffset, this.options.period).format('YYYY-MM-DD')
      try {
        if (this.options.allDates) {
          dataDb = this.db.exec(`SELECT * FROM (SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 GROUP BY category ORDER BY s LIMIT ${this.options.nbCat}) ORDER BY ${this.options.order} ASC`)
        } else {
          dataDb = this.db.exec(`SELECT * FROM (SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 AND date BETWEEN "${lowDate}" AND "${highDate}" GROUP BY category ORDER BY s LIMIT ${this.options.nbCat}) ORDER BY ${this.options.order} ASC`)
        }
      } catch (e) {
        console.warn(e)
        dataDb = {s: 1, category: 'No data to display'}
      } finally {
        const data = []
        const labels = []
        let max = 0
        for (let i = 0; i < dataDb.length; i++) {
          if (this.options.percent) {
            max += -dataDb[i].s.toFixed(2)
          }
        }
        for (let i = 0; i < dataDb.length; i++) {
          data.push(-dataDb[i].s.toFixed(2))
          const legend = this.options.percent ? (-dataDb[i].s.toFixed(2) / max * 100).toFixed(2) + '%' : -dataDb[i].s.toFixed(2)
          labels.push(((dataDb[i].category === '') ? Vue.filter('translate')('OTHER') : dataDb[i].category) + ` (${legend})`)
        }
        this.config.data.labels = labels
        this.config.data.datasets[0].data = data

        if (this.options.previous) {
          const dataDb2 = []
          const data2 = []
          const lowDate = moment(this.options.firstDate, 'YYYY-MM-DD').subtract(1 + this.options.periodOffset, this.options.period).format('YYYY-MM-DD')
          const highDate = moment(this.options.lastDate, 'YYYY-MM-DD').subtract(1 + this.options.periodOffset, this.options.period).format('YYYY-MM-DD')
          for (let i = 0; i < dataDb.length; i++) {
            try {
              dataDb2.push(this.db.exec(`SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 AND category="${dataDb[i].category}" AND date BETWEEN "${lowDate}" AND "${highDate}" GROUP BY category ORDER BY ${this.options.order} ASC LIMIT ${this.options.nbCat}`)[0])
            } catch (e) {
              console.warn(e)
              dataDb2.push({s: 0, category: `${dataDb[i].category}`})
            }
          }
          for (let i = 0; i < dataDb2.length; i++) {
            data2.push(-dataDb2[i].s.toFixed(2))
          }
          const dataset2 = {
            data: data2,
            backgroundColor: [
              'rgba(20, 91, 213, 0.5)',
              'rgba(0, 209, 178, 0.5)',
              'rgba(41, 235, 0, 0.5)',
              'rgba(177, 249, 0, 0.5)',
              'rgba(255, 248, 0, 0.5)',
              'rgba(255, 206, 0, 0.5)',
              'rgba(255, 164, 0, 0.5)',
              'rgba(255, 106, 0, 0.5)',
              'rgba(241, 0, 77, 0.5)',
              'rgba(205, 1, 212, 0.5)',
              'rgba(101, 19, 215, 0.5)',
              'rgba(62, 27, 217, 0.5)'
            ],
            borderWidth: 0,
            hoverBorderColor: 'rgba(0,0,0,0)',
            hoverBorderWidth: 10,
            label: 'Dataset 2'
          }
          this.config.data.datasets[1] = dataset2
        } else {
          if (typeof this.config.data.datasets[1] !== 'undefined') {
            this.config.data.datasets.pop()
          }
        }
      }
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
    this.updateConfig()
    if (this.$root.settings.theme === 'dark') {
      this.config.options.legend.labels = {fontColor: 'rgb(237, 237, 237)'}
    }
    this.myChart = new Chart(ctx, this.config) // eslint-disable-line

    ipcRenderer.on('slider-input', (event, arg) => {
      this.options.nbCat = arg
      this.updateConfig()
      this.myChart.update()
    })

    ipcRenderer.on('toggle-time-span', (event, args) => {
      this.period = this.timesSpan[args].value
      this.throwPeriod()
    })

    ipcRenderer.send('open-report', 'statisticWin')
  }
}
</script>
