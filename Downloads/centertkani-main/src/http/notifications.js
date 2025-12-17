// src/http/notifications.js
// Notifications API methods
// Handles user notifications

import ApiService from './client';
import { getApiUrl } from '../utils/apiConfig';
import { getHeaders } from './auth';
import logger from '../utils/logger';

const api = new ApiService(getApiUrl());

/**
 * Notifications API methods
 */
export const notificationsAPI = {
  /**
   * Get all notifications for current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Notifications list
   */
  getNotifications: async (params = {}) => {
    const headers = getHeaders(true);
    logger.log('Notifications API Request Headers:', {
      hasAuth: !!headers['Authorization'],
      contentType: headers['Content-Type']
    });
    
    try {
      return await api.get('/notifications', {
        'sort': 'createdAt:desc',
        ...params
      }, headers);
    } catch (error) {
      logger.error('Notifications API Error (403 Forbidden):', {
        message: error.message,
        status: error.status,
        suggestion: 'Проверьте права доступа к /api/notifications на бэкенде или убедитесь, что токен авторизации действителен'
      });
      throw error;
    }
  },

  /**
   * Get notification by ID
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Notification details
   */
  getNotification: async (id) => {
    return api.get(`/notifications/${id}`, {}, getHeaders(true));
  },

  /**
   * Mark notification as read
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`, {}, getHeaders(true));
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Response
   */
  markAllAsRead: async () => {
    return api.put('/notifications/read-all', {}, getHeaders(true));
  },

  /**
   * Get count of unread notifications
   * @returns {Promise<Object>} Unread count
   */
  getUnreadCount: async () => {
    return api.get('/notifications/unread/count', {}, getHeaders(true));
  }
};

export default notificationsAPI;
