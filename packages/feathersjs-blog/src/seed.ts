// @ts-expect-error The shared fixture loader is JavaScript without type declarations.
import { loadBlogFixtures } from '../../../fixtures/blog/index.mjs';
import { connectDatabase } from './database.ts';
import type { ArticleRecord, UserRecord } from './models/index.ts';

const fixtures: {
  users: (Omit<UserRecord, '_id'> & { id: string })[];
  articles: (Omit<ArticleRecord, '_id' | 'author'> & { id: string; author: string })[];
} = loadBlogFixtures();
const { connection, User, Article } = await connectDatabase();
try {
  const users = fixtures.users.map(({ id, ...data }) => new User({ _id: id, ...data }));
  const articles = fixtures.articles.map(({ id, ...data }) => new Article({ _id: id, ...data }));
  for (const user of users) {
    if (await User.exists({ $or: [{ _id: user._id }, { email: user.email }] })) {
      throw new Error('Seed data already exists. Use a fresh MONGODB_URI to load clean fixtures.');
    }
  }
  for (const article of articles) {
    if (await Article.exists({ _id: article._id })) {
      throw new Error('Seed data already exists. Use a fresh MONGODB_URI to load clean fixtures.');
    }
  }
  await User.insertMany(users);
  await Article.insertMany(articles);
  console.log(`Seeded ${users.length} users and ${articles.length} articles`);
} finally {
  await connection.close();
}
