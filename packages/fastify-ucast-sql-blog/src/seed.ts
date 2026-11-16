import 'reflect-metadata';
import { resolve } from 'node:path';
// @ts-expect-error
import { loadBlogFixtures } from '../../../fixtures/blog/index.mjs';
import { initializeOrm } from './services/orm.js';

async function seed() {
  const implementation = process.argv[2];
  if (!['mikro', 'typeorm', 'sequelize', 'objection', 'drizzle-v1'].includes(implementation)) {
    throw new Error('Usage: tsx src/seed.ts mikro|typeorm|sequelize|objection|drizzle-v1');
  }
  const configuredPath = process.env.DATABASE_URL ?? `./blog-${implementation}.sqlite`;
  const filename = resolve(configuredPath.startsWith('file:') ? configuredPath.slice(5) : configuredPath);
  // Validate all source files before connecting or inserting any records.
  const { users, articles } = loadBlogFixtures();
  const repo = await initializeOrm(implementation, filename);
  try {
    for (const user of users) {
      if (await repo.findUserByEmail(user.email) || await repo.userExists(user.id)) {
        throw new Error('Seed data already exists. Use a new DATABASE_URL to create a clean fixture database.');
      }
    }
    for (const article of articles) {
      if (await repo.articleExists(article.id)) {
        throw new Error('Seed data already exists. Use a new DATABASE_URL to create a clean fixture database.');
      }
    }
    for (const user of users) await repo.createUser(user);
    for (const article of articles) await repo.createArticle(article);
    console.log(`Seeded ${users.length} users and ${articles.length} articles in ${filename}`);
  } finally {
    await repo.close();
  }
}
seed().catch(error => { console.error(error); process.exitCode = 1; });
