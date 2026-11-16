import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mongo } from 'mongoose';
import { loadBlogFixtures } from '../../../fixtures/blog/index.mjs';

const { BSON, ObjectId } = mongo;
const { users, articles } = loadBlogFixtures();
const collections = {
  users: users.map(({ id, ...user }) => ({ _id: new ObjectId(id), ...user })),
  articles: articles.map(({ id, author, ...article }) => ({
    _id: new ObjectId(id),
    author: new ObjectId(author),
    ...article,
  })),
  // Retain the legacy collections as empty dumps, without stale references or test data.
  comments: [],
  posts: [],
};

for (const [collection, documents] of Object.entries(collections)) {
  const dump = Buffer.concat(documents.map(document => BSON.serialize(document)));
  writeFileSync(resolve(__dirname, `../db/blog/${collection}.bson`), dump);
}

console.log(`Built MongoDB fixtures: ${users.length} users and ${articles.length} articles`);
