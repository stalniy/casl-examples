import { EntitySchema, type MikroORM } from '@mikro-orm/sqlite';
import { createMikroORMInterpreter } from '@ucast/sql/mikro-orm';
import type { ArticlePatch, BlogRepository, QueryFilter, UserPatch } from './types.js';
import type { User, Article } from '../domain.js';

type UserRow = Omit<User, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string };
type ArticleRow = Omit<Article, 'author' | 'createdAt' | 'updatedAt' | 'createdBy'> & {
  author: UserRow;
  createdAt: string;
  updatedAt: string;
};
type ArticleWithAuthorRow = Omit<ArticleRow, 'author'> & {
  author: string;
  authorId: string;
  authorEmail: string;
};

export const MikroUsers = new EntitySchema<UserRow>({
  name: 'User',
  tableName: 'users',
  properties: {
    id: { type: 'string', primary: true, fieldName: 'id' },
    name: { type: 'string', nullable: true, fieldName: 'name' },
    email: { type: 'string', unique: true, fieldName: 'email' },
    password: { type: 'string', fieldName: 'password' },
    role: { type: 'string', fieldName: 'role' },
    createdAt: { type: 'string', fieldName: 'createdAt' },
    updatedAt: { type: 'string', fieldName: 'updatedAt' },
  },
});

export const MikroArticles = new EntitySchema<ArticleRow>({
  name: 'Article',
  tableName: 'articles',
  properties: {
    id: { type: 'string', primary: true, fieldName: 'id' },
    author: { kind: 'm:1', entity: () => MikroUsers, fieldName: 'author' },
    title: { type: 'string', fieldName: 'title' },
    body: { type: 'text', fieldName: 'body' },
    published: { type: 'boolean', fieldName: 'published' },
    createdAt: { type: 'string', fieldName: 'createdAt' },
    updatedAt: { type: 'string', fieldName: 'updatedAt' },
  }
});

export class MikroBlogRepository implements BlogRepository {
  readonly kind = 'mikro';

  private readonly interpret;

  constructor(private readonly orm: MikroORM) {
    this.interpret = createMikroORMInterpreter({
      metadata: orm.getMetadata(),
      platform: orm.em.getPlatform(),
    });
  }

  private get em() {
    return this.orm.em;
  }

  schemaMetadata() {
    return Array.from(this.orm.getMetadata().getAll().values())
      .filter(metadata => ['User', 'Article'].includes(metadata.className))
      .map(metadata => ({
        entity: metadata.className,
        properties: Object.entries(metadata.properties)
          .filter(([, property]) => property.fieldNames?.length)
          .map(([propertyName, property]) => ({
            propertyName,
            columnName: property.fieldNames[0],
          })),
      }));
  }

  async close(): Promise<void> {
    await this.orm.close(true);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const row = await this.em.findOne<UserRow>(MikroUsers, { email });
    return row ? this.#toUser(row) : null;
  }

  async userExists(id: string): Promise<boolean> {
    const user = await this.em.findOne(MikroUsers, { id });
    return user !== null;
  }

  async articleExists(id: string): Promise<boolean> {
    const article = await this.em.findOne(MikroArticles, { id });
    return article !== null;
  }

  async findUserById(id: string, filter: QueryFilter = { kind: 'all' }): Promise<User | null> {
    if (filter.kind === 'none') return null;

    const query = this.em.createQueryBuilder(MikroUsers, 'user').select('*');
    if (filter.kind === 'ast') query.andWhere(this.interpret(filter.ast, MikroUsers));
    query.andWhere({ id });
    const row = await query.execute('get', false);
    return row ? this.#toUser(row) : null;
  }

  async createUser(value: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const row = this.em.create<UserRow>(MikroUsers, {
      ...value,
      id: value.id ?? crypto.randomUUID(),
      createdAt: value.createdAt.toISOString(),
      updatedAt: value.updatedAt.toISOString(),
    });
    await this.em.persist(row).flush();
    return this.#toUser(row);
  }

  async updateUser(id: string, patch: UserPatch, filter: QueryFilter = { kind: 'all' }): Promise<User | null> {
    if (filter.kind === 'none') return null;

    const query = this.em.createQueryBuilder(MikroUsers, 'user')
      .update({ ...patch, updatedAt: new Date().toISOString() })
      .where({ id });
    if (filter.kind === 'ast') query.andWhere(this.interpret(filter.ast, MikroUsers));
    query.andWhere({ id });

    const result = await query.execute();
    this.em.clear();
    if (!result.affectedRows) return null;

    return this.findUserById(id);
  }

  async findArticle(id: string, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;

    const row = await this.#articleQuery(filter).andWhere({ id }).execute<ArticleWithAuthorRow | null>('get', false);
    return row ? this.#toArticle(row) : null;
  }

  async listArticles(filter: QueryFilter, page: number, pageSize: number): Promise<{ items: Article[]; count: number }> {
    if (filter.kind === 'none') return { items: [], count: 0 };

    const count = await this.#articleQuery(filter).getCount();
    const rows = await this.#articleQuery(filter)
      .orderBy({ createdAt: 'DESC', id: 'ASC' })
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute<ArticleWithAuthorRow[]>('all', false);
    const items = rows.map(row => this.#toArticle(row));
    return { items, count };
  }

  async createArticle(value: Omit<Article, 'id'> & { id?: string }): Promise<Article> {
    const row = this.em.create<ArticleRow>(MikroArticles, {
      ...value,
      author: this.em.getReference(MikroUsers, value.author),
      id: value.id ?? crypto.randomUUID(),
      createdAt: value.createdAt.toISOString(),
      updatedAt: value.updatedAt.toISOString(),
    });
    await this.em.persist(row).flush();
    const created = await this.findArticle(row.id);
    if (!created) throw new Error('Created article could not be loaded with its author');
    return created;
  }

  async updateArticle(id: string, patch: ArticlePatch, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;

    const current = await this.#articleQuery(filter).andWhere({ id }).execute<ArticleWithAuthorRow | null>('get', false);
    if (!current) return null;

    const updatedAt = new Date().toISOString();
    const query = this.em.createQueryBuilder(MikroArticles, 'article')
      .update({ ...patch, updatedAt })
      .where({ id });
    if (filter.kind === 'ast') query.andWhere(this.interpret(filter.ast, MikroArticles));
    query.andWhere({ id });

    const result = await query.execute();
    this.em.clear();
    if (!result.affectedRows) return null;
    return this.#toArticle({ ...current, ...patch, updatedAt });
  }

  async deleteArticle(id: string, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;

    const current = await this.#articleQuery(filter).andWhere({ id }).execute<ArticleWithAuthorRow | null>('get', false);
    if (!current) return null;

    const query = this.em.createQueryBuilder(MikroArticles, 'article')
      .delete()
      .where({ id });
    if (filter.kind === 'ast') query.andWhere(this.interpret(filter.ast, MikroArticles));
    query.andWhere({ id });

    const result = await query.execute();
    this.em.clear();
    return result.affectedRows ? this.#toArticle(current) : null;
  }

  #articleQuery(filter: QueryFilter) {
    const query = this.em.createQueryBuilder(MikroArticles, 'a')
      .select('a.*')
      .innerJoin('a.author', 'u')
      .addSelect(['u.id as authorId', 'u.email as authorEmail']);
    if (filter.kind === 'ast') query.andWhere(this.interpret(filter.ast, MikroArticles));
    return query;
  }

  #toUser(row: UserRow): User {
    return {
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  #toArticle(row: ArticleWithAuthorRow): Article {
    const { authorId, authorEmail, ...article } = row;
    return {
      ...article,
      createdAt: new Date(article.createdAt),
      updatedAt: new Date(article.updatedAt),
      published: Boolean(article.published),
      createdBy: { id: authorId, email: authorEmail },
    };
  }
}
