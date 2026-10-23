import { MikroORM, SqliteDriver } from '@mikro-orm/sqlite';
import { DataSource } from 'typeorm';
import { Sequelize } from 'sequelize';
import knex from 'knex';
import { DrizzleV1BlogRepository } from '../repositories/drizzle-v1.js';
import type { BlogRepository } from '../repositories/types.js';
import { MikroBlogRepository, MikroUsers, MikroArticles } from '../repositories/mikro.js';
import { TypeOrmBlogRepository, TypeOrmUsers, TypeOrmArticles } from '../repositories/typeorm.js';
import { SequelizeBlogRepository } from '../repositories/sequelize.js';
import { ObjectionBlogRepository } from '../repositories/objection.js';

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
    case 'sequelize': {
      const sequelize = new Sequelize({ dialect: 'sqlite', storage: filename, logging: false });
      try {
        await sequelize.authenticate();
        return new SequelizeBlogRepository(sequelize);
      } catch (error) {
        await sequelize.close();
        throw error;
      }
    }
    case 'objection': {
      const connection = knex({
        client: 'better-sqlite3',
        connection: { filename },
        useNullAsDefault: true,
        pool: {
          min: 1,
          max: 1,
          afterCreate(db: { pragma(sql: string): unknown }, done: (error: Error | null, db: unknown) => void) {
            try {
              db.pragma('foreign_keys = ON');
              done(null, db);
            } catch (error) {
              done(error as Error, db);
            }
          },
        },
      });
      try {
        await connection.raw('SELECT 1');
        return new ObjectionBlogRepository(connection);
      } catch (error) {
        await connection.destroy();
        throw error;
      }
    }
    case 'drizzle-v1':
      return new DrizzleV1BlogRepository(filename);
    default:
      throw new Error(`Unknown implementation "${implementation}". Use mikro, typeorm, sequelize, objection or drizzle-v1.`);
  }
}
