import { Component } from '@angular/core';
import { Todo, TodoInput } from '../models/Todo';

@Component({
  selector: 'app-root',
  template: `
    <section class="todoapp">
      <header class="header">
        <h1>Todo list</h1>
        <todo-form *ngIf="'create' | able: 'Todo'" (newTodo)="addTodo($event)"></todo-form>
      </header>
      <section class="main">
        <todo-list [items]="todos" (remove)="removeTodo($event)"></todo-list>
      </section>
      <todo-footer [items]="todos"></todo-footer>
    </section>
  `,
})
export class AppComponent {
  todos: Todo[] = [];

  addTodo(todo: TodoInput) {
    this.todos.push({
      ...todo,
      kind: 'Todo',
      id: Date.now(),
      completed: false,
    });
  }

  removeTodo(todo: Todo) {
    const index = this.todos.indexOf(todo);

    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }
}
