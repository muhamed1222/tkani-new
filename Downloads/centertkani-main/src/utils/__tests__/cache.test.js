import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import cache, { Cache } from '../cache';
import { CACHE_TTL } from '../constants';

describe('Cache Utility', () => {
  beforeEach(() => {
    cache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Cache.set and Cache.get', () => {
    it('should store and retrieve value', () => {
      cache.set('test-key', 'test-value');
      expect(cache.get('test-key')).toBe('test-value');
    });

    it('should return null for non-existent key', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should overwrite existing value', () => {
      cache.set('key', 'value1');
      cache.set('key', 'value2');
      expect(cache.get('key')).toBe('value2');
    });
  });

  describe('Cache expiration', () => {
    it('should return null for expired entry', () => {
      cache.set('key', 'value', CACHE_TTL.SHORT);
      expect(cache.get('key')).toBe('value');
      
      vi.advanceTimersByTime(CACHE_TTL.SHORT + 1000);
      expect(cache.get('key')).toBeNull();
    });

    it('should return value before expiration', () => {
      cache.set('key', 'value', CACHE_TTL.MEDIUM);
      vi.advanceTimersByTime(CACHE_TTL.MEDIUM - 1000);
      expect(cache.get('key')).toBe('value');
    });
  });

  describe('Cache.has', () => {
    it('should return true for existing key', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should return false for expired key', () => {
      cache.set('key', 'value', CACHE_TTL.SHORT);
      vi.advanceTimersByTime(CACHE_TTL.SHORT + 1000);
      expect(cache.has('key')).toBe(false);
    });
  });

  describe('Cache.delete', () => {
    it('should delete existing key', () => {
      cache.set('key', 'value');
      cache.delete('key');
      expect(cache.get('key')).toBeNull();
    });

    it('should not throw for non-existent key', () => {
      expect(() => cache.delete('non-existent')).not.toThrow();
    });
  });

  describe('Cache.clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('Cache.generateKey', () => {
    it('should generate consistent keys', () => {
      const key1 = Cache.generateKey('test', { id: 1, name: 'test' });
      const key2 = Cache.generateKey('test', { id: 1, name: 'test' });
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const key1 = Cache.generateKey('test', { id: 1 });
      const key2 = Cache.generateKey('test', { id: 2 });
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different prefixes', () => {
      const key1 = Cache.generateKey('test1', { id: 1 });
      const key2 = Cache.generateKey('test2', { id: 1 });
      expect(key1).not.toBe(key2);
    });
  });
});
