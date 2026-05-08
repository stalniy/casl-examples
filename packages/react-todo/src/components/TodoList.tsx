import React, { useEffect, useState } from 'react';
import { Can } from '@casl/react';
import todoStorage, { Todo } from '../services/todo-storage';
import NewTodo from './NewTodo';
import TodoListRenderer from './TodoListRenderer';
import TodoFooter from './TodoFooter';

export default function TodoList() {
  const [items, setItems] = useState<Todo[]>(() => todoStorage.fetch());

  useEffect(() => {
    todoStorage.save(items);
  }, [items]);

  const addTodo = (attrs: Pick<Todo, 'assignee' | 'title'>) => {
    const todo = todoStorage.build(attrs);
    setItems(prevItems => prevItems.concat(todo));
  };

  const removeTodo = (todo: Todo) => {
    setItems(prevItems => prevItems.filter(item => item !== todo));
  };

  const editTodo = (todo: Todo) => {
    setItems(prevItems => {
      const itemsCopy = prevItems.slice(0);
      const index = itemsCopy.findIndex(item => item.id === todo.id);

      itemsCopy.splice(index, 1, todo);

      return itemsCopy;
    });
  };

  const completeTodo = (todo: Todo, completed: boolean) => {
    setItems(prevItems => {
      const itemsCopy = prevItems.slice(0);
      const index = itemsCopy.findIndex(item => item.id === todo.id);
      itemsCopy[index] = { ...itemsCopy[index], completed };
      return itemsCopy;
    });
  };

  return (
    <div>
      <header className="header">
        <h1>Todos</h1>
        <Can I="create" a="Todo">
          <NewTodo onNewTodo={addTodo} />
        </Can>
      </header>
      <TodoListRenderer
        items={items}
        onRemove={removeTodo}
        onEdited={editTodo}
        onComplete={completeTodo}
      />
      <TodoFooter items={items} />
    </div>
  );
}
