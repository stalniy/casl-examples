import { createRouter, createWebHistory } from 'vue-router';

import Home from './views/Home.vue';
import Login from './views/Login.vue';
import EditArticle from './views/EditArticle.vue';
import Article from './views/Article.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/articles/:id/edit',
      name: 'editArticle',
      component: EditArticle,
    },
    {
      path: '/articles/new',
      name: 'newArticle',
      component: EditArticle,
    },
    {
      path: '/articles/:id',
      name: 'article',
      component: Article,
    },
  ],
});

export default router;
