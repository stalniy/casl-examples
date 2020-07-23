export default (store) => {
  const ability = store.getters.ability

  ability.update(store.state.rules)

  return store.subscribe((mutation) => {
    switch (mutation.type) {
    case 'createSession':
      ability.update(mutation.payload.rules)
      break
    case 'destroySession':
      ability.update([{ actions: 'read', subject: 'all' }])
      break
    }
  })
}
