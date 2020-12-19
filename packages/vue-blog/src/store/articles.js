import http from '../services/http'
import { typeAs } from '../services/utils'

export default {
  namespaced: true,

  actions: {
    find() {
      return http('/articles')
        .then((response) => {
          return response.body.items.map(typeAs('Article'))
        })
    },

    findById(_, id) {
      return http(`/articles/${id}`)
        .then(response => response.body.item)
        .then(typeAs('Article'))
    },

    destroy(_, article) {
      return http(`/articles/${article.id}`, { method: 'DELETE' })
        .then(response => response.body.item)
    },

    save(_, { id, ...data }) {
      const request = id
        ? http(`/articles/${id}`, { method: 'PATCH', data })
        : http('/articles', { method: 'POST', data })

      return request.then(response => response.body.item)
    },
  }
}
