import React, { memo, useState } from 'react';

type Todo = { title: string; assignee: string };
type Props = { onNewTodo: (todo: Todo) => void };

export default memo(function NewTodo({ onNewTodo }: Props) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('me');

  const addTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !assignee) return;
    onNewTodo({ title: title.trim(), assignee });
    setTitle('');
  };

  return (
    <form className="new-todo" onSubmit={addTodo}>
      <span className="add-symbol" aria-hidden="true">
        ＋
      </span>
      <input
        name="title"
        aria-label="Task title"
        autoComplete="off"
        placeholder="What's your next authorization task?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <select
        name="assignee"
        aria-label="Assign task to"
        value={assignee}
        onChange={(event) => setAssignee(event.target.value)}
      >
        <option value="" disabled>
          Assign to
        </option>
        <option>me</option>
        <option>John Doe</option>
        <option>Alex Pupkin</option>
      </select>
      <button
        className="add-button"
        type="submit"
        disabled={!title.trim() || !assignee}
      >
        Add task <span aria-hidden="true">↵</span>
      </button>
    </form>
  );
});
