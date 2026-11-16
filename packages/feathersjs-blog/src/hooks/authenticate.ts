import jwt from 'jsonwebtoken';
import { NotAuthenticated } from '@feathersjs/errors';
import type { BlogRecord } from '../models/index.ts';
import type { DocumentHookContext } from '../types.ts';

export async function authenticate<T extends BlogRecord>(context: DocumentHookContext<T>) {
  const header = context.params.headers?.authorization;
  if (!header) return;

  const { User } = context.app.get('database');
  let payload;
  try {
    payload = jwt.verify(header.replace(/^Bearer\s+/i, ''), context.app.get('authSecret'), {
      algorithms: ['HS256'], issuer: 'CASL.Feathers', audience: 'casl.io'
    });
  } catch {
    throw new NotAuthenticated('Invalid access token');
  }
  const user = typeof payload !== 'string' && typeof payload.id === 'string' && /^[a-f\d]{24}$/i.test(payload.id)
    ? await User.findById(payload.id) : null;
  if (!user) throw new NotAuthenticated('Invalid access token');
  context.params.user = user;
}
