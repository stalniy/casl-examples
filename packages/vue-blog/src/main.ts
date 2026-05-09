import { createApp } from 'vue';
import { abilitiesPlugin, Can } from '@casl/vue';
import { confirmPlugin } from './plugins/confirm';
import App from './App.vue';
import router from './router';
import http from './services/http';
import { store } from './store';
import { ability } from './store/ability';

http.token = store.state.token;
http.onError = (response: { status: number; body?: { message?: string } }) => {
  if (response.status === 403) {
    store.dispatch('forbidden', response);
    return true;
  }

  if (response.status === 401) {
    store.dispatch('sessionExpired', response);
    return true;
  }

  return false;
};

const app = createApp(App);

app.use(store);
app.use(router);
app.use(confirmPlugin);
app.use(abilitiesPlugin, ability);
app.component('Can', Can);
app.mount('#app');
