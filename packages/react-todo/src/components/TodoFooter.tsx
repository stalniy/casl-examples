import React, { memo, useState } from 'react';
import { useAbility } from '@casl/react';
import type { AppAbility } from '../config/ability';
import defineRulesFor from '../config/ability';

export default memo(function TodoFooter() {
  const ability = useAbility<AppAbility>();
  const [role, setRole] = useState('member');
  const setCurrentRole = (value: string) => {
    ability.update(defineRulesFor(value));
    setRole(value);
  };

  return (
    <aside className="footer" aria-labelledby="permissions-heading">
      <div className="permission-heading">
        <img
          className="shield-icon"
          src="/casl-shield.png"
          alt=""
          width="25"
          height="30"
        />
        <span className="eyebrow">POWERED BY CASL</span>
        <span className="status-dot" />
      </div>
      <h2 id="permissions-heading">A role changes everything.</h2>
      <p>
        Same tasks. Different permissions.
        <br />
        Switch roles to see the magic.
      </p>
      <div className="role-label">EXPLORE AS</div>
      <div className="roles" role="group" aria-label="Switch roles">
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
      <div className="role-description" aria-live="polite">
        <strong>
          {role === 'admin'
            ? 'The whole workspace is yours.'
            : 'Your tasks, your control.'}
        </strong>
        <p>
          {role === 'admin'
            ? 'Manage every task, no matter who it belongs to.'
            : 'View every task. Edit, complete, and delete only the ones assigned to you.'}
        </p>
      </div>
      <div className="permission-list">
        <div>
          <span>✓</span> View all tasks
        </div>
        <div>
          <span>✓</span> Create new tasks
        </div>
        <div>
          <span>✓</span> Manage your own tasks
        </div>
        <div className={role !== 'admin' ? 'restricted' : ''}>
          <span>{role === 'admin' ? '✓' : '−'}</span> Manage others’ tasks
        </div>
      </div>
      <div className="rule-snippet">
        <div>
          <span className="code-dot" /> THE RULE BEHIND IT
        </div>
        {role === 'admin' ? (
          <code>
            <span>can</span>(<span className="code-string">'manage'</span>,{' '}
            <span className="code-string">'all'</span>);
          </code>
        ) : (
          <code>
            <span>can</span>([<span className="code-string">'read'</span>,{' '}
            <span className="code-string">'create'</span>],{' '}
            <span className="code-string">'Todo'</span>);
            <br />
            <span>can</span>([<span className="code-string">'update'</span>,{' '}
            <span className="code-string">'delete'</span>],
            <br />
            &nbsp; <span className="code-string">'Todo'</span>, {'{'} assignee:{' '}
            <span className="code-string">'me'</span> {'}'});
          </code>
        )}
      </div>
      <a className="rules-link" href="https://casl.js.org/v6/en/guide/intro">
        A few lines. Fine-grained control. <span>↗</span>
      </a>
    </aside>
  );
});
