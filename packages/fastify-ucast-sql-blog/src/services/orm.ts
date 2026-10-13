import { MikroORM, SqliteDriver } from '@mikro-orm/sqlite';
import { DataSource } from 'typeorm';
import type { BlogRepository } from '../repositories/types.js';
import { MikroBlogRepository, MikroUsers, MikroArticles } from '../repositories/mikro.js';
import { TypeOrmBlogRepository, TypeOrmUsers, TypeOrmArticles } from '../repositories/typeorm.js';

export async function initializeOrm(implementation: string, databaseUrl: string): Promise<BlogRepository> {
  const filename = databaseUrl.startsWith('file:') ? databaseUrl.slice(5) : databaseUrl;

  switch (implementation) {
    case 'mikro': {
      const orm = await MikroORM.init({
        entities: [MikroUsers, MikroArticles],
        dbName: filename,
        driver: SqliteDriver,
        allowGlobalContext: true,
      });
      return new MikroBlogRepository(orm);
    }
    case 'typeorm': {
      const dataSource = new DataSource({
        type: 'better-sqlite3',
        database: filename,
        entities: [TypeOrmUsers, TypeOrmArticles],
        synchronize: false,
      });
      await dataSource.initialize();
      return new TypeOrmBlogRepository(dataSource);
    }
    default:
      throw new Error(`Unknown implementation "${implementation}". Use mikro or typeorm.`);
  }
}
