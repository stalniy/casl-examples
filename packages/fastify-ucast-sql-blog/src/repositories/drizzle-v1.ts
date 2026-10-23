import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { and, asc, count, desc, eq, getColumns, defineRelations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createDrizzleInterpreter } from '@ucast/sql/drizzle-orm/v1.x';
import type { Article, Role, User } from '../domain.js';
import type { ArticlePatch, BlogRepository, QueryFilter, UserPatch } from './types.js';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').$type<Role>().notNull(),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey().notNull(),
  author: text('author').notNull().references(() => users.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

export const articleRelations = defineRelations({ users, articles }, r => ({
  articles: {
    createdBy: r.one.users({ from: r.articles.author, to: r.users.id, optional: false }),
  },
}));
const schema = { users, articles, articleRelations };
const interpret = createDrizzleInterpreter({ schema });

type UserRow = typeof users.$inferSelect;
type ArticleRow = typeof articles.$inferSelect & { createdBy: Pick<User, 'id' | 'email'> };

export class DrizzleV1BlogRepository implements BlogRepository {
  readonly kind = 'drizzle-v1';
  private readonly connection;
  private readonly db;

  constructor(filename: string) {
    const connection = new Database(filename);
    try {
      connection.pragma('foreign_keys = ON');
      this.db = drizzle({ client: connection, relations: articleRelations });
      this.connection = connection;
    } catch (error) {
      connection.close();
      throw error;
    }
  }

  schemaMetadata() {
    return ([[users, 'User'], [articles, 'Article']] as const).map(([table, entity]) => ({
      entity,
      properties: Object.entries(getColumns(table))
        .map(([propertyName, column]) => ({ propertyName, columnName: column.name })),
    }));
  }

  async close(): Promise<void> {
    this.connection.close();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const row = this.db.select().from(users).where(eq(users.email, email)).get();
    return row ? this.#toUser(row) : null;
  }

  async userExists(id: string): Promise<boolean> {
    return Boolean(this.db.select({ id: users.id }).from(users).where(eq(users.id, id)).get());
  }

  async articleExists(id: string): Promise<boolean> {
    return Boolean(this.db.select({ id: articles.id }).from(articles).where(eq(articles.id, id)).get());
  }

  async findUserById(id: string, filter: QueryFilter = { kind: 'all' }): Promise<User | null> {
    const row = this.db.select().from(users).where(and(eq(users.id, id), this.#filter('users', filter))).get();
    return row ? this.#toUser(row) : null;
  }

  async createUser(value: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const row = this.db.insert(users).values({
      ...value, id: value.id ?? crypto.randomUUID(),
      createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(),
    }).returning().get();
    return this.#toUser(row);
  }

  async updateUser(id: string, patch: UserPatch, filter: QueryFilter): Promise<User | null> {
    const row = this.db.update(users).set({ ...patch, updatedAt: new Date().toISOString() })
      .where(and(eq(users.id, id), this.#filter('users', filter))).returning().get();
    return row ? this.#toUser(row) : null;
  }

  async findArticle(id: string, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    const row = this.#articleQuery().where(and(eq(articles.id, id), this.#filter('articles', filter))).get();
    return row ? this.#toArticle(row) : null;
  }

  async listArticles(filter: QueryFilter, page: number, pageSize: number): Promise<{ items: Article[]; count: number }> {
    const predicate = this.#filter('articles', filter);
    const total = this.db.select({ count: count() }).from(articles).where(predicate).get()!;
    const rows = this.#articleQuery().where(predicate).orderBy(desc(articles.createdAt), asc(articles.id))
      .limit(pageSize).offset((page - 1) * pageSize).all();
    return { items: rows.map(row => this.#toArticle(row)), count: total.count };
  }

  async createArticle(value: Omit<Article, 'id'> & { id?: string }): Promise<Article> {
    const { createdBy, ...attributes } = value;
    const row = this.db.insert(articles).values({
      ...attributes, id: value.id ?? crypto.randomUUID(),
      createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(),
    }).returning().get();
    const created = await this.findArticle(row.id);
    if (!created) throw new Error('Created article could not be loaded with its author');
    return created;
  }

  async updateArticle(id: string, patch: ArticlePatch, filter: QueryFilter): Promise<Article | null> {
    const current = await this.findArticle(id, filter);
    if (!current) return null;
    const updatedAt = new Date();
    const result = this.db.update(articles).set({ ...patch, updatedAt: updatedAt.toISOString() })
      .where(and(eq(articles.id, id), this.#filter('articles', filter))).run();
    return result.changes ? { ...current, ...patch, updatedAt } : null;
  }

  async deleteArticle(id: string, filter: QueryFilter): Promise<Article | null> {
    const current = await this.findArticle(id, filter);
    if (!current) return null;
    const result = this.db.delete(articles)
      .where(and(eq(articles.id, id), this.#filter('articles', filter))).run();
    return result.changes ? current : null;
  }

  #filter(table: 'users' | 'articles', filter: QueryFilter) {
    if (filter.kind === 'none') return sql`0 = 1`;
    return filter.kind === 'ast' ? interpret(filter.ast, table) : undefined;
  }

  #articleQuery() {
    return this.db.select({ ...getColumns(articles), createdBy: { id: users.id, email: users.email } })
      .from(articles).innerJoin(users, eq(articles.author, users.id));
  }

  #toUser(row: UserRow): User {
    return { ...row, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
  }

  #toArticle(row: ArticleRow): Article {
    return { ...row, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
  }
}
