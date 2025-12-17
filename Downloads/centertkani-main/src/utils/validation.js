// src/utils/validation.js
// Centralized validation functions
// Provides consistent validation logic across the application

import { MIN_PASSWORD_LENGTH, MIN_PHONE_LENGTH, MAX_PHONE_LENGTH } from './constants';

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "Email обязателен для заполнения";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Введите корректный email адрес";
  }
  
  return "";
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @param {boolean} required - Whether phone is required
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validatePhone = (phone, required = false) => {
  if (!phone || !phone.trim()) {
    return required ? "Телефон обязателен для заполнения" : "";
  }
  
  // Remove all non-digit characters for length check
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < MIN_PHONE_LENGTH || digitsOnly.length > MAX_PHONE_LENGTH) {
    return "Введите корректный номер телефона";
  }
  
  return "";
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Пароль обязателен для заполнения";
  }
  
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов`;
  }
  
  return "";
};

/**
 * Validate password confirmation matches
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Подтвердите пароль";
  }
  
  if (password !== confirmPassword) {
    return "Пароли не совпадают";
  }
  
  return "";
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validateRequired = (value, fieldName = "Поле") => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} обязательно для заполнения`;
  }
  return "";
};

/**
 * Validate name (first name, last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validateName = (name, fieldName = "Имя") => {
  if (!name || !name.trim()) {
    return `${fieldName} обязательно для заполнения`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} должно содержать минимум 2 символа`;
  }
  
  return "";
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validateFileSize = (file, maxSize) => {
  if (!file) {
    return "";
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `Размер файла не должен превышать ${maxSizeMB}MB`;
  }
  
  return "";
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) {
    return "";
  }
  
  if (!allowedTypes.includes(file.type)) {
    return "Недопустимый тип файла";
  }
  
  return "";
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validateUrl = (url, required = false) => {
  if (!url || !url.trim()) {
    return required ? "URL обязателен для заполнения" : "";
  }
  
  try {
    new URL(url);
    return "";
  } catch {
    return "Введите корректный URL";
  }
};

/**
 * Validate number is within range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Name of the field for error message
 * @returns {string} Empty string if valid, error message if invalid
 */
export const validateNumberRange = (value, min, max, fieldName = "Значение") => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return `${fieldName} должно быть числом`;
  }
  
  if (num < min || num > max) {
    return `${fieldName} должно быть между ${min} и ${max}`;
  }
  
  return "";
};

/**
 * Validate all fields in a form data object
 * @param {object} formData - Object containing form field values
 * @param {object} validators - Object mapping field names to validator functions
 * @returns {object} Object with field names as keys and error messages as values
 */
export const validateForm = (formData, validators) => {
  const errors = {};
  
  Object.keys(validators).forEach(fieldName => {
    const validator = validators[fieldName];
    const value = formData[fieldName];
    const error = validator(value);
    
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

/**
 * Check if form has any errors
 * @param {object} errors - Errors object from validateForm
 * @returns {boolean} True if there are errors, false otherwise
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
  validateName,
  validateFileSize,
  validateFileType,
  validateUrl,
  validateNumberRange,
  validateForm,
  hasErrors,
};

