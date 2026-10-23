import 'reflect-metadata';
import { resolve } from 'node:path';
import { initializeOrm } from './services/orm.js';

async function seed() {
const implementation = process.argv[2];
if (!['mikro', 'typeorm', 'sequelize', 'objection', 'drizzle-v1'].includes(implementation)) throw new Error('Usage: tsx src/seed.ts mikro|typeorm|sequelize|objection|drizzle-v1');
const configuredPath = process.env.DATABASE_URL ?? `./blog-${implementation}.sqlite`;
const filename = resolve(configuredPath.startsWith('file:') ? configuredPath.slice(5) : configuredPath);
const repo = await initializeOrm(implementation, filename);
try {
  const existing = await repo.findUserByEmail('admin@casl.io');
  if (existing) throw new Error('Seed data already exists. Use a new DATABASE_URL to create a clean fixture database.');
  const now = new Date();
  const admin = await repo.createUser({ name: 'Admin', email: 'admin@casl.io', password: '123456', role: 'admin', createdAt: now, updatedAt: now });
  const writer = await repo.createUser({ name: 'Writer', email: 'writer@casl.io', password: '123456', role: 'writer', createdAt: now, updatedAt: now });
  await repo.createUser({ name: 'Another writer', email: 'another.writer@casl.io', password: '123456', role: 'writer', createdAt: now, updatedAt: now });
  await repo.createArticle({ author: admin.id, title: 'Welcome', body: 'Published example article', published: true, createdAt: now, updatedAt: now });
  await repo.createArticle({ author: writer.id, title: 'Writer draft', body: 'Draft example article', published: false, createdAt: now, updatedAt: now });
  console.log(`Seeded admin@casl.io and writer@casl.io in ${filename}`);
} finally { await repo.close(); }
}
seed().catch(error => { console.error(error); process.exitCode = 1; });
