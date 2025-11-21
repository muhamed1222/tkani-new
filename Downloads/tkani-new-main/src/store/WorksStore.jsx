// src/store/WorksStore.jsx
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
      console.log('🔄 Fetching works from API...');
      const response = await worksAPI.getAll(page, limit);
      console.log('📦 Works API response:', response);

      runInAction(() => {
        // Обработка формата Strapi v4
        if (response.data && Array.isArray(response.data)) {
          this._works = response.data.map(item => this._transformWorkData(item));
          this._totalItems = response.meta?.pagination?.total || response.data.length;
          this._totalPages = response.meta?.pagination?.pageCount || Math.ceil(this._totalItems / limit);
          this._currentPage = response.meta?.pagination?.page || page;
        } 
        // Обработка старого формата
        else if (response.works && Array.isArray(response.works)) {
          this._works = response.works.map(item => this._transformWorkData(item));
          this._totalItems = response.total || response.works.length;
          this._totalPages = response.totalPages || Math.ceil(this._totalItems / limit);
          this._currentPage = response.page || page;
        } 
        // Если API возвращает просто массив
        else if (Array.isArray(response)) {
          this._works = response.map(item => this._transformWorkData(item));
          this._totalItems = response.length;
          this._totalPages = Math.ceil(response.length / limit);
          this._currentPage = page;
        } 
        else {
          console.warn('Неизвестный формат ответа, используем моковые данные');
          const mockData = this._getMockData(page, limit);
          this._works = mockData.works;
          this._totalItems = mockData.total;
          this._totalPages = mockData.totalPages;
          this._currentPage = page;
        }
        
        console.log(`✅ Loaded ${this._works.length} works`);
      });
    } catch (error) {
      console.error('❌ Ошибка загрузки работ:', error);
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

_transformWorkData(workData) {
  if (!workData) return null;

  console.log('🔄 Transforming work data:', workData);

  // Извлекаем атрибуты в зависимости от формата Strapi
  const attributes = workData.attributes || workData;
  const id = workData.id || attributes.id;

  // Обрабатываем изображение - исправленная логика для Strapi v4
  let imageUrl = '/placeholder-work.jpg';
  
  if (attributes.image?.data) {
    const imageData = attributes.image.data;
    const imageAttributes = imageData.attributes || imageData;
    if (imageAttributes.url) {
      imageUrl = `http://localhost:1337${imageAttributes.url}`;
      console.log('🖼️ Image URL from Strapi v4:', imageUrl);
    }
  } 
  // Если изображение приходит напрямую как объект
  else if (attributes.image?.url) {
    imageUrl = attributes.image.url.startsWith('http') 
      ? attributes.image.url 
      : `http://localhost:1337${attributes.image.url}`;
    console.log('🖼️ Image URL from direct object:', imageUrl);
  }
  // Если изображение приходит как строка
  else if (typeof attributes.image === 'string') {
    imageUrl = attributes.image.startsWith('http') 
      ? attributes.image 
      : `http://localhost:1337${attributes.image}`;
    console.log('🖼️ Image URL from string:', imageUrl);
  }

  const transformedWork = {
    id: id,
    title: attributes.title,
    description: attributes.description, // оставляем на всякий случай
    image: imageUrl,
    link: attributes.link || '#'
  };

  console.log('✅ Transformed work with image:', transformedWork.image);
  return transformedWork;
}

  // Моковые данные (для разработки, когда API недоступен)
  _getMockData(page, limit) {
    const allWorks = [
      { 
        id: 1, 
        title: 'Платье из вискозного шифона "Флаурэль"', 
        description: 'Элегантное платье из легкого вискозного шифона с цветочным принтом. Идеально для летних мероприятий и особых случаев.',
        image: "/placeholder-work.jpg", 
        link: "#" 
      },
      { 
        id: 2, 
        title: 'Костюм из льняной ткани "Элеганс"', 
        description: 'Стильный летний костюм из натурального льна. Состоит из жакета и брюк, подходит для офиса и casual-выходов.',
        image: "/placeholder-work.jpg", 
        link: "#" 
      },
      { 
        id: 3, 
        title: 'Вечернее платье "Ноктюрн"', 
        description: 'Роскошное вечернее платье из атласа с ручной вышивкой. Создано для особых мероприятий и торжественных случаев.',
        image: "/placeholder-work.jpg", 
        link: "#" 
      },
      { 
        id: 4, 
        title: 'Детский комплект "Радуга"', 
        description: 'Яркий и comfortable детский комплект из хлопка. Включает платье и легкую куртку, идеален для повседневной носки.',
        image: "/placeholder-work.jpg", 
        link: "#" 
      },
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

  // Загрузка работы по ID
  async fetchWorkById(id) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      const response = await worksAPI.getById(id);
      console.log('📦 Work by ID response:', response);

      let workData = null;
      
      // Обработка разных форматов ответа
      if (response.data) {
        workData = this._transformWorkData(response.data);
      } else if (response.work) {
        workData = this._transformWorkData(response.work);
      } else {
        workData = this._transformWorkData(response);
      }

      return workData;
    } catch (error) {
      console.error('❌ Ошибка загрузки работы:', error);
      runInAction(() => {
        this._error = error.message;
      });
      return null;
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
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