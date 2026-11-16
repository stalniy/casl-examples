import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIRNAME = import.meta.dirname;

export function loadBlogFixtures(){
  const createdAt = new Date('2026-10-01T09:00:00.000Z');
  const users = [
    { id: '5db68f694aa0ede2d83bfd6c', name: 'Admin', email: 'admin@casl.io', role: 'admin' },
    { id: '5db68f774aa0ede2d83bfd6e', name: 'Writer', email: 'writer@casl.io', role: 'writer' },
    { id: '5db68f6f4aa0ede2d83bfd6d', name: 'Another writer', email: 'another.writer@casl.io', role: 'writer' },
  ].map(user => ({ ...user, password: '123456', createdAt, updatedAt: createdAt }));
  const authors = new Map(users.map(user => [user.email, user.id]));
  const ids = new Set();
  const articles = readdirSync(join(DIRNAME, 'articles'))
    .filter(filename => filename.endsWith('.md'))
    .sort()
    .map(filename => {
      const source = readFileSync(join(DIRNAME, 'articles', filename), 'utf8').replace(/\r\n/g, '\n');
      const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source);
      if (!match) throw new Error(`${filename}: expected frontmatter between --- delimiters`);
      // JSON is a subset of YAML. Restricting metadata to JSON keeps the loader dependency-free.
      let metadata;
      try {
        metadata = JSON.parse(match[1]);
      } catch (error) {
        throw new Error(`${filename}: invalid JSON frontmatter`, { cause: error });
      }
      const { id, title, author, published } = metadata;
      const body = match[2].trim();
      const createdAt = new Date(metadata.createdAt);
      const updatedAt = new Date(metadata.updatedAt);
      if (!/^[a-f0-9]{24}$/.test(id) || ids.has(id)
        || typeof title !== 'string' || !title.trim() || !body
        || !authors.has(author) || typeof published !== 'boolean'
        || typeof metadata.createdAt !== 'string' || !Number.isFinite(createdAt.getTime())
        || typeof metadata.updatedAt !== 'string' || !Number.isFinite(updatedAt.getTime())
        || updatedAt < createdAt) {
        throw new Error(`${filename}: invalid article id, title, author, publication status, or dates`);
      }
      ids.add(id);
      return { id, title, author: authors.get(author), body, published, createdAt, updatedAt };
    });

  return { users, articles };
}
