import React from 'react';
import TodoItem, { Props as TodoItemProps } from './TodoItem';
import { Todo } from '../services/todo-storage';

type Props = Omit<TodoItemProps, 'todo'> & {
  items: Todo[]
};

export default function TodoListRenderer(props: Props) {
  const { items, ...todoProps } = props
  if (!items.length) {
    return null;
  }

  return (
    <section className="main">
      <ul className="todo-list">
        {items.map(todo => <TodoItem {...todoProps} todo={todo} key={todo.id} />)}
      </ul>
    </section>
  )
}
