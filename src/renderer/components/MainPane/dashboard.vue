<template lang="html">
  <div class="tile ancestor notification is-dark is-paddingless">
    <div class="tile is-parent is-vertical" style="padding-bottom: 0">
      <div class="tile is-child is-vertical notification hero is-black">
        <div class="level is-marginless hero-head">
          <p class="level-left title is-marginless">{{'MAIN_PANE.DASHBOARD.TOP' | translate}}</p>
          <p class="level-right subtitle is-6 is-marginless">{{ lastMonth }}</p>
        </div>
        <div class="hero-body">
          <canvas id="doughnut" height="250%" style="margin-top: 3vh; margin-bottom: -5vh"></canvas>
        </div>
      </div>
    </div>
    <div class="tile is-parent is-vertical" style="padding-bottom: 0">
      <div class="tile is-child is-vertical hero notification is-black">
        <div class="level is-marginless hero-head">
          <p class="level-item title">{{'MAIN_PANE.DASHBOARD.QUICK_ACCESS' | translate}}</p>
        </div>
        <div class="hero-body">
          <ul>
            <li class="subtitle is-5" v-for="access in quickAccesses">
              <span>• {{'MAIN_PANE.DASHBOARD.ACCESSES.OPEN' + (access.plural ? '_PLURAL' : '') | translate}} </span>
              <span class="link ":class="'has-text-' + access.color" @click="send(access.ipcmsg)">{{ 'MAIN_PANE.DASHBOARD.ACCESSES.' + access.text | translate}} </span>
              <font-awesome-icon :class="'has-text-' + access.color" :icon="access.icon"/>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import {ipcRenderer} from 'electron'
import Vue from 'vue'
import chartJS from 'chart.js' // eslint-disable-line

export default {
  data: function () {
    return {
      quickAccesses: [
        {
          plural: true,
          color: 'info',
          ipcmsg: 'open-swin',
          text: 'SETTINGS',
          icon: 'sliders-h'
        },
        {
          plural: false,
          color: 'primary',
          ipcmsg: 'open-chronowin',
          text: 'CHRONOCHART',
          icon: 'chart-area'
        },
        {
          plural: true,
          color: 'success',
          ipcmsg: 'open-recurring',
          text: 'RECURRING',
          icon: 'recycle'
        },
        {
          plural: false,
          color: 'warning',
          ipcmsg: 'open-piewin',
          text: 'STATISTIC',
          icon: 'chart-pie'
        },
        {
          plural: false,
          color: 'danger',
          ipcmsg: 'open-balancewin',
          text: 'BALANCE',
          icon: 'chart-line'
        },
        {
          plural: false,
          color: 'purple',
          ipcmsg: 'open-detail',
          text: 'DETAIL',
          icon: 'th-list'
        }
      ]
    }
  },
  computed: {
    lastMonth: function () {
      return moment().subtract(1, 'months').format('MMMM YYYY')
    }
  },
  methods: {
    send: function (msg) {
      ipcRenderer.send('action-trigger', msg)
    }
  },
  mounted: function () {
    const ctx = document.getElementById('doughnut')
    const firstDateofMonth = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD')
    const lastDateofMonth = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
    let dataDb
    try {
      dataDb = this.$root.db.exec(`SELECT category, SUM(amount) as s FROM OPERATION WHERE amount<=0 AND date BETWEEN "${firstDateofMonth}" AND "${lastDateofMonth}" GROUP BY category ORDER BY s ASC LIMIT 6`)
    } catch (e) {
      console.warn(e)
      dataDb = {s: 1, category: 'No data to display'}
    }
    const data = []
    const labels = []
    let max = 0
    for (let i = 0; i < dataDb.length; i++) {
      max += -dataDb[i].s.toFixed(2)
    }
    for (var i = 0; i < dataDb.length; i++) {
      data.push(-dataDb[i].s.toFixed(2))
      labels.push(((dataDb[i].category === '') ? Vue.filter('translate')('OTHER') : dataDb[i].category) + ` (${(-dataDb[i].s.toFixed(2) / max * 100).toFixed(2)}%)`)
    }

    var config = {
      type: 'doughnut',
      data: {
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(50, 114, 221, 0.60)',
            'rgba(0, 209, 178, 0.60)',
            'rgba(35, 209, 96, 0.60)',
            'rgba(255, 221, 87, 0.60)',
            'rgba(255, 56, 96, 0.60)',
            'rgba(132, 69, 214, 0.60)'
          ],
          borderWidth: 0,
          label: 'Dataset 1'
        }],
        labels: labels
      },
      options: {
        rotation: Math.PI,
        circumference: Math.PI,
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
        },
        tooltipTemplate: '<%if (label){%><%=label%>: <%}%>$<%= value %>'
      }
    }

    if (this.$root.settings.theme === 'dark') {
      config.options.legend.labels = {fontColor: 'rgb(237, 237, 237)'}
    }

    new Chart(ctx, config) // eslint-disable-line
  }
}
</script>
