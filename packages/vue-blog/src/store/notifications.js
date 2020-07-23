let COUNTER = 0

export default {
  namespaced: true,

  state: {
    stack: []
  },

  mutations: {
    add(state, message) {
      message.id = message.id || ++COUNTER
      state.stack.push(message)
    },

    remove(state, message) {
      state.stack = state.stack.filter(m => m !== message)
    }
  },

  actions: {
    info({ commit }, message) {
      commit('add', {
        timeout: 3000,
        type: 'info',
        message
      })
    },

    error({ commit }, message) {
      commit('add', {
        timeout: 3000,
        type: 'error',
        message
      })
    },

    remove({ commit }, message) {
      commit('remove', message)
    }
  }
}
