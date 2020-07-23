# CASL integration example with Vue + Vuex + REST API

This example shows how to integrate [CASL](https://casl.js.org) in [Vue](https://vuejs.org) application with Vuex and REST API.

## Installation

```sh
# install deps
npm install

# serve with hot reload at localhost:8080
npm run serve
```

## Description

This application is a basic blog application with possibility to login, logout and manage articles. User abilities are received from server and later stored in localStorage.

`Ability` plugin for Vuex store can be found in [src/store/ability.js](src/store/ability.js).
When user successfully login (i.e., `createSession` mutation is dispatched in store), ability is updated and when user logout (i.e., `destroySession` mutation is dispatched) ability is reset to read-only mode.

`http` service is built on top of Fetch API with some hacky code (it is not important for this example).
Also this example uses [vuetify](https://vuetifyjs.com/en/) as UI library

## Server side

REST API is expected to be available at `http://localhost:3000/api` and support CORS headers.
This example was tested and implemented together with [Rails5 + Cancan][rails-api] but API can be implemented in whatever language you want.
It's just a showcase that CASL can be seamlessly integrated with awesome [Cancan](https://github.com/CanCanCommunity/cancancan) ruby gem

See [README][rails-api] of the rails REST API for details on how to setup server.

[rails-api]: https://github.com/stalniy/rails-cancan-api-example

## Alternative Server side API

You can use [CASL Express API][express-api] together with this UI. This API uses MongoDB as a database, so you will need to have one running on localhost (you can set the connection string to MongoDB in [src/app.js](https://github.com/stalniy/casl-express-example/blob/vue-api/src/app.js#L36))

Make sure `VUE_APP_API_URL` option in `.env` file specified to the correct API URL.

For more details, read [README][express-api] of CASL Express.js example.

[express-api]: https://github.com/stalniy/casl-examples/tree/master/packages/express-blog

## License

MIT
