import Vue from 'vue'
import Settings from './Settings.vue'

let app = new Vue({
  components: { Settings },
  template: '<Settings/>'
}).$mount('#app')

console.debug(app)
