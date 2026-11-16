import mongoose from 'mongoose';
// @ts-expect-error The shared fixture loader is JavaScript without type declarations.
import { loadBlogFixtures } from '../../../fixtures/blog/index.mjs';
import { connectDatabase } from './database.ts';
import User from './modules/users/model.ts';
import Article from './modules/posts/model.ts';

async function seed() {
  // Validate the source files and construct all documents before connecting.
  const fixtures = loadBlogFixtures();
  const users = [];
  const articles = [];
  for (const { id, ...user } of fixtures.users) {
    users.push(new User({ _id: id, ...user }));
  }
  for (const { id, ...article } of fixtures.articles) {
    articles.push(new Article({ _id: id, ...article }));
  }

  try {
    await connectDatabase();
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
    await mongoose.disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
