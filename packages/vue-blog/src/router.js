import Vue from 'vue'
import Router from 'vue-router'

import Home from './views/Home'
import Login from './views/Login'
import EditArticle from './views/EditArticle'
import Article from './views/Article'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/articles/:id/edit',
      name: 'editArticle',
      component: EditArticle
    },
    {
      path: '/articles/new',
      name: 'newArticle',
      component: EditArticle
    },
    {
      path: '/articles/:id',
      name: 'article',
      component: Article
    },
  ]
})
