import React from 'react';
import TodoItem, { Props as TodoItemProps } from './TodoItem';
import { Todo } from '../services/todo-storage';

type Props = Omit<TodoItemProps, 'todo'> & {
  items: Todo[];
};

export default function TodoListRenderer(props: Props) {
  const { items, ...todoProps } = props;
  if (!items.length) {
    return (
      <section className="main" aria-label="Tasks">
        <div className="empty-state" role="status">
          <span aria-hidden="true">✳</span>
          <h3>A little room for your next idea.</h3>
          <p>No tasks here. Add a task or try another filter.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="main" aria-label="Tasks">
      <ul className="todo-list">
        {items.map((todo) => (
          <TodoItem {...todoProps} todo={todo} key={todo.id} />
        ))}
      </ul>
    </section>
  );
}
