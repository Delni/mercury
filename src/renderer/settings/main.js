import Vue from 'vue'
import axios from 'axios'

// CSS
import 'bulma/css/bulma.css'
import 'bulma-extensions/dist/bulma-extensions.min.css'
import 'font-awesome/css/font-awesome.css'
import '../assets/sass/master.sass'
import '../assets/sass/settings.sass'
// Components
import Settings from '@/settings/Settings.vue'
// nodeModules
import path from 'path'
import i18njs from 'i18njs'
import jsonfile from 'jsonfile'
import '../filters'

let globSettings = jsonfile.readFileSync(path.join(__static, 'settings.json'))

const lang = jsonfile.readFileSync(`${__static}/lang/${globSettings.language}_.json`)
i18njs.add(globSettings.language, '', lang)
i18njs.setLang(globSettings.language)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios

let app = new Vue({
  components: { Settings },
  template: '<Settings/>',
  data: function () { return {settings: globSettings} }
}).$mount('#app')

console.debug(app)
