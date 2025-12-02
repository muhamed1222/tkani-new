// src/hooks/useTokenSync.js
import { useContext, useEffect } from 'react';
import { Context } from '../main';

export const useTokenSync = () => {
  const { user } = useContext(Context);

  useEffect(() => {
    // Синхронизируем токен при монтировании компонента
    if (user && user.forceTokenSync) {
      user.forceTokenSync();
    }
  }, [user]);

  return null;
};