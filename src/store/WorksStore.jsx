import { makeAutoObservable, runInAction } from "mobx";
import { worksAPI } from "../http/api";

export default class WorksStore {
  constructor() {
    this._works = [];
    this._currentPage = 1;
    this._totalPages = 1;
    this._totalItems = 0;
    this._itemsPerPage = 12;
    this._isLoading = false;
    this._error = null;

    makeAutoObservable(this);
  }

  // Загрузка работ с сервера
  async fetchWorks(page = 1, limit = 12) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      // Если API недоступен, используем моковые данные
      // В реальном проекте уберите этот блок try-catch и используйте только worksAPI
      let response;
      try {
        response = await worksAPI.getAll(page, limit);
      } catch (apiError) {
        console.warn('API недоступен, используем моковые данные:', apiError);
        // Моковые данные для разработки
        response = this._getMockData(page, limit);
      }

      // Обработка ответа от API
      // Предполагаем, что API возвращает объект вида:
      // { works: [...], total: 12, page: 1, totalPages: 1 }
      if (!response.works && !Array.isArray(response)) {
        throw new Error('Неверный формат ответа от API');
      }

      runInAction(() => {
        if (response.works) {
          this._works = response.works;
          this._totalItems = response.total || response.works.length;
          this._totalPages = response.totalPages || Math.ceil(this._totalItems / limit);
          this._currentPage = response.page || page;
        } else if (Array.isArray(response)) {
          // Если API возвращает просто массив
          this._works = response;
          this._totalItems = response.length;
          this._totalPages = Math.ceil(response.length / limit);
          this._currentPage = page;
        }
      });
    } catch (error) {
      console.error('Ошибка загрузки работ:', error);
      runInAction(() => {
        this._error = error.message;
        // В случае ошибки используем моковые данные
        const mockData = this._getMockData(page, limit);
        this._works = mockData.works;
        this._totalItems = mockData.total;
        this._totalPages = mockData.totalPages;
        this._currentPage = page;
      });
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Моковые данные (для разработки, когда API недоступен)
  _getMockData(page, limit) {
    const allWorks = [
      { id: 1, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 2, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 3, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 4, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 5, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 6, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 7, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 8, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 9, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 10, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 11, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
      { id: 12, title: 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"', image: "/placeholder-work.jpg", link: "#" },
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWorks = allWorks.slice(startIndex, endIndex);

    return {
      works: paginatedWorks,
      total: allWorks.length,
      page: page,
      totalPages: Math.ceil(allWorks.length / limit),
    };
  }

  // Установить текущую страницу
  setCurrentPage(page) {
    this._currentPage = page;
  }

  // Установить количество элементов на странице
  setItemsPerPage(limit) {
    this._itemsPerPage = limit;
  }

  // Getters
  get works() {
    return this._works;
  }

  get currentPage() {
    return this._currentPage;
  }

  get totalPages() {
    return this._totalPages;
  }

  get totalItems() {
    return this._totalItems;
  }

  get itemsPerPage() {
    return this._itemsPerPage;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }
}

