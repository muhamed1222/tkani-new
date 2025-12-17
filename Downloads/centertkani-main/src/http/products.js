// src/http/products.js
// Products and catalog API methods
// Handles products, categories, banners, and works

import ApiService from './client';
import { getApiUrl } from '../utils/apiConfig';
import { getHeaders } from './auth';
import logger from '../utils/logger';

const strapiApi = new ApiService(getApiUrl());

/**
 * Catalog API methods for products and categories
 */
export const catalogAPI = {
  /**
   * Get products with filtering and pagination
   * @param {Object} params - Query parameters (page, pageSize, categoryId)
   * @returns {Promise<Object>} Products response with data and pagination info
   */
  getProducts: async (params = {}) => {
    const strapiParams = {
      'populate': '*',
      'publicationState': 'live'
    };

    // Pagination
    if (params.page) strapiParams['pagination[page]'] = params.page;
    if (params.pageSize) strapiParams['pagination[pageSize]'] = params.pageSize;

    // Filters for Strapi v4
    if (params['filters[category][id][$eq]']) {
      strapiParams['filters[category][id][$eq]'] = params['filters[category][id][$eq]'];
    }
    if (params.categoryId) {
      strapiParams['filters[category][id][$eq]'] = params.categoryId;
    }
    if (params.categorySlug) {
      strapiParams['filters[category][slug][$eq]'] = params.categorySlug;
    }

    logger.log('Strapi parameters for products:', strapiParams);
    return strapiApi.get('/products', strapiParams, getHeaders(false));
  },

  /**
   * Get single product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  getProduct: async (id) => {
    return strapiApi.get(`/products/${id}`, {
      'populate': '*'
    }, getHeaders(false));
  },

  /**
   * Get all categories
   * @returns {Promise<Object>} Categories response
   */
  getCategories: async () => {
    return strapiApi.get('/categories', {
      'populate': '*',
      'pagination[pageSize]': 100
    }, getHeaders(false));
  },

  /**
   * Get catalog sections grouped by type (clothing/home)
   * @returns {Promise<Object>} Object with clothing and home arrays
   */
  getCatalogSections: async () => {
    try {
      const [clothingResponse, homeResponse] = await Promise.all([
        strapiApi.get('/categories', {
          'populate': '*',
          'filters[section][$eq]': 'clothing',
          'sort': 'order:asc',
          'pagination[pageSize]': 100
        }, getHeaders(false)),
        strapiApi.get('/categories', {
          'populate': '*',
          'filters[section][$eq]': 'home',
          'sort': 'order:asc',
          'pagination[pageSize]': 100
        }, getHeaders(false))
      ]);

      // Process Strapi v4 responses
      const processCategories = (response) => {
        if (response.data && Array.isArray(response.data)) {
          return response.data.map(item => {
            const attributes = item.attributes || item;
            return {
              id: item.id,
              name: attributes.name || attributes.title,
              slug: attributes.slug,
              section: attributes.section,
              order: attributes.order || 0,
              image: attributes.image
            };
          });
        }
        return [];
      };

      return {
        clothing: processCategories(clothingResponse),
        home: processCategories(homeResponse)
      };
    } catch (error) {
      logger.error('Error loading catalog sections:', error);
      return {
        clothing: [],
        home: []
      };
    }
  },

  /**
   * Get banners for sliders
   * @param {string|null} section - Section to filter by (clothing/home)
   * @returns {Promise<Object>} Banners response
   */
  getBanners: async (section = null) => {
    try {
      const params = {
        'populate': '*',
        'publicationState': 'live',
        'sort': 'order:asc',
        'pagination[pageSize]': 100
      };

      if (section) {
        params['filters[section][$eq]'] = section;
      }

      return strapiApi.get('/banners', params, getHeaders(false));
    } catch (error) {
      logger.error('Error loading banners:', error);
      return { data: [] };
    }
  },
};

/**
 * Works (portfolio) API methods
 */
export const worksAPI = {
  /**
   * Get all works with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Works response
   */
  getAll: async (page = 1, limit = 12) => {
    // Явно указываем populate для images и fabrics согласно документации Strapi v4
    return strapiApi.get('/works', {
      'populate[0]': 'images',
      'populate[1]': 'fabrics',
      'populate[2]': 'fabrics.image',
      'pagination[page]': page,
      'pagination[pageSize]': limit
    }, getHeaders(false));
  },

  /**
   * Get work by ID
   * @param {number} id - Work ID
   * @returns {Promise<Object>} Work data
   */
  getById: async (id) => {
    // Явно указываем populate для images и fabrics согласно документации Strapi v4
    return strapiApi.get(`/works/${id}`, {
      'populate[0]': 'images',
      'populate[1]': 'fabrics',
      'populate[2]': 'fabrics.image'
    }, getHeaders(false));
  },
};

/**
 * Backward compatibility: old methods for tkans (redirect to catalog)
 */
export const tkansAPI = {
  getAll: async (params = {}) => catalogAPI.getProducts(params),
  getById: async (id) => catalogAPI.getProduct(id),
  getTypes: async () => catalogAPI.getCategories(),
};

export default catalogAPI;
