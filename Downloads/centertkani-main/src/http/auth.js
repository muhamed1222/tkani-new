// src/http/auth.js
// Authentication API methods
// Handles login, registration, password management, and user profile

import ApiService from './client';
import { getApiUrl, getStrapiUrl } from '../utils/apiConfig';
import cookieUtils from '../utils/cookies';
import logger from '../utils/logger';
import { DEFAULT_TOKEN_EXPIRY_DAYS, REMEMBER_ME_TOKEN_EXPIRY_DAYS } from '../utils/constants';

// Используем полный URL Strapi для избежания проблем с прокси
// Для /api/profile нужен прямой доступ к Strapi, а не через Vite прокси
const apiUrl = getApiUrl();
const strapiUrl = getStrapiUrl();
// Если getApiUrl возвращает относительный путь, используем полный URL Strapi
const baseUrl = apiUrl.startsWith('/') ? `${strapiUrl}/api` : apiUrl;
const api = new ApiService(baseUrl);

/**
 * Get authentication token from all possible sources
 * @returns {string|null} Authentication token or null
 */
export const getAuthToken = () => {
  const token =
    localStorage.getItem('authToken') ||
    cookieUtils.get('authToken') ||
    null;

  // Security: Token presence logged without exposing token value
  if (token) {
    logger.log('Auth token found');
  }
  return token;
};

/**
 * Get headers for API requests with optional authentication
 * @param {boolean} includeAuth - Whether to include authorization header
 * @param {boolean} isFormData - Whether the request body is FormData
 * @returns {Object} Headers object
 */
export const getHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // Security: Token details not logged
    } else {
      logger.warn('Auth token not found, proceeding without authorization');
    }
  }

  return headers;
};

/**
 * Authentication API methods
 */
export const authAPI = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response with JWT and user data
   */
  login: async (email, password) => {
    const response = await api.post('/auth/local', {
      identifier: email,
      password: password
    }, getHeaders(false));

    // After successful login, get full user data
    if (response.jwt) {
      api.setAuthToken(response.jwt);
      const userData = await api.get('/users/me?populate=avatar', {}, getHeaders(true));
      return {
        ...response,
        user: userData
      };
    }

    return response;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    const registerData = {
      username: userData.email,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone
    };

    logger.log('Sending registration data to custom endpoint');

    return api.post('/registration/register', registerData, getHeaders(false));
  },

  /**
   * Check current authentication status
   * @returns {Promise<Object>} Current user data
   */
  checkAuth: async () => {
    return api.get('/users/me?populate=avatar', {}, getHeaders(true));
  },

  /**
   * Delete current user account
   * @returns {Promise<Object>} Deletion response
   */
  deleteAccount: async () => {
    try {
      logger.log('Deleting account via /auth/account');
      return await api.delete('/auth/account', {}, getHeaders(true));
    } catch (error) {
      logger.error('Account deletion error:', error.message);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (userData) => {
    logger.log('🔄 authAPI.updateProfile - начало');
    logger.log('📝 Полученные данные:', JSON.stringify(userData, null, 2));

    // В Strapi стандартные поля: firstName, lastName, email, phone
    // Если у вас другие имена полей, проверьте через /api/users/me
    const updateData = {};

    // Имена полей как в Strapi по умолчанию
    if (userData.firstName !== undefined) {
      updateData.firstName = userData.firstName;
      logger.log('✅ Добавлено firstName:', userData.firstName);
    }

    if (userData.lastName !== undefined) {
      updateData.lastName = userData.lastName;
      logger.log('✅ Добавлено lastName:', userData.lastName);
    }

    if (userData.middleName !== undefined) {
      updateData.middleName = userData.middleName;
      logger.log('✅ Добавлено middleName:', userData.middleName);
    }

    if (userData.email !== undefined) {
      updateData.email = userData.email.toLowerCase();
      logger.log('✅ Добавлено email:', userData.email);
    }

    if (userData.phone !== undefined) {
      updateData.phone = userData.phone.trim();
      logger.log('✅ Добавлено phone:', userData.phone);
    }

    if (userData.avatar !== undefined) {
      updateData.avatar = userData.avatar;
      logger.log('✅ Добавлено avatar');
    }

    logger.log('📤 Отправляемые данные на сервер:', JSON.stringify(updateData, null, 2));

    // Используем кастомный endpoint /api/profile вместо /api/users/:id
    // Используем полный URL для гарантии прямого доступа к Strapi
    const strapiUrl = getStrapiUrl();
    const profileApiUrl = `${strapiUrl}/api`;
    logger.log('🌐 Profile API URL:', profileApiUrl);

    // Получаем заголовки с токеном
    const headers = getHeaders(true);
    logger.log('🔐 Headers for profile update:', {
      hasAuth: !!headers['Authorization'],
      authHeader: headers['Authorization'] ? `${headers['Authorization'].substring(0, 20)}...` : 'missing',
      contentType: headers['Content-Type'],
      allHeaders: Object.keys(headers)
    });

    try {
      const profileApi = new ApiService(profileApiUrl);
      logger.log('📤 Отправка PUT запроса на /profile с данными:', updateData);

      const response = await profileApi.put('/profile', updateData, headers);

      logger.log('✅ Профиль успешно обновлен на сервере');
      logger.log('📥 Ответ от сервера:', JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      logger.error('❌ Ошибка обновления профиля:', {
        message: error.message,
        status: error.status,
        data: error.data,
        url: error.url,
        suggestion: 'Проверьте права доступа к /api/profile на бэкенде.'
      });

      // Если кастомный эндпоинт не работает, пробуем стандартный API Strapi
      if (error.status === 403 || error.status === 404 || error.status === 400) {
        logger.log('🔄 Пробуем обновить профиль через стандартный API /api/users/me');
        try {
          // Получаем ID текущего пользователя
          const currentUser = await api.get('/users/me', {}, headers);
          const userId = currentUser.id;

          logger.log('👤 ID пользователя для обновления:', userId);

          // Обновляем через стандартный API
          const response = await api.put(`/users/${userId}`, updateData, headers);
          logger.log('✅ Профиль обновлен через /api/users/:id');
          return response;
        } catch (fallbackError) {
          logger.error('❌ Fallback обновления профиля тоже не удалось:', fallbackError);
          throw error; // Бросаем оригинальную ошибку
        }
      }

      throw error;
    }
  },

  /**
   * Change user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password change response
   */
  changePassword: async (oldPassword, newPassword) => {
    logger.log('🔐 authAPI.changePassword - начало');
    logger.log('📝 Старый пароль (первые 2 символа):', oldPassword.substring(0, 2) + '***');
    logger.log('📝 Новый пароль (первые 2 символа):', newPassword.substring(0, 2) + '***');

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: oldPassword,
        password: newPassword,
        passwordConfirmation: newPassword
      }, getHeaders(true));

      logger.log('✅ Смена пароля успешна');
      logger.log('📥 Ответ от сервера:', JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      logger.error('❌ Ошибка смены пароля:', {
        message: error.message,
        status: error.status,
        data: error.data,
        url: error.url
      });
      throw error;
    }
  },

  /**
   * Request password reset code
   * @param {string} email - User email
   * @returns {Promise<Object>} Response with reset code sent
   */
  forgotPassword: async (email) => {
    logger.log('📧 authAPI.forgotPassword - запрос сброса пароля для:', email);
    return api.post('/forgot-password/send-code', { email }, getHeaders(false));
  },

  /**
   * Reset password with code
   * @param {string} code - Reset code from email
   * @param {string} password - New password
   * @param {string} passwordConfirmation - Password confirmation
   * @returns {Promise<Object>} Password reset response
   */
  resetPassword: async (code, password, passwordConfirmation) => {
    logger.log('🔄 authAPI.resetPassword - сброс пароля с кодом');
    return api.post('/forgot-password/reset', {
      code,
      password,
      passwordConfirmation
    }, getHeaders(false));
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    logger.log('🚪 authAPI.logout - выход пользователя');
    return api.post('/auth/logout', {}, getHeaders(true));
  },

  /**
   * Save auth token to localStorage and cookies
   * @param {string} token - JWT token
   * @param {boolean} rememberMe - Whether to remember user for longer period
   */
  saveToken: (token, rememberMe = false) => {
    if (token) {
      api.setAuthToken(token);
      localStorage.setItem('authToken', token);

      const days = rememberMe ? REMEMBER_ME_TOKEN_EXPIRY_DAYS : DEFAULT_TOKEN_EXPIRY_DAYS;
      cookieUtils.set('authToken', token, days);

      logger.log('🔐 Auth token сохранен во всех хранилищах');
    }
  },

  /**
   * Clear auth token from all storage locations
   */
  clearToken: () => {
    api.setAuthToken(null);
    localStorage.removeItem('authToken');
    cookieUtils.remove('authToken');
    logger.log('🔐 Auth token удален из всех хранилищ');
  },
};

export default authAPI;