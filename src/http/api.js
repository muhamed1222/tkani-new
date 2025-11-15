// Базовый URL API (можно вынести в переменные окружения)
// Поддерживаем оба варианта: /api/v1/ (новый) и /api/ (старый для обратной совместимости)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

// Утилита для получения токена из localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || null;
};

// Утилита для получения заголовков с авторизацией
const getHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {};
  
  // Не добавляем Content-Type для FormData (браузер установит автоматически)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Базовый класс для работы с API
class ApiService {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  // Улучшенная обработка ошибок с поддержкой нового формата
  async _handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Специфичные сообщения для разных статусов
      if (response.status === 401) {
        errorMessage = "Неверный email или пароль";
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
        
        if (import.meta.env.DEV) {
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
        }
        
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
        
        if (import.meta.env.DEV) {
          console.error('Failed to parse error response:', parseError);
        }
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
      
      if (import.meta.env.DEV) {
        console.log('API POST Request:', {
          url: `${this.baseURL}${endpoint}`,
          endpoint,
          includeAuth,
          isFormData,
          body: isFormData ? '[FormData]' : body
        });
      }
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(includeAuth, isFormData),
        body: body,
      });

      if (import.meta.env.DEV) {
        console.log('API POST Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
      }

      return await this._handleResponse(response);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API POST Error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          status: error.status
        });
      }
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
      if (import.meta.env.DEV) {
        console.error('API PUT Error:', error);
      }
      throw error;
    }
  }

  // Универсальный метод для DELETE запросов
  async delete(endpoint, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(includeAuth),
      });

      return await this._handleResponse(response);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API DELETE Error:', error);
      }
      throw error;
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
    return api.get('/works', { page, limit }, false);
  },

  // Получить работу по ID
  getById: async (id) => {
    return api.get(`/works/${id}`, {}, false);
  },
};

// Специфичные методы для каталога товаров
export const catalogAPI = {
  // Получить все товары с фильтрацией
  getProducts: async (params = {}) => {
    return api.get('/catalog/products', params, false);
  },

  // Получить товар по ID
  getProduct: async (id) => {
    return api.get(`/catalog/products/${id}`, {}, false);
  },

  // Получить категории
  getCategories: async () => {
    return api.get('/catalog/categories', {}, false);
  },

  // Получить бренды
  getBrands: async () => {
    return api.get('/catalog/brands', {}, false);
  },
};

// Методы для аутентификации
export const authAPI = {
  // Вход
  login: async (email, password) => {
    return api.post('/auth/login', { email, password }, false);
  },

  // Регистрация (используем FormData для поддержки аватара)
  register: async (userData) => {
    const formData = new FormData();
    formData.append('first_name', userData.firstName || userData.first_name);
    formData.append('last_name', userData.lastName || userData.last_name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    
    // Если есть аватар, добавляем его
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }
    
    return api.post('/auth/register', formData, false, true);
  },

  // Получить информацию о текущем пользователе
  checkAuth: async () => {
    return api.get('/auth/me', {}, true);
  },

  // Обновить профиль
  updateProfile: async (userData) => {
    const formData = new FormData();
    if (userData.firstName) formData.append('first_name', userData.firstName);
    if (userData.lastName) formData.append('last_name', userData.lastName);
    if (userData.email) formData.append('email', userData.email);
    if (userData.avatar) formData.append('avatar', userData.avatar);
    
    return api.put('/auth/update', formData, true, true);
  },

  // Изменить пароль
  changePassword: async (oldPassword, newPassword) => {
    return api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    }, true);
  },

  // Восстановление пароля - отправить код
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email }, false);
  },

  // Восстановление пароля - проверить код
  verifyCode: async (email, code) => {
    return api.post('/auth/verify-code', { email, code }, false);
  },

  // Восстановление пароля - повторная отправка кода
  resendCode: async (email) => {
    return api.post('/auth/resend-code', { email }, false);
  },

  // Восстановление пароля - сброс пароля
  resetPassword: async (email, code, newPassword) => {
    return api.post('/auth/reset-password', {
      email,
      code,
      new_password: newPassword
    }, false);
  },

  // Выход из системы
  logout: async () => {
    return api.post('/auth/logout', {}, true);
  },
};

// Методы для корзины
export const cartAPI = {
  // Получить корзину
  getCart: async () => {
    console.log('cartAPI.getCart: Начало запроса');
    try {
      const result = await api.get('/cart/', {}, false);
      console.log('cartAPI.getCart: Успешный ответ:', result);
      return result;
    } catch (error) {
      console.error('cartAPI.getCart: Ошибка:', error);
      throw error;
    }
  },

  // Добавить товар в корзину
  addToCart: async (productId, quantity = 1) => {
    return api.post('/cart/add', {
      product_id: productId,
      quantity: quantity
    }, false);
  },

  // Обновить количество товара
  updateCart: async (productId, quantity) => {
    return api.post('/cart/update', {
      product_id: productId,
      quantity: quantity
    }, false);
  },

  // Удалить товар из корзины
  removeFromCart: async (productId) => {
    return api.post('/cart/remove', {
      product_id: productId
    }, false);
  },

  // Очистить корзину
  clearCart: async () => {
    return api.post('/cart/clear', {}, false);
  },
};

// Методы для заказов
export const ordersAPI = {
  // Создать заказ из корзины
  createOrder: async (orderData = {}) => {
    return api.post('/orders/create', orderData, true);
  },

  // Получить список заказов пользователя
  getMyOrders: async (params = {}) => {
    return api.get('/orders/my', params, true);
  },

  // Получить детали заказа
  getOrder: async (orderId) => {
    return api.get(`/orders/${orderId}`, {}, true);
  },

  // Обновить статус заказа
  updateOrderStatus: async (orderId, status, comment) => {
    return api.put(`/orders/${orderId}/status`, {
      status: status,
      comment: comment
    }, true);
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
  // Отправить сообщение через контактную форму
  sendMessage: async (contactData) => {
    return api.post('/contact', {
      name: contactData.name,
      phone: contactData.phone,
      message: contactData.message
    }, false);
  },
};

export default api;
