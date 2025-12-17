// src/http/client.js
// Base HTTP client for making API requests
// Provides common methods (GET, POST, PUT, DELETE) with error handling

import logger from '../utils/logger';
import { HTTP_STATUS } from '../utils/constants';

/**
 * Base API service class for HTTP requests
 */
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Handle API response with error checking and data extraction
   * @param {Response} response - Fetch API response object
   * @returns {Promise<any>} Parsed response data
   * @throws {Error} If response is not ok
   */
  async _handleResponse(response) {
    logger.log('API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      // Specific messages for different status codes
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        errorMessage = "Необходима авторизация";
        // Clear invalid token
        localStorage.removeItem('authToken');
      } else if (response.status === HTTP_STATUS.FORBIDDEN) {
        errorMessage = "Доступ запрещен";
      } else if (response.status === HTTP_STATUS.NOT_FOUND) {
        errorMessage = "Ресурс не найден";
      } else if (response.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        errorMessage = "Ошибка сервера";
      }

      try {
        const responseClone = response.clone();
        const errorData = await responseClone.json();

        logger.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        // New error format: { error: true, message: "..." }
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (parseError) {
        // If JSON parsing fails, try reading as text
        try {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        } catch {
          // Use default message
        }

        logger.error('Failed to parse error response:', parseError);
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    // Empty response (204 No Content)
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return null;
    }

    const data = await response.json();
    logger.log('API Success Data received');

    // Handle new response format: { success: true, data: {...} }
    if (data.success === false || data.error === true) {
      const error = new Error(data.message || 'Ошибка запроса');
      error.status = response.status;
      throw error;
    }

    // If success: true, return data without the success wrapper
    if (data.success === true) {
      const { success, ...rest } = data;
      return rest;
    }

    // Old format (without success) - return as is
    return data;
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} headers - Request headers
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, params = {}, headers = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;

      logger.log('API GET Request:', { endpoint, url });

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      logger.log('API GET Response:', {
        status: response.status,
        ok: response.ok
      });

      return await this._handleResponse(response);
    } catch (error) {
      logger.error('API GET Error:', error.message);
      throw error;
    }
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {Object} headers - Request headers
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data = {}, headers = {}) {
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);

      // Для FormData не устанавливаем Content-Type - браузер сделает это сам с boundary
      const requestHeaders = { ...headers };
      if (isFormData) {
        // Удаляем Content-Type для FormData, чтобы браузер установил его автоматически с boundary
        delete requestHeaders['Content-Type'];
      } else if (!requestHeaders['Content-Type']) {
        // Для JSON устанавливаем Content-Type только если его нет
        requestHeaders['Content-Type'] = 'application/json';
      }

      logger.log('API POST Request:', { 
        endpoint, 
        isFormData,
        hasAuth: !!requestHeaders['Authorization'],
        headers: Object.keys(requestHeaders)
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: requestHeaders,
        body: body,
      });

      logger.log('API POST Response:', {
        status: response.status,
        ok: response.ok
      });

      return await this._handleResponse(response);
    } catch (error) {
      logger.error('API POST Error:', error.message);
      throw error;
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {Object} headers - Request headers
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data = {}, headers = {}) {
    try {
      const isFormData = data instanceof FormData;
      const body = isFormData ? data : JSON.stringify(data);
      
      // Для FormData не устанавливаем Content-Type
      const requestHeaders = { ...headers };
      if (isFormData) {
        delete requestHeaders['Content-Type'];
      } else if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }

      logger.log('API PUT Request:', { 
        endpoint, 
        isFormData,
        hasAuth: !!requestHeaders['Authorization'],
        headers: Object.keys(requestHeaders)
      });
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: body,
      });

      logger.log('API PUT Response:', {
        status: response.status,
        ok: response.ok
      });

      return await this._handleResponse(response);
    } catch (error) {
      logger.error('API PUT Error:', error.message);
      throw error;
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Optional request body data
   * @param {Object} headers - Request headers
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint, data = {}, headers = {}) {
    try {
      logger.log('API DELETE Request:', { endpoint });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: headers,
        body: data && Object.keys(data).length > 0 ? JSON.stringify(data) : undefined,
      });

      logger.log('API DELETE Response:', {
        status: response.status,
        ok: response.ok
      });

      return await this._handleResponse(response);
    } catch (error) {
      logger.error('API DELETE Error:', error.message);
      throw error;
    }
  }

  /**
   * Set authentication token
   * @param {string|null} token - JWT token or null to clear
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
}

export default ApiService;
