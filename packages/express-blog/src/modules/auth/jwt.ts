import type { Express } from 'express';
import type { PassportStatic } from 'passport';
import { Strategy } from 'passport-jwt';
import type { VerifiedCallback } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import User from '../users/model.ts';

type TokenPayload = { anonymous?: boolean; id?: string };

function findUser(payload: TokenPayload, done: VerifiedCallback) {
  if (payload.anonymous) {
    done(null, new User());
    return;
  }

  User.findById(payload.id)
    .then((user) => user ? done(null, user) : done(null, false))
    .catch((error: unknown) => done(error, false));
}

export function configurePassport(passport: PassportStatic, app: Express) {
  const options = {
    issuer: app.get('jwt.issuer') as string,
    audience: app.get('jwt.audience') as string
  };
  const secret: string = app.get('jwt.secret');
  const anonymousToken = jwt.sign({ anonymous: true }, secret, options);

  passport.use(new Strategy({
    ...options,
    secretOrKey: secret,
    jwtFromRequest: (req) => req.headers.authorization || anonymousToken,
  }, findUser));
}
