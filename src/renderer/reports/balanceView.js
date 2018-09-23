import Vue from 'vue'
import axios from 'axios'

// CSS
import 'bulma/css/bulma.css'
import 'bulma-extensions/dist/bulma-extensions.min.css'
import 'font-awesome/css/font-awesome.css'
import '../assets/sass/master.sass'
// Components
import BalanceView from '@/reports/balanceView.vue'
// nodeModules
import path from 'path'
import jsonfile from 'jsonfile'
import './../filters'

let globSettings = jsonfile.readFileSync(path.join(__static, 'settings.json'))
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios

new Vue({
  components: { BalanceView },
  template: '<balance-view />',
  data: function () { return {settings: globSettings} }
}).$mount('#app')
