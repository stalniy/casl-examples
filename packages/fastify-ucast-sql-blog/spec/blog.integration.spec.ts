import 'reflect-metadata';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { ensureSqliteSchema } from '../src/sqlite-schema.js';
import { AbilityBuilder, createMongoAbility, subject } from '@casl/ability';
import { createApp } from '../src/app.js';
import { createMikroRepository } from '../src/repositories/mikro.js';
import { createTypeOrmRepository } from '../src/repositories/typeorm.js';
import type { BlogRepository } from '../src/repositories/types.js';
import { defineAbilityFor } from '../src/domain.js';
import type { AppAbility, Article } from '../src/domain.js';
import { PublishDeniedError } from '../src/repositories/types.js';

const implementation = process.env.IMPLEMENTATION ?? 'mikro';
const root = mkdtempSync(join(tmpdir(), `fastify-ucast-${implementation}-`));
const filename = join(root, 'blog.sqlite');
const config = { IMPLEMENTATION: implementation, DATABASE_URL: filename, SERVER_PORT: 0, AUTH_SECRET: 'integration-secret', AUTH_ISSUER: 'test', AUTH_AUDIENCE: 'test' };
let repo: BlogRepository;
let app: Awaited<ReturnType<typeof createApp>>;
let adminToken: string;
let writerToken: string;
let otherToken: string;
let adminId: string;
let writerId: string;
let otherId: string;
let publicId: string;
let writerDraftId: string;
let otherDraftId: string;
let createdArticleId: string;

before(async () => {
  const db = new Database(filename);
  ensureSqliteSchema(db);
  db.close();
  repo = implementation === 'mikro' ? await createMikroRepository(filename) : await createTypeOrmRepository(filename);
  app = await createApp(config, repo);
  const now = new Date();
  const admin = await repo.createUser({ id: 'admin-1', name: 'Admin', email: 'admin@casl.io', password: '123456', role: 'admin', createdAt: now, updatedAt: now } as any);
  const writer = await repo.createUser({ id: 'writer-1', name: 'Writer', email: 'writer@casl.io', password: '123456', role: 'writer', createdAt: now, updatedAt: now } as any);
  const other = await repo.createUser({ id: 'other-1', name: 'Other', email: 'other@casl.io', password: '123456', role: 'writer', createdAt: now, updatedAt: now } as any);
  adminId = admin.id; writerId = writer.id; otherId = other.id;
  const publicArticle = await repo.createArticle({ id: 'article-public', author: otherId, title: 'Public', body: 'visible', published: true, createdAt: now, updatedAt: now } as any);
  const writerDraft = await repo.createArticle({ id: 'article-writer-draft', author: writerId, title: 'Writer draft', body: 'mine', published: false, createdAt: now, updatedAt: now } as any);
  const otherDraft = await repo.createArticle({ id: 'article-other-draft', author: otherId, title: 'Other draft', body: 'hidden', published: false, createdAt: now, updatedAt: now } as any);
  publicId = publicArticle.id; writerDraftId = writerDraft.id; otherDraftId = otherDraft.id;
  adminToken = (await app.inject({ method: 'POST', url: '/api/session', payload: { email: 'admin@casl.io', password: '123456' } })).json().token;
  writerToken = (await app.inject({ method: 'POST', url: '/api/session', payload: { email: 'writer@casl.io', password: '123456' } })).json().token;
  otherToken = (await app.inject({ method: 'POST', url: '/api/session', payload: { email: 'other@casl.io', password: '123456' } })).json().token;
});

after(async () => { await app?.close(); rmSync(root, { recursive: true, force: true }); });

const request = (method: string, url: string, token?: string, payload?: any): any => app.inject({ method: method as any, url, headers: token ? { authorization: `Bearer ${token}` } : {}, payload } as any);

test(`${implementation}: anonymous, writer and admin article visibility; count matches items`, async () => {
  const anon = await request('GET', '/api/articles?page=1&pageSize=100');
  assert.equal(anon.statusCode, 200); assert.equal(anon.json().count, 1); assert.deepEqual(anon.json().items.map((a: Article) => a.id), [publicId]);
  const writer = await request('GET', '/api/articles?page=1&pageSize=100', writerToken);
  assert.equal(writer.json().count, 2); assert.deepEqual(writer.json().items.map((a: Article) => a.id).sort(), [publicId, writerDraftId].sort());
  assert.equal(writer.json().items.find((item: Article) => item.id === publicId).createdBy.email, 'other@casl.io');
  const admin = await request('GET', '/api/articles?page=1&pageSize=100', adminToken);
  assert.equal(admin.json().count, 3); assert.equal(admin.json().items.length, admin.json().count);
  const page = await request('GET', '/api/articles?page=2&pageSize=5', writerToken);
  assert.equal(page.json().count, 2); assert.deepEqual(page.json().items, []);
});

test(`${implementation}: accessible and inaccessible identifier reads, including missing ids`, async () => {
  assert.equal((await request('GET', `/api/articles/${publicId}`)).statusCode, 200);
  assert.equal((await request('GET', `/api/articles/${writerDraftId}`, writerToken)).statusCode, 200);
  assert.equal((await request('GET', `/api/articles/${otherDraftId}`, writerToken)).statusCode, 404);
  assert.equal((await request('GET', '/api/articles/missing', adminToken)).statusCode, 404);
});

test(`${implementation}: owner writes are atomic and denied writes leave data intact`, async () => {
  const own = await request('POST', '/api/articles', writerToken, { title: 'Temporary owned draft', body: 'for update/delete checks' });
  const ownId = own.json().item.id;
  assert.equal((await request('PATCH', `/api/articles/${ownId}`, writerToken, { title: {} })).statusCode, 400);
  const updated = await request('PATCH', `/api/articles/${ownId}`, writerToken, { title: 'Updated own draft' });
  if (updated.statusCode !== 200) console.error(updated.body);
  assert.equal(updated.statusCode, 200); assert.equal(updated.json().item.title, 'Updated own draft');
  const before = (await repo.findArticle(otherDraftId, defineAbilityFor({ id: otherId, role: 'writer' })))!;
  const denied = await request('PATCH', `/api/articles/${otherDraftId}`, writerToken, { title: 'tampered' });
  assert.equal(denied.statusCode, 404);
  const stored = await repo.findArticle(otherDraftId, defineAbilityFor({ id: otherId, role: 'writer' }));
  assert.equal(stored?.title, before.title);
  assert.equal((await request('DELETE', `/api/articles/${otherDraftId}`, writerToken)).statusCode, 404);
  assert.ok(await repo.findArticle(otherDraftId, defineAbilityFor({ id: otherId, role: 'writer' })));
  assert.equal((await request('PATCH', `/api/articles/${otherDraftId}`, writerToken, { published: true })).statusCode, 404);
  assert.equal((await repo.findArticle(otherDraftId, defineAbilityFor({ id: otherId, role: 'writer' })))?.published, false);
  assert.equal((await request('DELETE', `/api/articles/${ownId}`, writerToken)).statusCode, 200);
});

test(`${implementation}: create, publish, user authorization and persisted user updates`, async () => {
  assert.equal((await request('POST', '/api/articles', undefined, { title: 'Denied', body: 'anonymous' })).statusCode, 403);
  const created = await request('POST', '/api/articles', writerToken, { title: "Writer's quote", body: 'body' });
  assert.equal(created.statusCode, 200); assert.equal(created.json().item.author, writerId);
  createdArticleId = created.json().item.id;
  assert.equal((await request('PATCH', `/api/articles/${publicId}`, writerToken, { published: false })).statusCode, 404);
  const published = await request('PATCH', `/api/articles/${created.json().item.id}`, writerToken, { published: true });
  assert.equal(published.statusCode, 200); assert.equal(published.json().item.published, true);
  const self = await request('GET', `/api/users/${writerId}`, writerToken); assert.equal(self.statusCode, 200);
  assert.equal((await request('GET', `/api/users/${otherId}`, writerToken)).statusCode, 404);
  assert.equal((await request('PATCH', `/api/users/${otherId}`, writerToken, { name: 'No' })).statusCode, 404);
  const change = await request('PATCH', `/api/users/${writerId}`, writerToken, { name: 'Persisted name' });
  assert.equal(change.json().item.name, 'Persisted name');
  assert.equal((await request('GET', `/api/users/${writerId}`, writerToken)).json().item.name, 'Persisted name');
  assert.equal((await request('POST', '/api/users', writerToken, { role: 'writer', email: 'blocked@example.com', password: '123456' })).statusCode, 403);
  const adminCreated = await request('POST', '/api/users', adminToken, { role: 'writer', email: 'created@example.com', password: '123456' });
  assert.equal(adminCreated.statusCode, 201);
  assert.equal((await request('GET', `/api/users/${adminCreated.json().item.id}`, adminToken)).statusCode, 200);
});

test(`${implementation}: an authorized update with a denied publish transition returns a typed denial without mutation`, async () => {
  const rules = new AbilityBuilder<AppAbility>(createMongoAbility as any);
  rules.can('update', 'Article', { author: writerId });
  rules.can('publish', 'Article', { author: writerId, title: 'Publish permitted title' });
  const ability = createMongoAbility<AppAbility>(rules.rules as any);
  const before = await repo.findArticle(writerDraftId, defineAbilityFor({ id: writerId, role: 'writer' }));
  assert.ok(before);
  await assert.rejects(() => repo.updateArticle(writerDraftId, { published: true }, ability), PublishDeniedError);
  const after = await repo.findArticle(writerDraftId, defineAbilityFor({ id: writerId, role: 'writer' }));
  assert.equal(after?.published, false);
  assert.equal(after?.title, before.title);
});

test(`${implementation}: UCAST rule composition matches CASL checks and preserves bound identifiers`, async () => {
  const allRules = new AbilityBuilder<AppAbility>(createMongoAbility as any); allRules.can('read', 'Article');
  const all = createMongoAbility<AppAbility>(allRules.rules as any);
  const allRows = (await repo.listArticles(all, 1, 100)).items;
  assert.equal(allRows.length, 4);
  const fixtures = allRows;
  assert.deepEqual(allRows.map(article => article.id).sort(), fixtures.filter(article => all.can('read', subject('Article', article) as any)).map(article => article.id).sort());
  const none = createMongoAbility<AppAbility>([] as any);
  const noRows = (await repo.listArticles(none, 1, 100)).items;
  assert.deepEqual(noRows.map(article => article.id), fixtures.filter(article => none.can('read', subject('Article', article) as any)).map(article => article.id));
  assert.equal((await repo.listArticles(none, 1, 100)).count, 0);
  assert.equal(await repo.updateArticle(writerDraftId, { title: 'denied by empty ability' }, none), null);
  assert.equal((await repo.findArticle(writerDraftId, all))?.title, 'Writer draft');
  const overlapping = new AbilityBuilder<AppAbility>(createMongoAbility as any);
  overlapping.can('read', 'Article', { published: true }); overlapping.cannot('read', 'Article', { author: otherId });
  const overlapAbility = createMongoAbility<AppAbility>(overlapping.rules as any);
  const rows = (await repo.listArticles(overlapAbility, 1, 100)).items;
  const expected = fixtures.filter(article => overlapAbility.can('read', subject('Article', article) as any)).map(article => article.id).sort();
  assert.deepEqual(rows.map(row => row.id).sort(), expected);
  const overriding = new AbilityBuilder<AppAbility>(createMongoAbility as any);
  overriding.cannot('read', 'Article', { published: true }); overriding.can('read', 'Article', { author: writerId });
  const overrideAbility = createMongoAbility<AppAbility>(overriding.rules as any);
  const overriddenRows = (await repo.listArticles(overrideAbility, 1, 100)).items;
  const expectedOverride = fixtures.filter(article => overrideAbility.can('read', subject('Article', article) as any)).map(article => article.id).sort();
  assert.deepEqual(overriddenRows.map(row => row.id).sort(), expectedOverride);
});

test(`${implementation}: quote parameter binding and unsupported translation fails closed`, async () => {
  const now = new Date();
  const quote = await repo.createArticle({ author: writerId, title: "Quoted: 'binding test'", body: 'body', published: false, createdAt: now, updatedAt: now });
  const quoteRules = new AbilityBuilder<AppAbility>(createMongoAbility as any); quoteRules.can('read', 'Article', { title: "Quoted: 'binding test'" });
  const quoteAbility = createMongoAbility<AppAbility>(quoteRules.rules as any);
  const matches = await repo.listArticles(quoteAbility, 1, 100);
  assert.equal(matches.count, 1); assert.equal(matches.items[0].title, "Quoted: 'binding test'");
  assert.equal((await repo.findArticle(matches.items[0].id, quoteAbility))?.id, matches.items[0].id);
  assert.equal(await repo.findArticle(publicId, quoteAbility), null);
  const invalidRules = new AbilityBuilder<AppAbility>(createMongoAbility as any); invalidRules.can('read', 'Article', { title: { $regex: '.*' } } as any); invalidRules.can('update', 'Article', { title: { $regex: '.*' } } as any); invalidRules.can('delete', 'Article', { title: { $regex: '.*' } } as any);
  const invalid = createMongoAbility<AppAbility>(invalidRules.rules as any);
  await assert.rejects(() => repo.listArticles(invalid, 1, 100));
  const before = (await repo.listArticles(createMongoAbility<AppAbility>([{ action: 'manage', subject: 'all' }] as any), 1, 100)).items.find(item => item.id === quote.id)!;
  await assert.rejects(() => repo.updateArticle(quote.id, { title: 'must not change' }, invalid));
  await assert.rejects(() => repo.updateArticle(otherDraftId, { title: 'must not reveal target' }, invalid), /regex|operator|unsupported|translate/i);
  await assert.rejects(() => repo.deleteArticle(otherDraftId, invalid), /regex|operator|unsupported|translate/i);
  assert.equal((await repo.findArticle(quote.id, createMongoAbility<AppAbility>([{ action: 'manage', subject: 'all' }] as any)))?.title, before.title);
});

test(`${implementation}: generated ORM metadata keeps scalar property and database column names identical`, () => {
  const metadata = repo.schemaMetadata();
  for (const entity of ['User', 'Article']) {
    const properties = metadata.find(value => value.entity === entity)?.properties ?? [];
    for (const propertyName of entity === 'User' ? ['createdAt', 'updatedAt'] : ['createdAt', 'updatedAt', 'author']) {
      const property = properties.find(value => value.propertyName === propertyName);
      assert.ok(property, `${entity}.${propertyName} is present in ORM metadata`);
      assert.equal(property.columnName, propertyName);
    }
  }
});

test(`${implementation}: restarting the selected server keeps stored SQLite data`, async () => {
  const before = (await request('GET', '/api/articles?page=1&pageSize=100', adminToken)).json().count;
  await app.close();
  app = await createApp(config);
  const response = await request('GET', '/api/articles?page=1&pageSize=100', adminToken);
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().count, before);
});
