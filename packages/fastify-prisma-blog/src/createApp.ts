import { PrismaClient } from '@prisma/client';
import Fastify, { FastifyInstance } from 'fastify'
import { AppConfig } from './config';
import { authRoutes, provideAuthentication } from './modules/auth';
import { usersRoutes } from './modules/users';
import { articlesRoutes } from './modules/articles';
import { ForbiddenError } from '@casl/ability';

export async function createApp(config: AppConfig): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true
  });

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  fastify.decorate('prisma', prisma);
  fastify.decorate('appConfig', config);

  fastify.register(authRoutes, { prefix: '/api' });
  fastify.register(usersRoutes, { prefix: '/api' });
  fastify.register(articlesRoutes, { prefix: '/api' });

  fastify.addHook('onRequest', provideAuthentication(fastify));
  const defaultErrorHandler = fastify.errorHandler;
  fastify.setErrorHandler(function (error, req, reply) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send();
    }

    return defaultErrorHandler.call(this, error, req, reply);
  })

  return fastify;
}

declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient;
    appConfig: AppConfig;
  }
}
