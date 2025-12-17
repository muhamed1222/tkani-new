// src/utils/cache.js
// Simple in-memory cache utility with TTL support
// Used for caching API responses and computed data

import { CACHE_TTL } from './constants';
import logger from './logger';

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {*} data - Cached data
 * @property {number} timestamp - Timestamp when entry was created
 * @property {number} ttl - Time to live in milliseconds
 */

class Cache {
  constructor() {
    this._cache = new Map();
    this._defaultTTL = CACHE_TTL.MEDIUM;
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: CACHE_TTL.MEDIUM)
   */
  set(key, value, ttl = this._defaultTTL) {
    const entry = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this._defaultTTL
    };

    this._cache.set(key, entry);
    logger.log(`Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get cache entry
   * @param {string} key - Cache key
   * @returns {*|null} Cached value or null if expired/not found
   */
  get(key) {
    const entry = this._cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Entry expired
      this._cache.delete(key);
      logger.log(`Cache expired: ${key}`);
      return null;
    }

    logger.log(`Cache hit: ${key} (age: ${age}ms)`);
    return entry.data;
  }

  /**
   * Check if cache entry exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} True if cache entry exists and is not expired
   */
  has(key) {
    const entry = this._cache.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this._cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this._cache.delete(key);
    logger.log(`Cache deleted: ${key}`);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this._cache.size;
    this._cache.clear();
    logger.log(`Cache cleared: ${size} entries removed`);
  }

  /**
   * Clear expired entries
   * @returns {number} Number of expired entries removed
   */
  clearExpired() {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this._cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this._cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.log(`Cleared ${removed} expired cache entries`);
    }

    return removed;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const entry of this._cache.values()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this._cache.size,
      valid,
      expired
    };
  }

  /**
   * Generate cache key from parameters
   * @param {string} prefix - Key prefix
   * @param {Object} params - Parameters to include in key
   * @returns {string} Generated cache key
   */
  static generateKey(prefix, params = {}) {
    if (!params || Object.keys(params).length === 0) {
      return prefix;
    }

    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join('|');

    return `${prefix}:${paramString}`;
  }
}

// Create singleton instance
const cache = new Cache();

// Auto-cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.clearExpired();
  }, 5 * 60 * 1000); // 5 minutes
}

export default cache;
export { Cache };
