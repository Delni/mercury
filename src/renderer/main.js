import Vue from 'vue'
import axios from 'axios'

// CSS
import 'bulma/css/bulma.css'
import 'bulma-extensions/dist/bulma-extensions.min.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
// Components
import App from '@/App'
// nodeModules
import jsonfile from 'jsonfile'
import path from 'path'
import moment from 'moment'
import {ipcRenderer} from 'electron'
import './icons'
import './filters'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios

Vue.config.productionTip = false

let globSettings = jsonfile.readFileSync(path.join(__static, 'settings.json'))

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>',
  data: function () {
    return {
      settings: globSettings,
      accounts: [],
      unsaved: false,
      db: null
    }
  },
  methods: {
    // Functions
    updateSQL: function (sqlType) {
      switch (sqlType) {
        case 'dashboard':
          ipcRenderer.send('tab-update', 0)
          break
        case 'accounts-detail':
          ipcRenderer.send('tab-update', 1)
          break
        case 'recurrings':
          ipcRenderer.send('tab-update', 2)
          break
        default:
          ipcRenderer.send('tab-update', 0)
      }
    }
  },
  mounted: function () {
    // Sets locale
    moment.locale(globSettings.language)
  }
}).$mount('#app')
