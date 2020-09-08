import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as sw from './registerServiceWorker';
import { defaultStore } from './hooks/useAppStore';
import { autosave } from './services/autosave';

autosave(defaultStore.hydrateFrom(localStorage));
ReactDOM.render(<App />, document.getElementById('root'));
sw.unregister();
