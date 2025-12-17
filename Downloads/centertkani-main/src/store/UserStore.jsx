// src/store/UserStore.jsx
// User state management with MobX
// Now uses AuthService and TokenManager for cleaner separation of concerns

import { makeAutoObservable, runInAction } from "mobx";
import authService from "../services/AuthService";
import tokenManager from "../services/TokenManager";
import logger from '../utils/logger';

export default class UserStore {
  constructor() {
    this._isAuth = false;
    this._user = {};
    this._isLoading = true;
    this._error = null;
    this._isInitialized = false;
    
    makeAutoObservable(this);
    
    // Initialize authentication state
    this.initialize();
  }

  // Asynchronous initialization
  async initialize() {
    try {
      await this.checkAuth();
    } catch (error) {
      logger.error('UserStore initialization error:', error);
    } finally {
      runInAction(() => {
        this._isInitialized = true;
        this._isLoading = false;
      });
    }
  }

  // Check authentication status
  async checkAuth() {
    try {
      const result = await authService.checkAuth();
      
      runInAction(() => {
        if (result.success) {
          this._isAuth = true;
          this._user = result.user;
        } else {
          this._isAuth = false;
          this._user = {};
        }
      });

    } catch (error) {
      logger.error('Auth check error:', error);
      runInAction(() => {
        this._isAuth = false;
        this._user = {};
      });
    }
  }

  // Login user
  async login(email, password, rememberMe = false) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await authService.login(email, password, rememberMe);
      
      if (result.success) {
        runInAction(() => {
          this._isAuth = true;
          this._user = result.user;
          this._isLoading = false;
        });
        
        // Синхронизируем локальную корзину с серверной после успешного логина
        try {
          const { syncLocalCartToServer } = await import('../utils/localCart');
          const { cartAPI } = await import('../http/api');
          await syncLocalCartToServer((productId, quantity) => 
            cartAPI.addToCart(productId, quantity)
          );
          logger.log('✅ Локальная корзина синхронизирована с сервером');
        } catch (syncError) {
          logger.error('Ошибка синхронизации корзины:', syncError);
          // Не блокируем логин из-за ошибки синхронизации корзины
        }
        
        return { success: true };
      } else {
        runInAction(() => {
          this._error = result.error;
          this._isLoading = false;
        });
        
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      logger.error('Login error:', error);
      runInAction(() => {
        this._error = error.message || 'Ошибка входа';
        this._isLoading = false;
      });
      
      return { success: false, error: this._error };
    }
  }

  // Register new user
  async register(userData, rememberMe = false) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await authService.register(userData, rememberMe);
      
      if (result.success) {
        runInAction(() => {
          this._isAuth = true;
          this._user = result.user;
          this._isLoading = false;
        });
        
        // Синхронизируем локальную корзину с серверной после успешной регистрации
        try {
          const { syncLocalCartToServer } = await import('../utils/localCart');
          const { cartAPI } = await import('../http/api');
          await syncLocalCartToServer((productId, quantity) => 
            cartAPI.addToCart(productId, quantity)
          );
          logger.log('✅ Локальная корзина синхронизирована с сервером');
        } catch (syncError) {
          logger.error('Ошибка синхронизации корзины:', syncError);
          // Не блокируем регистрацию из-за ошибки синхронизации корзины
        }
        
        return { success: true };
      } else {
        runInAction(() => {
          this._error = result.error;
          this._isLoading = false;
        });
        
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      logger.error('Registration error:', error);
      runInAction(() => {
        this._error = error.message || 'Ошибка регистрации';
        this._isLoading = false;
      });
      
      return { success: false, error: this._error };
    }
  }

  // Update user profile
  async updateProfile(userData) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await authService.updateProfile(userData);
      
      if (result.success) {
        // Reload user data after update
        await this.checkAuth();
        
        runInAction(() => {
          this._isLoading = false;
        });
        
        return { success: true };
      } else {
        runInAction(() => {
          this._error = result.error;
          this._isLoading = false;
        });
        
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      logger.error('Profile update error:', error);
      runInAction(() => {
        this._error = error.message || 'Ошибка обновления профиля';
        this._isLoading = false;
      });
      
      return { success: false, error: this._error };
    }
  }

  // Change user password
  async changePassword(oldPassword, newPassword) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await authService.changePassword(oldPassword, newPassword);
      
      runInAction(() => {
        if (!result.success) {
          this._error = result.error;
        }
        this._isLoading = false;
      });
      
      return result;
      
    } catch (error) {
      logger.error('Password change error:', error);
      runInAction(() => {
        this._error = error.message || 'Ошибка смены пароля';
        this._isLoading = false;
      });
      
      return { success: false, error: this._error };
    }
  }

  // Upload user avatar
  async uploadAvatar(file) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await authService.uploadAvatar(file);
      
      if (result.success) {
        // Reload user data after avatar upload
        await this.checkAuth();
        
        runInAction(() => {
          this._isLoading = false;
        });
        
        return { success: true };
      } else {
        runInAction(() => {
          this._error = result.error;
          this._isLoading = false;
        });
        
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      logger.error('Avatar upload error:', error);
      runInAction(() => {
        this._error = error.message || 'Ошибка загрузки аватара';
        this._isLoading = false;
      });
      
      return { success: false, error: this._error };
    }
  }

  // Remove user avatar
  async removeAvatar() {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await authService.removeAvatar();
      
      if (result.success) {
        // Reload user data after avatar removal
        await this.checkAuth();
        
        runInAction(() => {
          this._isLoading = false;
        });
        
        return { success: true };
      } else {
        runInAction(() => {
          this._error = result.error;
          this._isLoading = false;
        });
        
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      logger.error('Avatar removal error:', error);
      runInAction(() => {
        this._error = error.message || 'Ошибка удаления аватара';
        this._isLoading = false;
      });
      
      return { success: false, error: this._error };
    }
  }

  // Delete user account
  async deleteAccount() {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const result = await authService.deleteAccount();
      
      if (result.success) {
        runInAction(() => {
          this._isAuth = false;
          this._user = {};
          this._isLoading = false;
        });
        
        return { success: true, message: result.message };
      } else {
        runInAction(() => {
          this._error = result.error;
          this._isLoading = false;
        });
        
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      logger.error('Account deletion error:', error);
      runInAction(() => {
        this._error = error.message || 'Ошибка удаления аккаунта';
        this._isLoading = false;
      });
      
      return { success: false, error: this._error };
    }
  }

  // Alias for deleteAccount (for backward compatibility)
  async deleteAccountDirect() {
    return this.deleteAccount();
  }

  // Logout user
  logout() {
    authService.logout();
    
    runInAction(() => {
      this._isAuth = false;
      this._user = {};
      this._error = null;
    });
  }

  // Clear authentication state (for internal use)
  clearAuth() {
    authService.logout();
    
    runInAction(() => {
      this._isAuth = false;
      this._user = {};
      this._error = null;
    });
  }

  // Getters
  get user() {
    return this._user;
  }

  get isAuth() {
    return this._isAuth;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  get token() {
    return tokenManager.getToken();
  }

  // Force token synchronization
  forceTokenSync() {
    tokenManager.syncToken();
  }

  // Clear error
  clearError() {
    runInAction(() => {
      this._error = null;
    });
  }
}
