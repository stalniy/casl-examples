import { createApp } from 'vue';
import { abilitiesPlugin, Can } from '@casl/vue';
import { buildAbilityFor } from './config/ability';
import App from './App.vue';

const ability = buildAbilityFor('member');
const app = createApp(App);

if (import.meta.env.DEV) {
  // exposed for debugging
  (window as Window & { ability?: typeof ability }).ability = ability;
}

app.use(abilitiesPlugin, ability);
app.component('Can', Can);
app.mount('#app');
