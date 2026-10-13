import type { FastifyPluginAsync } from 'fastify';
import { defineRulesFor } from './abilities.js';
import { generateToken, isValidUserPassword } from './services.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const schema = {
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', minLength: 5 },
        password: { type: 'string', minLength: 6 },
      },
    },
  } as const;

  fastify.post<{ Body: { email: string; password: string } }>('/session', { schema }, async (req, reply) => {
    const found = await fastify.repository.findLogin(req.body.email);
    if (!found || !isValidUserPassword(found, req.body.password)) {
      return reply.code(400).send({ message: 'Invalid login or password' });
    }
    const token = generateToken(fastify.appConfig, found);
    return { token, rules: defineRulesFor(found), email: found.email, userId: found.id };
  });
};
