import { col, DataTypes, fn, literal, Model, Op, type ModelStatic, type Sequelize, type WhereOptions } from 'sequelize';
import { interpret } from '@ucast/sql/sequelize';
import sqlUtils from 'sequelize/lib/utils/sql';
import type { User, Article } from '../domain.js';
import type { ArticlePatch, BlogRepository, QueryFilter, UserPatch } from './types.js';

type ArticleRow = Omit<Article, 'createdBy'> & { createdBy?: Pick<User, 'id' | 'email'> };

export class SequelizeBlogRepository implements BlogRepository {
  readonly kind = 'sequelize';
  private readonly users;
  private readonly articles;

  constructor(private readonly sequelize: Sequelize) {
    ({ users: this.users, articles: this.articles } = defineSequelizeModels(sequelize));
  }

  schemaMetadata() {
    return ([this.users, this.articles] as ModelStatic<Model>[]).map(model => ({
      entity: model.name,
      properties: Object.entries(model.getAttributes()).map(([propertyName, attribute]) => ({
        propertyName,
        columnName: attribute.field ?? propertyName,
      })),
    }));
  }

  async close(): Promise<void> {
    await this.sequelize.close();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const row = await this.users.findOne({ where: { email } });
    return row ? this.#toUser(row) : null;
  }

  async userExists(id: string): Promise<boolean> {
    return Boolean(await this.users.count({ where: { id } }));
  }

  async articleExists(id: string): Promise<boolean> {
    return Boolean(await this.articles.count({ where: { id } }));
  }

  async findUserById(id: string, filter: QueryFilter = { kind: 'all' }): Promise<User | null> {
    if (filter.kind === 'none') return null;
    const row = await this.users.findOne(this.#queryOptions(this.users, filter, id, 'User'));
    return row ? this.#toUser(row) : null;
  }

  async createUser(value: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const row = await this.users.create({ ...value, id: value.id ?? crypto.randomUUID() });
    return this.#toUser(row);
  }

  async updateUser(id: string, patch: UserPatch, filter: QueryFilter): Promise<User | null> {
    if (filter.kind === 'none') return null;
    const [affected] = await this.users.update({ ...patch, updatedAt: new Date() }, {
      ...this.#queryOptions(this.users, filter, id),
    });
    return affected ? this.findUserById(id) : null;
  }

  async findArticle(id: string, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;
    const row = await this.articles.findOne({
      ...this.#queryOptions(this.articles, filter, id, 'Article'),
      include: [{ association: 'createdBy', attributes: ['id', 'email'], required: true }],
    });
    return row ? this.#toArticle(row) : null;
  }

  async listArticles(filter: QueryFilter, page: number, pageSize: number): Promise<{ items: Article[]; count: number }> {
    if (filter.kind === 'none') return { items: [], count: 0 };
    const { rows, count } = await this.articles.findAndCountAll({
      ...this.#queryOptions(this.articles, filter, undefined, 'Article'),
      include: [{ association: 'createdBy', attributes: ['id', 'email'], required: true }],
      // Existing SQLite files can contain both ISO and Sequelize timestamp formats.
      order: [[fn('julianday', col('Article.createdAt')), 'DESC'], ['id', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return { items: rows.map(row => this.#toArticle(row)), count };
  }

  async createArticle(value: Omit<Article, 'id'> & { id?: string }): Promise<Article> {
    const { createdBy, ...attributes } = value;
    const row = await this.articles.create({ ...attributes, id: value.id ?? crypto.randomUUID() });
    const created = await this.findArticle(row.getDataValue('id'));
    if (!created) throw new Error('Created article could not be loaded with its author');
    return created;
  }

  async updateArticle(id: string, patch: ArticlePatch, filter: QueryFilter): Promise<Article | null> {
    if (filter.kind === 'none') return null;
    const current = await this.findArticle(id, filter);
    if (!current) return null;
    const updatedAt = new Date();
    const [affected] = await this.articles.update({ ...patch, updatedAt }, {
      ...this.#queryOptions(this.articles, filter, id),
    });
    return affected ? { ...current, ...patch, updatedAt } : null;
  }

  async deleteArticle(id: string, filter: QueryFilter): Promise<Article | null> {
    if (filter.kind === 'none') return null;
    const current = await this.findArticle(id, filter);
    if (!current) return null;
    const affected = await this.articles.destroy(this.#queryOptions(this.articles, filter, id));
    return affected ? current : null;
  }

  #queryOptions(model: typeof this.users | typeof this.articles, filter: QueryFilter, id?: string, alias?: string) {
    let condition: WhereOptions = {};
    if (filter.kind === 'ast') {
      const { where, replacements } = interpret(filter.ast, model, { alias });
      // Sequelize 6 UPDATE generates binds internally, which cannot coexist with replacements.
      // Use its own SQL-aware replacement escaping before composing the native query.
      const dialect = (this.sequelize as unknown as { dialect: Parameters<typeof sqlUtils.injectReplacements>[1] }).dialect;
      condition = literal(sqlUtils.injectReplacements(where.val as string, dialect, replacements));
    }
    return { where: id === undefined ? condition : { [Op.and]: [{ id }, condition] } };
  }

  #toUser(model: Model<User>): User {
    const row = model.get({ plain: true });
    return { ...row, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
  }

  #toArticle(model: Model<ArticleRow>): Article {
    const row = model.get({ plain: true });
    return { ...row, published: Boolean(row.published), createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
  }
}

export function defineSequelizeModels(sequelize: Sequelize) {
  const users = sequelize.define<Model<User>>('User', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  }, { tableName: 'users', timestamps: false });
  const articles = sequelize.define<Model<ArticleRow>>('Article', {
    id: { type: DataTypes.STRING, primaryKey: true },
    author: { type: DataTypes.STRING, allowNull: false, references: { model: users, key: 'id' } },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    published: { type: DataTypes.BOOLEAN, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  }, { tableName: 'articles', timestamps: false });
  articles.belongsTo(users, { as: 'createdBy', foreignKey: 'author' });
  return { users, articles };
}
