import React, { memo, useState } from 'react';

type Todo = { title: string, assignee: string };
type Props = {
  onNewTodo: (todo: Todo) => void
};

export default memo(function NewTodo({ onNewTodo }: Props) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');

  const updateTodoTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const updateTodoAssignee = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAssignee(event.target.value);
  };

  const addTodo = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    onNewTodo({ title, assignee });
    setTitle('');
    setAssignee('');
  };

  return (
    <div className="new-todo">
      <input
        name="title"
        autoFocus
        autoComplete="off"
        placeholder="What needs to be done?"
        value={title}
        onChange={updateTodoTitle}
        onKeyUp={addTodo} />

      <select name="assignee" value={assignee} onChange={updateTodoAssignee}>
        <option value="" disabled>Choose Assignee</option>
        <option>me</option>
        <option>John Doe</option>
        <option>Alex Pupkin</option>
      </select>
    </div>
  );
});
