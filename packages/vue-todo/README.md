# CASL Vue Todo list

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/github/stalniy/casl-examples/tree/master/packages/vue-todo)

StackBlitz installs dependencies and starts the app automatically. Edit the source to update the preview.

This example shows how to integrate [CASL](https://stalniy.github.io/casl/) authorization in a Vue 3 application powered by Vite.
Read [Vue ACL with CASL](https://medium.com/@sergiy.stotskiy/vue-acl-with-casl-781a374b987a) for detailed explanation.


## Installation

``` bash
# install dependencies
pnpm install

# serve with hot reload at localhost:8080
pnpm run dev
```

## Description

This application is a basic Todo application with possibility to specify assignee for a task. By default, all users are able to create and read all tasks but update and delete only assigned to them. Any user may create a task and assign it to other users.

Ability configuration can be found in `src/config/ability.ts`, the Vue plugin for abilities is provided by `@casl/vue`. The plugin adds `$can` (references `ability.can()`) method to every Vue component and makes sure that all components that use `$can` are updated when `ability.update` is called.

## Example

```html
<div class="view">
  <input class="toggle" type="checkbox" v-model="todo.completed" v-if="$can('update', todo)">
  <label @dblclick="$can('update', todo) && editTodo(todo)">{{ todo.title }}</label>
  <button class="destroy" v-if="$can('delete', todo)" @click="removeTodo(todo)"></button>
</div>
```

----

**Another example**: Example of integration [CASL with Vuex and REST API](https://github.com/stalniy/casl-vue-api-example)

[casl-ability]: https://github.com/stalniy/casl/tree/master/packages/casl-ability
[casl-vue]: https://github.com/stalniy/casl/tree/master/packages/casl-vue
