import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { ensureSqliteSchema } from './sqlite-schema.js';

const implementation = process.argv[2];
if (!['mikro', 'typeorm', 'sequelize', 'objection'].includes(implementation)) throw new Error('Usage: tsx src/schema.ts mikro|typeorm|sequelize|objection');
const configuredPath = process.env.DATABASE_URL ?? `./blog-${implementation}.sqlite`;
const filename = resolve(configuredPath.startsWith('file:') ? configuredPath.slice(5) : configuredPath);
mkdirSync(dirname(filename), { recursive: true });
const db = new Database(filename);
ensureSqliteSchema(db);
db.close();
console.log(`Schema ready for ${implementation}: ${filename}`);
