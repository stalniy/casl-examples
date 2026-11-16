import type { Express, Router } from 'express';
import * as comments from './service.ts';

export function configure(app: Express, router: Router) {
  router.get('/articles/:postId/comments', comments.findAll);
  router.post('/articles/:postId/comments', comments.create);

  router.patch('/articles/:postId/comments/:id', comments.update);
  router.delete('/articles/:postId/comments/:id', comments.destroy);
}
