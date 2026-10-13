import 'reflect-metadata';
import { createApp } from './createApp.js';
import type { AppConfig } from './config.js';

const config: AppConfig = {
  IMPLEMENTATION: process.env.IMPLEMENTATION ?? 'mikro',
  DATABASE_URL: process.env.DATABASE_URL ?? './blog-mikro.sqlite',
  SERVER_PORT: Number(process.env.SERVER_PORT ?? 3000),
  AUTH_SECRET: process.env.AUTH_SECRET ?? 'development-only-secret',
  AUTH_ISSUER: process.env.AUTH_ISSUER ?? 'CASL.Fastify.UcastSql',
  AUTH_AUDIENCE: process.env.AUTH_AUDIENCE ?? 'casl.io',
};

createApp(config).then(app => app.listen({ port: config.SERVER_PORT, host: '0.0.0.0' })).catch(error => { console.error(error); process.exitCode = 1; });
