import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { UserInput, UserPatch } from '../../repositories/types.js';

const userBody = {
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password', 'role'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', minLength: 5 },
    password: { type: 'string', minLength: 6 },
    role: { type: 'string', enum: ['admin', 'writer'] },
  },
} as const;
const userPatch = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    email: { type: 'string', minLength: 5 },
    password: { type: 'string', minLength: 6 },
  },
} as const;

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  defineUserCreateRoute(fastify);
  defineUserFindRoute(fastify);
  defineUserUpdateRoute(fastify);
};

function defineUserCreateRoute(fastify: FastifyInstance) {
  const { blogService } = fastify;
  fastify.post<{ Body: UserInput }>('/users', { schema: { body: userBody } }, async (req, reply) => {
    const item = await blogService.createUser(req.body, req.userAbility);
    return reply.code(201).send({ item });
  });
}

function defineUserFindRoute(fastify: FastifyInstance) {
  const { blogService } = fastify;
  fastify.get<{ Params: { id: string } }>('/users/:id', async (req) => {
    const item = await blogService.findUserById(req.params.id, req.userAbility);
    return { item };
  });
}

function defineUserUpdateRoute(fastify: FastifyInstance) {
  const { blogService } = fastify;
  fastify.patch<{ Params: { id: string }; Body: UserPatch }>('/users/:id', { schema: { body: userPatch } }, async (req) => {
    const item = await blogService.updateUser(req.params.id, req.body, req.userAbility);
    return { item };
  });
}
