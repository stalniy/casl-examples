# Blog fixtures

The MongoDB blogs and the SQL blog share five technical articles from [articles](./articles). Four are published; “Test the boundaries of a permission rule” is a draft owned by writer@casl.io. Visitors see four articles, and that writer and the administrator see all five. All three demo accounts use the password `123456`.

Each `.md` file contains JSON frontmatter between `---` delimiters, followed by the article body. JSON is valid YAML and lets both examples read the same metadata without a parser dependency. Required fields are `id` (a unique, stable 24-character hex identifier), `title`, `author` (a demo email), `published` (a boolean), `createdAt`, and `updatedAt` (ISO timestamps). Keep paragraphs as plain prose: the existing React and Vue readers display the body as text with preserved line breaks.

`index.cjs` validates the metadata, resolves author emails to stable user IDs, and returns database-independent records. Keep articles here instead of editing database dumps or SQL seed code.

## MongoDB

After editing content, regenerate the checked-in BSON dumps from the repository root:

```sh
pnpm --dir packages/express-blog fixtures:build
```

Then follow the [MongoDB setup instructions](../../packages/express-blog/README.md) to restore into a fresh database. The same dump supports the Fastify Prisma MongoDB example. Generation writes local fixture files only; it does not connect to a database. Legacy posts and comments collections are empty.

## SQL

The seed command reads these files directly. From `packages/fastify-ucast-sql-blog`, choose an ORM and a fresh database:

```sh
DATABASE_URL=./journal.sqlite pnpm schema:mikro
DATABASE_URL=./journal.sqlite pnpm seed:mikro
DATABASE_URL=./journal.sqlite IMPLEMENTATION=mikro pnpm start
```

Substitute `typeorm`, `sequelize`, `objection`, or `drizzle-v1` for `mikro` as needed. Seeding refuses to overwrite existing fixture records. Use a fresh database to preview edited fixtures.
