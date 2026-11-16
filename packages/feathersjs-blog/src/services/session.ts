import jwt from 'jsonwebtoken';
import { BadRequest } from '@feathersjs/errors';
import { defineAbilityFor } from '../abilities.ts';
import type { Models } from '../models/index.ts';

export class SessionService {
  User: Models['User'];
  secret: string;

  constructor(User: Models['User'], secret: string) {
    this.User = User;
    this.secret = secret;
  }

  async create(data: { email?: unknown; password?: unknown } | null) {
    const { email, password } = data || {};
    if (typeof email !== 'string' || !email || typeof password !== 'string' || !password) {
      throw new BadRequest('Please specify "email" and "password" fields in body');
    }
    const user = await this.User.findOne({ email });
    // Shared blog fixtures intentionally use plain text passwords, as does
    // express-blog. This is an authorization example, not a password store.
    if (!user || user.password !== password) throw new BadRequest('Invalid login or password');
    const token = jwt.sign({ id: user.id }, this.secret, {
      algorithm: 'HS256', issuer: 'CASL.Feathers', audience: 'casl.io', expiresIn: '1d'
    });
    return { token, rules: defineAbilityFor(user).rules, email: user.email, userId: user.id };
  }
}
