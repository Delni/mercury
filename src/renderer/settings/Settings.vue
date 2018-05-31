<template lang="html">
  <div :class="$root.settings.theme" id="app">
    <section id="window" class="hero is-fullheight is-dark" style="padding: 1px">
        <div class="hero-head">
          <p class="title">
            <span style="margin-left:2%; -webkit-app-region: drag">
              <icon size="is-large has-text-info" fa="sliders" />
              <span>{{'SETTINGS.TITLE' | translate}}</span>
            </span>
            <a onclick="window.close()" class="button is-outlined is-danger pull-right">
              <icon fa="fa-times"/>
            </a>
          </p>
        </div>
        <div class="hero-body is-paddingless">
          <div class="hero notification is-black is-centered is-fullwidth is-setting-pane is-paddingless">
            <div class="hero-head tabs is-fullwidth">
              <ul>
                <li v-for="tab in tabs" :class="{'is-active': activeTab === tab.key}">
                  <a @click="toggleTab(tab.key)">
                    <icon :fa="tab.icon"/>
                    <span>{{ 'SETTINGS.TABS.TITLES.'+ tab.translate | translate}}</span>
                  </a>
                </li>
              </ul>
            </div>
            <div class="hero-body" style="padding-top: 0">
              <transition name="fadeUp" mode="out-in">
                <component v-bind:is="activeTab"></component>
              </transition>
            </div>
          </div>
        </div>
        <div class="hero-footer">
          <a class="button is-outlined is-info pull-right"  :class="{'is-loading' : loading}" @click="save()">
            <icon fa="save"/> &nbsp; {{ "SETTINGS.SAVE" | translate}}
          </a>
        </div>
    </section>
  </div>
</template>

<script>
import icon from '../components/common/icon.vue'
import general from './components/general.vue'
import savedValues from './components/savedValues.vue'
import exchange from './components/exchange.vue'
import about from './components/about.vue'

import {ipcRenderer} from 'electron'
import jsonfile from 'jsonfile'
import path from 'path'
import Vue from 'vue'

export default {
  components: { icon, general, savedValues, exchange, about },
  data: function () {
    return {
      loading: false,
      activeTab: 'general',
      settings: this.$root.settings,
      tabs: [
        {key: 'general', icon: 'cogs', translate: 'GENERAL'},
        {key: 'savedValues', icon: 'bookmark-o', translate: 'SAVED_VALUES'},
        {key: 'exchange', icon: 'globe', translate: 'CURRENCIES'},
        {key: 'about', icon: 'heart', translate: 'ABOUT'}
      ]
    }
  },
  methods: {
    toggleTab: function (tab) {
      this.activeTab = tab
    },

    save: function () {
      let previousSettings = jsonfile.readFileSync(path.join(__static, 'settings.json'))
      this.loading = true
      this.settings.beneficiaries.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase())
      })
      this.settings.categories.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase())
      })
      delete this.settings['theme === \'dark\'']
      delete this.settings['theme === \'light\'']
      jsonfile.writeFile(path.join(__static, 'settings.json'), this.settings, {
        spaces: 2
      }, function (err) {
        if (err != null) {
          console.error(err)
        }
      })
      setTimeout(() => {
        window.close()
      }, 1000)
      if (previousSettings.defaultCurrency !== this.settings.defaultCurrency || previousSettings.language !== this.settings.language || previousSettings.theme !== this.settings.theme || previousSettings.dateFormat !== this.settings.dateFormat) {
        if (previousSettings.language !== this.settings.language) {
          const options = {
            body: Vue.filter('translate')('SETTINGS.TABS.GENERAL.LANGUAGE_UPDATE')
          }
          ipcRenderer.send('notification', options)
        }
        if (previousSettings.dateFormat !== this.settings.dateFormat) {
          const options = {
            body: Vue.filter('translate')('SETTINGS.TABS.GENERAL.DATE_UPDATE')
          }
          ipcRenderer.send('notification', options)
        }
        ipcRenderer.send('new-settings', this.settings)
      }
    }
  }
}
</script>

<style lang="css">
.is-setting-pane {
  height: 80vh;
  width: 100%;
  margin-left: 2vw;
  margin-right: 2vw;
}

.tabs *.is-active {
  border: none;
  border-bottom: 2.5px solid !important;
  border-bottom-color: #209cee !important;
  transition: all 2s;
}
.tabs li:not(.is-active) {
  border: none;
  border-bottom: 1px solid whitesmoke;
  transition: all 2s;
}

.fadeUp-enter-active, .fadeUp-leave-active {
  transition: all 1s;
}

.fadeUp-enter, .fadeUp-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
</style>
