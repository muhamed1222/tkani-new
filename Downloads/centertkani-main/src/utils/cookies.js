// src/utils/cookies.js
// Utility for working with browser cookies
// Centralized implementation to avoid code duplication

/**
 * Cookie utility object with methods for managing browser cookies
 */
const cookieUtils = {
  /**
   * Get cookie value by name
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  get(name) {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  /**
   * Set cookie with name, value and expiration
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Days until expiration (default: 7)
   * @param {string} path - Cookie path (default: '/')
   */
  set(name, value, days = 7, path = '/') {
    if (typeof document === 'undefined') return;
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=" + path + "; SameSite=Lax";
  },

  /**
   * Remove cookie by name
   * @param {string} name - Cookie name to remove
   * @param {string} path - Cookie path (default: '/')
   */
  remove(name, path = '/') {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path + ';';
  }
};

export default cookieUtils;

