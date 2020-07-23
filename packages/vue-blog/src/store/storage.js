const STATE_KEY = 'vuex-state'

export default (options) => (store) => {
  const rawStoredState = localStorage[STATE_KEY]

  if (rawStoredState) {
    const storedState = JSON.parse(rawStoredState)
    store.replaceState(Object.assign(store.state, storedState))
  }

  return store.subscribe((mutation, state) => {
    if (options.destroyOn && options.destroyOn.includes(mutation.type)) {
      return localStorage.removeItem(STATE_KEY)
    }

    const newState = options.storedKeys.reduce((map, key) => {
      map[key] = state[key]
      return map
    }, {})

    localStorage[STATE_KEY] = JSON.stringify(newState)
  })
}
