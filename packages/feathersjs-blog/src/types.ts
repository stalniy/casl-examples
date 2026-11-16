import type { HookContext, Params } from '@feathersjs/feathers';
import type { Application } from '@feathersjs/express';
import type { connectDatabase } from './database.ts';
import type { BlogRecord, UserRecord, ArticleRecord, CommentRecord, UserDocument } from './models/index.ts';
import type { DocumentService } from './services/documents.ts';
import type { SessionService } from './services/session.ts';

export interface DocumentParams extends Params<Record<string, unknown>> {
  user?: UserDocument;
}

export interface Services {
  'api/session': SessionService;
  'api/users': DocumentService<UserRecord>;
  'api/articles': DocumentService<ArticleRecord>;
  'api/comments': DocumentService<CommentRecord>;
}

export interface Settings {
  database: Awaited<ReturnType<typeof connectDatabase>>;
  authSecret: string;
}

export type BlogApplication = Application<Services, Settings>;
export type DocumentHookContext<T extends BlogRecord> = HookContext<BlogApplication, DocumentService<T>>;
