# CASL and Angular integration example

This example shows how to integrate [CASL][casl-ability] auhorization (i.e. permissions) in Angular application by using completmentary module [@casl/angular][casl-angular]. Read [Managing user permissions in Angular app](https://medium.com/@sergiy.stotskiy/managing-user-permissions-in-angular-application-504c83752f83) for detailed explanation.

> Generated with angular cli

## Installation

Use `yarn` to install dependencies, for some reason pnpm doesn't work with angular...

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:4200
yarn start
```

## Description

This application is a basic Todo application with possibility to specify assignee for a task. By default, all users are able to create and read all tasks but update and delete only assigned to them. Any user may create a task and assign it to other users.

Ability configuration can be found in [src/services/AppAbility.ts](./src/services/AppAbility.ts), the function that creates `Ability` instance is in the same file.

## Example

```html
<todo-form
  (newTodo)="addTodo($event)"
  *ngIf="'Todo' | can: 'create'"
></todo-form>
```

[casl-ability]: https://stalniy.github.io/casl/
[casl-angular]: https://github.com/stalniy/casl/tree/master/packages/casl-angular
