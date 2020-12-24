import http from '../services/http'
import { subject as an } from '@casl/ability'

export default {
  namespaced: true,

  actions: {
    find() {
      return http('/articles')
        .then((response) => {
          return response.body.items.map(item => an('Article', item))
        })
    },

    findById(_, id) {
      return http(`/articles/${id}`)
        .then(response => an('Article', response.body.item))
    },

    destroy(_, article) {
      return http(`/articles/${article.id}`, { method: 'DELETE' })
        .then(response => an('Article', response.body.item))
    },

    save(_, { id, ...data }) {
      const request = id
        ? http(`/articles/${id}`, { method: 'PATCH', data })
        : http('/articles', { method: 'POST', data })

      return request.then(response => an('Article', response.body.item))
    },
  }
}
