/**
 * Утилита для работы с локальной корзиной (localStorage)
 * Используется для неавторизованных пользователей
 */

import logger from './logger';

const CART_STORAGE_KEY = 'localCart';

/**
 * Получить корзину из localStorage
 * @returns {Array} Массив товаров в корзине
 */
export const getLocalCart = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];
    
    const cart = JSON.parse(cartData);
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    logger.error('Ошибка чтения корзины из localStorage:', error);
    return [];
  }
};

/**
 * Сохранить корзину в localStorage
 * @param {Array} cartItems - Массив товаров в корзине
 */
export const saveLocalCart = (cartItems) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    logger.error('Ошибка сохранения корзины в localStorage:', error);
  }
};

/**
 * Добавить товар в локальную корзину
 * @param {number} productId - ID товара
 * @param {number} quantity - Количество
 * @param {Object} product - Данные товара (опционально)
 * @returns {{cart: Array, wasExisting: boolean}} Обновленная корзина и флаг существования товара
 */
export const addToLocalCart = (productId, quantity = 1, product = null) => {
  const cart = getLocalCart();
  const existingItemIndex = cart.findIndex(item => item.product?.id === productId);
  const wasExisting = existingItemIndex >= 0;
  
  if (wasExisting) {
    // Увеличиваем количество существующего товара (метраж)
    const currentQuantity = parseFloat(cart[existingItemIndex].quantity) || 0;
    const addQuantity = parseFloat(quantity) || 1;
    cart[existingItemIndex].quantity = currentQuantity + addQuantity;
    if (product) {
      cart[existingItemIndex].product = product;
      cart[existingItemIndex].price = product.price || cart[existingItemIndex].price;
    }
  } else {
    // Добавляем новый товар
    cart.push({
      id: Date.now(), // Временный ID
      product: product || { id: productId },
      quantity: parseFloat(quantity),
      price: product?.price || 0
    });
  }
  
  saveLocalCart(cart);
  return { cart, wasExisting };
};

/**
 * Обновить количество товара в локальной корзине
 * @param {number} productId - ID товара
 * @param {number} quantity - Новое количество
 * @returns {Array} Обновленная корзина
 */
export const updateLocalCart = (productId, quantity) => {
  const cart = getLocalCart();
  const itemIndex = cart.findIndex(item => item.product?.id === productId);
  
  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Удаляем товар, если количество <= 0
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = parseFloat(quantity);
    }
    saveLocalCart(cart);
  }
  
  return cart;
};

/**
 * Удалить товар из локальной корзины
 * @param {number} productId - ID товара
 * @returns {Array} Обновленная корзина
 */
export const removeFromLocalCart = (productId) => {
  const cart = getLocalCart();
  const filteredCart = cart.filter(item => item.product?.id !== productId);
  saveLocalCart(filteredCart);
  return filteredCart;
};

/**
 * Очистить локальную корзину
 */
export const clearLocalCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

/**
 * Получить количество товаров в локальной корзине
 * @returns {number} Количество товаров
 */
export const getLocalCartCount = () => {
  const cart = getLocalCart();
  return cart.filter(item => item.product && item.product.id).length;
};

/**
 * Синхронизировать локальную корзину с серверной после авторизации
 * @param {Function} addToCartAPI - Функция API для добавления товара
 * @returns {Promise<void>}
 */
export const syncLocalCartToServer = async (addToCartAPI) => {
  const localCart = getLocalCart();
  
  if (localCart.length === 0) return;
  
  try {
    // Добавляем все товары из локальной корзины в серверную
    for (const item of localCart) {
      if (item.product && item.product.id) {
        try {
          await addToCartAPI(item.product.id, item.quantity);
        } catch (error) {
          logger.error('Ошибка синхронизации товара:', error);
        }
      }
    }
    
    // Очищаем локальную корзину после успешной синхронизации
    clearLocalCart();
  } catch (error) {
    logger.error('Ошибка синхронизации корзины:', error);
  }
};

