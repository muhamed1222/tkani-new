// src/http/cart.js
// Shopping cart API methods
// Handles cart operations (get, add, update, remove, clear)
// Supports both authenticated (server) and unauthenticated (localStorage) users

import ApiService from './client';
import { getApiUrl } from '../utils/apiConfig';
import { getHeaders, getAuthToken } from './auth';
import logger from '../utils/logger';
import {
  getLocalCart,
  addToLocalCart,
  updateLocalCart,
  removeFromLocalCart,
  clearLocalCart
} from '../utils/localCart';

const api = new ApiService(getApiUrl());

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Shopping cart API methods
 */
export const cartAPI = {
  /**
   * Get current user's cart
   * @returns {Promise<Object>} Cart data with items
   */
  getCart: async () => {
    logger.log('cartAPI.getCart: Starting request');

    // Если пользователь не авторизован, возвращаем локальную корзину
    if (!isAuthenticated()) {
      logger.log('cartAPI.getCart: User not authenticated, using local cart');
      const localCart = getLocalCart();
      return {
        data: {
          items: localCart,
          id: null
        }
      };
    }

    try {
      const result = await api.get('/cart', {}, getHeaders(true));
      logger.log('cartAPI.getCart: Success');
      return result;
    } catch (error) {
      logger.error('cartAPI.getCart: Error:', error.message);
      throw error;
    }
  },

  /**
   * Add product to cart
   * @param {number} productId - Product ID to add
   * @param {number} quantity - Quantity to add
   * @param {Object} product - Product data (optional, for local cart)
   * @returns {Promise<Object>} Updated cart data
   */
  addToCart: async (productId, quantity = 1, product = null) => {
    logger.log('cartAPI.addToCart: Adding product', productId);

    // Если пользователь не авторизован, используем локальную корзину
    if (!isAuthenticated()) {
      logger.log('cartAPI.addToCart: User not authenticated, using local cart');
      const { cart, wasExisting } = addToLocalCart(productId, quantity, product);
      return {
        data: {
          items: cart,
          id: null,
          wasExisting // Флаг, был ли товар уже в корзине
        }
      };
    }

    try {
      const result = await api.post('/cart/add', {
        product_id: productId,
        quantity: quantity
      }, getHeaders(true));

      logger.log('cartAPI.addToCart: Success');
      return result;
    } catch (error) {
      logger.error('cartAPI.addToCart: Error:', error.message);
      throw error;
    }
  },

  /**
   * Update product quantity in cart
   * @param {number} productId - Product ID to update
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart data
   */
  updateCart: async (productId, quantity) => {
    logger.log('cartAPI.updateCart: Updating product', productId);

    // Если пользователь не авторизован, используем локальную корзину
    if (!isAuthenticated()) {
      logger.log('cartAPI.updateCart: User not authenticated, using local cart');
      const updatedCart = updateLocalCart(productId, quantity);
      return {
        data: {
          items: updatedCart,
          id: null
        }
      };
    }

    try {
      const result = await api.post('/cart/update', {
        product_id: productId,
        quantity: quantity
      }, getHeaders(true));
      logger.log('cartAPI.updateCart: Success');
      return result;
    } catch (error) {
      logger.error('cartAPI.updateCart: Error:', error.message);
      throw error;
    }
  },

  /**
   * Remove product from cart
   * @param {number} productId - Product ID to remove
   * @returns {Promise<Object>} Updated cart data
   */
  removeFromCart: async (productId) => {
    logger.log('cartAPI.removeFromCart: Removing product', productId);

    // Если пользователь не авторизован, используем локальную корзину
    if (!isAuthenticated()) {
      logger.log('cartAPI.removeFromCart: User not authenticated, using local cart');
      const updatedCart = removeFromLocalCart(productId);
      return {
        data: {
          items: updatedCart,
          id: null
        }
      };
    }

    try {
      const result = await api.post('/cart/remove', {
        product_id: productId
      }, getHeaders(true));
      logger.log('cartAPI.removeFromCart: Success');
      return result;
    } catch (error) {
      logger.error('cartAPI.removeFromCart: Error:', error.message);
      throw error;
    }
  },

  /**
   * Clear entire cart
   * @returns {Promise<Object>} Empty cart response
   */
  clearCart: async () => {
    logger.log('cartAPI.clearCart: Clearing cart');

    // Если пользователь не авторизован, используем локальную корзину
    if (!isAuthenticated()) {
      logger.log('cartAPI.clearCart: User not authenticated, using local cart');
      clearLocalCart();
      return {
        data: {
          items: [],
          id: null
        }
      };
    }

    try {
      const result = await api.post('/cart/clear', {}, getHeaders(true));
      logger.log('cartAPI.clearCart: Success');
      return result;
    } catch (error) {
      logger.error('cartAPI.clearCart: Error:', error.message);
      throw error;
    }
  },

  checkout: async (orderData = {}) => {
    logger.log('cartAPI.checkout: Starting checkout');

    // Если пользователь не авторизован
    if (!isAuthenticated()) {
      logger.log('cartAPI.checkout: User not authenticated');
      throw new Error('Необходимо авторизоваться для оформления заказа');
    }

    try {
      const result = await api.post('/cart/checkout', orderData, getHeaders(true));
      logger.log('cartAPI.checkout: Success');
      return result;
    } catch (error) {
      logger.error('cartAPI.checkout: Error:', error.message);
      throw error;
    }
  }
};

export default cartAPI;
