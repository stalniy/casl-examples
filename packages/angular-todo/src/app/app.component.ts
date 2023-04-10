import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbilityService } from '@casl/angular';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { AppAbility } from 'src/services/AppAbility';
import { Todo, TodoInput } from '../models/Todo';

@Component({
  selector: 'app-root',
  template: `
    <section *ngIf="state$ | async as state" class="todoapp">
      <header class="header">
        <h1>Todo list</h1>
        <todo-form *ngIf="state.ability.can('create', 'Todo')" (newTodo)="addTodo($event)"></todo-form>
      </header>
      <section class="main">
        <todo-list [items]="state.todos" (remove)="removeTodo($event)"></todo-list>
      </section>
      <todo-footer [items]="state.todos"></todo-footer>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly state$: Observable<{
    ability: AppAbility;
    todos: Todo[];
  }>;

  private readonly todos$ = new BehaviorSubject<Todo[]>([]);

  constructor(abilityService: AbilityService<AppAbility>) {
    this.state$ = combineLatest([abilityService.ability$, this.todos$]).pipe(
      map(([ability, todos]) => ({
        ability,
        todos,
      }))
    );
  }

  addTodo(todo: TodoInput) {
    this.todos$.next(this.todos$.value.concat({
      ...todo,
      kind: 'Todo',
      id: Date.now(),
      completed: false,
    }));
  }

  removeTodo(todoToRemove: Todo) {
    this.todos$.next(this.todos$.value.filter(todo => todo !== todoToRemove));
  }
}
