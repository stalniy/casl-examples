# Blog fixtures

The MongoDB blogs and the SQL blog share five technical articles from [articles](./articles). Four are published; “Test the boundaries of a permission rule” is a draft owned by writer@casl.io. Visitors see four articles, and that writer and the administrator see all five. All three demo accounts use the password `123456`.

Each `.md` file contains JSON frontmatter between `---` delimiters, followed by the article body. JSON is valid YAML and lets both examples read the same metadata without a parser dependency. Required fields are `id` (a unique, stable 24-character hex identifier), `title`, `author` (a demo email), `published` (a boolean), `createdAt`, and `updatedAt` (ISO timestamps). Keep paragraphs as plain prose: the existing React and Vue readers display the body as text with preserved line breaks.

`index.mjs` validates the metadata, resolves author emails to stable user IDs, and returns database-independent records. Keep articles here instead of editing database dumps or SQL seed code.

## MongoDB

The TypeScript seed script reads these files directly. Start MongoDB, then run from the repository root:

```sh
pnpm --dir packages/express-blog seed
```

Set `MONGODB_URI` to choose a database. Follow the [MongoDB setup instructions](../../packages/express-blog/README.md) for the default connection and Docker setup. The same seeded database supports the Fastify Prisma MongoDB example. Seeding refuses to overwrite existing fixture IDs or demo user emails; use a fresh database to preview edited fixtures.

## SQL

The seed command reads these files directly. From `packages/fastify-ucast-sql-blog`, choose an ORM and a fresh database:

```sh
DATABASE_URL=./journal.sqlite pnpm schema:mikro
DATABASE_URL=./journal.sqlite pnpm seed:mikro
DATABASE_URL=./journal.sqlite IMPLEMENTATION=mikro pnpm start
```

Substitute `typeorm`, `sequelize`, `objection`, or `drizzle-v1` for `mikro` as needed. Seeding refuses to overwrite existing fixture records. Use a fresh database to preview edited fixtures.
