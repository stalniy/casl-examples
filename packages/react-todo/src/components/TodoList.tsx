import React, { useEffect, useState } from 'react';
import { Can } from '@casl/react';
import todoStorage, { Todo } from '../services/todo-storage';
import NewTodo from './NewTodo';
import TodoListRenderer from './TodoListRenderer';
import TodoFooter from './TodoFooter';

export default function TodoList() {
  const [items, setItems] = useState<Todo[]>(() => todoStorage.fetch());

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    todoStorage.save(items);
  }, [items]);

  const addTodo = (attrs: Pick<Todo, 'assignee' | 'title'>) => {
    const todo = todoStorage.build(attrs);
    setFilter('all');
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

  const remaining = items.filter((item) => !item.completed).length;
  const visibleItems = items.filter(
    (item) =>
      filter === 'all' ||
      (filter === 'completed' ? item.completed : !item.completed)
  );
  const filters = [
    { value: 'all', label: 'All tasks' },
    { value: 'active', label: 'To do' },
    { value: 'completed', label: 'Completed' }
  ] as const;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="https://casl.js.org/"
          aria-label="CASL documentation"
        >
          <img
            className="brand-mark"
            src="/casl-shield.png"
            alt=""
            width="35"
            height="42"
          />{' '}
          CASL
        </a>
        <div className="workspace-label">THE AUTHORIZATION PLAYGROUND</div>
        <a className="nav-item current" href="#workspace">
          <span aria-hidden="true">▦</span> My workspace{' '}
          <span className="nav-count">{items.length}</span>
        </a>
        <a className="nav-item" href="https://casl.js.org/v6/en/guide/intro">
          <span aria-hidden="true">⌘</span> Explore CASL{' '}
          <span className="external">↗</span>
        </a>
        <div className="sidebar-bottom">
          <div className="mini-orbit" aria-hidden="true">
            ✳
          </div>
          <h3>
            Small rules.
            <br />
            Big possibilities.
          </h3>
          <p>Build permissions that grow with your ideas.</p>
          <a href="https://casl.js.org/">
            Meet CASL <span>↗</span>
          </a>
          <div className="framework">
            <span className="react-icon">⚛</span> Built with React{' '}
            <span className="status-dot" />
          </div>
        </div>
      </aside>
      <div className="page">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Playground</span>
            <span className="breadcrumb-slash">/</span> Todo workspace
          </div>
          <a href="https://github.com/stalniy/casl">
            Star on GitHub <span aria-hidden="true">↗</span>
          </a>
        </header>
        <main id="workspace">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="status-dot" /> A LITTLE PRODUCTIVITY. A LOT OF
                POSSIBILITY.
              </div>
              <h1>
                Your tasks. Your rules<span>.</span>
              </h1>
              <p>
                A space to get things done. Powered by permissions that make
                sense.
              </p>
            </div>
            <span className="edition">CASL × React</span>
          </div>
          <div className="workspace-grid">
            <section className="todoapp" aria-labelledby="tasks-heading">
              <div className="section-heading">
                <div>
                  <span className="section-icon" aria-hidden="true">
                    ☷
                  </span>
                  <h2 id="tasks-heading">My tasks</h2>
                  <span className="task-total">{items.length}</span>
                </div>
                <span className="live-label">
                  <span className="status-dot" /> Live playground
                </span>
              </div>
              <Can I="create" a="Todo">
                <NewTodo onNewTodo={addTodo} />
              </Can>
              <div className="list-toolbar">
                <div className="filters" role="group" aria-label="Filter tasks">
                  {filters.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={filter === option.value ? 'active' : ''}
                      aria-pressed={filter === option.value}
                      onClick={() => setFilter(option.value)}
                    >
                      {option.label}{' '}
                      {option.value === 'all' && <span>{items.length}</span>}
                    </button>
                  ))}
                </div>
                <span className="list-hint">Make something happen</span>
              </div>
              <TodoListRenderer
                items={visibleItems}
                onRemove={removeTodo}
                onEdited={editTodo}
                onComplete={completeTodo}
              />
              <div className="task-bottom">
                <span aria-live="polite">{remaining} tasks left to do</span>
                <span>
                  <span className="tiny-key">↵</span> to add · double-click a
                  task to edit
                </span>
              </div>
              <div className="playground-note">
                <span aria-hidden="true">ⓘ</span>
                <p>
                  This is your sandbox. Add a task, switch roles, and see
                  authorization in action.
                  <br />
                  <span>
                    Tasks are saved in this browser. Come back and pick up where
                    you left off.
                  </span>
                </p>
              </div>
            </section>
            <TodoFooter />
          </div>
          <a className="promo-banner" href="https://casl.js.org/">
            <span className="promo-symbol" aria-hidden="true">
              ✳
            </span>
            <div>
              <span className="eyebrow">MEET THE ENGINE BEHIND THE RULES</span>
              <h2>Permission to build something great.</h2>
              <p>
                CASL is an isomorphic authorization library for JavaScript.
                Simple, flexible, and made for your stack.
              </p>
            </div>
            <span className="promo-cta">
              Explore CASL <span>↗</span>
            </span>
          </a>
          <footer className="page-footer">
            <span>A tiny app. A powerful authorization library.</span>
            <span>
              Made possible by <a href="https://casl.js.org/">CASL</a>{' '}
              <span className="footer-spark">✳</span>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
