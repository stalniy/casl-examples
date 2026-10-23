import { Model, type ModelClass, type QueryBuilder } from 'objection';
import type { Knex } from 'knex';
import { interpret } from '@ucast/sql/objection';
import type { User, Article, Role } from '../domain.js';
import type { ArticlePatch, BlogRepository, QueryFilter, UserPatch } from './types.js';

export class ObjectionBlogRepository implements BlogRepository {
  readonly kind = 'objection';
  private readonly users: ModelClass<ObjectionUser>;
  private readonly articles: ModelClass<ObjectionArticle>;

  constructor(private readonly connection: Knex) {
    this.users = ObjectionUser.bindKnex(connection);
    this.articles = ObjectionArticle.bindKnex(connection);
  }

  schemaMetadata() {
    const models: Array<[ModelClass<Model>, string]> = [[this.users, 'User'], [this.articles, 'Article']];
    return models.map(([model, entity]) => ({
      entity,
      properties: Object.keys(model.jsonSchema.properties ?? {}).map(propertyName => ({
        propertyName,
        columnName: model.propertyNameToColumnName(propertyName),
      })),
    }));
  }

  async close(): Promise<void> {
    await this.connection.destroy();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const row = await this.users.query().findOne({ email });
    return row ? this.#toUser(row) : null;
  }

  async userExists(id: string): Promise<boolean> {
    return Boolean(await this.users.query().findById(id));
  }

  async articleExists(id: string): Promise<boolean> {
    return Boolean(await this.articles.query().findById(id));
  }

  async findUserById(id: string, filter: QueryFilter = { kind: 'all' }): Promise<User | null> {
    if (filter.kind === 'none') return null;
    const row = await this.#filter(this.users.query(), filter).findById(id);
    return row ? this.#toUser(row) : null;
  }

  async createUser(value: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const row = await this.users.query().insert({
      ...value, id: value.id ?? crypto.randomUUID(),
      createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(),
    });
    return this.#toUser(row);
  }

  async updateUser(id: string, patch: UserPatch, filter: QueryFilter): Promise<User | null> {
    if (filter.kind === 'none') return null;
    const affected = await this.#filter(this.users.query(), filter).where('id', id)
      .patch({ ...patch, updatedAt: new Date().toISOString() });
    return affected ? this.findUserById(id) : null;
  }

  async findArticle(id: string, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;
    const row = await this.#articleQuery(filter).findById(id);
    return row ? this.#toArticle(row) : null;
  }

  async listArticles(filter: QueryFilter, page: number, pageSize: number): Promise<{ items: Article[]; count: number }> {
    if (filter.kind === 'none') return { items: [], count: 0 };
    const count = await this.#filter(this.articles.query(), filter).resultSize();
    const rows = await this.#articleQuery(filter).orderBy('createdAt', 'desc').orderBy('id', 'asc')
      .limit(pageSize).offset((page - 1) * pageSize);
    return { items: rows.map(row => this.#toArticle(row)), count };
  }

  async createArticle(value: Omit<Article, 'id'> & { id?: string }): Promise<Article> {
    const { createdBy, ...attributes } = value;
    const row = await this.articles.query().insert({
      ...attributes, id: value.id ?? crypto.randomUUID(),
      createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(),
    });
    const created = await this.findArticle(row.id);
    if (!created) throw new Error('Created article could not be loaded with its author');
    return created;
  }

  async updateArticle(id: string, patch: ArticlePatch, filter: QueryFilter): Promise<Article | null> {
    if (filter.kind === 'none') return null;
    const current = await this.findArticle(id, filter);
    if (!current) return null;
    const updatedAt = new Date();
    const affected = await this.#filter(this.articles.query(), filter).where('id', id)
      .patch({ ...patch, updatedAt: updatedAt.toISOString() });
    return affected ? { ...current, ...patch, updatedAt } : null;
  }

  async deleteArticle(id: string, filter: QueryFilter): Promise<Article | null> {
    if (filter.kind === 'none') return null;
    const current = await this.findArticle(id, filter);
    if (!current) return null;
    const affected = await this.#filter(this.articles.query(), filter).where('id', id).delete();
    return affected ? current : null;
  }

  #filter<T extends Model>(query: QueryBuilder<T, T[]>, filter: QueryFilter) {
    if (filter.kind === 'ast') query.where(interpret(filter.ast, query.modelClass()));
    return query;
  }

  #articleQuery(filter: QueryFilter) {
    return this.#filter(this.articles.query(), filter).withGraphFetched('createdBy')
      .modifyGraph('createdBy', query => query.select('id', 'email'));
  }

  #toUser(row: ObjectionUser): User {
    return { ...row.toJSON(), createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) } as User;
  }

  #toArticle(row: ObjectionArticle): Article {
    return { ...row.toJSON(), createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) } as Article;
  }
}

export class ObjectionUser extends Model {
  static tableName = 'users';
  static jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' }, name: { type: ['string', 'null'] }, email: { type: 'string' },
      password: { type: 'string' }, role: { type: 'string' },
      createdAt: { type: 'string' }, updatedAt: { type: 'string' },
    },
  };
  id!: string;
  name!: string | null;
  email!: string;
  password!: string;
  role!: Role;
  createdAt!: string;
  updatedAt!: string;
}

export class ObjectionArticle extends Model {
  static tableName = 'articles';
  static jsonSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' }, author: { type: 'string' }, title: { type: 'string' },
      body: { type: 'string' }, published: { type: 'boolean' },
      createdAt: { type: 'string' }, updatedAt: { type: 'string' },
    },
  };
  static get relationMappings() {
    return {
      createdBy: {
        relation: Model.BelongsToOneRelation,
        modelClass: ObjectionUser,
        join: { from: 'articles.author', to: 'users.id' },
      },
    };
  }
  id!: string;
  author!: string;
  title!: string;
  body!: string;
  published!: boolean;
  createdAt!: string;
  updatedAt!: string;
  createdBy?: Pick<User, 'id' | 'email'>;

  $parseDatabaseJson(json: Record<string, any>) {
    const parsed = super.$parseDatabaseJson(json);
    if (parsed.published !== undefined) parsed.published = Boolean(parsed.published);
    return parsed;
  }
}
