import type { User, Article } from '../domain.js';
export type ArticleInput = Pick<Article, 'title' | 'body'> & { published?: boolean };
export type ArticlePatch = Partial<ArticleInput>;
export type UserInput = Pick<User, 'email' | 'password' | 'role'> & { name?: string };
export type UserPatch = Partial<Pick<User, 'name' | 'email' | 'password'>>;
export type QueryFilter = { kind: 'all' } | { kind: 'none' } | { kind: 'ast'; ast: any };

export interface BlogRepository {
  readonly kind: 'mikro' | 'typeorm' | 'sequelize' | 'objection' | 'drizzle-v1';
  schemaMetadata(): Array<{ entity: string; properties: Array<{ propertyName: string; columnName: string }> }>;
  close(): Promise<void>;
  findUserByEmail(email: string): Promise<User | null>;
  userExists(id: string): Promise<boolean>;
  findUserById(id: string, filter?: QueryFilter): Promise<User | null>;
  createUser(user: Omit<User, 'id'> & { id?: string }): Promise<User>;
  updateUser(id: string, patch: UserPatch, filter: QueryFilter): Promise<User | null>;
  findArticle(id: string, filter: QueryFilter): Promise<Article | null>;
  articleExists(id: string): Promise<boolean>;
  listArticles(filter: QueryFilter, page: number, pageSize: number): Promise<{ items: Article[]; count: number }>;
  createArticle(article: Omit<Article, 'id'> & { id?: string }): Promise<Article>;
  updateArticle(id: string, patch: ArticlePatch, filter: QueryFilter): Promise<Article | null>;
  deleteArticle(id: string, filter: QueryFilter): Promise<Article | null>;
}
