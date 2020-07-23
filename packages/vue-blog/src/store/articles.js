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

    save(_, { id, action, published, ...data }) {
      if (action === 'publish') {
        data.published = published
      }

      const request = id
        ? http(`/articles/${id}`, { method: 'PATCH', data })
        : http('/articles', { method: 'POST', data })

      return request.then(response => response.body.item)
    },

    publish({ dispatch }, article) {
      return dispatch('save', {
        id: article.id,
        published: true,
        action: 'publish'
      })
    }
  }
}
