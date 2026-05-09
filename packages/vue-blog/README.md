# CASL integration example with Vue 3 + Vuex + REST API

This example shows how to integrate [CASL](https://casl.js.org) in a [Vue 3](https://vuejs.org/) application with Vuex, Vite, and a REST API.

## Installation

```sh
# install deps from the monorepo root
pnpm install

# run the app on localhost:8080
pnpm --filter casl-vue-api-example dev
```

## Description

This application is a basic blog with login, logout, article listing, article editing, and article publishing controls driven by CASL rules returned by the server.

The CASL integration lives in [src/store/ability.js](src/store/ability.js). When `createSession` is committed, the shared ability instance is updated from the API rules. When `destroySession` runs, ability is reset to a read-only baseline.

The HTTP service is built on top of `fetch` and reads its base URL from `VITE_API_URL`, falling back to `http://localhost:3000/api`.

## Server side

REST API is expected to be available at `http://localhost:3000/api` and support CORS headers.

This example was originally implemented against [Rails + CanCanCan][rails-api], but any backend that returns the same session and article payloads can be used.

[rails-api]: https://github.com/stalniy/rails-cancan-api-example

## Alternative server side API

You can also use the API from [CASL Express example][express-api].

[express-api]: https://github.com/stalniy/casl-examples/tree/master/packages/express-blog

## Versions

This package is aligned with the repo's modern Vue stack:

- `vite`: `^7.3.2`
- `typescript`: `~6.0.2`
- `vue`: `^3.5.33`
- `@casl/ability`: `7.0.0-rc`
- `@casl/vue`: `3.0.0-rc`

## License

MIT
