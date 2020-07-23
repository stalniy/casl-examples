import Vue from 'vue'
import Vuex from 'vuex'
import { Ability } from '@casl/ability'
import storage from './storage'
import abilityPlugin from './ability'
import notifications from './notifications'
import articles from './articles'
import http from '../services/http'
import router from '../router'
import { TYPE_KEY } from '../services/utils'

Vue.use(Vuex)

export const store = new Vuex.Store({
  plugins: [
    storage({
      storedKeys: ['token', 'rules', 'email'],
      destroyOn: ['destroySession']
    }),
    abilityPlugin
  ],

  modules: {
    notifications,
    articles
  },

  state: {
    token: '',
    email: '',
    rules: [],
    pageTitle: 'CASL + VUE + VUEX + REST API'
  },

  getters: {
    isLoggedIn(state) {
      return !!state.token
    },

    ability() {
      return new Ability([], {
        subjectName(subject) {
          return !subject || typeof subject === 'string'
            ? subject
            : subject[TYPE_KEY]
        }
      })
    }
  },

  mutations: {
    createSession(state, session) {
      state.token = session.token
      state.rules = session.rules
      state.email = session.email
      http.token = session.token
    },

    destroySession(state) {
      state.token = ''
      state.rules = []
      state.email = ''
      http.token = null
    }
  },

  actions: {
    login({ commit }, data) {
      return http('/session', { method: 'POST', data })
        .then(response => commit('createSession', response.body))
    },

    logout({ commit }) {
      commit('destroySession')
    },

    setTitle({ state }, value) {
      state.pageTitle = value
    },

    sessionExpired({ dispatch, commit }) {
      dispatch('notifications/info', 'Session has been expired')
      commit('destroySession')
      router.push('/login')
    },

    forbidden({ dispatch }, response) {
      dispatch('notifications/error', response.body.message)
      router.back()
    }
  }
})