import type { Express, Router } from 'express';
import * as posts from './service.ts';

export function configure(app: Express, router: Router) {
  router.get('/articles', posts.findAll);
  router.post('/articles', posts.create);

  router.get('/articles/:id', posts.find);
  router.patch('/articles/:id', posts.update);
  router.delete('/articles/:id', posts.destroy);
}
