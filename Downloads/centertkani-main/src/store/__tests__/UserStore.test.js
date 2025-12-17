import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserStore from '../UserStore';
import authService from '../../services/AuthService';
import tokenManager from '../../services/TokenManager';

// Mock dependencies
vi.mock('../../services/AuthService');
vi.mock('../../services/TokenManager');
vi.mock('../../utils/logger', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('UserStore', () => {
  let userStore;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock checkAuth to resolve immediately
    authService.checkAuth = vi.fn().mockResolvedValue({
      success: false,
    });
    userStore = new UserStore();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      // Check initial state
      expect(userStore.isAuth).toBe(false);
      expect(userStore.user).toEqual({});
      expect(userStore.error).toBeNull();
      // isLoading starts as true but may be set to false after async initialization
      // So we just check it's a boolean
      expect(typeof userStore.isLoading).toBe('boolean');
    });
  });

  describe('Login', () => {
    it('should set user as authenticated on successful login', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      authService.login.mockResolvedValue({
        success: true,
        user: mockUser,
        token: 'mock-token',
      });

      const result = await userStore.login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(userStore.isAuth).toBe(true);
      expect(userStore.user).toEqual(mockUser);
      expect(userStore.isLoading).toBe(false);
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123', false);
    });

    it('should set error on failed login', async () => {
      authService.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const result = await userStore.login('test@example.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(userStore.isAuth).toBe(false);
      expect(userStore.error).toBe('Invalid credentials');
      expect(userStore.isLoading).toBe(false);
    });

    it('should handle login errors', async () => {
      authService.login.mockRejectedValue(new Error('Network error'));

      const result = await userStore.login('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(userStore.error).toBeTruthy();
      expect(userStore.isLoading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should clear user state on logout', async () => {
      // Set authenticated state
      userStore._isAuth = true;
      userStore._user = { id: 1, email: 'test@example.com' };

      authService.logout.mockResolvedValue({ success: true });

      await userStore.logout();

      expect(userStore.isAuth).toBe(false);
      expect(userStore.user).toEqual({});
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('Registration', () => {
    it('should register user successfully', async () => {
      const mockUser = { id: 1, email: 'new@example.com' };
      authService.register.mockResolvedValue({
        success: true,
        user: mockUser,
        token: 'mock-token',
      });

      const result = await userStore.register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(true);
      expect(userStore.isAuth).toBe(true);
      expect(userStore.user).toEqual(mockUser);
    });

    it('should handle registration errors', async () => {
      authService.register.mockResolvedValue({
        success: false,
        error: 'Email already exists',
      });

      const result = await userStore.register({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(userStore.error).toBe('Email already exists');
    });
  });

  describe('Getters', () => {
    it('should return correct isAuth value', () => {
      userStore._isAuth = true;
      expect(userStore.isAuth).toBe(true);
    });

    it('should return correct user object', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      userStore._user = mockUser;
      expect(userStore.user).toEqual(mockUser);
    });

    it('should return correct isLoading value', () => {
      userStore._isLoading = true;
      expect(userStore.isLoading).toBe(true);
    });

    it('should return correct error value', () => {
      userStore._error = 'Test error';
      expect(userStore.error).toBe('Test error');
    });
  });
});
