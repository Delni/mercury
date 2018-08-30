<template lang="html">
  <div class="columns" style="width:100%">
    <div class="column has-text-centered">
      <p class="title">Mercury</p>
      <p class="subtitle" >{{'SETTINGS.TABS.ABOUT.THANKS' | translate}}</p>
      <img :src="iconUrl">
      <p class="subtitle is-marginless" >{{'SETTINGS.TABS.ABOUT.VERSION' | translate}}
        <code>{{appVersion}}</code>
        <a @click="checkForUpdates()" class="button is-small is-primary is-outlined">
          <font-awesome-icon :icon="upToDate" v-if="!loading" />
          <font-awesome-icon icon="sync" spin v-else />
        </a>
      </p>
      <p v-if="update"><a class="link has-text-warning" target="_blank" @click="openExternal(update)">{{'SETTINGS.TABS.ABOUT.DOWNLOAD' | translate}}</a></p>
    </div>
    <div class="column has-text-centered">
      <p>{{'SETTINGS.TABS.ABOUT.ME' | translate}}</p>
      <p :inner-html.prop="'SETTINGS.TABS.ABOUT.CONTACT' | translate"></p>
      <br>
      <a target="_blank" @click="openExternal('https://simulatedgreg.gitbooks.io/electron-vue/en/')"><img :src="electronVueUrl"></a>
      <p :inner-html.prop="'SETTINGS.TABS.ABOUT.TECHNO' | translate"></p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {shell, ipcRenderer} from 'electron'

export default {
  data: function () {
    return {
      loading: false,
      update: null,
      upToDate: 'sync',
      iconUrl: 'static/assets/256x256.png',
      electronVueUrl: 'static/assets/evue.png',
      appVersion: require('electron').remote.app.getVersion()
    }
  },
  methods: {
    openExternal: function (url) {
      shell.openExternal(url)
    },

    checkForUpdates: function () {
      let vm = this
      this.loading = true
      Vue.http({
        method: 'GET',
        url: 'https://api.github.com/repos/delni/mercury/releases'
      }).then((result) => {
        if ('v' + vm.appVersion < result.data[0].tag_name) {
          const options = {
            body: Vue.filter('translate')('SETTINGS.TABS.ABOUT.UPDATE_AVAILABLE', {version: result.data[0].tag_name}),
            silent: false
          }
          ipcRenderer.send('notification', options)
          vm.upToDate = 'exclamation-triangle'
          vm.update = result.data[0].html_url
        } else {
          const options = {
            body: Vue.filter('translate')('SETTINGS.TABS.ABOUT.UP_TO_DATE')
          }
          vm.upToDate = 'check'
          ipcRenderer.send('notification', options)
        }
        vm.loading = false
      })
    }
  },
  created: function () {
  }
}
</script>
