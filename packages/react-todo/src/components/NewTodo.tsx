import React, { memo, useState } from 'react';
import Icon from './Icon';

type Todo = { title: string; assignee: string };
type Props = { onNewTodo: (todo: Todo) => void };

export default memo(function NewTodo({ onNewTodo }: Props) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');

  const addTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    onNewTodo({ title: title.trim(), assignee });
    setTitle('');
    setAssignee('');
  };

  return (
    <form className="new-todo" onSubmit={addTodo}>
      <div className="title-field">
        <Icon name="plus" />
        <input
          name="title"
          aria-label="Task title"
          autoComplete="off"
          placeholder="What needs to be done?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <select
        name="assignee"
        aria-label="Assign task"
        value={assignee}
        onChange={(event) => setAssignee(event.target.value)}
      >
        <option value="" disabled>
          Choose Assignee
        </option>
        <option>me</option>
        <option>John Doe</option>
        <option>Alex Pupkin</option>
      </select>
      <button className="add-button" type="submit">
        Add task <Icon name="plus" />
      </button>
    </form>
  );
});
