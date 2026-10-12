# Fastify blog with UCAST SQL

This example shares the Fastify blog API while selecting either MikroORM 7.x or TypeORM 1.x before startup. Both repositories run CASL's effective rule AST through the matching `@ucast/sql` ORM interpreter. SQLite files are independent: selecting another implementation does not move or migrate data.

The checked-in UCAST package is a reproducible packed build from UCAST commit `61b4ef843efe00e753d19c3e62c80c170fd8195a` (release PR 87, `@ucast/sql@0.2.1`). Its SHA-256 is `b660f717424eb6a59f8b851fcde5fcb66cec8d7ad69ccd09eaaa5a562a7983b0`. The build was performed in an isolated checkout under `/private/tmp/ucast-pr87`; the user's local UCAST checkout was not used. The upstream package's declaration export paths did not match the generated `dist/types/src/...` layout, so the isolated package manifest was corrected before packing. Runtime files are built from the pinned source; the tarball resolves `@ucast/core` to its declared `2.0.0` package dependency.

## Local setup

Install workspace dependencies from the repository root. The example test commands below invoke the checked-in Node scripts directly, so they also work in workspaces where pnpm has not approved all third-party install scripts.

```sh
pnpm install
```

Pick one implementation and prepare its SQLite file. The schema command is explicit and safe to rerun. The seed command inserts the admin, writer, another writer, one published article, and one draft. Seed refuses to run when the admin fixture already exists.

```sh
cd packages/fastify-ucast-sql-blog
DATABASE_URL=./blog-mikro.sqlite pnpm schema:mikro
DATABASE_URL=./blog-mikro.sqlite pnpm seed:mikro
```

For TypeORM, use a separate file:

```sh
DATABASE_URL=./blog-typeorm.sqlite pnpm schema:typeorm
DATABASE_URL=./blog-typeorm.sqlite pnpm seed:typeorm
```

Start the matching implementation. `DATABASE_URL` accepts a relative or absolute SQLite filename; `file:` is also accepted.

```sh
IMPLEMENTATION=mikro DATABASE_URL=./blog-mikro.sqlite AUTH_SECRET=local-secret pnpm start
# or
IMPLEMENTATION=typeorm DATABASE_URL=./blog-typeorm.sqlite AUTH_SECRET=local-secret pnpm start
```

`IMPLEMENTATION` must be `mikro` or `typeorm`. The default is `mikro`; the default database filename is `blog-mikro.sqlite`. The server never creates or clears schema/data on startup. It closes the selected ORM connection when Fastify closes.

## API and rules

The API stays under `/api`: `POST /session`, user create/read/update routes, and article list/read/create/update/delete routes. Session response shape, string IDs, article `author`, list `createdBy`, and the reference pagination bounds are retained. Anonymous users see published articles, writers also see their own drafts and manage their own articles, and admins can manage all records. Unavailable individual resources and writes without an authorized target return 404, empty accessible lists return `{ items: [], count: 0 }`, denied creation returns 403, and a denied publish transition on an authorized target returns 403.

The repositories own ORM metadata, query construction, UCAST interpretation, and writes. Their metadata keeps property names and physical column names identical, including `author`, `createdAt`, and `updatedAt`. Access to existing records uses the SQL predicate for list/count/read/update/delete; updates and deletes keep the authorization predicate in the changing statement. Object checks remain for create and proposed publish transitions.

## Shared SQLite integration suite

The same API/repository integration suite runs against each real SQLite adapter:

```sh
IMPLEMENTATION=mikro volta run --node 24.14.1 node --import tsx --test spec/*.spec.ts
IMPLEMENTATION=typeorm volta run --node 24.14.1 node --import tsx --test spec/*.spec.ts

# Run the original Express API contract suite against each Fastify SQL adapter.
IMPLEMENTATION=mikro volta run --node 24.14.1 node --import tsx spec/run-express-contract.cjs
IMPLEMENTATION=typeorm volta run --node 24.14.1 node --import tsx spec/run-express-contract.cjs
```

The suite covers role visibility, stable pagination and matching counts, missing and inaccessible identifiers, atomic owner writes, denied-write persistence, authorized-but-denied publish transitions, create/publish/user access, durable user updates, CASL rule priority/inversion, unconditional and absent permissions, identifier plus condition composition, quoted parameter values, unsupported UCAST translation, and generated property/column metadata.

The source Express contracts include historical 403 expectations for inaccessible article reads and foreign publish attempts. The runner changes those expected statuses to 404 in memory to match this example's no-authorized-target behavior; source files are unchanged. It also converts the session suite's `it.only` to `it` so every contract runs.

To refresh the vendored UCAST artifact, clone UCAST into a disposable directory, check out the pinned commit, install the lockfile, build `@ucast/core` and `@ucast/sql`, correct the generated declaration paths in the isolated `packages/sql/package.json`, pack `@ucast/sql`, then replace `vendor/ucast-sql-0.2.1.tgz` and update this hash. Do not use a registry `@ucast/sql` release for this example.
