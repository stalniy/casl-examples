import type { AppAbility, User, Article } from '../domain.js';
export type ArticleInput = Pick<Article, 'title' | 'body'> & { published?: boolean };
export type ArticlePatch = Partial<ArticleInput>;
export type UserInput = Pick<User, 'email' | 'password' | 'role'> & { name?: string };
export class PublishDeniedError extends Error {
  constructor() { super('The ability does not allow this article publish transition'); this.name = 'PublishDeniedError'; }
}
export interface BlogRepository {
  readonly kind: 'mikro' | 'typeorm';
  schemaMetadata(): Array<{ entity: string; properties: Array<{ propertyName: string; columnName: string }> }>;
  close(): Promise<void>;
  findLogin(email: string): Promise<User | null>;
  findUserForAuthentication(id: string): Promise<User | null>;
  findUserById(id: string, ability: AppAbility): Promise<User | null>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, patch: Partial<Pick<User, 'name' | 'email' | 'password'>>, ability: AppAbility): Promise<User | null>;
  findArticle(id: string, ability: AppAbility): Promise<Article | null>;
  listArticles(ability: AppAbility, page: number, pageSize: number): Promise<{ items: Article[]; count: number }>;
  createArticle(article: Omit<Article, 'id'>): Promise<Article>;
  updateArticle(id: string, patch: ArticlePatch, ability: AppAbility): Promise<Article | null>;
  deleteArticle(id: string, ability: AppAbility): Promise<Article | null>;
}
