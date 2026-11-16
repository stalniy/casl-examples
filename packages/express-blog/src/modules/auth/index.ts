import type { Express, Router } from 'express';
import passport from 'passport';
import { configurePassport } from './jwt.ts';
import * as session from './service.ts';
import { defineAbilityFor } from './abilities.ts';

export function configure(app: Express, router: Router) {
  router.post('/session', session.create);

  app.set('jwt.secret', '!_^secret.casl@authorization?!');
  app.set('jwt.issuer', 'CASL.Express');
  app.set('jwt.audience', 'casl.io');
  configurePassport(passport, app);
  router.use(passport.initialize());
  router.use(passport.authenticate('jwt', { session: false, failWithError: true }));
  router.use((req, _, next) => {
    req.ability = defineAbilityFor(req.user);
    next();
  });
}
