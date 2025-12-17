import { useState, useEffect } from "react";
import styles from "./Toast.module.css";
import { TOAST_TIMEOUT, TOAST_TYPES } from "../../utils/constants";

let toastId = 0;
const toasts = [];
const listeners = [];

/**
 * Show toast notification
 * @param {string} message - Toast message to display
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} timeout - Auto-dismiss timeout in milliseconds (default: 3000)
 */
const showToast = (message, type = TOAST_TYPES.SUCCESS, timeout = TOAST_TIMEOUT) => {
  const id = toastId++;
  const toast = { id, message, type, timeout };
  toasts.push(toast);
  listeners.forEach(listener => listener([...toasts]));
  
  // Auto-dismiss after timeout
  if (timeout > 0) {
    setTimeout(() => {
      removeToast(id);
    }, timeout);
  }
};

const removeToast = (id) => {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach(listener => listener([...toasts]));
  }
};

export const useToast = () => {
  const [toastList, setToastList] = useState([]);

  useEffect(() => {
    listeners.push(setToastList);
    setToastList([...toasts]);
    
    return () => {
      const index = listeners.indexOf(setToastList);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    showToast,
    toasts: toastList
  };
};

export const ToastContainer = () => {
  const { toasts } = useToast();

  const getToastClassName = (type) => {
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
    return styles[`toast${typeCapitalized}`] || styles.toastSuccess;
  };

  return (
    <div className={styles.toastContainer}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${styles.toast} ${getToastClassName(toast.type)}`}
        >
          <span className={styles.toastMessage}>{toast.message}</span>
          <button
            className={styles.toastClose}
            onClick={() => removeToast(toast.id)}
            aria-label="Закрыть"
            type="button"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// Export constants for use in other components
export { TOAST_TYPES, TOAST_TIMEOUT };
export { showToast };

