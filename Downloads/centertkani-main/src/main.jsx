import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React, {createContext} from 'react';
import stores from './store/index.js';

export const Context = createContext(null)

// Stores are now created once in store/index.js to prevent memory leaks
const container = document.getElementById('root');

// Сохраняем root в переменную модуля, чтобы избежать повторного создания при HMR
let root = window.__reactRoot;

if (!root) {
  root = createRoot(container);
  window.__reactRoot = root;
}

root.render(
  <StrictMode>
    <Context.Provider value={stores}>
    <App />
    </Context.Provider>
  </StrictMode>,
)
