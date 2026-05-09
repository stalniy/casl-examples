import { createStore } from 'vuex';
import storage from './storage';
import abilityPlugin, { ability } from './ability';
import notifications from './notifications';
import articles from './articles';
import http from '../services/http';
import router from '../router';
import type { HttpErrorBody, RootState, Session } from '../types';

export const store = createStore<RootState>({
  plugins: [
    storage({
      storedKeys: ['token', 'rules', 'email', 'userId'],
      destroyOn: ['destroySession'],
    }),
    abilityPlugin,
  ],

  modules: {
    notifications,
    articles,
  },

  state: {
    token: '',
    email: '',
    userId: '',
    rules: [],
    pageTitle: 'CASL + Vue + Vuex + REST API',
  },

  getters: {
    isLoggedIn(state: RootState) {
      return !!state.token;
    },

    ability() {
      return ability;
    },
  },

  mutations: {
    createSession(state: RootState, session: Session) {
      state.token = session.token;
      state.rules = session.rules;
      state.email = session.email;
      state.userId = session.userId;
      http.token = session.token;
    },

    destroySession(state: RootState) {
      state.token = '';
      state.rules = [];
      state.email = '';
      state.userId = '';
      http.token = null;
    },

    setPageTitle(state: RootState, value: string) {
      state.pageTitle = value;
    },
  },

  actions: {
    login({ commit }: { commit: (type: string, payload?: unknown) => void }, data: { email: string; password: string }) {
      return http<Session>('/session', { method: 'POST', data })
        .then((response) => commit('createSession', response.body));
    },

    logout({ commit }: { commit: (type: string, payload?: unknown) => void }) {
      commit('destroySession');
    },

    setTitle({ commit }: { commit: (type: string, payload?: unknown) => void }, value: string) {
      commit('setPageTitle', value);
    },

    sessionExpired({
      dispatch,
      commit,
    }: {
      dispatch: (type: string, payload?: unknown) => Promise<unknown>;
      commit: (type: string, payload?: unknown) => void;
    }) {
      dispatch('notifications/info', 'Session has expired');
      commit('destroySession');
      router.push('/login');
    },

    forbidden({
      dispatch,
    }: {
      dispatch: (type: string, payload?: unknown) => Promise<unknown>;
    }, response: { body?: HttpErrorBody }) {
      dispatch('notifications/error', response.body?.message || 'Forbidden');

      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    },
  },
});
