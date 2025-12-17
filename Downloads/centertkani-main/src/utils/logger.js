// src/utils/logger.js
// Centralized logging utility with conditional logging based on environment

const isDevelopment = import.meta.env.DEV;

/**
 * Logger utility that only logs in development mode
 * In production, logs are suppressed to avoid information leakage and performance issues
 */
const logger = {
  /**
   * Log general information (only in development)
   * @param {...any} args - Arguments to log
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (only in development)
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },

  /**
   * Log warnings (only in development)
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (only in development)
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log information (only in development)
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

export default logger;

