import React from 'react';
import TodoList from './components/TodoList';
import { AbilityContext } from './components/Can';
import { buildAbilityFor } from './config/ability';
import './App.css';

const ability = buildAbilityFor('member');

if (process.env.NODE_ENV !== 'production') {
  // expose ability to play around with it in devtools
  (window as any).ability = ability;
}

export default () => {
  return (
    <AbilityContext.Provider value={ability}>
      <div className="todoapp">
        <TodoList />
      </div>
    </AbilityContext.Provider>
  );
};
