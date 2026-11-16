import React, { useEffect, useState } from 'react';
import { Can } from '@casl/react';
import todoStorage, { Todo } from '../services/todo-storage';
import NewTodo from './NewTodo';
import TodoListRenderer from './TodoListRenderer';
import TodoFooter from './TodoFooter';
import Icon from './Icon';

export default function TodoList() {
  const [items, setItems] = useState<Todo[]>(() => todoStorage.fetch());

  useEffect(() => {
    todoStorage.save(items);
  }, [items]);

  const addTodo = (attrs: Pick<Todo, 'assignee' | 'title'>) => {
    const todo = todoStorage.build(attrs);
    setItems((prevItems) => prevItems.concat(todo));
  };

  const removeTodo = (todo: Todo) => {
    setItems((prevItems) => prevItems.filter((item) => item !== todo));
  };

  const editTodo = (todo: Todo) => {
    setItems((prevItems) => {
      const itemsCopy = prevItems.slice(0);
      const index = itemsCopy.findIndex((item) => item.id === todo.id);

      itemsCopy.splice(index, 1, todo);

      return itemsCopy;
    });
  };

  const completeTodo = (todo: Todo, completed: boolean) => {
    setItems((prevItems) => {
      const itemsCopy = prevItems.slice(0);
      const index = itemsCopy.findIndex((item) => item.id === todo.id);
      itemsCopy[index] = { ...itemsCopy[index], completed };
      return itemsCopy;
    });
  };

  const completed = items.filter((item) => item.completed).length;

  return (
    <div className="workspace-grid">
      <section className="todoapp" aria-labelledby="tasks-heading">
        <header className="board-heading">
          <div>
            <span className="board-icon">
              <Icon name="list" />
            </span>
            <h2 id="tasks-heading">Your workspace</h2>
            <span className="task-total">{items.length}</span>
          </div>
          <span className="live-badge">
            <span className="status-dot" /> Live demo
          </span>
        </header>
        <div className="board-description">
          Big ideas start with small tasks. Make one yours.
        </div>
        <Can I="create" a="Todo">
          <NewTodo onNewTodo={addTodo} />
        </Can>
        <div className="list-heading">
          <span>ALL TASKS</span>
          <span>
            {completed} of {items.length} complete
          </span>
        </div>
        <TodoListRenderer
          items={items}
          onRemove={removeTodo}
          onEdited={editTodo}
          onComplete={completeTodo}
        />
        {!items.length && (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="check" />
            </span>
            <h3>A clean slate. A great start.</h3>
            <p>Add your first task above, or try an authorization task.</p>
            <Can I="create" a="Todo">
              <button
                type="button"
                className="starter-task"
                onClick={() =>
                  addTodo({ title: 'Explore what CASL can do', assignee: 'me' })
                }
              >
                Explore what CASL can do <Icon name="plus" />
              </button>
            </Can>
          </div>
        )}
        <div className="board-hint">
          <Icon name="code" />
          <span>Double-click a task to edit. Your role decides the rest.</span>
        </div>
      </section>
      <TodoFooter items={items} />
    </div>
  );
}
