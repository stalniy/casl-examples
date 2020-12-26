import { Component, Input } from '@angular/core';
import { defineAbilitiesFor, AppAbility } from '../../services/AppAbility';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'todo-footer',
  template: `
    <footer class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong> left
      </span>
      <ul class="roles">
        <li class="help" title="Admin - can do anything. Member can read everything and manage todos with assignee 'me'" i18n i18n-title>Switch roles</li>
        <li><button type="button" [class.selected]="role == 'admin'" (click)="setRole('admin')" i18n>Admin</button></li>
        <li><button type="button" [class.selected]="role == 'member'" (click)="setRole('member')" i18n>Member</button></li>
      </ul>
    </footer>
  `,
})
export class TodoFooter {
  @Input() items: Todo[] = [];

  role: string = 'member';

  constructor(private ability: AppAbility) {}

  get remaining() {
    return this.items.filter(item => !item.completed).length;
  }

  setRole(name: string) {
    if (this.role !== name) {
      this.role = name;
      this.ability.update(defineAbilitiesFor(name))
    }
  }
}
