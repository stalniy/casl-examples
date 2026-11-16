import { feathers } from '@feathersjs/feathers';
import express from '@feathersjs/express';
import cors from 'cors';
import { ForbiddenError } from '@casl/ability';
import { BadRequest, Forbidden } from '@feathersjs/errors';
import { connectDatabase } from './database.ts';
import { authenticate } from './hooks/authenticate.ts';
import { DocumentService } from './services/documents.ts';
import { SessionService } from './services/session.ts';
import type { ErrorRequestHandler } from 'express';
import type { ApplicationHookContext, FeathersService, NextFunction } from '@feathersjs/feathers';
import type { BlogRecord } from './models/index.ts';
import type { BlogApplication, Services, Settings } from './types.ts';

export default async function createApp() {
  const app = express.default(feathers<Services, Settings>());
  const database = await connectDatabase();
  app.set('database', database);
  app.set('authSecret', process.env.AUTH_SECRET || '!_^secret.casl@authorization?!');
  app.use(cors({ origin: true }));
  app.use(express.json());
  app.configure(express.rest());

  app.use('api/session', new SessionService(database.User, app.get('authSecret')));
  app.service('api/session').hooks({ after: { create: [context => { context.http = { status: 200 }; }] } });

  function configureDocuments<T extends BlogRecord>(service: FeathersService<BlogApplication, DocumentService<T>>, status: number) {
    service.hooks({
      before: { all: [authenticate] },
      after: { create: [context => { context.http = { status }; }] }
    });
  }
  app.use('api/users', new DocumentService(database.User), { methods: ['get', 'create', 'patch'] });
  app.use('api/articles', new DocumentService(database.Article), { methods: ['find', 'get', 'create', 'patch', 'remove'] });
  app.use('api/comments', new DocumentService(database.Comment), { methods: ['find', 'get', 'create', 'patch', 'remove'] });
  configureDocuments(app.service('api/users'), 201);
  configureDocuments(app.service('api/articles'), 200);
  configureDocuments(app.service('api/comments'), 200);

  app.use(express.notFound());
  const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (error instanceof ForbiddenError) {
      next(new Forbidden(error.message));
      return;
    }
    if (error.name === 'ValidationError' || error.name === 'CastError'
      || error.code === 11000 || error.status === 400) {
      next(new BadRequest(error.message));
      return;
    }
    next(error);
  };
  app.use(errorHandler);
  app.use(express.errorHandler());
  app.hooks({ teardown: [async (context: ApplicationHookContext<BlogApplication>, next: NextFunction) => {
    await next();
    await database.connection.close();
  }] });
  return app;
}
