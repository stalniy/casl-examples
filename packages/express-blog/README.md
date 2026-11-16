# Example of CASL integration with Express 5 and TypeScript 6

Read [CASL in Expressjs app][casl-express-example] for details.

[CASL](https://casl.js.org) is an isomorphic authorization JavaScript library which restricts what resources a given user is allowed to access.

This is an example API which shows how integrate CASL in blog application. There are 3 entities:
* User
* Post
* Comment

Permission logic (i.e., abilities) is defined in `src/modules/auth/abilities.ts`. Rules can be specified for authenticated and anonymous users, so potentially it's quite easy to give access to anonymous users to write comments.

Application uses `passport-jwt` for authentication. The main logic is built on top of modules, all in `src/modules`.

The API uses CASL 7 and Mongoose 9. See [@casl/ability][casl-ability] and [@casl/mongoose][casl-mongoose] for details.

**Warning**: this code is just an example and doesn't follow best practices everywhere (e.g. it stores passwords without hashing).

## Installation

Use Node.js 24 and pnpm. From the repository root:

```sh
pnpm install
pnpm --dir packages/express-blog seed
pnpm --filter blog-express start
```

`start` compiles the strict TypeScript source to `dist` before starting the API on port 3000. Express 5 forwards rejected async handlers to the error middleware directly.

From `packages/express-blog`, the available development commands are:

```sh
pnpm dev        # Run TypeScript with Node.js type stripping and --watch
pnpm seed       # Seed MongoDB from the shared Markdown fixtures
pnpm typecheck  # Check types with TypeScript 6
pnpm build      # Compile to dist
pnpm test       # Build and run the API tests against MongoDB
```

The tests require a database loaded with the demo fixtures below. They create and update records, so use a separate test database. Set `MONGODB_URI` to override the default connection, for example:

```sh
export MONGODB_URI=mongodb://localhost:27017/blog_test
pnpm seed
pnpm test
```

MongoDB must be running before seeding or starting the API. By default, both commands connect to `mongodb://root:blogpwd@localhost:27017/blog?authSource=admin&retryWrites=true&w=majority`. Set `MONGODB_URI` to use another database.

This repository contains three demo users and five technical articles about CASL and authorization (four published and one writer-owned draft), shared with the SQL blog through [frontmatter fixtures](../../fixtures/blog/README.md). From `packages/express-blog`, seed a fresh database:

```sh
pnpm seed
```

To run MongoDB in a container, start it before seeding and wait until it is ready to accept connections:

```sh
docker compose up -d
pnpm seed
```

The TypeScript seed script reads `fixtures/blog/articles` directly and preserves the stable user and article IDs, author references, publication status, and timestamps. After editing those files, run `pnpm seed` against a fresh database to preview the changes. Seeding refuses to overwrite existing fixture IDs or demo user emails.

## Instruction to login

1. Create new user

```
POST http://localhost:3000/api/users
{
   "email": "casl@medium.com",
   "password": "password"
}
```

2. Create new session

```
POST http://localhost:3000/api/session
{
  "email": "admin@casl.io",
  "password": "123456"
}

200 OK
{ "token": "....", "rules": [], "email": "admin@casl.io", "userId": "..." }
```

3. Put access token in `Authorization` header for all future requests


## Routes

* /api/articles
* /api/articles/:id/comments
* /api/users
* /api/session

There are 3 users available:
* admin@casl.io / 123456
* another.writer@casl.io / 123456
* writer@casl.io / 123456

[casl-express-example]: https://medium.com/@sergiy.stotskiy/authorization-with-casl-in-express-app-d94eb2e2b73b
[casl-ability]: https://github.com/stalniy/casl/tree/master/packages/casl-ability
[casl-mongoose]: https://github.com/stalniy/casl/tree/master/packages/casl-mongoose
