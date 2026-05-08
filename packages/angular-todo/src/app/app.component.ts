import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbilityServiceSignal } from '@casl/angular';
import { AppAbility } from 'src/services/AppAbility';
import { Todo, TodoInput } from '../models/Todo';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <section class="todoapp">
      <header class="header">
        <h1>Todo list</h1>
        @if (can('create', 'Todo')) {
          <todo-form (newTodo)="addTodo($event)"></todo-form>
        }
      </header>
      <section class="main">
        <todo-list [items]="todos()" (remove)="removeTodo($event)"></todo-list>
      </section>
      <todo-footer [items]="todos()"></todo-footer>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly abilityService = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);

  protected readonly can = this.abilityService.can;
  protected readonly todos = signal<Todo[]>([]);

  addTodo(todo: TodoInput) {
    this.todos.update(items => items.concat({
      ...todo,
      kind: 'Todo',
      id: Date.now(),
      completed: false,
    }));
  }

  removeTodo(todoToRemove: Todo) {
    this.todos.update(items => items.filter(todo => todo !== todoToRemove));
  }
}
