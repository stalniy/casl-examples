import { EntitySchema, type DataSource, type Repository } from 'typeorm';
import { interpret } from '@ucast/sql/typeorm';
import type { ArticlePatch, BlogRepository, QueryFilter, UserPatch } from './types.js';
import type { User, Article } from '../domain.js';

type ArticleRow = Omit<Article, 'author' | 'createdBy'> & { author: User };

export const TypeOrmUsers = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: String, primary: true },
    name: { type: String, nullable: true },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
});

export const TypeOrmArticles = new EntitySchema<ArticleRow>({
  name: 'Article',
  tableName: 'articles',
  columns: {
    id: { type: String, primary: true },
    title: { type: String },
    body: { type: 'text' },
    published: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  relations: {
    author: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'author', referencedColumnName: 'id' },
      nullable: false,
    },
  },
});

export class TypeOrmBlogRepository implements BlogRepository {
  readonly kind = 'typeorm';
  private readonly users: Repository<User>;
  private readonly articles: Repository<ArticleRow>;

  constructor(private readonly dataSource: DataSource) {
    this.users = dataSource.getRepository<User>('User');
    this.articles = dataSource.getRepository<ArticleRow>('Article');
  }

  schemaMetadata() {
    return this.dataSource.entityMetadatas.map(metadata => ({
      entity: metadata.name,
      properties: metadata.columns.map(column => ({
        propertyName: column.propertyName,
        columnName: column.databaseName,
      })),
    }));
  }

  async close(): Promise<void> {
    await this.dataSource.destroy();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.findOneBy({ email });
  }

  async userExists(id: string): Promise<boolean> {
    return this.users.existsBy({ id });
  }

  async articleExists(id: string): Promise<boolean> {
    return this.articles.existsBy({ id });
  }

  async findUserById(id: string, filter: QueryFilter = { kind: 'all' }): Promise<User | null> {
    if (filter.kind === 'none') return null;

    const query = this.users.createQueryBuilder('user');
    if (filter.kind === 'ast') query.andWhere(interpret(filter.ast));
    query.andWhere('user.id = :requestedId', { requestedId: id });
    return query.getOne();
  }

  async createUser(value: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const user = this.users.create({ ...value, id: value.id ?? crypto.randomUUID() });
    return this.users.save(user);
  }

  async updateUser(id: string, patch: UserPatch, filter: QueryFilter = { kind: 'all' }): Promise<User | null> {
    if (filter.kind === 'none') return null;

    const query = this.users.createQueryBuilder('users')
      .update()
      .set({ ...patch, updatedAt: new Date() })
      .where('id = :requestedId', { requestedId: id });
    if (filter.kind === 'ast') query.andWhere(interpret(filter.ast));
    query.andWhere('id = :requestedId', { requestedId: id });

    const result = await query.execute();
    if (!result.affected) return null;
    return this.findUserById(id);
  }

  async findArticle(id: string, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;

    const row = await this.articleQuery(filter)
      .andWhere('article.id = :requestedId', { requestedId: id })
      .getOne();
    return row ? this.toArticle(row) : null;
  }

  async listArticles(filter: QueryFilter, page: number, pageSize: number): Promise<{ items: Article[]; count: number }> {
    if (filter.kind === 'none') return { items: [], count: 0 };

    const count = await this.articleQuery(filter).getCount();
    const rows = await this.articleQuery(filter)
      .orderBy('article.createdAt', 'DESC')
      .addOrderBy('article.id', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    const items = rows.map(row => this.toArticle(row));
    return { items, count };
  }

  async createArticle(value: Omit<Article, 'id'> & { id?: string }): Promise<Article> {
    const article = this.articles.create({
      ...value,
      id: value.id ?? crypto.randomUUID(),
      author: { id: value.author },
    });
    const saved = await this.articles.save(article);
    const created = await this.findArticle(saved.id);
    if (!created) throw new Error('Created article could not be loaded with its author');
    return created;
  }

  async updateArticle(id: string, patch: ArticlePatch, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;

    const current = await this.articleQuery(filter)
      .andWhere('article.id = :requestedId', { requestedId: id })
      .getOne();
    if (!current) return null;

    const updatedAt = new Date();
    const query = this.articles.createQueryBuilder('articles')
      .update()
      .set({ ...patch, updatedAt })
      .where('id = :requestedId', { requestedId: id });
    if (filter.kind === 'ast') query.andWhere(interpret(filter.ast));
    query.andWhere('id = :requestedId', { requestedId: id });

    const result = await query.execute();
    if (!result.affected) return null;
    return this.toArticle({ ...current, ...patch, updatedAt });
  }

  async deleteArticle(id: string, filter: QueryFilter = { kind: 'all' }): Promise<Article | null> {
    if (filter.kind === 'none') return null;

    const current = await this.articleQuery(filter)
      .andWhere('article.id = :requestedId', { requestedId: id })
      .getOne();
    if (!current) return null;

    const query = this.articles.createQueryBuilder('articles')
      .delete()
      .from('Article')
      .where('id = :requestedId', { requestedId: id });
    if (filter.kind === 'ast') query.andWhere(interpret(filter.ast));
    query.andWhere('id = :requestedId', { requestedId: id });

    const result = await query.execute();
    return result.affected ? this.toArticle(current) : null;
  }

  private articleQuery(filter: QueryFilter) {
    const query = this.articles.createQueryBuilder('article')
      .innerJoin('article.author', 'user')
      .addSelect(['user.id', 'user.email']);
    if (filter.kind === 'ast') query.andWhere(interpret(filter.ast));
    return query;
  }

  private toArticle(row: ArticleRow): Article {
    const { author, ...article } = row;
    return {
      ...article,
      author: author.id,
      createdBy: { id: author.id, email: author.email },
    };
  }
}
