import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import cookieUtils from '../cookies';

describe('Cookie Utilities', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('set', () => {
    it('should set a cookie', () => {
      cookieUtils.set('test-key', 'test-value');
      expect(document.cookie).toContain('test-key=test-value');
    });

    it('should set cookie with options', () => {
      cookieUtils.set('test-key', 'test-value', {
        expires: 7,
        path: '/test',
        secure: true,
        sameSite: 'Strict',
      });
      expect(document.cookie).toContain('test-key=test-value');
    });

    it('should encode special characters', () => {
      cookieUtils.set('test-key', 'value with spaces');
      expect(cookieUtils.get('test-key')).toBe('value with spaces');
    });
  });

  describe('get', () => {
    it('should get a cookie value', () => {
      document.cookie = 'test-key=test-value';
      expect(cookieUtils.get('test-key')).toBe('test-value');
    });

    it('should return null for non-existent cookie', () => {
      expect(cookieUtils.get('non-existent')).toBeNull();
    });

    it('should decode cookie value', () => {
      cookieUtils.set('test-key', 'value with spaces');
      expect(cookieUtils.get('test-key')).toBe('value with spaces');
    });
  });

  describe('remove', () => {
    it('should remove a cookie', () => {
      cookieUtils.set('test-key', 'test-value');
      expect(cookieUtils.get('test-key')).toBe('test-value');
      
      cookieUtils.remove('test-key');
      expect(cookieUtils.get('test-key')).toBeNull();
    });

    it('should not throw for non-existent cookie', () => {
      expect(() => cookieUtils.remove('non-existent')).not.toThrow();
    });
  });

  describe('get for non-existent cookie', () => {
    it('should return null for non-existent cookie', () => {
      expect(cookieUtils.get('non-existent')).toBeNull();
    });
  });
});
