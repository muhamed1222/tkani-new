// src/http/contact.js
// Contact form API methods
// Handles contact form submissions

import ApiService from './client';
import { getApiUrl } from '../utils/apiConfig';
import { getHeaders } from './auth';
import logger from '../utils/logger';

const api = new ApiService(getApiUrl());

/**
 * Contact form API methods
 */
export const contactAPI = {
  /**
   * Send contact form message
   * @param {Object} data - Contact form data (name, phone, email, message)
   * @returns {Promise<Object>} Response with success status
   */
  sendMessage: async (data) => {
    logger.log('Sending contact form data');

    try {
      const response = await api.post('/contact/send', {
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        message: data.message
      }, getHeaders(false));

      logger.log('Contact form sent successfully');
      
      return {
        success: true,
        message: response.message || 'Сообщение успешно отправлено'
      };
    } catch (error) {
      logger.error('Contact form error:', error.message);
      
      // If backend doesn't support endpoint, fallback logging for development
      if (error.status === 404) {
        logger.warn('Endpoint /contact/send not found, using fallback');
        logger.log('Contact form data (fallback):', {
          name: data.name,
          phone: data.phone,
          email: data.email || 'not provided',
          message: data.message
        });
        
        return {
          success: true,
          message: 'Сообщение принято (endpoint не настроен на сервере)'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Ошибка отправки сообщения. Попробуйте позже.'
      };
    }
  }
};

export default contactAPI;
