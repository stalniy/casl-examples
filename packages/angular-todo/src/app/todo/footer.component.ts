import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { defineAbilitiesFor, AppAbility } from '../../services/AppAbility';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'todo-footer',
  standalone: false,
  template: `
    <footer class="footer">
      <span class="todo-count">
        <strong>{{ remaining() }}</strong> left
      </span>
      <ul class="roles">
        <li class="help" title="Admin - can do anything. Member can read everything and manage todos with assignee 'me'" i18n i18n-title>Switch roles</li>
        <li><button type="button" [class.selected]="role() === 'admin'" (click)="setRole('admin')" i18n>Admin</button></li>
        <li><button type="button" [class.selected]="role() === 'member'" (click)="setRole('member')" i18n>Member</button></li>
      </ul>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFooter {
  readonly items = input<Todo[]>([]);
  readonly role = signal('member');
  readonly remaining = computed(() => this.items().filter(item => !item.completed).length);

  constructor(private readonly ability: AppAbility) {}

  setRole(name: string) {
    if (this.role() !== name) {
      this.ability.update(defineAbilitiesFor(name));
      this.role.set(name);
    }
  }
}
