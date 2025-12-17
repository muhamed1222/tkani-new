// src/services/AuthService.js
// Authentication service
// Business logic for authentication operations

import authAPI from '../http/auth';
import tokenManager from './TokenManager';
import logger from '../utils/logger';
import ApiService from '../http/client';
import { getStrapiUrl } from '../utils/apiConfig';

// API instance for file uploads and other operations
const api = new ApiService(`${getStrapiUrl()}/api`);

/**
 * AuthService class for authentication business logic
 * Separates authentication logic from state management
 */
class AuthService {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to remember user
   * @returns {Promise<Object>} Result with success status and user data
   */
  async login(email, password, rememberMe = false) {
    try {
      const response = await authAPI.login(email, password);
      
      const token = response.jwt;
      if (token) {
        // Save token using TokenManager
        tokenManager.saveToken(token, rememberMe);
      }

      return {
        success: true,
        user: response.user || {},
        token: token
      };
    } catch (error) {
      logger.error('Login error:', error.message);
      return {
        success: false,
        error: error.message || 'Ошибка входа'
      };
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {boolean} rememberMe - Whether to remember user
   * @returns {Promise<Object>} Result with success status
   */
  async register(userData, rememberMe = false) {
    try {
      logger.log('Starting user registration');

      const response = await authAPI.register(userData);
      logger.log('Registration successful');
      
      const token = response.jwt;
      if (token) {
        // Save token using TokenManager
        tokenManager.saveToken(token, rememberMe);
        logger.log('Registration token saved');
      }

      return {
        success: true,
        user: response.user || {},
        token: token
      };
    } catch (error) {
      logger.error('Registration error:', error.message);
      
      return {
        success: false,
        error: error.message || 'Ошибка подключения к серверу'
      };
    }
  }

  /**
   * Check authentication status
   * @returns {Promise<Object>} Result with user data or null
   */
  async checkAuth() {
    try {
      // Sync token before checking
      tokenManager.syncToken();
      
      if (!tokenManager.hasToken()) {
        return {
          success: false,
          isAuth: false,
          user: null
        };
      }

      const userData = await authAPI.checkAuth();
      logger.log('Auth check successful');
      
      return {
        success: true,
        isAuth: true,
        user: userData
      };
    } catch (error) {
      logger.error('Auth check error:', error.message);
      
      // If 401 error, clear invalid token
      if (error.status === 401) {
        this.logout();
      }

      return {
        success: false,
        isAuth: false,
        user: null,
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Result with updated user data
   */
  async updateProfile(userData) {
    try {
      logger.log('Updating user profile');
      
      if (!tokenManager.hasToken()) {
        return {
          success: false,
          error: 'Токен авторизации не найден. Пожалуйста, войдите заново.'
        };
      }
      
      const response = await authAPI.updateProfile(userData);
      logger.log('Profile updated successfully');
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      logger.error('Profile update error:', error.message);
      
      return {
        success: false,
        error: error.message || 'Ошибка обновления профиля'
      };
    }
  }

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result with success status
   */
  async changePassword(oldPassword, newPassword) {
    try {
      logger.log('Changing password');
      
      const response = await authAPI.changePassword(oldPassword, newPassword);
      logger.log('Password changed successfully');
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      logger.error('Password change error:', error.message);
      
      return {
        success: false,
        error: error.message || 'Ошибка смены пароля'
      };
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar file
   * @returns {Promise<Object>} Result with avatar data
   */
  async uploadAvatar(file) {
    try {
      logger.log('Uploading avatar file:', file.name);
      
      if (!tokenManager.hasToken()) {
        return {
          success: false,
          error: 'Токен авторизации не найден'
        };
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('files', file);
      
      // Get auth token for headers
      const token = tokenManager.getToken();
      if (!token) {
        logger.error('No auth token found for upload');
        return {
          success: false,
          error: 'Токен авторизации не найден. Пожалуйста, войдите заново.'
        };
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      // НЕ устанавливаем Content-Type для FormData - браузер сделает это сам
      
      // Upload file via Strapi Upload endpoint
      logger.log('Uploading file to server:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        endpoint: '/upload',
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      });
      
      const uploadResponse = await api.post('/upload', formData, headers);
      logger.log('File uploaded successfully:', uploadResponse);

      if (!uploadResponse) {
        logger.error('Upload response is null or undefined');
        return {
          success: false,
          error: 'Сервер не вернул данные о загруженном файле'
        };
      }

      // Strapi может вернуть массив или объект с data
      const files = Array.isArray(uploadResponse) 
        ? uploadResponse 
        : (uploadResponse.data || [uploadResponse]);

      if (files.length === 0) {
        logger.error('No files in upload response:', uploadResponse);
        return {
          success: false,
          error: 'Файл не был загружен. Проверьте формат файла и размер.'
        };
      }

      const uploadedFile = files[0];
      const fileId = uploadedFile.id || uploadedFile.data?.id;
      
      if (!fileId) {
        logger.error('No file ID in upload response:', uploadedFile);
        return {
          success: false,
          error: 'Не удалось получить ID загруженного файла'
        };
      }

      logger.log('Uploaded file ID:', fileId);
      
      // Update user profile with avatar
      const updateData = { avatar: fileId };
      
      logger.log('Updating user profile with avatar ID:', fileId);
      const updateResult = await authAPI.updateProfile(updateData);
      logger.log('Profile updated with avatar:', updateResult);
      
      return {
        success: true,
        message: 'Аватар успешно обновлен',
        avatar: uploadedFile
      };
    } catch (error) {
      logger.error('Avatar upload error:', {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      
      // Более детальные сообщения об ошибках
      let errorMessage = 'Ошибка загрузки аватара';
      if (error.status === 401) {
        errorMessage = 'Сессия истекла. Пожалуйста, войдите заново.';
      } else if (error.status === 413) {
        errorMessage = 'Файл слишком большой. Максимальный размер: 5MB';
      } else if (error.status === 415) {
        errorMessage = 'Неподдерживаемый формат файла. Используйте JPG, JPEG или PNG';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Remove user avatar
   * @returns {Promise<Object>} Result with success status
   */
  async removeAvatar() {
    try {
      logger.log('Removing avatar');
      
      if (!tokenManager.hasToken()) {
        return {
          success: false,
          error: 'Токен авторизации не найден'
        };
      }

      // Update user profile to remove avatar
      const updateData = { avatar: null };
      
      logger.log('Removing avatar from profile');
      await authAPI.updateProfile(updateData);
      logger.log('Avatar removed successfully');
      
      return {
        success: true,
        message: 'Аватар успешно удален'
      };
    } catch (error) {
      logger.error('Avatar removal error:', error.message);
      return {
        success: false,
        error: error.message || 'Ошибка удаления аватара'
      };
    }
  }

  /**
   * Delete user account
   * @returns {Promise<Object>} Result with success status
   */
  async deleteAccount() {
    try {
      logger.log('Deleting user account');
      
      if (!tokenManager.hasToken()) {
        throw new Error('Токен авторизации не найден');
      }

      // Delete account via API
      const response = await authAPI.deleteAccount();
      logger.log('Account deleted successfully');
      
      // Clear authentication data
      this.logout();
      
      return {
        success: true,
        message: 'Аккаунт успешно удален'
      };
    } catch (error) {
      logger.error('Account deletion error:', error.message);
      
      return {
        success: false,
        error: error.message || 'Ошибка удаления аккаунта'
      };
    }
  }

  /**
   * Logout user and clear all auth data
   */
  logout() {
    tokenManager.clearToken();
    logger.log('User logged out');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated() {
    return tokenManager.hasToken();
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
