import React from 'react';
import { AbilityProvider } from '@casl/react';
import TodoList from './components/TodoList';
import { buildAbilityFor } from './config/ability';
import './App.css';

const ability = buildAbilityFor('member');

if (import.meta.env.DEV) {
  // expose ability to play around with it in devtools
  (window as any).ability = ability;
}

export default () => {
  return (
    <AbilityProvider value={ability}>
      <div className="todoapp">
        <TodoList />
      </div>
    </AbilityProvider>
  );
};
