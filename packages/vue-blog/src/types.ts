import type { MongoAbility, RawRuleOf } from '@casl/ability';

export interface ArticleAuthor {
  email: string;
}

export interface Article {
  id?: string;
  title: string;
  body: string;
  published: boolean;
  author?: string;
  createdBy?: ArticleAuthor;
}

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'publish';
type Subjects = 'Article' | Article | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;
export type AppRule = RawRuleOf<AppAbility>;

export interface Session {
  token: string;
  email: string;
  userId: string;
  rules: AppRule[];
}

export interface NotificationMessage {
  id?: number;
  timeout: number;
  type: 'info' | 'error';
  message: string;
}

export interface RootState {
  token: string;
  email: string;
  userId: string;
  rules: AppRule[];
  pageTitle: string;
}

export interface HttpErrorBody {
  message?: string;
  errors?: string[];
}

export interface HttpResponse<TBody> {
  body: TBody;
  status: number;
}
