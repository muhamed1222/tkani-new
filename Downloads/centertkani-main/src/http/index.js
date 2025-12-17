// src/http/index.js
// Main API module exports
// Centralized export for all API services and utilities

import ApiService from './client';
import authAPI, { getAuthToken, getHeaders } from './auth';
import catalogAPI, { worksAPI } from './products';
import cartAPI from './cart';
import ordersAPI from './orders';
import adminAPI from './admin';
import notificationsAPI from './notifications';
import contactAPI from './contact';
import { buildImageUrl, getApiUrl } from '../utils/apiConfig';
import logger from '../utils/logger';

// Create default API instance for backward compatibility
const api = new ApiService(getApiUrl());

/**
 * Get image URL from Strapi data
 * @param {Object|string} imageData - Image data from Strapi
 * @returns {string} Full image URL
 */
export const getImageUrl = (imageData) => {
  logger.log('Getting image URL');
  return buildImageUrl(imageData, '/default-textile.jpg');
};

// Export all API services
export {
  // Client
  api,
  ApiService,
  
  // Auth
  authAPI,
  getAuthToken,
  getHeaders,
  
  // Products & Catalog
  catalogAPI,
  worksAPI,
  
  // Cart
  cartAPI,
  
  // Orders
  ordersAPI,
  
  // Admin
  adminAPI,
  
  // Notifications
  notificationsAPI,
  
  // Contact
  contactAPI,
  
  // Utilities - getImageUrl already exported above
};

// Default export for backward compatibility
export default api;
