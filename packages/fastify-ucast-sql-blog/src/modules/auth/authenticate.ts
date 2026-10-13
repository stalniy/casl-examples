import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { AppAbility, User } from '../../domain.js';
import { defineAbilityFor } from './abilities.js';
import { generateToken, verifyToken } from './services.js';

export async function authenticate(this: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  try {
    let token = req.headers.authorization ?? generateToken(this.appConfig);
    if (token.startsWith('Bearer ')) token = token.slice(7);
    const payload = verifyToken(this.appConfig, token);
    if (payload.anonymous) {
      req.user = {
        id: '<anonymous>',
        name: 'Anonymous',
        email: 'anonymous@casl.io',
        password: '123456',
        role: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      req.userAbility = defineAbilityFor();
    } else {
      const user = await this.blogService.findUserForAuthentication(payload.id!);
      if (!user) return reply.code(401).send();
      req.user = user;
      req.userAbility = defineAbilityFor(user);
    }
  } catch {
    return reply.code(401).send();
  }
}

export function provideAuthentication(fastify: FastifyInstance) {
  fastify.decorateRequest('user');
  fastify.decorateRequest('userAbility');
  return authenticate;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
    userAbility: AppAbility;
  }
}
