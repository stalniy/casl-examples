import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppAbility } from '../../services/AppAbility';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'todo-list',
  template: `
    <ul class="todo-list">
      <li *ngFor="let todo of items" class="todo" [ngClass]="cssFor(todo)">
        <input
          *ngIf="'update' | able: todo"
          class="toggle"
          type="checkbox"
          [(ngModel)]="todo.completed"
        >

        <div class="view">
          <label (dblclick)="editTodo(todo)">{{ todo.title }}</label>
        </div>

        <input class="edit" type="text"
          *ngIf="'update' | able: todo"
          [(ngModel)]="todo.title"
          (blur)="doneEdit(todo)"
          (keyup.enter)="doneEdit(todo)"
          (keyup.esc)="cancelEdit(todo)"
        >

        <div class="assignee">
          {{ todo.assignee }}
        </div>

        <button
          *ngIf="'delete' | able: todo"
          class="destroy"
          (click)="removeTodo(todo)"
        ></button>
      </li>
    </ul>
  `,
})
export class TodoList {
  @Input() items: Todo[] = [];
  @Output('remove') onRemoveTodo = new EventEmitter<Todo>();

  editedTodo: Todo = null;
  beforeEditTodo: Todo = null;

  constructor(private ability: AppAbility) {}

  cssFor(todo: Todo) {
    return {
      completed: todo.completed,
      editing: todo == this.editedTodo
    };
  }

  editTodo(todo: Todo) {
    if (this.ability.can('update', todo)) {
      this.editedTodo = todo;
      this.beforeEditTodo = { ...todo }
    }
  }

  doneEdit(todo: Todo) {
    if (!this.editedTodo) {
      return
    }

    this.beforeEditTodo = null;
    this.editedTodo = null;
    todo.title = todo.title.trim();

    if (!todo.title) {
      this.removeTodo(todo);
    }
  }

  cancelEdit(todo: Todo) {
    Object.assign(todo, this.beforeEditTodo);
    this.beforeEditTodo = null;
    this.editedTodo = null;
  }

  removeTodo(todo: Todo) {
    this.onRemoveTodo.emit(todo);
  }
}
