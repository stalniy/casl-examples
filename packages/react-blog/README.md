# CASL and React integration example

This example shows how to integrate [CASL authorization](https://casl.js.org) (i.e. permissions) in React application with [Mobx](https://mobx.js.org/).

> Generated with crate-react-app

## Installation

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:3000
npm start
```

## Description

This application is a basic Blog application with possibility to manage articles. There are 2 types of users:

* authenticated, can manage their articles and read published articles of other authors
* unauthenticated, can only read published articles

Ability rules are fetch during login phase from REST API and store in [mobx store](./src/services/AppStore.ts). This application uses `useAbility` hook from `@casl/react` which looks a bit more straightforward and allows to remove nesting.

## Example

```tsx
{can('create', 'Article') && (
  <Link to="/articles/new" className={styles.menuLink}>
    Add Article
  </Link>
)}
```

## API

This example was tested using [CASL express blog app](../packages/express-blog). Please read details of how to setup API in its README file.

## License

MIT (c) Sergii Stotskyi 2020
