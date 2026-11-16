import React from 'react';
import { AbilityProvider } from '@casl/react';
import TodoList from './components/TodoList';
import Icon from './components/Icon';
import { buildAbilityFor } from './config/ability';
import './App.css';

const ability = buildAbilityFor('member');

if (import.meta.env.DEV) {
  // expose ability to play around with it in devtools
  (window as any).ability = ability;
}

export default function App() {
  return (
    <AbilityProvider value={ability}>
      <div className="app-shell">
        <aside className="sidebar">
          <a
            className="brand"
            href="https://casl.js.org/"
            aria-label="CASL home"
          >
            <span className="brand-mark">
              <Icon name="shield" />
            </span>
            casl<span className="brand-dot">.</span>
          </a>
          <div className="sidebar-label">THE PLAYGROUND</div>
          <a className="nav-item active" href="#workspace">
            <Icon name="list" /> Task workspace <span>01</span>
          </a>
          <a className="nav-item" href="https://casl.js.org/">
            <Icon name="code" /> Documentation <Icon name="arrow" />
          </a>
          <div className="sidebar-note">
            <Icon name="shield" />
            <h3>
              Small rules.
              <br />
              Big possibilities.
            </h3>
            <p>Authorization that grows with your application.</p>
            <a href="https://github.com/stalniy/casl">
              Explore CASL <Icon name="arrow" />
            </a>
          </div>
          <div className="sidebar-bottom">
            <span className="status-dot" /> Powered by CASL + React
          </div>
        </aside>
        <main className="page" id="workspace">
          <div className="topbar">
            <span>
              Examples <span className="breadcrumb-slash">/</span>{' '}
              <strong>React todo</strong>
            </span>
            <a href="https://github.com/stalniy/casl-examples/tree/master/packages/react-todo">
              View source <Icon name="arrow" />
            </a>
          </div>
          <header className="page-heading">
            <div className="eyebrow">
              <span className="status-dot" /> AUTHORIZATION, IN ACTION
            </div>
            <h1>
              A little task.
              <br />A lot of possibility<span>.</span>
            </h1>
            <p>
              A hands-on space to explore what you <em>can</em> do with CASL.
              <br className="desktop-break" /> Create a task, switch your role,
              and watch permissions come to life.
            </p>
            <span className="framework-badge">
              <span>✳</span> Built with React
            </span>
          </header>
          <TodoList />
          <footer className="page-footer">
            <span>A tiny app with a powerful permission system.</span>
            <a href="https://casl.js.org/">
              Build something with CASL <Icon name="arrow" />
            </a>
          </footer>
        </main>
      </div>
    </AbilityProvider>
  );
}
