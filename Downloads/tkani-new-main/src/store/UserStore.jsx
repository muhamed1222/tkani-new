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
    this._isLoading = false;
    this._error = null;
    
    makeAutoObservable(this);
    
    // Проверяем токен при инициализации
    this.checkAuth();
  }

  async checkAuth() {
    try {
      const token = cookieUtils.get('authToken');
      console.log('🔐 Проверка авторизации, токен:', token ? 'есть' : 'нет');
      
      if (!token) {
        this.setIsAuth(false);
        this.setUser({});
        return;
      }

      // Убедимся, что токен установлен в API
      if (token !== api.getAuthToken()) {
        api.setAuthToken(token);
      }

      const userData = await authAPI.checkAuth();
      console.log('✅ Данные пользователя:', userData);
      
      runInAction(() => {
        this._user = userData;
        this._isAuth = true;
      });

    } catch (error) {
      console.error('❌ Ошибка проверки авторизации:', error);
      this.clearAuth();
    }
  }

  // Вход
  async login(email, password, rememberMe = false) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const response = await authAPI.login(email, password, rememberMe);
      
      // Strapi возвращает jwt и user в ответе
      const token = response.jwt;
      
      if (token) {
        api.setAuthToken(token, rememberMe);
        // Сохраняем в куки вместо localStorage
        const days = rememberMe ? 30 : 7;
        cookieUtils.set('authToken', token, days);
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

      const response = await authAPI.register(userData, rememberMe);
      console.log('🟢 authAPI.register успешен', response);
      
      const token = response.jwt;
      if (token) {
        api.setAuthToken(token, rememberMe);
        // Сохраняем в куки вместо localStorage
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

// Обновить профиль
// Обновить профиль
async updateProfile(userData) {
  try {
    console.log('🔄 updateProfile - исходные данные:', userData);
    
    // Проверяем авторизацию
    console.log('🔐 updateProfile - Статус авторизации:', this._isAuth);
    console.log('🔐 updateProfile - Токен в API:', api.getAuthToken() ? 'есть' : 'нет');
    
    const response = await authAPI.updateProfile(userData);
    console.log('✅ updateProfile - успешный ответ:', response);
    
    // Обновляем данные пользователя в сторе
    runInAction(() => {
      if (userData.firstName !== undefined) {
        this._user.firstName = userData.firstName;
        this._user.firstname = userData.firstName;
      }
      if (userData.lastName !== undefined) {
        this._user.lastName = userData.lastName;
        this._user.lastname = userData.lastName;
      }
      if (userData.email !== undefined) {
        this._user.email = userData.email;
      }
    });
    
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ updateProfile - ошибка:', error);
    return { 
      success: false, 
      error: error.message || 'Ошибка обновления профиля'
    };
  }
}

  // Загрузка аватара
  async uploadAvatar(file) {
    try {
      console.log('🔄 uploadAvatar - загрузка файла:', file.name);
      
      const formData = new FormData();
      formData.append('files', file);
      formData.append('ref', 'plugin::users-permissions.user');
      formData.append('refId', this._user.id);
      formData.append('field', 'avatar');

      const response = await fetch('http://localhost:1337/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ uploadAvatar - успешно:', result);

      // Обновляем данные пользователя
      await this.checkAuth();

      return { success: true, data: result };
    } catch (error) {
      console.error('❌ uploadAvatar - ошибка:', error);
      return { 
        success: false, 
        error: error.message || 'Ошибка загрузки аватара'
      };
    }
  }

  // Очистка авторизации
  clearAuth() {
    runInAction(() => {
      this._isAuth = false;
      this._user = {};
      this._error = null;
      this._isLoading = false;
    });
    
    // Удаляем все данные авторизации
    api.setAuthToken(null);
    cookieUtils.remove('authToken');
  }

  // Выход из системы
  logout() {
    this.clearAuth();
    console.log('🔵 Пользователь вышел из системы');
  }

  setIsAuth(bool) {
    this._isAuth = bool;
  }

  setUser(user) {
    this._user = user;
  }

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
}