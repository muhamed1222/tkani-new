// Базовый URL API (можно вынести в переменные окружения)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Базовый класс для работы с API
class ApiService {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  // Универсальный метод для GET запросов
  async get(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  // Универсальный метод для POST запросов
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  // Универсальный метод для PUT запросов
  async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  // Универсальный метод для DELETE запросов
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
}

// Создаем экземпляр API сервиса
const api = new ApiService();

// Специфичные методы для работ
export const worksAPI = {
  // Получить все работы с пагинацией
  getAll: async (page = 1, limit = 12) => {
    return api.get('/works', { page, limit });
  },

  // Получить работу по ID
  getById: async (id) => {
    return api.get(`/works/${id}`);
  },

  // Создать новую работу (для админки)
  create: async (workData) => {
    return api.post('/works', workData);
  },

  // Обновить работу (для админки)
  update: async (id, workData) => {
    return api.put(`/works/${id}`, workData);
  },

  // Удалить работу (для админки)
  delete: async (id) => {
    return api.delete(`/works/${id}`);
  },
};

export default api;

