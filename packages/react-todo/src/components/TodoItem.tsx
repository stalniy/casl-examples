import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Can, useAbility } from '@casl/react';
import type { AppAbility } from '../config/ability';
import { Todo } from '../services/todo-storage';

export interface Props {
  todo: Todo;
  onEdited(todo: Todo): void;
  onRemove(todo: Todo): void;
  onComplete(todo: Todo, completed: boolean): void;
}

export default function TodoItem({
  todo,
  onEdited,
  onRemove,
  onComplete
}: Props) {
  const ability = useAbility<AppAbility>();
  const editInputRef = useRef<HTMLInputElement>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const canUpdate = ability.can('update', todo);

  useEffect(() => {
    if (isEditing && !canUpdate) {
      setIsEditing(false);
      setEditingTitle('');
    } else if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing, canUpdate]);

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingTitle('');
  };

  const removeTodo = () => {
    onRemove(todo);
  };

  const doneEdit = () => {
    if (!isEditing) {
      return;
    }

    const nextTitle = editInputRef.current?.value.trim() || '';

    if (!nextTitle) {
      removeTodo();
    } else {
      onEdited({ ...todo, title: nextTitle });
    }

    cancelEdit();
  };

  const doneOrCancelEdit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      doneEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  };

  const editTodo = () => {
    if (!canUpdate) {
      return;
    }

    setEditingTitle(todo.title);
    setIsEditing(true);
  };

  const updateTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(event.target.value);
  };

  const className = useMemo(() => {
    const css = ['todo'];

    if (todo.completed) {
      css.push('completed');
    }

    if (isEditing) {
      css.push('editing');
    }

    return css.join(' ');
  }, [isEditing, todo.completed]);

  const completeTodo = (event: React.ChangeEvent<HTMLInputElement>) => {
    onComplete(todo, event.target.checked);
  };

  return (
    <li className={className}>
      <Can I="update" a={todo}>
        <input
          aria-label={`Complete ${todo.title}`}
          type="checkbox"
          checked={todo.completed}
          onChange={completeTodo}
          className="toggle"
        />
      </Can>

      {!canUpdate && (
        <span
          className="locked-check"
          title="Only the assignee or an admin can change this task"
        >
          {todo.completed ? '✓' : '−'}
        </span>
      )}
      <div className="view">
        <label
          onDoubleClick={editTodo}
          tabIndex={canUpdate ? 0 : undefined}
          role={canUpdate ? 'button' : undefined}
          title={canUpdate ? 'Double-click or press Enter to edit' : undefined}
          onKeyDown={(event) => {
            if (canUpdate && event.key === ' ') event.preventDefault();
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter' || event.key === ' ') editTodo();
          }}
        >
          {todo.title}
        </label>
      </div>

      <Can I="update" a={todo}>
        <input
          aria-label="Edit task title"
          className="edit"
          type="text"
          ref={editInputRef}
          value={editingTitle}
          onBlur={doneEdit}
          onKeyUp={doneOrCancelEdit}
          onChange={updateTitle}
        />
      </Can>

      <div className="assignee">
        <span
          className={`avatar${todo.assignee === 'me' ? ' own' : ''}`}
          aria-hidden="true"
        >
          {todo.assignee === 'me'
            ? 'Y'
            : todo.assignee
                .split(' ')
                .map((part) => part[0])
                .join('')}
        </span>
        {todo.assignee === 'me' ? 'You' : todo.assignee || 'Unassigned'}
      </div>

      <Can I="delete" a={todo}>
        <button
          type="button"
          className="destroy"
          aria-label={`Delete ${todo.title}`}
          onClick={removeTodo}
        />
      </Can>
      {!ability.can('delete', todo) && (
        <span className="read-only">Read only</span>
      )}
    </li>
  );
}
