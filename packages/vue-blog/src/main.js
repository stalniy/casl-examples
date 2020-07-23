import Vue from 'vue'
import Vuetify from 'vuetify'
import { abilitiesPlugin } from '@casl/vue'
import { confirmPlugin } from './plugins/confirm'
import App from './App'
import router from './router'
import http from './services/http'
import { store } from './store'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false
Vue.use(Vuetify)
Vue.use(confirmPlugin)
Vue.use(abilitiesPlugin, store.getters.ability)

http.token = store.state.token
http.onError = (response) => {
  if (response.status === 403) {
    store.dispatch('forbidden', response)
    return true
  }

  if (response.status === 401) {
    store.dispatch('sessionExpired', response)
    return true
  }
}


new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
