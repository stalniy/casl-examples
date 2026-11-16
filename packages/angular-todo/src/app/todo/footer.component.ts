import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { defineAbilitiesFor, AppAbility } from '../../services/AppAbility';
import { Todo } from '../../models/Todo';

@Component({
  selector: 'todo-footer',
  standalone: false,
  template: `
    <aside class="footer" aria-labelledby="permissions-heading">
      <div class="permission-heading"><img class="shield-icon" src="assets/casl-shield.png" alt="" width="25" height="30"><span class="eyebrow">POWERED BY CASL</span><span class="status-dot"></span></div>
      <h2 id="permissions-heading">A role changes everything.</h2>
      <p>Same tasks. Different permissions.<br>Switch roles to see the magic.</p>
      <div class="role-label">EXPLORE AS</div>
      <div class="roles" aria-label="Switch roles">
        <button type="button" [class.selected]="role() === 'member'" [attr.aria-pressed]="role() === 'member'" (click)="setRole('member')">Member</button>
        <button type="button" [class.selected]="role() === 'admin'" [attr.aria-pressed]="role() === 'admin'" (click)="setRole('admin')">Admin</button>
      </div>
      <div class="role-description" aria-live="polite"><strong>{{ role() === 'admin' ? 'The whole workspace is yours.' : 'Your tasks, your control.' }}</strong><p>{{ role() === 'admin' ? 'Manage every task, no matter who it belongs to.' : 'View every task. Edit, complete, and delete only the ones assigned to you.' }}</p></div>
      <div class="permission-list"><div><span>✓</span> View all tasks</div><div><span>✓</span> Create new tasks</div><div><span>✓</span> Manage your own tasks</div><div [class.restricted]="role() !== 'admin'"><span>{{ role() === 'admin' ? '✓' : '−' }}</span> Manage others’ tasks</div></div>
      <div class="rule-snippet"><div><span class="code-dot"></span> THE RULE BEHIND IT</div><code><span>can</span>(<span class="code-string">'{{ role() === 'admin' ? 'manage' : 'read' }}'</span>, <span class="code-string">'all'</span>);@if (role() === 'member') {<br><span>can</span>(<span class="code-string">'manage'</span>, <span class="code-string">'Todo'</span>,<br>&nbsp; &#123; assignee: <span class="code-string">'me'</span> &#125;);}</code></div>
      <a class="rules-link" href="https://casl.js.org/v6/en/guide/intro">A few lines. Fine-grained control. <span>↗</span></a>
      <span class="sr-only todo-count">{{ remaining() }} left</span>
    </aside>
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
