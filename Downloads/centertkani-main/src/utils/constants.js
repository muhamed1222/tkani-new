// src/utils/constants.js
// Application-wide constants
// Centralizes magic numbers and commonly used values

// Timeouts (in milliseconds)
export const ERROR_TIMEOUT = 5000;
export const SUCCESS_MESSAGE_TIMEOUT = 5000;
export const DEBOUNCE_DELAY = 300;
export const SEARCH_DEBOUNCE_DELAY = 500;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Token/Auth
export const DEFAULT_TOKEN_EXPIRY_DAYS = 7;
export const REMEMBER_ME_TOKEN_EXPIRY_DAYS = 30;
export const TOKEN_STORAGE_KEY = 'authToken';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_PAGE = 1;
export const MAX_PAGE_SIZE = 100;

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_PHONE_LENGTH = 10;
export const MAX_PHONE_LENGTH = 15;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  UNAUTHORIZED: 'Необходима авторизация.',
  FORBIDDEN: 'Доступ запрещен.',
  NOT_FOUND: 'Ресурс не найден.',
  FILE_TOO_LARGE: 'Размер файла слишком большой.',
  INVALID_FILE_TYPE: 'Недопустимый тип файла.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Профиль успешно обновлен',
  PASSWORD_CHANGED: 'Пароль успешно изменен',
  AVATAR_UPLOADED: 'Аватар успешно загружен',
  AVATAR_REMOVED: 'Аватар успешно удален',
  ORDER_CREATED: 'Заказ успешно создан',
  ITEM_ADDED_TO_CART: 'Товар добавлен в корзину',
  ITEM_REMOVED_FROM_CART: 'Товар удален из корзины',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  CART_ITEMS: 'cartItems',
  THEME: 'theme',
};

// Cookie Names
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'authToken',
  REMEMBER_ME: 'rememberMe',
};

// Product Related
export const DEFAULT_PRODUCT_IMAGE = '/placeholder-product.jpg';
export const DEFAULT_AVATAR_IMAGE = '/default-avatar.svg';

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,     // 5 minutes
  MEDIUM: 15 * 60 * 1000,    // 15 minutes
  LONG: 60 * 60 * 1000,      // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Toast notification
export const TOAST_TIMEOUT = 3000; // 3 seconds default
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// API Retry
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second

export default {
  ERROR_TIMEOUT,
  SUCCESS_MESSAGE_TIMEOUT,
  DEBOUNCE_DELAY,
  SEARCH_DEBOUNCE_DELAY,
  MAX_FILE_SIZE,
  MAX_AVATAR_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  DEFAULT_TOKEN_EXPIRY_DAYS,
  REMEMBER_ME_TOKEN_EXPIRY_DAYS,
  TOKEN_STORAGE_KEY,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  MAX_PAGE_SIZE,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PHONE_LENGTH,
  MAX_PHONE_LENGTH,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  COOKIE_NAMES,
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_AVATAR_IMAGE,
  CACHE_TTL,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY,
  TOAST_TIMEOUT,
  TOAST_TYPES,
};

