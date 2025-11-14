import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React, {createContext} from 'react';
import UserStore from './store/UserStore.jsx';
import TkanStore from './store/TkanStore.jsx';
import WorksStore from './store/WorksStore.jsx';

export const Context = createContext(null)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Context.Provider value={{
      user: new UserStore(),
      tkans: new TkanStore(),
      works: new WorksStore(),
    }}>
    <App />
    </Context.Provider>
  </StrictMode>,
)
