import Fastify, { type FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { subject, defineAbilityFor, defineRulesFor, type User, type AppAbility } from './domain.js';
import type { BlogRepository } from './repositories/types.js';
import { PublishDeniedError } from './repositories/types.js';
import { createMikroRepository } from './repositories/mikro.js';
import { createTypeOrmRepository } from './repositories/typeorm.js';

export type AppConfig = { IMPLEMENTATION: string; DATABASE_URL: string; SERVER_PORT: number; AUTH_SECRET: string; AUTH_ISSUER?: string; AUTH_AUDIENCE?: string };
const userBody = { type: 'object', additionalProperties: false, required: ['email', 'password', 'role'], properties: { name: { type: 'string' }, email: { type: 'string', minLength: 5 }, password: { type: 'string', minLength: 6 }, role: { type: 'string', enum: ['admin', 'writer'] } } } as const;
const userPatch = { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, email: { type: 'string', minLength: 5 }, password: { type: 'string', minLength: 6 } } } as const;
const articleBody = { type: 'object', additionalProperties: false, required: ['title', 'body'], properties: { title: { type: 'string' }, body: { type: 'string' }, published: { type: 'boolean', default: false } } } as const;
const articlePatch = { type: 'object', additionalProperties: false, properties: { title: { type: 'string' }, body: { type: 'string' }, published: { type: 'boolean' } } } as const;

export async function createApp(config: AppConfig, injectedRepository?: BlogRepository): Promise<FastifyInstance> {
  if (!['mikro', 'typeorm'].includes(config.IMPLEMENTATION)) throw new Error(`Unknown implementation "${config.IMPLEMENTATION}". Use mikro or typeorm.`);
  const filename = config.DATABASE_URL.startsWith('file:') ? config.DATABASE_URL.slice(5) : config.DATABASE_URL;
  const repository = injectedRepository ?? (config.IMPLEMENTATION === 'mikro' ? await createMikroRepository(filename) : await createTypeOrmRepository(filename));
  const app = Fastify({ logger: false });
  app.decorate('repository', repository);
  app.decorate('appConfig', config);
  app.addHook('onClose', async () => { await repository.close(); });
  (app as any).decorateRequest('user', null);
  (app as any).decorateRequest('userAbility', null);
  app.addHook('onRequest', async (req, reply) => {
    try {
      let token = req.headers.authorization ?? jwt.sign({ anonymous: true }, config.AUTH_SECRET, { issuer: config.AUTH_ISSUER, audience: config.AUTH_AUDIENCE });
      if (token.startsWith('Bearer ')) token = token.slice(7);
      const payload = jwt.verify(token, config.AUTH_SECRET, { issuer: config.AUTH_ISSUER, audience: config.AUTH_AUDIENCE }) as { id?: string; anonymous?: boolean };
      if (payload.anonymous) {
        req.user = { id: '<anonymous>', name: 'Anonymous', email: 'anonymous@casl.io', password: '123456', role: '', createdAt: new Date(), updatedAt: new Date() };
        req.userAbility = defineAbilityFor();
      } else {
        const user = await repository.findUserForAuthentication(payload.id!);
        if (!user) return reply.code(401).send();
        req.user = user; req.userAbility = defineAbilityFor(user);
      }
    } catch { return reply.code(401).send(); }
  });

  app.post('/api/session', { schema: { body: { type: 'object', additionalProperties: false, required: ['email', 'password'], properties: { email: { type: 'string', minLength: 5 }, password: { type: 'string', minLength: 6 } } } } }, async (req: any, reply) => {
    const found = await repository.findLogin(req.body.email);
    if (!found || found.password !== req.body.password) return reply.code(400).send({ message: 'Invalid login or password' });
    const token = jwt.sign({ id: found.id }, config.AUTH_SECRET, { issuer: config.AUTH_ISSUER, audience: config.AUTH_AUDIENCE });
    return { token, rules: defineRulesFor(found), email: found.email, userId: found.id };
  });
  app.post('/api/users', { schema: { body: userBody } }, async (req: any, reply) => {
    const candidate = { ...req.body, name: req.body.name ?? 'Unknown', id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() } as User;
    if (!req.userAbility.can('create', subject('User', candidate))) return reply.code(403).send();
    return reply.code(201).send({ item: await repository.createUser(candidate) });
  });
  app.get('/api/users/:id', async (req: any, reply) => {
    const user = await repository.findUserById(req.params.id, req.userAbility);
    return user ? { item: user } : reply.code(404).send();
  });
  app.patch('/api/users/:id', { schema: { body: userPatch } }, async (req: any, reply) => {
    const existing = await repository.findUserById(req.params.id, req.userAbility);
    if (!existing) return reply.code(404).send();
    const proposed = { ...existing, ...req.body, updatedAt: new Date() };
    if (!req.userAbility.can('update', subject('User', proposed))) return reply.code(404).send();
    const user = await repository.updateUser(req.params.id, req.body, req.userAbility);
    return user ? { item: user } : reply.code(404).send();
  });
  app.get('/api/articles', { schema: { querystring: { type: 'object', required: ['page', 'pageSize'], properties: { page: { type: 'integer', minimum: 1, default: 1 }, pageSize: { type: 'integer', minimum: 5, maximum: 100, default: 100 } } } } }, async (req: any) => repository.listArticles(req.userAbility, req.query.page, req.query.pageSize));
  app.get('/api/articles/:id', async (req: any, reply) => {
    const item = await repository.findArticle(req.params.id, req.userAbility);
    return item ? { item } : reply.code(404).send();
  });
  app.post('/api/articles', { schema: { body: articleBody } }, async (req: any, reply) => {
    const now = new Date();
    const candidate = { ...req.body, published: !!req.body.published, id: crypto.randomUUID(), author: req.user.id, createdAt: now, updatedAt: now };
    if (!req.userAbility.can('create', subject('Article', candidate))) return reply.code(403).send();
    if (candidate.published && !req.userAbility.can('publish', subject('Article', candidate))) return reply.code(403).send();
    return reply.send({ item: await repository.createArticle(candidate) });
  });
  app.patch('/api/articles/:id', { schema: { body: articlePatch } }, async (req: any, reply) => {
    try {
      const item = await repository.updateArticle(req.params.id, req.body, req.userAbility);
      return item ? { item } : reply.code(404).send();
    } catch (error) {
      if (error instanceof PublishDeniedError) return reply.code(403).send();
      throw error;
    }
  });
  app.delete('/api/articles/:id', async (req: any, reply) => {
    const item = await repository.deleteArticle(req.params.id, req.userAbility);
    return item ? { item } : reply.code(404).send();
  });
  return app;
}

declare module 'fastify' {
  interface FastifyInstance { repository: BlogRepository; appConfig: AppConfig }
  interface FastifyRequest { user: User; userAbility: AppAbility }
}
