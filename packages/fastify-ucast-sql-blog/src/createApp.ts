import Fastify, { type FastifyInstance } from 'fastify';
import type { AppConfig } from './config.js';
import type { BlogRepository } from './repositories/types.js';
import { initializeOrm } from './services/orm.js';
import { BlogService, BlogServiceError } from './services/blog.js';
import { authRoutes, provideAuthentication } from './modules/auth/index.js';
import { usersRoutes } from './modules/users/index.js';
import { articlesRoutes } from './modules/articles/index.js';

export async function createApp(config: AppConfig, injectedRepository?: BlogRepository): Promise<FastifyInstance> {
  if (!['mikro', 'typeorm', 'sequelize', 'objection', 'drizzle-v1'].includes(config.IMPLEMENTATION)) {
    throw new Error(`Unknown implementation "${config.IMPLEMENTATION}". Use mikro, typeorm, sequelize, objection or drizzle-v1.`);
  }
  const repository = injectedRepository ?? await initializeOrm(config.IMPLEMENTATION, config.DATABASE_URL);
  const fastify = Fastify({ logger: true });
  fastify.decorate('blogService', new BlogService(repository));
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof BlogServiceError) {
      const statusCode = error.code === 'access_denied' ? 403 : 404;
      return reply.code(statusCode).send();
    }
    return reply.send(error);
  });
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
    blogService: BlogService;
    appConfig: AppConfig;
  }
}
