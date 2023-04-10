import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { defineAbilitiesFor, AppAbility } from '../../services/AppAbility';
import { Todo } from '../../models/Todo';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Component({
  selector: 'todo-footer',
  template: `
    <footer *ngIf="state$ | async as state" class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong> left
      </span>
      <ul class="roles">
        <li class="help" title="Admin - can do anything. Member can read everything and manage todos with assignee 'me'" i18n i18n-title>Switch roles</li>
        <li><button type="button" [class.selected]="state.role == 'admin'" (click)="setRole('admin')" i18n>Admin</button></li>
        <li><button type="button" [class.selected]="state.role == 'member'" (click)="setRole('member')" i18n>Member</button></li>
      </ul>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFooter {
  @Input() items: Todo[] = [];

  readonly state$: Observable<{
    role: string;
  }>

  private readonly role$ = new BehaviorSubject('member');

  constructor(private readonly ability: AppAbility) {
    this.state$ = this.role$.pipe(
      map(role => ({ role }))
    );
  }

  get remaining() {
    return this.items.filter(item => !item.completed).length;
  }

  setRole(name: string) {
    if (this.role$.value !== name) {
      this.ability.update(defineAbilitiesFor(name))
      this.role$.next(name);
    }
  }
}
