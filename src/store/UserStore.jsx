import { makeAutoObservable, runInAction } from "mobx";
import { authAPI } from "../http/api";
import api from "../http/api";

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

  // Проверка авторизации по токену
  async checkAuth() {
    const token = api.getAuthToken();
    if (!token) {
      return;
    }

    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const response = await authAPI.checkAuth();
      // Новый формат: { user: {...} } или старый: просто объект пользователя
      const userData = response.user || response;
      runInAction(() => {
        this._user = userData;
        this._isAuth = true;
      });
    } catch (error) {
      // Если токен невалидный, удаляем его
      if (error.status === 401 || error.status === 403) {
        this.logout();
      }
      if (import.meta.env.DEV) {
        console.error('Ошибка проверки авторизации:', error);
      }
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Вход
  async login(email, password) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const response = await authAPI.login(email, password);
      
      // Новый формат: { access_token: "...", user: {...} }
      // Старый формат: { token: "...", user: {...} }
      const token = response.access_token || response.token;
      
      if (token) {
        api.setAuthToken(token);
      }

      runInAction(() => {
        this._user = response.user || response.data?.user || {};
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
  async register(userData) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const response = await authAPI.register(userData);
      
      // Новый формат: { user: {...}, user_id: ... }
      // Токен обычно не приходит при регистрации, нужно войти отдельно
      // Но если приходит - сохраняем
      const token = response.access_token || response.token;
      if (token) {
        api.setAuthToken(token);
      }

      runInAction(() => {
        this._user = response.user || response.data?.user || {};
        // Если токен есть, считаем пользователя авторизованным
        if (token) {
          this._isAuth = true;
        }
      });

      return { success: true };
    } catch (error) {
      runInAction(() => {
        this._error = error.message || 'Ошибка регистрации';
        this._isAuth = false;
      });
      return { success: false, error: this._error };
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Выход
  async logout() {
    try {
      // Пытаемся вызвать logout на сервере
      await authAPI.logout();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Ошибка выхода:', error);
      }
    } finally {
      // Удаляем токен и сбрасываем состояние
      api.setAuthToken(null);
      runInAction(() => {
        this._isAuth = false;
        this._user = {};
        this._error = null;
      });
    }
  }

  // Обновить профиль
  async updateProfile(userData) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const response = await authAPI.updateProfile(userData);
      runInAction(() => {
        this._user = response.user || response;
      });
      return { success: true };
    } catch (error) {
      runInAction(() => {
        this._error = error.message || 'Ошибка обновления профиля';
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
      await authAPI.changePassword(oldPassword, newPassword);
      return { success: true };
    } catch (error) {
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
