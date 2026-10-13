# Fastify blog with UCAST SQL

This example shares the Fastify blog API while selecting MikroORM 7.x, TypeORM 1.x, Sequelize 6.x, or Objection 3.x before startup. All repositories run CASL's effective rule AST through the matching `@ucast/sql` ORM interpreter. SQLite files are independent: selecting another implementation does not move or migrate data. Sequelize uses the `sqlite3` driver; Objection uses Knex with `better-sqlite3`.

## Local setup

Install workspace dependencies from the repository root. The example test commands below invoke the checked-in Node scripts directly, so they also work in workspaces where pnpm has not approved all third-party install scripts.

```sh
pnpm install
```

Pick one implementation and prepare its SQLite file. The schema command is explicit and safe to rerun. The seed command inserts the admin, writer, another writer, one published article, and one draft. Seed refuses to run when the admin fixture already exists.

```sh
cd packages/fastify-ucast-sql-blog
pnpm schema:mikro # or schema:typeorm or schema:sequelize or schema:objection
pnpm seed:mikro # or schema:typeorm or schema:sequelize or schema:objection
```

it will automatically create `blog-${orm}.sqlite` database file in the current directory. It's also possible to configure this by specifying `DATABASE_URL` environment variable, for example:

```sh
DATABASE_URL=./blog-typeorm.sqlite pnpm schema:typeorm
DATABASE_URL=./blog-typeorm.sqlite pnpm seed:typeorm
```

To start the matching implementation. `DATABASE_URL` accepts a relative or absolute SQLite filename; `file:` is also accepted.

```sh
IMPLEMENTATION=mikro pnpm start
```

`IMPLEMENTATION` variable can be one of `mikro`, `typeorm`, `sequelize`, or `objection`. The default is `mikro`; the default database filename is `blog-${IMPLEMENTATION}$.sqlite`, also possible to set `DATABASE_URL` to provide custom database path. The server never creates or clears schema/data on startup. It closes the selected ORM connection when Fastify closes.

## API and rules

The API stays under `/api`: `POST /session`, user create/read/update routes, and article list/read/create/update/delete routes. Session response shape, string IDs, article `author`, list `createdBy`, and the reference pagination bounds are retained. Anonymous users see published articles, writers also see their own drafts and manage their own articles, and admins can manage all records. Missing individual resources return 404; existing resources that the caller cannot access or change return 403. Article lists return newest records first, and empty accessible lists return `{ items: [], count: 0 }`. Denied creation and publish transitions return 403.

`src/createApp.ts` composes the app and registers the `auth`, `users`, and `articles` modules under `src/modules`, matching the Fastify Prisma example. Each module exposes its routes through `index.ts`; authentication, ability definitions, and token services live in the auth module. Shared entity types remain in `src/domain.ts`, and app configuration is defined in `src/config.ts`.

`src/services/orm.ts` initializes the selected ORM and returns a `MikroBlogRepository`, `TypeOrmBlogRepository`, `SequelizeBlogRepository`, or `ObjectionBlogRepository` instance to `createApp.ts`. The app injects that repository into `BlogService` and exposes the service to routes and authentication. `src/services/blog.ts` owns record permissions, create and publish checks, and missing/forbidden results. It derives query filters from CASL rules through `src/services/authorization.ts` so lists and counts include only accessible records.

Entity schemas live alongside their corresponding repository classes in `src/repositories`. Repositories only perform database operations: metadata inspection, query construction, UCAST interpretation of supplied filters, and writes. They do not receive abilities or decide permissions. Their metadata keeps property names and physical column names identical, including `author`, `createdAt`, and `updatedAt`. Updates and deletes apply the service's filters in the changing SQL statement.

Sequelize combines the interpreter's `where` expression with the requested identifier using `Op.and`, selecting the model alias for reads and the table name for writes. Objection applies the interpreter directly to its query builder and binds its models to each repository's Knex connection. Both expose the author through `createdBy` while retaining the scalar `author` column, and normalize timestamps to domain `Date` values.

## Testing

To test api contracts, run server running on port 3000 (default), and then run `npm run test:server` from `packages/express-blog`.
