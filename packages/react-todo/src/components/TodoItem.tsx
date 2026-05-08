import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Can, useAbility } from '@casl/react';
import type { AppAbility } from '../config/ability';
import { Todo } from '../services/todo-storage';

export interface Props {
  todo: Todo
  onEdited(todo: Todo): void
  onRemove(todo: Todo): void
  onComplete(todo: Todo, completed: boolean): void
};

export default function TodoItem({ todo, onEdited, onRemove, onComplete }: Props) {
  const ability = useAbility<AppAbility>();
  const editInputRef = useRef<HTMLInputElement>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

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

    const nextTitle = editInputRef.current?.value || '';

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
    if (!ability.can('update', todo)) {
      return;
    }

    setIsEditing(true);
  };

  const updateTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(event.target.value);
  };

  const className = useMemo(() => {
    const css = ['todo']

    if (todo.completed) {
      css.push('completed')
    }

    if (isEditing) {
      css.push('editing')
    }

    return css.join(' ')
  }, [isEditing, todo.completed]);

  const completeTodo = (event: React.ChangeEvent<HTMLInputElement>) => {
    onComplete(todo, event.target.checked);
  };

  return (
    <li className={className}>
      <Can I="update" a={todo}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={completeTodo}
          className="toggle"
        />
      </Can>

      <div className="view">
        <label onDoubleClick={editTodo}>{todo.title}</label>
      </div>

      <Can I="update" a={todo}>
        <input
          className="edit"
          type="text"
          ref={editInputRef}
          value={editingTitle || todo.title}
          onBlur={doneEdit}
          onKeyUp={doneOrCancelEdit}
          onChange={updateTitle}
        />
      </Can>

      <div className="assignee">
        {todo.assignee}
      </div>

      <Can I="delete" a={todo}>
        <button className="destroy" onClick={removeTodo}></button>
      </Can>
    </li>
  );
}
