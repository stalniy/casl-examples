import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { connectDatabase } from './database.ts';
import errorHandler from './error-handler.ts';
import * as auth from './modules/auth/index.ts';
import * as comments from './modules/comments/index.ts';
import * as posts from './modules/posts/index.ts';
import * as users from './modules/users/index.ts';

export default async function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: true }));
  const router = express.Router();

  for (const appModule of [auth, comments, posts, users]) {
    appModule.configure(app, router);
  }

  app.use('/api', router);
  app.use(errorHandler);

  await connectDatabase();
  app.addListener('close', () => { void mongoose.disconnect(); });

  return app;
}
