// src/http/api.js
// Базовый URL API (можно вынести в переменные окружения)
// Поддерживаем оба варианта: /api/v1/ (новый) и /api/ (старый для обратной совместимости)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1339/api';

// Утилита для работы с куками
const cookieUtils = {
  get(name) {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  set(name, value, days = 7, path = '/') {
    if (typeof document === 'undefined') return;
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=" + path + "; SameSite=Lax";
  },

  remove(name, path = '/') {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path + ';';
  }
};

// Утилита для получения токена из всех возможных источников
const getAuthToken = () => {
  // Пробуем получить токен из разных источников в порядке приоритета
  const token =
    localStorage.getItem('authToken') ||
    cookieUtils.get('authToken') ||
    null;

  console.log('🔐 getAuthToken - Токен найден:', token ? `присутствует (${token.substring(0, 20)}...)` : 'отсутствует');
  return token;
};

// Утилита для получения заголовков с авторизацией
// src/http/api.js - обновите getHeaders
const getHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getAuthToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('📤 Заголовок Authorization установлен:', {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + '...',
        fullHeader: `Bearer ${token}`
      });
    } else {
      console.warn('⚠️ getHeaders - Токен не найден, запрос без авторизации');
    }
  }

  console.log('📤 Итоговые заголовки запроса:', headers);
  return headers;
};

// Базовый класс для работы с API
class ApiService {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  // Улучшенная обработка ошибок с поддержкой нового формата
  async _handleResponse(response) {
    console.log('🔵 API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      // Специфичные сообщения для разных статусов
      if (response.status === 401) {
        errorMessage = "Необходима авторизация";
        // Очищаем невалидный токен
        localStorage.removeItem('authToken');
      } else if (response.status === 403) {
        errorMessage = "Доступ запрещен";
      } else if (response.status === 404) {
        errorMessage = "Ресурс не найден";
      } else if (response.status === 500) {
        errorMessage = "Ошибка сервера";
      }

      try {
        // Клонируем response для чтения, так как response.json() можно вызвать только один раз
        const responseClone = response.clone();
        const errorData = await responseClone.json();

        console.error('🔴 API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        // Новый формат ошибок: { error: true, message: "..." }
        // Приоритет: сообщение из ответа > стандартное сообщение по статусу
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (parseError) {
        // Если не удалось распарсить JSON, пытаемся прочитать как текст
        try {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        } catch {
          // Если не удалось прочитать, используем стандартное сообщение
        }

        console.error('🔴 Failed to parse error response:', parseError);
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    // Если ответ пустой (204 No Content), возвращаем null
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    console.log('🟢 API Success Data:', data);

    // Обработка нового формата ответов: { success: true, data: {...} }
    // Если есть success: false, это ошибка
    if (data.success === false || data.error === true) {
      const error = new Error(data.message || 'Ошибка запроса');
      error.status = response.status;
      throw error;
    }

    // Если success: true, возвращаем данные (без обертки success)
    // Для обратной совместимости также поддерживаем старый формат
    if (data.success === true) {
      // Убираем success из ответа, возвращаем только данные
      const { success, ...rest } = data;
      return rest;
    }

    // Старый формат (без success) - возвращаем как есть
    return data;
  }

  // Универсальный метод для GET запросов
  async get(endpoint, params = {}, includeAuth = true) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;

      console.log('API GET Request:', {
        url,
        endpoint,
        baseURL: this.baseURL,
        includeAuth,
        headers: getHeaders(includeAuth)
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(includeAuth),
      });

      console.log('API GET Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      return await this._handleResponse(response);
    } catch (error) {
      console.error('API GET Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        status: error.status
      });
      throw error;
    }
  }

  // Универсальный метод для POST запросов
  async post(endpoint, data = {}, includeAuth = true, isFormData = false) {
    try {
      const body = isFormData ? data : JSON.stringify(data);

      console.log('API POST Request:', {
        url: `${this.baseURL}${endpoint}`,
        endpoint,
        includeAuth,
        isFormData,
        body: isFormData ? '[FormData]' : body
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(includeAuth, isFormData),
        body: body,
      });

      console.log('API POST Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      return await this._handleResponse(response);
    } catch (error) {
      console.error('API POST Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        status: error.status
      });
      throw error;
    }
  }

  // Универсальный метод для PUT запросов
  async put(endpoint, data = {}, includeAuth = true, isFormData = false) {
    try {
      const body = isFormData ? data : JSON.stringify(data);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(includeAuth, isFormData),
        body: body,
      });

      return await this._handleResponse(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  // src/http/api.js - ОБНОВИТЕ метод delete
  async delete(endpoint, data = {}, includeAuth = true) {
    try {
      console.log('🗑️ API DELETE Request:', {
        url: `${this.baseURL}${endpoint}`,
        endpoint,
        includeAuth,
        data,
        headers: getHeaders(includeAuth)
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(includeAuth),
        body: data && Object.keys(data).length > 0 ? JSON.stringify(data) : undefined,
      });

      console.log('🗑️ API DELETE Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      return await this._handleResponse(response);
    } catch (error) {
      console.error('❌ API DELETE Error:', error);
      throw error;
    }
  }

  // src/store/UserStore.jsx - ОБНОВЛЕННЫЙ метод deleteAccount
  async deleteAccount() {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      console.log('🗑️ UserStore.deleteAccount - начало удаления аккаунта');

      // ПРОВЕРЯЕМ ТОКЕН ИЗ РАЗНЫХ ИСТОЧНИКОВ
      const tokenFromLocalStorage = localStorage.getItem('authToken');
      const tokenFromCookie = cookieUtils.get('authToken');
      const tokenFromAPI = api.getAuthToken();

      console.log('🔐 Токены из разных источников:', {
        localStorage: tokenFromLocalStorage ? 'есть' : 'нет',
        cookie: tokenFromCookie ? 'есть' : 'нет',
        api: tokenFromAPI ? 'есть' : 'нет'
      });

      // Используем токен из localStorage (основной источник)
      const token = tokenFromLocalStorage || tokenFromCookie;
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      // Устанавливаем токен в API
      api.setAuthToken(token);
      console.log('🔐 Токен установлен в API:', token.substring(0, 20) + '...');

      // ДЕЛАЕМ ЗАПРОС С ПРОВЕРКОЙ АВТОРИЗАЦИИ
      console.log('👤 Удаление текущего аккаунта через кастомный endpoint');

      // Используем authAPI.deleteAccount вместо прямого вызова api.delete
      const response = await authAPI.deleteAccount();
      console.log('✅ Аккаунт успешно удален:', response);

      // Очищаем данные авторизации
      this.clearAuth();

      return {
        success: true,
        message: 'Аккаунт успешно удален'
      };

    } catch (error) {
      console.error('❌ UserStore.deleteAccount - ошибка:', error);

      runInAction(() => {
        this._error = error.message || 'Ошибка удаления аккаунта';
      });

      return {
        success: false,
        error: this._error
      };
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Метод для установки токена авторизации
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Метод для получения токена
  getAuthToken() {
    return getAuthToken();
  }
}

// Создаем экземпляр API сервиса
const api = new ApiService();

// Специфичные методы для работ
export const worksAPI = {
  // Получить все работы с пагинацией
  getAll: async (page = 1, limit = 12) => {
    return api.get('/works', {
      'populate': '*',
      'pagination[page]': page,
      'pagination[pageSize]': limit
    }, false);
  },

  // Получить работу по ID - ДОБАВЬТЕ populate=*
  getById: async (id) => {
    return api.get(`/works/${id}`, {
      'populate': '*' // ВАЖНО: добавляем для загрузки изображений
    }, false);
  },
};

// Специфичные методы для каталога товаров
export const catalogAPI = {
  // Получить все товары с фильтрацией
  getProducts: async (params = {}) => {
    const strapiParams = {
      'populate': '*', // Важно: запрашиваем все связанные данные
      'publicationState': 'live'
    };

    // Пагинация
    if (params.page) strapiParams['pagination[page]'] = params.page;
    if (params.pageSize) strapiParams['pagination[pageSize]'] = params.pageSize;

    // Фильтры для Strapi v4
    if (params['filters[category][id][$eq]']) {
      strapiParams['filters[category][id][$eq]'] = params['filters[category][id][$eq]'];
    }
    if (params.categoryId) {
      strapiParams['filters[category][id][$eq]'] = params.categoryId;
    }
    if (params.brandId) {
      strapiParams['filters[brand][id][$eq]'] = params.brandId;
    }

    console.log('📡 Strapi параметры для товаров:', strapiParams);
    return api.get('/products', strapiParams, false);
  },

  // Получить товар по ID
  getProduct: async (id) => {
    return api.get(`/products/${id}`, {
      'populate': '*' // Запрашиваем все связанные данные
    }, false);
  },

  // Получить категории
  getCategories: async () => {
    return api.get('/categories', {
      'populate': '*',
      'pagination[pageSize]': 100
    }, false);
  },

  // Получить бренды
  getBrands: async () => {
    return api.get('/brands', {
      'populate': '*',
      'pagination[pageSize]': 100
    }, false);
  },
};

// Методы для аутентификации
export const authAPI = {
  // Вход - правильный endpoint для Strapi
  login: async (email, password) => {
    const response = await api.post('/auth/local', {
      identifier: email, // Strapi использует 'identifier' вместо 'email'
      password: password
    }, false);

    // После успешного входа получаем полные данные пользователя
    if (response.jwt) {
      api.setAuthToken(response.jwt);
      const userData = await api.get('/users/me?populate=avatar', {}, true);
      return {
        ...response,
        user: userData
      };
    }

    return response;
  },

  // Регистрация через кастомный endpoint
  register: async (userData) => {
    const registerData = {
      username: userData.email,
      email: userData.email,
      password: userData.password,
      // Отправляем дополнительные поля
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone
    };

    console.log('🔵 Отправляем данные регистрации в кастомный endpoint:', registerData);

    // Используем кастомный endpoint вместо стандартного Strapi
    return api.post('/registration/register', registerData, false);
  },

  // Получить информацию о текущем пользователе
  checkAuth: async () => {
    return api.get('/users/me?populate=avatar', {}, true);
  },


  deleteAccount: async () => {
    try {
      console.log('🗑️ authAPI.deleteAccount - отправка запроса через /auth/account');
      return await api.delete('/auth/account', {}, true);
    } catch (error) {
      console.error('❌ authAPI.deleteAccount - ошибка:', error);
      throw error;
    }
  },


  // Обновление профиля
  updateProfile: async (userData) => {
    const updateData = {};

    // Используем правильные имена полей
    if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
    if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone; // ВАЖНО: добавляем phone
    if (userData.avatar !== undefined) updateData.avatar = userData.avatar;

    console.log('🔵 Отправляем данные обновления профиля:', updateData);

    // Получаем ID текущего пользователя
    const currentUser = await api.get('/users/me', {}, true);
    const userId = currentUser.id;

    console.log('👤 ID пользователя для обновления:', userId);

    // Обновляем пользователя
    const response = await api.put(`/users/${userId}`, updateData, true);

    console.log('✅ Профиль обновлен, ответ:', response);

    return response;
  },

  // Изменить пароль
  changePassword: async (oldPassword, newPassword) => {
    return api.post('/auth/change-password', {
      currentPassword: oldPassword,
      password: newPassword,
      passwordConfirmation: newPassword
    }, true);
  },

  // Восстановление пароля - отправить код
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email }, false);
  },

  // Восстановление пароля - сброс пароля
  resetPassword: async (code, password, passwordConfirmation) => {
    return api.post('/auth/reset-password', {
      code,
      password,
      passwordConfirmation
    }, false);
  },

  // Выход из системы
  logout: async () => {
    return api.post('/auth/logout', {}, true);
  },
};

// Методы для корзины - ОБНОВЛЕННЫЕ С АВТОРИЗАЦИЕЙ
export const cartAPI = {
  // Получить корзину - теперь с авторизацией
  getCart: async () => {
    console.log('cartAPI.getCart: Начало запроса');
    try {
      const result = await api.get('/cart', {}, true); // true - includeAuth
      console.log('cartAPI.getCart: Успешный ответ:', result);
      return result;
    } catch (error) {
      console.error('cartAPI.getCart: Ошибка:', error);
      throw error;
    }
  },

  // Добавить товар в корзину - с авторизацией
  addToCart: async (productId, quantity = 1) => {
    console.log('cartAPI.addToCart: Добавление товара:', { productId, quantity });
    try {
      const result = await api.post('/cart/add', {
        product_id: productId,
        quantity: quantity
      }, true); // true - includeAuth
      console.log('cartAPI.addToCart: Успешный ответ:', result);
      return result;
    } catch (error) {
      console.error('cartAPI.addToCart: Ошибка:', error);
      throw error;
    }
  },

  // Обновить количество товара - с авторизацией
  updateCart: async (productId, quantity) => {
    console.log('cartAPI.updateCart: Обновление товара:', { productId, quantity });
    try {
      const result = await api.post('/cart/update', {
        product_id: productId,
        quantity: quantity
      }, true); // true - includeAuth
      console.log('cartAPI.updateCart: Успешный ответ:', result);
      return result;
    } catch (error) {
      console.error('cartAPI.updateCart: Ошибка:', error);
      throw error;
    }
  },

  // Удалить товар из корзины - с авторизацией
  removeFromCart: async (productId) => {
    console.log('cartAPI.removeFromCart: Удаление товара:', { productId });
    try {
      const result = await api.post('/cart/remove', {
        product_id: productId
      }, true); // true - includeAuth
      console.log('cartAPI.removeFromCart: Успешный ответ:', result);
      return result;
    } catch (error) {
      console.error('cartAPI.removeFromCart: Ошибка:', error);
      throw error;
    }
  },

  // Очистить корзину - с авторизацией
  clearCart: async () => {
    console.log('cartAPI.clearCart: Очистка корзины');
    try {
      const result = await api.post('/cart/clear', {}, true); // true - includeAuth
      console.log('cartAPI.clearCart: Успешный ответ:', result);
      return result;
    } catch (error) {
      console.error('cartAPI.clearCart: Ошибка:', error);
      throw error;
    }
  },
};

// Методы для админ-панели
export const adminAPI = {
  // Товары
  getProducts: async (params = {}) => {
    return api.get('/admin/products', params, true);
  },

  createProduct: async (productData) => {
    const formData = new FormData();
    formData.append('title', productData.title);
    if (productData.description) formData.append('description', productData.description);
    formData.append('price', productData.price);
    if (productData.stock !== undefined) formData.append('stock', productData.stock);
    if (productData.category_id) formData.append('category_id', productData.category_id);
    if (productData.brand_id) formData.append('brand_id', productData.brand_id);
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

    return api.post('/admin/products', formData, true, true);
  },

  updateProduct: async (productId, productData) => {
    const formData = new FormData();
    if (productData.title) formData.append('title', productData.title);
    if (productData.description !== undefined) formData.append('description', productData.description);
    if (productData.price !== undefined) formData.append('price', productData.price);
    if (productData.stock !== undefined) formData.append('stock', productData.stock);
    if (productData.category_id !== undefined) formData.append('category_id', productData.category_id);
    if (productData.brand_id !== undefined) formData.append('brand_id', productData.brand_id);
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

    return api.put(`/admin/products/${productId}`, formData, true, true);
  },

  deleteProduct: async (productId) => {
    return api.delete(`/admin/products/${productId}`, true);
  },

  // Заказы
  getAllOrders: async (params = {}) => {
    return api.get('/admin/orders', params, true);
  },

  getOrder: async (orderId) => {
    return api.get(`/admin/orders/${orderId}`, {}, true);
  },

  updateOrderStatus: async (orderId, status, comment) => {
    return api.put(`/admin/orders/${orderId}/status`, {
      status: status,
      comment: comment
    }, true);
  },

  // Пользователи
  getUsers: async () => {
    return api.get('/admin/users', {}, true);
  },

  getUser: async (userId) => {
    return api.get(`/admin/users/${userId}`, {}, true);
  },

  updateUser: async (userId, userData) => {
    return api.put(`/admin/users/${userId}`, userData, true);
  },

  deleteUser: async (userId) => {
    return api.delete(`/admin/users/${userId}`, true);
  },

  // Статистика
  getStats: async () => {
    return api.get('/admin/stats', {}, true);
  },

  // Категории
  getCategories: async () => {
    return api.get('/admin/categories', {}, true);
  },

  createCategory: async (categoryData) => {
    return api.post('/admin/categories', categoryData, true);
  },

  updateCategory: async (categoryId, categoryData) => {
    return api.put(`/admin/categories/${categoryId}`, categoryData, true);
  },

  deleteCategory: async (categoryId) => {
    return api.delete(`/admin/categories/${categoryId}`, true);
  },

  // Бренды
  getBrands: async () => {
    return api.get('/admin/brands', {}, true);
  },

  createBrand: async (brandData) => {
    return api.post('/admin/brands', brandData, true);
  },

  updateBrand: async (brandId, brandData) => {
    return api.put(`/admin/brands/${brandId}`, brandData, true);
  },

  deleteBrand: async (brandId) => {
    return api.delete(`/admin/brands/${brandId}`, true);
  },

  // Работы
  getWorks: async () => {
    return api.get('/admin/works', {}, true);
  },

  createWork: async (workData) => {
    const formData = new FormData();
    formData.append('title', workData.title);
    if (workData.description) formData.append('description', workData.description);
    if (workData.image) formData.append('image', workData.image);
    if (workData.link) formData.append('link', workData.link);
    if (workData.tags) formData.append('tags', workData.tags);

    return api.post('/admin/works', formData, true, true);
  },

  updateWork: async (workId, workData) => {
    const formData = new FormData();
    if (workData.title) formData.append('title', workData.title);
    if (workData.description !== undefined) formData.append('description', workData.description);
    if (workData.image) formData.append('image', workData.image);
    if (workData.link !== undefined) formData.append('link', workData.link || '');
    if (workData.tags !== undefined) formData.append('tags', workData.tags || '');

    return api.put(`/admin/works/${workId}`, formData, true, true);
  },

  deleteWork: async (workId) => {
    return api.delete(`/admin/works/${workId}`, true);
  },
};

// Обратная совместимость: старые методы для tkans (перенаправляем на catalog)
export const tkansAPI = {
  getAll: async (params = {}) => {
    return catalogAPI.getProducts(params);
  },
  getById: async (id) => {
    return catalogAPI.getProduct(id);
  },
  getTypes: async () => {
    return catalogAPI.getCategories();
  },
  getBrands: async () => {
    return catalogAPI.getBrands();
  },
};

// Методы для контактной формы
export const contactAPI = {
  sendMessage: async (data) => {
    console.log('📧 Данные формы для отправки на почту:', data);

    // TODO: Настроить реальную отправку на почту
    // Временная заглушка - всегда успешная отправка
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ Письмо отправлено на почту организации');
        console.log('📋 Содержимое письма:');
        console.log('   Имя:', data.name);
        console.log('   Телефон:', data.phone);
        console.log('   Сообщение:', data.message);
        resolve({ success: true, message: 'Письмо отправлено' });
      }, 1000);
    });
  }
};

// В разделе методов для заказов добавьте:
export const ordersAPI = {
  // Создать заказ из корзины
  createOrder: async (orderData = {}) => {
    return api.post('/orders', orderData, true);
  },

  // Получить список заказов пользователя - базовый populate
  getMyOrders: async (params = {}) => {
    return api.get('/orders', {
      ...params,
      'populate[items]': '*', // Базовый populate для компонента
    }, true);
  },

  // Получить список заказов с глубоким populate
  getMyOrdersDeep: async (params = {}) => {
    return api.get('/orders', {
      ...params,
      'populate': 'deep,3' // Глубокий populate до 3 уровня
    }, true);
  },

  // Получить список заказов с вложенным populate
  getMyOrdersNested: async (params = {}) => {
    return api.get('/orders', {
      ...params,
      'populate[0]': 'items', // populate компонента items
      'populate[1]': 'items.image' // populate изображений внутри компонента
    }, true);
  },


  // Получить завершенные заказы
  getCompletedOrders: async (params = {}) => {
    return api.get('/orders', {
      ...params,
      'filters[status][$eq]': 'confirmed', // Фильтр по статусу
      'populate[items]': '*',
    }, true);
  },

  // Получить детали заказа
  getOrder: async (orderId) => {
    return api.get(`/orders/${orderId}`, {
      'populate[items][populate][image]': '*'
    }, true);
  },

  // Обновить статус заказа
  updateOrderStatus: async (orderId, status, comment) => {
    return api.put(`/orders/${orderId}`, {
      data: {
        status: status
      }
    }, true);
  },
};

// Функция для получения URL изображения из данных Strapi
export const getImageUrl = (imageData) => {
  console.log('🖼️ Получение URL изображения:', imageData);

  if (!imageData) {
    console.log('❌ Изображение не найдено');
    return '/default-textile.jpg';
  }

  // Формат Strapi v4 с глубоким populate
  if (imageData.data) {
    // Если это массив (multiple: true)
    if (Array.isArray(imageData.data) && imageData.data.length > 0) {
      const url = `http://localhost:1339${imageData.data[0].attributes?.url}`;
      console.log('✅ URL из массива данных:', url);
      return url;
    }
    // Если это одиночный файл
    if (imageData.data.attributes?.url) {
      const url = `http://localhost:1339${imageData.data.attributes.url}`;
      console.log('✅ URL из одиночных данных:', url);
      return url;
    }
  }

  // Прямой доступ к attributes (альтернативный формат)
  if (imageData.attributes?.url) {
    const url = `http://localhost:1339${imageData.attributes.url}`;
    console.log('✅ URL из прямых attributes:', url);
    return url;
  }

  // Прямой URL (для обратной совместимости)
  if (imageData.url) {
    const url = imageData.startsWith('http') ? imageData : `http://localhost:1339${imageData}`;
    console.log('✅ Прямой URL:', url);
    return url;
  }

  // Если это строка (старый формат)
  if (typeof imageData === 'string') {
    const url = imageData.startsWith('http') ? imageData : `http://localhost:1339${imageData}`;
    console.log('✅ URL из строки:', url);
    return url;
  }

  console.log('❌ Неизвестный формат изображения');
  return '/default-textile.jpg';
};


// Методы для уведомлений
export const notificationsAPI = {
  // Получить все уведомления пользователя
  getNotifications: async (params = {}) => {
    return api.get('/notifications', {
      'sort': 'createdAt:desc',
      ...params
    }, true);
  },

  // Получить уведомление по ID
  getNotification: async (id) => {
    return api.get(`/notifications/${id}`, {}, true);
  },

  // Пометить уведомление как прочитанное
  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`, {}, true);
  },

  // Пометить все уведомления как прочитанные
  markAllAsRead: async () => {
    return api.put('/notifications/read-all', {}, true);
  },

  // Получить количество непрочитанных уведомлений
  getUnreadCount: async () => {
    return api.get('/notifications/unread/count', {}, true);
  }
};

export default api;