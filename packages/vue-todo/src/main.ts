import Vue from 'vue';
import { abilitiesPlugin, Can } from '@casl/vue';
import { buildAbilityFor } from './config/ability';
import App from './App.vue';

const ability = buildAbilityFor('member');

if (process.env.NODE_ENV !== 'production') {
  // exposed for debugging
  (window as any).ability = ability
}

Vue.config.productionTip = false;
Vue.use(abilitiesPlugin, ability);
Vue.component('Can', Can);

new Vue({
  render: h => h(App),
}).$mount('#app')
