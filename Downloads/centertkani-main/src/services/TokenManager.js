// src/services/TokenManager.js
// Token management service
// Centralized token storage and retrieval

import cookieUtils from '../utils/cookies';
import { DEFAULT_TOKEN_EXPIRY_DAYS, REMEMBER_ME_TOKEN_EXPIRY_DAYS, TOKEN_STORAGE_KEY } from '../utils/constants';
import logger from '../utils/logger';

/**
 * TokenManager class for managing authentication tokens
 * Handles token storage in both localStorage and cookies
 * 
 * NOTE: For better security, consider migrating to httpOnly cookies
 * This requires backend changes to set and manage cookies
 */
class TokenManager {
  /**
   * Get authentication token from all available sources
   * Priority: localStorage -> cookies
   * @returns {string|null} Authentication token or null
   */
  getToken() {
    const token =
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      cookieUtils.get(TOKEN_STORAGE_KEY) ||
      null;

    // Security: Do not log token value
    if (token) {
      logger.log('Token found in storage');
    }

    return token;
  }

  /**
   * Save authentication token to all storage locations
   * @param {string} token - JWT token to save
   * @param {boolean} rememberMe - Whether to remember user for extended period
   */
  saveToken(token, rememberMe = false) {
    if (!token) {
      logger.warn('Attempted to save null or undefined token');
      return;
    }

    // Save to localStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Save to cookies with appropriate expiry
    const days = rememberMe ? REMEMBER_ME_TOKEN_EXPIRY_DAYS : DEFAULT_TOKEN_EXPIRY_DAYS;
    cookieUtils.set(TOKEN_STORAGE_KEY, token, days);

    logger.log('Token saved to storage locations');
  }

  /**
   * Clear authentication token from all storage locations
   */
  clearToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    cookieUtils.remove(TOKEN_STORAGE_KEY);
    logger.log('Token cleared from all storage locations');
  }

  /**
   * Check if user has valid token
   * @returns {boolean} True if token exists
   */
  hasToken() {
    return !!this.getToken();
  }

  /**
   * Check if token exists in localStorage
   * @returns {boolean} True if token exists in localStorage
   */
  hasTokenInLocalStorage() {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Check if token exists in cookies
   * @returns {boolean} True if token exists in cookies
   */
  hasTokenInCookies() {
    return !!cookieUtils.get(TOKEN_STORAGE_KEY);
  }

  /**
   * Sync token between localStorage and cookies
   * Ensures token is available in both locations
   */
  syncToken() {
    const localStorageToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const cookieToken = cookieUtils.get(TOKEN_STORAGE_KEY);

    // If token exists in one location but not the other, sync it
    if (localStorageToken && !cookieToken) {
      cookieUtils.set(TOKEN_STORAGE_KEY, localStorageToken, DEFAULT_TOKEN_EXPIRY_DAYS);
      logger.log('Token synced from localStorage to cookies');
    } else if (cookieToken && !localStorageToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, cookieToken);
      logger.log('Token synced from cookies to localStorage');
    }
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
