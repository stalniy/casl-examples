import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { AppAbility } from '../../services/AppAbility';
import { Todo } from '../../models/Todo';
import { AbilityServiceSignal } from '@casl/angular';

@Component({
  selector: 'todo-list',
  standalone: false,
  template: `
    <ul class="todo-list">
      @for (todo of items(); track todo.id) {
        <li class="todo" [ngClass]="cssFor(todo)">
          @if (can('update', todo)) {
            <input
              class="toggle"
              type="checkbox"
              [(ngModel)]="todo.completed"
            >
          }

          <div class="view">
            @if (can('update', todo)) {
              <label (dblclick)="editTodo(todo)">{{ todo.title }}</label>
            } @else {
              <label>{{ todo.title }}</label>
            }
          </div>

          @if (can('update', todo)) {
            <input class="edit" type="text"
              [(ngModel)]="todo.title"
              (blur)="doneEdit(todo)"
              (keyup.enter)="doneEdit(todo)"
              (keyup.esc)="cancelEdit(todo)"
            >
          }

          <div class="assignee">
            {{ todo.assignee }}
          </div>

          @if (can('delete', todo)) {
            <button
              class="destroy"
              (click)="removeTodo(todo)"
            ></button>
          }
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoList {
  private readonly abilityService = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);

  readonly items = input<Todo[]>([]);
  readonly onRemoveTodo = output<Todo>({ alias: 'remove' });
  readonly can = this.abilityService.can;

  private readonly editedTodo = signal<Todo | null>(null);
  private readonly beforeEditTodo = signal<Todo | null>(null);

  cssFor(todo: Todo) {
    return {
      completed: todo.completed,
      editing: todo === this.editedTodo(),
    };
  }

  editTodo(todo: Todo) {
    this.editedTodo.set(todo);
    this.beforeEditTodo.set({ ...todo });
  }

  doneEdit(todo: Todo) {
    if (!this.editedTodo()) {
      return;
    }

    this.beforeEditTodo.set(null);
    this.editedTodo.set(null);
    todo.title = todo.title.trim();

    if (!todo.title) {
      this.removeTodo(todo);
    }
  }

  cancelEdit(todo: Todo) {
    Object.assign(todo, this.beforeEditTodo());
    this.beforeEditTodo.set(null);
    this.editedTodo.set(null);
  }

  removeTodo(todo: Todo) {
    this.onRemoveTodo.emit(todo);
  }
}
