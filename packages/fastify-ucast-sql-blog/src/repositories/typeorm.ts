import { DataSource, EntitySchema } from 'typeorm';
import { interpret } from '@ucast/sql/typeorm';
import { PublishDeniedError, type BlogRepository } from './types.js';
import { accessFor } from './authorization.js';
import { subject, type AppAbility, type User, type Article } from '../domain.js';

const Users = new EntitySchema<User>({ name: 'User', tableName: 'users', columns: {
  id: { type: String, primary: true }, name: { type: String, nullable: true }, email: { type: String, unique: true }, password: { type: String }, role: { type: String },
  createdAt: { type: Date }, updatedAt: { type: Date },
} });
const Articles = new EntitySchema<Article>({ name: 'Article', tableName: 'articles', columns: {
  id: { type: String, primary: true }, author: { type: String }, title: { type: String }, body: { type: 'text' }, published: { type: Boolean },
  createdAt: { type: Date }, updatedAt: { type: Date },
} });

export async function createTypeOrmRepository(filename: string): Promise<BlogRepository> {
  const dataSource = new DataSource({ type: 'better-sqlite3' as any, database: filename, entities: [Users, Articles], synchronize: false });
  await dataSource.initialize();
  const users = dataSource.getRepository(Users);
  const articles = dataSource.getRepository(Articles);
  const withAuthor = async (row: any): Promise<Article> => {
    if (!row) return row;
    const author = await users.findOneBy({ id: row.author } as any);
    return { ...row, createdBy: author ? { id: author.id, email: author.email } : undefined };
  };
  const getAccess = (ability: AppAbility, action: 'read' | 'update' | 'delete') => accessFor(ability, action, 'Article');
  return {
    kind: 'typeorm',
    schemaMetadata: () => dataSource.entityMetadatas.map(meta => ({ entity: meta.name, properties: meta.columns.map(column => ({ propertyName: column.propertyName, columnName: column.databaseName })) })),
    close: async () => { await dataSource.destroy(); },
    findLogin: async email => (await users.findOneBy({ email } as any)) as User | null,
    findUserForAuthentication: async id => await users.findOneBy({ id } as any) as User | null,
    findUserById: async (id, ability) => { const c = accessFor(ability, 'read', 'User'); if (c.kind === 'none') return null; const qb = users.createQueryBuilder('user'); if (c.kind === 'ast') interpret(c.ast, qb); qb.andWhere('user.id = :requestedId', { requestedId: id }); return await qb.getOne() as User | null; },
    createUser: async value => await users.save(users.create({ ...value, id: crypto.randomUUID() } as any)) as unknown as User,
    updateUser: async (id, patch, ability) => { const repo = users; const c = accessFor(ability, 'update', 'User'); if (c.kind === 'none') return null; const qb = repo.createQueryBuilder('users').update().set({ ...patch, updatedAt: new Date() } as any).where('id = :requestedId', { requestedId: id }); if (c.kind === 'ast') interpret(c.ast, qb as any); qb.andWhere('id = :requestedId', { requestedId: id }); if (!(await qb.execute()).affected) return null; const read = accessFor(ability, 'read', 'User'); if (read.kind === 'none') return null; const reread = repo.createQueryBuilder('user'); if (read.kind === 'ast') interpret(read.ast, reread); reread.andWhere('user.id = :requestedId', { requestedId: id }); return await reread.getOne() as User | null; },
    findArticle: async (id, ability) => {
      const access = getAccess(ability, 'read'); if (access.kind === 'none') return null;
      const qb = articles.createQueryBuilder('article'); if (access.kind === 'ast') interpret(access.ast, qb);
      qb.andWhere('article.id = :requestedId', { requestedId: id });
      return withAuthor(await qb.getOne());
    },
    listArticles: async (ability, page, pageSize) => {
      const access = getAccess(ability, 'read'); if (access.kind === 'none') return { items: [], count: 0 };
      const make = () => { const qb = articles.createQueryBuilder('article'); if (access.kind === 'ast') interpret(access.ast, qb); return qb; };
      const count = await make().getCount();
      const rows = await make().orderBy('article.createdAt', 'ASC').addOrderBy('article.id', 'ASC').skip((page - 1) * pageSize).take(pageSize).getMany();
      return { items: await Promise.all(rows.map(withAuthor)), count };
    },
    createArticle: async value => withAuthor(await articles.save(articles.create({ ...value, id: crypto.randomUUID() } as any))),
    updateArticle: async (id, patch, ability) => {
      const access = getAccess(ability, 'update'); if (access.kind === 'none') return null;
      const target = articles.createQueryBuilder('article'); if (access.kind === 'ast') interpret(access.ast, target);
      target.andWhere('article.id = :requestedId', { requestedId: id });
      const before = await target.getOne(); if (!before) return null;
      if (patch.published === true && !before.published && !ability.can('publish', subject('Article', { ...before, ...patch } as Article) as any)) throw new PublishDeniedError();
      const qb = articles.createQueryBuilder('articles').update().set({ ...patch, updatedAt: new Date() } as any).where('id = :requestedId', { requestedId: id });
      if (access.kind === 'ast') interpret(access.ast, qb as any);
      qb.andWhere('id = :requestedId', { requestedId: id });
      const result = await qb.execute(); return result.affected ? withAuthor({ ...before, ...patch, updatedAt: new Date() }) : null;
    },
    deleteArticle: async (id, ability) => {
      const access = getAccess(ability, 'delete'); if (access.kind === 'none') return null;
      const target = articles.createQueryBuilder('article'); if (access.kind === 'ast') interpret(access.ast, target);
      target.andWhere('article.id = :requestedId', { requestedId: id });
      const before = await target.getOne(); if (!before) return null;
      const qb = articles.createQueryBuilder('articles').delete().from(Articles).where('id = :requestedId', { requestedId: id });
      if (access.kind === 'ast') interpret(access.ast, qb as any);
      qb.andWhere('id = :requestedId', { requestedId: id });
      return (await qb.execute()).affected ? withAuthor(before) : null;
    },
  };
}
