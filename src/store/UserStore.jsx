// src/store/UserStore.jsx
import { makeAutoObservable, runInAction } from "mobx";
import { authAPI } from "../http/api";
import api from "../http/api";

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

export default class UserStore {
  constructor() {
    this._isAuth = false;
    this._user = {};
    this._isLoading = true;
    this._error = null;
    this._isInitialized = false;
    
    makeAutoObservable(this);
    
    // Синхронизируем токен с API service при инициализации
    this.syncTokenWithAPI();
    this.initialize();
  }

  // Синхронизация токена между localStorage и API service
  syncTokenWithAPI() {
    const token = localStorage.getItem('authToken') || cookieUtils.get('authToken');
    console.log('🔄 Синхронизация токена с API:', token ? 'есть' : 'нет');
    
    if (token) {
      api.setAuthToken(token);
      this._isAuth = true;
    } else {
      api.setAuthToken(null);
      this._isAuth = false;
    }
  }

  // Асинхронная инициализация
  async initialize() {
    try {
      await this.checkAuth();
    } catch (error) {
      console.error('❌ Ошибка инициализации UserStore:', error);
    } finally {
      runInAction(() => {
        this._isInitialized = true;
        this._isLoading = false;
      });
    }
  }

  async checkAuth() {
    try {
      // Сначала синхронизируем токен
      this.syncTokenWithAPI();
      
      const token = localStorage.getItem('authToken') || cookieUtils.get('authToken');
      console.log('🔐 Проверка авторизации, токен:', token ? 'есть' : 'нет');
      
      if (!token) {
        runInAction(() => {
          this._isAuth = false;
          this._user = {};
        });
        return;
      }

      // Убедимся, что токен установлен в API
      api.setAuthToken(token);

      const userData = await authAPI.checkAuth();
      console.log('✅ Данные пользователя из checkAuth:', userData);
      
      runInAction(() => {
        this._user = userData;
        this._isAuth = true;
      });

    } catch (error) {
      console.error('❌ Ошибка проверки авторизации:', error);
      // При ошибке 401 просто сбрасываем авторизацию
      if (error.status === 401) {
        runInAction(() => {
          this._isAuth = false;
          this._user = {};
        });
        this.clearAuth();
      }
    }
  }

// В UserStore.jsx - ОБНОВИТЕ метод deleteAccount
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
    
    // Используем токен из куки (как в других методах)
    const token = tokenFromCookie;
    if (!token) {
      throw new Error('Токен авторизации не найден');
    }

    // Устанавливаем токен в API
    api.setAuthToken(token);
    console.log('🔐 Токен установлен в API');
    
    console.log('👤 Удаление текущего аккаунта через кастомный endpoint');
    
    // ДЕЛАЕМ ЗАПРОС С ПРОВЕРКОЙ АВТОРИЗАЦИИ
    const response = await api.delete('/profile', {}, true);
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

// В UserStore.jsx - добавьте этот метод
async deleteAccountDirect() {
  runInAction(() => {
    this._isLoading = true;
    this._error = null;
  });

  try {
    console.log('🔄 Используем прямой метод удаления через users endpoint');
    
    // Сначала получаем ID текущего пользователя
    const currentUser = await api.get('/users/me', {}, true);
    const userId = currentUser.id;
    
    console.log('🗑️ Удаляем пользователя по ID:', userId);
    
    // Используем стандартный Strapi endpoint для удаления пользователя
    const response = await api.delete(`/users/${userId}`, {}, true);
    
    console.log('✅ Аккаунт удален через прямой метод:', response);
    
    // Очищаем данные авторизации
    this.clearAuth();
    
    return { 
      success: true, 
      message: 'Аккаунт успешно удален' 
    };
    
  } catch (error) {
    console.error('❌ Прямой метод удаления не сработал:', error);
    
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

  async updateProfile(userData) {
    try {
      console.log('🔄 updateProfile - исходные данные:', userData);
      
      // Проверяем авторизацию
      console.log('🔐 updateProfile - Статус авторизации:', this._isAuth);
      
      // Получаем токен из куки и устанавливаем его
      const token = cookieUtils.get('authToken');
      console.log('🔐 updateProfile - Токен из куки:', token ? 'есть' : 'нет');
      
      if (token) {
        api.setAuthToken(token);
        console.log('🔐 Токен установлен в API');
      } else {
        console.error('❌ Токен не найден в куках');
        return { 
          success: false, 
          error: 'Токен авторизации не найден. Пожалуйста, войдите заново.'
        };
      }
      
      const response = await authAPI.updateProfile(userData);
      console.log('✅ updateProfile - успешный ответ:', response);
      
      // Обновляем данные пользователя в сторе из ответа сервера
      runInAction(() => {
        // Обновляем все поля из ответа
        if (response.firstName !== undefined) {
          this._user.firstName = response.firstName;
        }
        if (response.lastName !== undefined) {
          this._user.lastName = response.lastName;
        }
        if (response.email !== undefined) {
          this._user.email = response.email;
        }
        if (response.phone !== undefined) { // ДОБАВЛЕНО: обновление телефона
          this._user.phone = response.phone;
        }
        
        // Также обновляем альтернативные имена полей для совместимости
        if (response.firstName !== undefined) {
          this._user.firstname = response.firstName;
        }
        if (response.lastName !== undefined) {
          this._user.lastname = response.lastName;
        }
        if (response.phone !== undefined) { // ДОБАВЛЕНО: альтернативное поле
          this._user.phoneNumber = response.phone;
        }
      });
      
      console.log('🔄 Данные пользователя после обновления в сторе:', this._user);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ updateProfile - ошибка:', error);
      
      // Если ошибка авторизации, НЕ очищаем данные автоматически
      if (error.status === 401) {
        return { 
          success: false, 
          error: 'Ошибка авторизации. Проверьте правильность данных.'
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Ошибка обновления профиля'
      };
    }
  }

  // Загрузка аватара
  async uploadAvatar(file) {
    try {
      console.log('🔄 UserStore.uploadAvatar - начало загрузки файла:', file.name);
      
      const token = cookieUtils.get('authToken');
      if (!token) {
        return { 
          success: false, 
          error: 'Токен авторизации не найден' 
        };
      }

      // Создаем FormData для загрузки файла
      const formData = new FormData();
      formData.append('files', file);
      
      // Загружаем файл через Strapi Upload
      console.log('📤 Загружаем файл на сервер...');
      const uploadResponse = await api.post('/upload', formData, true, true);
      console.log('✅ Файл загружен:', uploadResponse);

      if (uploadResponse && uploadResponse.length > 0) {
        const fileId = uploadResponse[0].id;
        console.log('📝 ID загруженного файла:', fileId);
        
        // Обновляем пользователя, привязывая аватар
        const updateData = {
          avatar: fileId
        };
        
        console.log('🔄 Обновляем профиль пользователя с аватаром...');
        const updateResponse = await authAPI.updateProfile(updateData);
        console.log('✅ Профиль обновлен:', updateResponse);
        
        // ОБНОВЛЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ В STORE
        runInAction(() => {
          // Сохраняем аватар в формате Strapi v4
          this._user.avatar = {
            data: {
              id: uploadResponse[0].id,
              attributes: uploadResponse[0]
            }
          };
        });
        
        // ПЕРЕЗАГРУЖАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
        await this.checkAuth();
        
        return { 
          success: true, 
          message: 'Аватар успешно обновлен',
          avatar: uploadResponse[0]
        };
      } else {
        return { 
          success: false, 
          error: 'Ошибка загрузки файла' 
        };
      }
    } catch (error) {
      console.error('❌ UserStore.uploadAvatar - ошибка:', error);
      return { 
        success: false, 
        error: error.message || 'Ошибка загрузки аватара' 
      };
    }
  }

  // Удаление аватара
  async removeAvatar() {
    try {
      console.log('🔄 UserStore.removeAvatar - удаление аватара');
      
      const token = cookieUtils.get('authToken');
      if (!token) {
        return { 
          success: false, 
          error: 'Токен авторизации не найден' 
        };
      }

      // Обновляем пользователя, убирая аватар
      const updateData = {
        avatar: null
      };
      
      console.log('🔄 Удаляем аватар из профиля...');
      const updateResponse = await authAPI.updateProfile(updateData);
      console.log('✅ Аватар удален:', updateResponse);
      
      // ОБНОВЛЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ В STORE
      runInAction(() => {
        this._user.avatar = null;
      });
      
      // ПЕРЕЗАГРУЖАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
      await this.checkAuth();
      
      return { 
        success: true, 
        message: 'Аватар успешно удален'
      };
    } catch (error) {
      console.error('❌ UserStore.removeAvatar - ошибка:', error);
      return { 
        success: false, 
        error: error.message || 'Ошибка удаления аватара' 
      };
    }
  }

  // Вход
  async login(email, password, rememberMe = false) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const response = await authAPI.login(email, password);
      
      const token = response.jwt;
      
      if (token) {
        // Сохраняем во всех местах
        api.setAuthToken(token);
        localStorage.setItem('authToken', token);
        
        const days = rememberMe ? 30 : 7;
        cookieUtils.set('authToken', token, days);
        
        console.log('🔐 Токен сохранен во всех хранилищах');
      }

      runInAction(() => {
        this._user = response.user || {};
        this._isAuth = true;
      });

      return { success: true };
    } catch (error) {
      runInAction(() => {
        this._error = error.message || 'Ошибка входа';
        this._isAuth = false;
      });
      return { success: false, error: this._error };
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Регистрация
  async register(userData, rememberMe = false) {
    console.log('🔵 UserStore.register начат', userData);
    
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      console.log('🟡 Вызываем authAPI.register с данными:', userData);

      const response = await authAPI.register(userData);
      console.log('🟢 authAPI.register успешен', response);
      
      const token = response.jwt;
      if (token) {
        api.setAuthToken(token);
        // Сохраняем в куки
        const days = rememberMe ? 30 : 7;
        cookieUtils.set('authToken', token, days);
        console.log('🟢 Токен сохранен в куки');
      }

      runInAction(() => {
        this._user = response.user || {};
        this._isAuth = true;
      });

      return { success: true };
      
    } catch (error) {
      console.error('🔴 Детальная ошибка регистрации:', error);
      
      runInAction(() => {
        this._error = error.message || 'Ошибка подключения к серверу';
        this._isAuth = false;
      });
      return { success: false, error: this._error };
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Изменить пароль
  async changePassword(oldPassword, newPassword) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      console.log('🔵 UserStore.changePassword - данные:', {
        oldPassword: !!oldPassword,
        newPassword: !!newPassword
      });
      
      const response = await authAPI.changePassword(oldPassword, newPassword);
      console.log('🟢 UserStore.changePassword - ответ:', response);
      
      return { success: true };
    } catch (error) {
      console.error('🔴 UserStore.changePassword - ошибка:', error);
      
      runInAction(() => {
        this._error = error.message || 'Ошибка смены пароля';
      });
      return { success: false, error: this._error };
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Выход из системы
  logout() {
    this.clearAuth();
    console.log('🔵 Пользователь вышел из системы');
  }

  // Очистка авторизации из всех мест
  clearAuth() {
    runInAction(() => {
      this._isAuth = false;
      this._user = {};
      this._error = null;
      this._isLoading = false;
    });
    
    // Удаляем все данные авторизации
    api.setAuthToken(null);
    localStorage.removeItem('authToken');
    cookieUtils.remove('authToken');
    
    console.log('🔐 Все данные авторизации очищены');
  }

  // Метод для принудительной синхронизации
  forceTokenSync() {
    this.syncTokenWithAPI();
  }

  // Сеттеры
  setIsAuth(bool) {
    this._isAuth = bool;
  }

  setUser(user) {
    this._user = user;
  }

  // Геттеры
  get isAuth() {
    return this._isAuth;
  }

  get user() {
    return this._user;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  get token() {
    return localStorage.getItem('authToken') || cookieUtils.get('authToken');
  }
}