# CASL with FeathersJS

Feathers services expose the same REST contract and MongoDB schema as
[`express-blog`](../express-blog), so either server can serve the React and Vue blog apps.

## Run

From the repository root:

```sh
pnpm --filter ./packages/feathersjs-blog --filter ./packages/express-blog install
docker compose -f packages/express-blog/docker-compose.yml up -d
pnpm --dir packages/feathersjs-blog seed
pnpm --dir packages/feathersjs-blog start
```

Wait for MongoDB to become writable before seeding. Seed only a fresh database;
if it already contains the shared blog fixtures, skip the seed command.
The default database is
`mongodb://root:blogpwd@localhost:27017/blog?authSource=admin&retryWrites=true&w=majority`.
Set `MONGODB_URI`, `SERVER_PORT` (default `3000`), and `AUTH_SECRET` to override the defaults.

## API and permissions

- `POST /api/session` accepts `{ "email": "writer@casl.io", "password": "123456" }`
  and returns `token`, `rules`, `email`, and `userId`.
- Send the token in the `Authorization` header, directly or with the `Bearer` prefix.
- `/api/articles` supports listing, creation, reads, patches, and deletion.
  Lists return `{ items, count }`, accept `page` and `pageSize`, and include author
  details under `createdBy`. Individual operations return `{ item }`.
- `/api/users` supports creation, reads, and patches. `/api/comments` exposes
  the document service using the Express comment schema.

Admins manage everything. Writers manage their own articles and comments and
read or update their own user. Anonymous visitors can read published articles.
The seeded accounts are `admin@casl.io`, `writer@casl.io`, and
`another.writer@casl.io`, all with password `123456`.

`src/hooks/abilities.js` translates Feathers methods into CASL actions and applies `accessibleBy` to list queries before pagination and counting. Individual records are authorized before writes. Mongoose validates changes before persisting them.
The schemas use the `users`, `articles`, and `comments` collections, with ObjectId article authors, timestamps, and JSON `id` virtuals matching Express.

## Tests

With a seeded MongoDB running and port 3000 available:

```sh
pnpm --dir packages/feathersjs-blog test
```

This starts the Feathers API, runs the tests in `express-blog/spec`, and closes the API and database connection afterward. CI also runs that contract against Feathers using the Express seed, verifying compatibility with its data.

## License

[MIT](./LICENSE)
