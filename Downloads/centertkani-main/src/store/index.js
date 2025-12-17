// src/store/index.js
// Centralized store initialization to prevent memory leaks
// Stores are created once and reused throughout the application

import UserStore from './UserStore.jsx';
import TkanStore from './TkanStore.jsx';
import WorksStore from './WorksStore.jsx';

// Create stores once, not on every render
const userStore = new UserStore();
const tkanStore = new TkanStore();
const worksStore = new WorksStore();

export const stores = {
  user: userStore,
  tkans: tkanStore,
  works: worksStore,
};

export default stores;

