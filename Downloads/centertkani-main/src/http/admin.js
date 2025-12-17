// src/http/admin.js
// Admin panel API methods
// Handles admin operations for products, orders, users, categories, and works

import ApiService from './client';
import { getApiUrl } from '../utils/apiConfig';
import { getHeaders } from './auth';

const api = new ApiService(getApiUrl());

/**
 * Admin API methods
 */
export const adminAPI = {
  // === Products Management ===

  /**
   * Get all products (admin view)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products list
   */
  getProducts: async (params = {}) => {
    return api.get('/admin/products', params, getHeaders(true));
  },

  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  createProduct: async (productData) => {
    const formData = new FormData();
    formData.append('title', productData.title);
    if (productData.description) formData.append('description', productData.description);
    formData.append('price', productData.price);
    if (productData.stock !== undefined) formData.append('stock', productData.stock);
    if (productData.category_id) formData.append('category_id', productData.category_id);
    if (productData.image) formData.append('image', productData.image);
    if (productData.discount !== undefined) formData.append('discount', productData.discount);
    if (productData.discount_price !== undefined) formData.append('discount_price', productData.discount_price);
    if (productData.article) formData.append('article', productData.article);
    if (productData.composition) formData.append('composition', productData.composition);
    if (productData.width) formData.append('width', productData.width);
    if (productData.density) formData.append('density', productData.density);
    if (productData.country) formData.append('country', productData.country);
    formData.append('is_new', productData.is_new ? 'true' : 'false');
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return api.post('/admin/products', formData, getHeaders(true, true));
  },

  /**
   * Update product
   * @param {number} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product
   */
  updateProduct: async (productId, productData) => {
    const formData = new FormData();
    if (productData.title) formData.append('title', productData.title);
    if (productData.description !== undefined) formData.append('description', productData.description);
    if (productData.price !== undefined) formData.append('price', productData.price);
    if (productData.stock !== undefined) formData.append('stock', productData.stock);
    if (productData.category_id !== undefined) formData.append('category_id', productData.category_id);
    if (productData.image) formData.append('image', productData.image);
    if (productData.discount !== undefined) formData.append('discount', productData.discount);
    if (productData.discount_price !== undefined) formData.append('discount_price', productData.discount_price);
    if (productData.article !== undefined) formData.append('article', productData.article || '');
    if (productData.composition !== undefined) formData.append('composition', productData.composition || '');
    if (productData.width !== undefined) formData.append('width', productData.width || '');
    if (productData.density !== undefined) formData.append('density', productData.density || '');
    if (productData.country !== undefined) formData.append('country', productData.country || '');
    if (productData.is_new !== undefined) formData.append('is_new', productData.is_new ? 'true' : 'false');
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    return api.put(`/admin/products/${productId}`, formData, getHeaders(true, true));
  },

  /**
   * Delete product
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteProduct: async (productId) => {
    return api.delete(`/admin/products/${productId}`, {}, getHeaders(true));
  },

  // === Orders Management ===

  /**
   * Get all orders (admin view)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Orders list
   */
  getAllOrders: async (params = {}) => {
    return api.get('/admin/orders', params, getHeaders(true));
  },

  /**
   * Get order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrder: async (orderId) => {
    return api.get(`/admin/orders/${orderId}`, {}, getHeaders(true));
  },

  /**
   * Update order status
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @param {string} comment - Optional comment
   * @returns {Promise<Object>} Updated order
   */
  updateOrderStatus: async (orderId, status, comment) => {
    return api.put(`/admin/orders/${orderId}/status`, {
      status: status,
      comment: comment
    }, getHeaders(true));
  },

  // === Users Management ===

  /**
   * Get all users
   * @returns {Promise<Object>} Users list
   */
  getUsers: async () => {
    return api.get('/admin/users', {}, getHeaders(true));
  },

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User details
   */
  getUser: async (userId) => {
    return api.get(`/admin/users/${userId}`, {}, getHeaders(true));
  },

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (userId, userData) => {
    return api.put(`/admin/users/${userId}`, userData, getHeaders(true));
  },

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteUser: async (userId) => {
    return api.delete(`/admin/users/${userId}`, {}, getHeaders(true));
  },

  // === Statistics ===

  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Statistics data
   */
  getStats: async () => {
    return api.get('/admin/stats', {}, getHeaders(true));
  },

  // === Categories Management ===

  /**
   * Get all categories (admin view)
   * @returns {Promise<Object>} Categories list
   */
  getCategories: async () => {
    return api.get('/admin/categories', {}, getHeaders(true));
  },

  /**
   * Create category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  createCategory: async (categoryData) => {
    return api.post('/admin/categories', categoryData, getHeaders(true));
  },

  /**
   * Update category
   * @param {number} categoryId - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  updateCategory: async (categoryId, categoryData) => {
    return api.put(`/admin/categories/${categoryId}`, categoryData, getHeaders(true));
  },

  /**
   * Delete category
   * @param {number} categoryId - Category ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteCategory: async (categoryId) => {
    return api.delete(`/admin/categories/${categoryId}`, {}, getHeaders(true));
  },

  // === Works Management ===

  /**
   * Get all works (admin view)
   * @returns {Promise<Object>} Works list
   */
  getWorks: async () => {
    return api.get('/admin/works', {}, getHeaders(true));
  },

  /**
   * Create work
   * @param {Object} workData - Work data
   * @returns {Promise<Object>} Created work
   */
  createWork: async (workData) => {
    const formData = new FormData();
    formData.append('title', workData.title);
    if (workData.description) formData.append('description', workData.description);
    if (workData.image) formData.append('image', workData.image);
    if (workData.link) formData.append('link', workData.link);
    if (workData.tags) formData.append('tags', workData.tags);

    return api.post('/admin/works', formData, getHeaders(true, true));
  },

  /**
   * Update work
   * @param {number} workId - Work ID
   * @param {Object} workData - Updated work data
   * @returns {Promise<Object>} Updated work
   */
  updateWork: async (workId, workData) => {
    const formData = new FormData();
    if (workData.title) formData.append('title', workData.title);
    if (workData.description !== undefined) formData.append('description', workData.description);
    if (workData.image) formData.append('image', workData.image);
    if (workData.link !== undefined) formData.append('link', workData.link || '');
    if (workData.tags !== undefined) formData.append('tags', workData.tags || '');

    return api.put(`/admin/works/${workId}`, formData, getHeaders(true, true));
  },

  /**
   * Delete work
   * @param {number} workId - Work ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteWork: async (workId) => {
    return api.delete(`/admin/works/${workId}`, {}, getHeaders(true));
  },
};

export default adminAPI;
