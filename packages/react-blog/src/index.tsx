import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { defaultStore } from './hooks/useAppStore';
import { autosave } from './services/autosave';

autosave(defaultStore.hydrateFrom(localStorage));
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
