import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal } from '@angular/core';
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
              (ngModelChange)="onChange.emit()"
              [attr.aria-label]="'Complete ' + todo.title"
            >
          }

          @if (!can('update', todo)) {
            <span class="locked-check" aria-hidden="true">−</span>
          }
          <div class="view">
            @if (can('update', todo)) {
              <label tabindex="0" role="button" [attr.aria-label]="'Edit ' + todo.title" (dblclick)="editTodo(todo)" (keyup.enter)="editTodo(todo)">{{ todo.title }}</label>
            } @else {
              <label>{{ todo.title }}</label>
            }
          </div>

          @if (can('update', todo)) {
            <input class="edit" type="text" [attr.aria-label]="'Edit ' + todo.title"
              [(ngModel)]="todo.title"
              (blur)="doneEdit(todo)"
              (keyup.enter)="doneEdit(todo)"
              (keyup.esc)="cancelEdit(todo)"
            >
          }

          <div class="assignee">
            <span class="avatar" [class.own]="todo.assignee === 'me'" aria-hidden="true">{{ todo.assignee === 'me' ? 'Y' : todo.assignee.charAt(0) }}</span>
            {{ todo.assignee === 'me' ? 'You' : todo.assignee }}
          </div>

          @if (can('delete', todo)) {
            <button
              class="destroy"
              type="button"
              [attr.aria-label]="'Delete ' + todo.title"
              (click)="removeTodo(todo)"
            ></button>
          } @else {
            <span class="read-only" title="Only the assignee or an admin can manage this task">Read only</span>
          }
        </li>
      } @empty {
        <li class="empty-state"><span aria-hidden="true">✳</span><h3>A little space for your next idea.</h3><p>Add a task above, or switch filters to see your work.</p></li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoList {
  private readonly abilityService = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly items = input<Todo[]>([]);
  readonly onRemoveTodo = output<Todo>({ alias: 'remove' });
  readonly onChange = output<void>({ alias: 'change' });
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
    setTimeout(() => this.element.nativeElement.querySelector<HTMLInputElement>('.todo.editing .edit')?.focus());
  }

  doneEdit(todo: Todo) {
    if (!this.editedTodo()) {
      return;
    }

    this.beforeEditTodo.set(null);
    this.editedTodo.set(null);
    todo.title = todo.title.trim();
    this.onChange.emit();

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
