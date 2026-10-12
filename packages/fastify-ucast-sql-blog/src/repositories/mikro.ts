import { MikroORM, EntitySchema } from '@mikro-orm/sqlite';
import { interpret } from '@ucast/sql/mikro-orm';
import { PublishDeniedError, type BlogRepository } from './types.js';
import { accessFor } from './authorization.js';
import { subject, type AppAbility, type User, type Article } from '../domain.js';

const Users = new EntitySchema<any>({ name: 'User', tableName: 'users', properties: {
  id: { type: 'string', primary: true, fieldName: 'id' }, name: { type: 'string', nullable: true, fieldName: 'name' }, email: { type: 'string', unique: true, fieldName: 'email' },
  password: { type: 'string', fieldName: 'password' }, role: { type: 'string', fieldName: 'role' }, createdAt: { type: 'string', fieldName: 'createdAt' }, updatedAt: { type: 'string', fieldName: 'updatedAt' },
} });
const Articles = new EntitySchema<any>({ name: 'Article', tableName: 'articles', properties: {
  id: { type: 'string', primary: true, fieldName: 'id' }, author: { type: 'string', fieldName: 'author' }, title: { type: 'string', fieldName: 'title' }, body: { type: 'text', fieldName: 'body' },
  published: { type: 'boolean', fieldName: 'published' }, createdAt: { type: 'string', fieldName: 'createdAt' }, updatedAt: { type: 'string', fieldName: 'updatedAt' },
} });

export async function createMikroRepository(filename: string): Promise<BlogRepository> {
  const orm = await MikroORM.init({ entities: [Users, Articles], dbName: filename, driver: (await import('@mikro-orm/sqlite')).SqliteDriver, allowGlobalContext: true });
  const em: any = orm.em;
  const user = (row: any): User => row && ({ ...row, createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt), updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt) });
  const article = async (row: any): Promise<Article> => {
    if (!row) return row;
    const author = await em.findOne(Users, { id: row.author });
    return { ...row, createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt), updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt), published: !!row.published, createdBy: author ? { id: author.id, email: author.email } : undefined };
  };
  const condition = (ability: AppAbility, action: 'read' | 'update' | 'delete') => accessFor(ability, action, 'Article');
  return {
    kind: 'mikro',
    schemaMetadata: () => Array.from(orm.getMetadata().getAll().values()).filter((meta: any) => ['User', 'Article'].includes(meta.className)).map((meta: any) => ({ entity: meta.className, properties: Object.entries(meta.properties).filter(([, property]: any) => property.fieldNames?.length).map(([propertyName, property]: any) => ({ propertyName, columnName: property.fieldNames[0] })) })),
    close: () => orm.close(true),
    findLogin: async email => { const row = await em.findOne(Users, { email }); return row ? user(row) : null; },
    findUserForAuthentication: async id => { const row = await em.findOne(Users, { id }); return row ? user(row) : null; },
    findUserById: async (id, ability) => { const c = accessFor(ability, 'read', 'User'); if (c.kind === 'none') return null; const qb = em.createQueryBuilder(Users, 'user').select('*'); if (c.kind === 'ast') interpret(c.ast, qb); qb.andWhere({ id }); const row = await qb.execute('get', false); return row ? user(row) : null; },
    createUser: async value => { const row = em.create(Users, { ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(), id: crypto.randomUUID() }); await em.persist(row).flush(); return user(row); },
    updateUser: async (id, patch, ability) => {
      const c = accessFor(ability, 'update', 'User'); if (c.kind === 'none') return null;
      const qb = em.createQueryBuilder(Users, 'user').update({ ...patch, updatedAt: new Date().toISOString() }).where({ id }); if (c.kind === 'ast') interpret(c.ast, qb); qb.andWhere({ id });
      const result = await qb.execute(); em.clear();
      if (!result.affectedRows) return null;
      const reread = em.createQueryBuilder(Users, 'user').select('*'); if (c.kind === 'ast') interpret(c.ast, reread); reread.andWhere({ id });
      const updated = await reread.execute('get', false); return updated ? user(updated) : null;
    },
    findArticle: async (id, ability) => {
      const access = condition(ability, 'read'); if (access.kind === 'none') return null;
      const qb = em.createQueryBuilder(Articles, 'article').select('*');
      if (access.kind === 'ast') interpret(access.ast, qb);
      qb.andWhere({ id });
      const row = await qb.execute('get', false); return row ? article(row) : null;
    },
    listArticles: async (ability, page, pageSize) => {
      const access = condition(ability, 'read'); if (access.kind === 'none') return { items: [], count: 0 };
      const make = () => { const qb = em.createQueryBuilder(Articles, 'article').select('*'); if (access.kind === 'ast') interpret(access.ast, qb); return qb; };
      const count = await make().getCount();
      const rows = await make().orderBy({ createdAt: 'ASC', id: 'ASC' }).limit(pageSize).offset((page - 1) * pageSize).execute('all', false);
      return { items: await Promise.all(rows.map(article)), count };
    },
    createArticle: async value => { const row = em.create(Articles, { ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(), id: crypto.randomUUID() }); await em.persist(row).flush(); return article(row); },
    updateArticle: async (id, patch, ability) => {
      const access = condition(ability, 'update'); if (access.kind === 'none') return null;
      const target = em.createQueryBuilder(Articles, 'article').select('*'); if (access.kind === 'ast') interpret(access.ast, target);
      target.andWhere({ id }); const current = await target.execute('get', false); if (!current) return null;
      if (patch.published === true && !Boolean(current.published) && !ability.can('publish', subject('Article', { ...current, ...patch } as Article) as any)) throw new PublishDeniedError();
      const update = em.createQueryBuilder(Articles, 'article').update({ ...patch, updatedAt: new Date().toISOString() }).where({ id });
      if (access.kind === 'ast') interpret(access.ast, update);
      update.andWhere({ id });
      const result = await update.execute(); em.clear(); if (!result.affectedRows) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() }; return article(updated);
    },
    deleteArticle: async (id, ability) => {
      const access = condition(ability, 'delete'); if (access.kind === 'none') return null;
      const target = em.createQueryBuilder(Articles, 'article').select('*'); if (access.kind === 'ast') interpret(access.ast, target);
      target.andWhere({ id }); const current = await target.execute('get', false); if (!current) return null;
      const del = em.createQueryBuilder(Articles, 'article').delete().where({ id });
      if (access.kind === 'ast') interpret(access.ast, del);
      del.andWhere({ id });
      const result = await del.execute(); em.clear(); return result.affectedRows ? article(current) : null;
    },
  };
}
