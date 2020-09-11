# Example of CASL integration in expressjs app

Read [CASL in Expressjs app][casl-express-example] for details.

[CASL](https://casl.js.org) is an isomorphic authorization JavaScript library which restricts what resources a given user is allowed to access.

This is an example API which shows how integrate CASL in blog application. There are 3 entities:
* User
* Post
* Comment

Permission logic (i.e., abilities) are define in `src/modules/auth/abilities.js`. Rules can be specified for authenticated and anonymous users, so potentially it's quite easy to give access to anonymous users to write comments.

Application uses `passport-jwt` for authentication. The main logic is built on top of modules, all in `src/modules`.

**Note**: refactored to use CASL 4.0. See [@casl/ability][casl-ability] and [@casl/mongoose][casl-mongoose] for details.
**Warning**: this code is just an example and doesn't follow best practices everywhere (e.g. it stores passwords without hashing).

## Installation

```sh
git clone https://github.com/stalniy/casl-express-example.git
cd casl-express-example
npm install
npm start # `npm run dev` to run in dev mode
```

Also you need mongodb database up and running. Application will connect to `mongodb://localhost:27017/blog`. This repository contains database fixtures which you can load using `mongorestore` cli command. Navigate to the project root and run:

```sh
mongorestore db
```


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

201 Created
{ "token": "...." }
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
