import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from "rxjs";
import { AppAbility } from '../../services/AppAbility';
import { Todo } from '../../models/Todo';
import { AbilityService } from '@casl/angular';

@Component({
  selector: 'todo-list',
  template: `
    <ul *ngIf="ability$ | async as ability" class="todo-list">
      <li *ngFor="let todo of items" class="todo" [ngClass]="cssFor(todo)">
        <input
          *ngIf="ability.can('update', todo)"
          class="toggle"
          type="checkbox"
          [(ngModel)]="todo.completed"
        >

        <div class="view">
          <label *ngIf="ability.can('update', todo) else pureLabel" (dblclick)="editTodo(todo)">{{ todo.title }}</label>
          <ng-template #pureLabel>
            <label>{{ todo.title }}</label>
          </ng-template>
        </div>

        <input class="edit" type="text"
          *ngIf="ability.can('update', todo)"
          [(ngModel)]="todo.title"
          (blur)="doneEdit(todo)"
          (keyup.enter)="doneEdit(todo)"
          (keyup.esc)="cancelEdit(todo)"
        >

        <div class="assignee">
          {{ todo.assignee }}
        </div>

        <button
          *ngIf="ability.can('delete', todo)"
          class="destroy"
          (click)="removeTodo(todo)"
        ></button>
      </li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoList {
  @Input() items: Todo[] = [];
  @Output('remove') onRemoveTodo = new EventEmitter<Todo>();

  readonly ability$: Observable<AppAbility>;

  private editedTodo: Todo = null;
  private beforeEditTodo: Todo = null;

  constructor(abilityService: AbilityService<AppAbility>) {
    this.ability$ = abilityService.ability$;
  }

  cssFor(todo: Todo) {
    return {
      completed: todo.completed,
      editing: todo == this.editedTodo
    };
  }

  editTodo(todo: Todo) {
    this.editedTodo = todo;
    this.beforeEditTodo = { ...todo }
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
