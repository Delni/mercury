import Vue from 'vue'
import axios from 'axios'

// CSS
import 'bulma/css/bulma.css'
import 'bulma-extensions/dist/bulma-extensions.min.css'
import 'font-awesome/css/font-awesome.css'
// Components
import ChronoView from '@/reports/chronoView.vue'
// nodeModules
import path from 'path'
import i18njs from 'i18njs'
import jsonfile from 'jsonfile'

let globSettings = jsonfile.readFileSync(path.join(__static, 'settings.json'))

const lang = jsonfile.readFileSync(`${__static}/lang/${globSettings.language}_.json`)
i18njs.add(globSettings.language, '', lang)
i18njs.setLang(globSettings.language)

Vue.filter('translate', (value, option) => {
  if (!value) return ''
  value = value.toString()
  if (i18njs.has('.RENDERER.' + value)) return i18njs.get('.RENDERER.' + value, option)
  if (i18njs.has('.COMMON.' + value)) return i18njs.get('.COMMON.' + value, option)
  return i18njs.get(value, option)
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios

new Vue({
  components: { ChronoView },
  template: '<chrono-view />',
  data: function () { return {settings: globSettings} }
}).$mount('#app')
