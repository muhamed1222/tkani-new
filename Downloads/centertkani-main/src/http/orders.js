// src/http/orders.js
// Orders API methods
// Handles order creation and management

import ApiService from './client';
import { getApiUrl } from '../utils/apiConfig';
import { getHeaders } from './auth';
import logger from '../utils/logger';

const api = new ApiService(getApiUrl());

/**
 * Orders API methods
 */
export const ordersAPI = {
  /**
   * Create order from cart
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order data
   */
  createOrder: async (orderData = {}) => {
    return api.post('/orders', orderData, getHeaders(true));
  },

  /**
   * Get user's orders with basic populate
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Orders list
   */
  getMyOrders: async (params = {}) => {
    const headers = getHeaders(true);
    logger.log('Orders API Request Headers:', {
      hasAuth: !!headers['Authorization'],
      contentType: headers['Content-Type']
    });
    
    try {
      return await api.get('/orders', {
        ...params,
        'populate[items]': '*',
      }, headers);
    } catch (error) {
      logger.error('Orders API Error (403 Forbidden):', {
        message: error.message,
        status: error.status,
        suggestion: 'Проверьте права доступа к /api/orders на бэкенде или убедитесь, что токен авторизации действителен'
      });
      throw error;
    }
  },

  /**
   * Get user's orders with deep populate
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Orders list with deep data
   */
  getMyOrdersDeep: async (params = {}) => {
    return api.get('/orders', {
      ...params,
      'populate': 'deep,3'
    }, getHeaders(true));
  },

  /**
   * Get user's orders with nested populate
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Orders list with nested data
   */
  getMyOrdersNested: async (params = {}) => {
    return api.get('/orders', {
      ...params,
      'populate[0]': 'items',
      'populate[1]': 'items.image'
    }, getHeaders(true));
  },

  /**
   * Get completed orders
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Completed orders list
   */
  getCompletedOrders: async (params = {}) => {
    return api.get('/orders', {
      ...params,
      'filters[status][$eq]': 'confirmed',
      'populate[items]': '*',
    }, getHeaders(true));
  },

  /**
   * Get order details by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrder: async (orderId) => {
    return api.get(`/orders/${orderId}`, {
      'populate[items][populate][image]': '*'
    }, getHeaders(true));
  },

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @param {string} comment - Optional comment
   * @returns {Promise<Object>} Updated order data
   */
  updateOrderStatus: async (orderId, status, comment) => {
    return api.put(`/orders/${orderId}`, {
      data: {
        status: status
      }
    }, getHeaders(true));
  },
};

export default ordersAPI;
