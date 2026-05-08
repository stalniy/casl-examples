import React, { memo, useMemo, useState } from 'react';
import { useAbility } from '@casl/react';
import { Todo } from '../services/todo-storage';
import type { AppAbility } from '../config/ability';
import defineRulesFor from '../config/ability';

type Props = {
  items: Todo[]
};

const hint = 'Admin - can do anything.\nMember can read everything and manage todos with assignee "me"';

export default memo(function TodoFooter({ items }: Props) {
  const ability = useAbility<AppAbility>();
  const [role, setRole] = useState('member');
  const remaining = useMemo(() => items.filter(item => !item.completed).length, [items]);

  const selectedIfRole = (value: string) => {
    return role === value ? 'selected' : '';
  };

  const setCurrentRole = (value: string) => {
    ability.update(defineRulesFor(value));
    setRole(value);
  };

  return (
    <footer className="footer">
      <span className="todo-count"><b>{remaining}</b> left</span>
      <ul className="roles">
        <li className="help" title={hint}>Switch roles:</li>
        <li>
          <button type="button" className={selectedIfRole('admin')} onClick={() => setCurrentRole('admin')}>
            Admin
          </button>
        </li>
        <li>
          <button type="button" className={selectedIfRole('member')} onClick={() => setCurrentRole('member')}>
            Member
          </button>
        </li>
      </ul>
    </footer>
  );
});
