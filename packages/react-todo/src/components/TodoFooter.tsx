import React, { memo, useMemo, useState } from 'react';
import { useAbility } from '@casl/react';
import { Todo } from '../services/todo-storage';
import type { AppAbility } from '../config/ability';
import defineRulesFor from '../config/ability';
import Icon from './Icon';

type Props = { items: Todo[] };

export default memo(function TodoFooter({ items }: Props) {
  const ability = useAbility<AppAbility>();
  const [role, setRole] = useState('member');
  const remaining = useMemo(
    () => items.filter((item) => !item.completed).length,
    [items]
  );
  const setCurrentRole = (value: string) => {
    ability.update(defineRulesFor(value));
    setRole(value);
  };

  return (
    <footer className="footer">
      <div className="role-heading">
        <span className="eyebrow">YOU’RE IN CONTROL</span>
        <Icon name="shield" />
      </div>
      <h2>Same tasks. Different powers.</h2>
      <p>Switch roles to see CASL’s permissions update instantly.</p>
      <div className="roles" aria-label="Switch roles">
        {['member', 'admin'].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={role === value}
            className={role === value ? 'selected' : ''}
            onClick={() => setCurrentRole(value)}
          >
            {value === 'member' ? 'Member' : 'Admin'}
          </button>
        ))}
      </div>
      <div className="permission-summary" aria-live="polite">
        <span className="permission-label">
          <span className="status-dot" />{' '}
          {role === 'member' ? 'Member permissions' : 'Admin permissions'}
        </span>
        <p>
          {role === 'member'
            ? 'View all tasks. Edit, complete, and delete only the tasks assigned to you.'
            : 'Full access. Edit, complete, and delete any task, no matter who it’s assigned to.'}
        </p>
      </div>
      <div className="code-block">
        <div>
          <span className="code-dot" />
          <span>ability.ts</span>
          <span>CASL</span>
        </div>
        <pre>
          <code>
            {role === 'admin'
              ? "can('manage', 'all');"
              : "can(['read', 'create'], 'Todo');\n\ncan(['update', 'delete'], 'Todo', {\n  assignee: 'me'\n});"}
          </code>
        </pre>
      </div>
      <a className="rules-link" href="https://casl.js.org/v6/en/guide/intro">
        Get to know the rules <Icon name="arrow" />
      </a>
      <div className="todo-count">
        <b>{remaining}</b> left <span>· Permission checks by CASL</span>
      </div>
    </footer>
  );
});
