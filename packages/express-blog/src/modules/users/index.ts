import type { Express, Router } from 'express';
import * as users from './service.ts';

export function configure(app: Express, router: Router) {
  router.get('/users/:id', users.find);
  router.patch('/users/:id', users.update);
  router.post('/users', users.create);
}
