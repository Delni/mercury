import Vue from 'vue'
import axios from 'axios'

// CSS
import 'bulma/css/bulma.css'
import 'bulma-extensions/dist/bulma-extensions.min.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '../assets/sass/master.sass'
// Components
import ChronoView from '@/reports/chronoView.vue'
// nodeModules
import path from 'path'
import jsonfile from 'jsonfile'
import './../icons'
import './../filters'

let globSettings = jsonfile.readFileSync(path.join(__static, 'settings.json'))

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios

new Vue({
  components: { ChronoView },
  template: '<chrono-view />',
  data: function () { return {settings: globSettings} }
}).$mount('#app')
