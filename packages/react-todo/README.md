# CASL and React integration example

This example shows how to integrate [CASL authorization](https://stalniy.github.io/casl/) (i.e. permissions) in React application. Read [Managing user permissions in React app](https://medium.com/dailyjs/managing-user-permissions-in-your-react-app-a93a94ff9b40) for detailed explanation.

> Generated with crate-react-app

## Installation

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:3000
npm start
```

## Description

This application is a basic Todo application with possibility to specify assignee for a task. By default, all users are able to create and read all tasks but update and delete only assigned to them. Any user may create a task and assign it to other users.

Ability configuration can be found in `src/config/ability.ts`, the React component which checks abilities is in `src/components/Can.ts`. This component allows to check abilities and if it's allowed to perform an operation it renders children components, otherwise renders an empty string.

## Example

```tsx
<div className="view">
  <Can do="update" on={this.props.todo}>
    <input className="toggle" type="checkbox" checked={this.props.todo.completed} onChange={this.completeTodo.bind(this)} />
  </Can>

  <label onDoubleClick={this.editTodo.bind(this)}>{this.props.todo.title}</label>

  <Can do="delete" on={this.props.todo}>
    <button className="destroy" onClick={this.removeTodo.bind(this)}></button>
  </Can>
</div>
```

## JavaScript sources

If you don't know TypeScript, you can run `npm run build.es.source` inside `react-todo` folder. This transpiles TypesScript files in JavaScript and JSX. You can find the ES sources in `src.es` folder.

You can even run them using `react-scripts`! To do this, just replace `include` option in `tsconfig.json` to:

```json
{
  // other options
  "include": [
    "src.es/**/*"
  ]
}
```

And run `SKIP_PREFLIGHT_CHECK=true npm start`
