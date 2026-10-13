import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { subject } from '../../domain.js';
import type { UserInput } from '../../repositories/types.js';

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
  const { repository } = fastify;
  fastify.post<{ Body: UserInput }>('/users', { schema: { body: userBody } }, async (req, reply) => {
    const candidate = {
      ...req.body,
      name: req.body.name ?? 'Unknown',
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (!req.userAbility.can('create', subject('User', candidate))) return reply.code(403).send();
    return reply.code(201).send({ item: await repository.createUser(candidate) });
  });
}

function defineUserFindRoute(fastify: FastifyInstance) {
  const { repository } = fastify;
  fastify.get<{ Params: { id: string } }>('/users/:id', async (req, reply) => {
    const user = await repository.findUserById(req.params.id, req.userAbility);
    return user ? { item: user } : reply.code(await repository.userExists(req.params.id) ? 403 : 404).send();
  });
}

function defineUserUpdateRoute(fastify: FastifyInstance) {
  const { repository } = fastify;
  fastify.patch<{ Params: { id: string }; Body: Partial<Omit<UserInput, 'role'>> }>('/users/:id', { schema: { body: userPatch } }, async (req, reply) => {
    const existing = await repository.findUserById(req.params.id, req.userAbility);
    if (!existing) return reply.code(await repository.userExists(req.params.id) ? 403 : 404).send();
    const proposed = { ...existing, ...req.body, updatedAt: new Date() };
    if (!req.userAbility.can('update', subject('User', proposed))) return reply.code(403).send();
    const user = await repository.updateUser(req.params.id, req.body, req.userAbility);
    return user ? { item: user } : reply.code(await repository.userExists(req.params.id) ? 403 : 404).send();
  });
}
