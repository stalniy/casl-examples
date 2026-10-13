import Fastify, { type FastifyInstance } from 'fastify';
import type { AppConfig } from './config.js';
import type { BlogRepository } from './repositories/types.js';
import { createMikroRepository } from './repositories/mikro.js';
import { createTypeOrmRepository } from './repositories/typeorm.js';
import { authRoutes, provideAuthentication } from './modules/auth/index.js';
import { usersRoutes } from './modules/users/index.js';
import { articlesRoutes } from './modules/articles/index.js';

export async function createApp(config: AppConfig, injectedRepository?: BlogRepository): Promise<FastifyInstance> {
  if (!['mikro', 'typeorm'].includes(config.IMPLEMENTATION)) {
    throw new Error(`Unknown implementation "${config.IMPLEMENTATION}". Use mikro or typeorm.`);
  }
  const filename = config.DATABASE_URL.startsWith('file:') ? config.DATABASE_URL.slice(5) : config.DATABASE_URL;
  const repository = injectedRepository ?? (config.IMPLEMENTATION === 'mikro'
    ? await createMikroRepository(filename)
    : await createTypeOrmRepository(filename));
  const fastify = Fastify({ logger: true });
  fastify.decorate('repository', repository);
  fastify.decorate('appConfig', config);
  fastify.addHook('onClose', async () => { await repository.close(); });
  fastify.addHook('onRequest', provideAuthentication(fastify));

  fastify.register(authRoutes, { prefix: '/api' });
  fastify.register(usersRoutes, { prefix: '/api' });
  fastify.register(articlesRoutes, { prefix: '/api' });

  return fastify;
}

declare module 'fastify' {
  interface FastifyInstance {
    repository: BlogRepository;
    appConfig: AppConfig;
  }
}
