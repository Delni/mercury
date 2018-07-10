<template lang="html">
  <div class="tile is-parent  is-2 is-paddingless" id="main-pane">
    <div class="tile is-parent is-vertical is-paddingless">
      <section class="tile is-child hero notification is-paddingless is-dark is-bottomless">
        <div class="tabs is-boxed is-small is-fullwidth is-bottomless">
          <ul>
            <li class="tab" :class="{'is-active': activeTab === 'dashboard'}"><a @click="tabToggle('dashboard')"><icon size="is-small" fa="dashboard" /> {{'MAIN_PANE.TABS.DASHBOARD' | translate }}</a></li>
            <li class="tab" :class="{'is-active': activeTab === 'accounts-detail'}"><a @click="tabToggle('accounts-detail')"><icon size="is-small" fa="th-list" /> {{'MAIN_PANE.TABS.ACCOUNTS' | translate }}</a></li>
            <li class="tab" :class="{'is-active': activeTab === 'recurrings'}"><a @click="tabToggle('recurrings')"><icon size="is-small" fa="recycle" /> {{'MAIN_PANE.TABS.RECURRINGS' | translate }}</a></li>
          </ul>
        </div>
        <div class="tile data" id="dashboard">
          <div class="tile is-parent is-vertical ">
            <div class="hero is-marginless">
              <!-- NO DATA -->
              <div class="container has-text-centered" v-show="!$root.accounts.length" style="width: 64vw; padding-top:25%">
                <p class="title">{{ 'MAIN_PANE.NO_DATA.TITLE' | translate}}</p>
                <p class="subtitle">Create an <span  class="has-text-primary link" @click="showCreateModal()">account</span> to start or <span class="has-text-info link" @click="openfile()">open a file</span> 🙂</p>
              </div>

              <div class="container" id="mainScreen" v-show="$root.accounts.length">
                <!-- TABS -->
                <component :is="activeTab"></component>
              </div>
            </div>
          </div>
        </div>

      </section>
      <section id="chart-area" class="tile is-child hero notification is-paddingless is-black">
        <div>
          <canvas id="chronoChart" height="75" style="position:relative; top:1rem;"></canvas>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// Components
import icon from '@/components/common/icon'
import dashboard from '@/components/MainPane/dashboard'
import accountsDetail from '@/components/MainPane/accountsDetail'
import recurrings from '@/components/MainPane/recurrings'

// Third party
import moment from 'moment'
import {ipcRenderer} from 'electron'
import ChronoChart from '@/assets/ChronoChart.class'
import chartJS from 'chart.js' // eslint-disable-line

export default {
  name: 'main-pane',
  components: {
    icon,
    dashboard,
    accountsDetail,
    recurrings
  },
  data: function () {
    return {
      activeTab: 'dashboard',
      reload: 1,
      chronoChart: null
    }
  },
  methods: {
    tabToggle: function (tab) {
      this.$root.updateSQL(tab)
      this.activeTab = tab
    },

    openfile: function () {
      ipcRenderer.send('open-file')
    },

    showCreateModal: function () {
      // Go for AccountsPane component
      this.$root.$children[0].$children[0].showCreateModal()
    },

    switchTab: function (args) {
      switch (args) {
        case 0:
          this.tabToggle('dashboard')
          break
        case 1:
          this.tabToggle('accounts-detail')
          break
        case 2:
          this.tabToggle('recurrings')
          break
        default:
          this.tabToggle('dashboard')
      }
    },

    refreshChronochart: function () {
      try {
        this.chronoChart.refresh(this.$root.accounts)
      } catch (e) {
        console.error(e)
      }
    },

    reloadChronochart: function () {
      this.chronoChart = new ChronoChart(document.getElementById('chronoChart'), this.$root.accounts, this.$root.db)
    }
  },
  created: function () {
    const tabToggle = this.tabToggle
    this.tabToggle('dashboard')
    moment.locale(this.$root.settings.language)

    this.$root.$on('toggle-tab', this.switchTab)
    this.$root.$on('add-operation', this.refreshChronochart)
    this.$root.$on('edit-operation:cancel', this.refreshChronochart)
    this.$root.$on('edit-operation:confirm', this.refreshChronochart)

    ipcRenderer.on('toggle', function (event, args) {
      switch (args) {
        case 0:
          tabToggle('dashboard')
          break
        case 1:
          tabToggle('accounts-detail')
          break
        case 2:
          tabToggle('recurrings')
          break
        default:
          tabToggle('dashboard')
      }
    })

    ipcRenderer.on('open-recurring', function () {
      tabToggle('recurrings')
    })

    ipcRenderer.on('open-detail', function () {
      tabToggle('accounts-detail')
    })

    ipcRenderer.on('new-settings', function () {
      tabToggle('dashboard')
    })

    // This refers to root !!!!
    this.$root.$on('update-accounts', this.reloadChronochart)
    this.$root.$on('update-accounts-list:success', this.reloadChronochart)
    this.$root.$on('launch-recurrings:success', this.refreshChronochart)
  },
  mounted: function () {
    this.chronoChart = new ChronoChart(document.getElementById('chronoChart'), this.$root.accounts, this.$root.db)
  }
}
</script>
