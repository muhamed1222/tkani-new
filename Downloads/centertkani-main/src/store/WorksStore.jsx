// src/store/WorksStore.jsx
import logger from '../utils/logger';
import { makeAutoObservable, runInAction } from "mobx";
import { worksAPI } from "../http/api";
import { buildImageUrl } from "../utils/apiConfig";
import cache, { Cache } from "../utils/cache";
import { CACHE_TTL } from "../utils/constants";

export default class WorksStore {
  constructor() {
    this._works = [];
    this._selectedWork = null; // Добавляем для хранения текущей работы
    this._isLoadingWork = false; // Отдельный флаг загрузки для одной работы
    this._errorWork = null; // Отдельная ошибка для одной работы
    this._currentPage = 1;
    this._totalPages = 1;
    this._totalItems = 0;
    this._itemsPerPage = 12;
    this._isLoading = false;
    this._error = null;

    makeAutoObservable(this);
  }

 // WorksStore.jsx - обновите метод fetchWorkById
async fetchWorkById(id) {
  const cacheKey = Cache.generateKey('work', { id });
  
  // Временно отключаем кеш для отладки проблемы с изображениями
  // const cached = cache.get(cacheKey);
  // if (cached) {
  //   runInAction(() => {
  //     this._selectedWork = cached;
  //     this._isLoadingWork = false;
  //   });
  //   return cached;
  // }
  
  // Очищаем кеш для этой работы, чтобы загрузить свежие данные
  cache.delete(cacheKey);

  runInAction(() => {
    this._isLoadingWork = true;
    this._errorWork = null;
    this._selectedWork = null;
  });

  try {
    logger.log('🔄 Fetching work by ID from API:', id);
    
    // Всегда пытаемся загрузить с API
    const response = await worksAPI.getById(id);
    logger.log('📦 Work by ID response:', response);
    logger.log('📦 Work by ID response.data:', response.data);
    logger.log('📦 Work by ID response.data.attributes:', response.data?.attributes);
    logger.log('📦 Work by ID response.data.attributes.images:', response.data?.attributes?.images);

    let workData = null;
    
    if (response.data) {
      logger.log('🔄 Using response.data for transformation');
      workData = this._transformWorkData(response.data);
    } else if (response.work) {
      logger.log('🔄 Using response.work for transformation');
      workData = this._transformWorkData(response.work);
    } else {
      logger.log('🔄 Using response directly for transformation');
      workData = this._transformWorkData(response);
    }

    if (!workData) {
      throw new Error('Данные работы не получены');
    }

    logger.log('✅ Transformed work data:', {
      id: workData.id,
      title: workData.title,
      imagesCount: workData.images?.length || 0,
      images: workData.images,
      image: workData.image
    });

    runInAction(() => {
      this._selectedWork = workData;
      logger.log('✅ Work loaded from API and set to selectedWork');
    });

    // Cache work for 15 minutes
    if (workData) {
      cache.set(cacheKey, workData, CACHE_TTL.MEDIUM);
    }

    return workData;
  } catch (error) {
    logger.error('❌ Ошибка загрузки работы с API:', error);
    
    runInAction(() => {
      this._errorWork = `Работа с ID ${id} не найдена в базе данных`;
      this._selectedWork = null;
    });
    return null;
  } finally {
    runInAction(() => {
      this._isLoadingWork = false;
    });
  }
}

  // Добавляем методы для работы с selectedWork
  setSelectedWork(work) {
    this._selectedWork = work;
  }

  setIsLoadingWork(loading) {
    this._isLoadingWork = loading;
  }

  setErrorWork(error) {
    this._errorWork = error;
  }

  // Добавляем геттеры для selectedWork
  get selectedWork() {
    return this._selectedWork;
  }

  get isLoadingWork() {
    return this._isLoadingWork;
  }

  get errorWork() {
    return this._errorWork;
  }
// WorksStore.jsx - обновите метод fetchWorks
async fetchWorks(page = 1, limit = 12) {
  runInAction(() => {
    this._isLoading = true;
    this._error = null;
  });

  try {
    logger.log('🔄 Fetching works from API...');
    const response = await worksAPI.getAll(page, limit);
    logger.log('📦 Works API response:', response);

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
        throw new Error('Неизвестный формат ответа от API');
      }
      
      logger.log(`✅ Loaded ${this._works.length} works from API`);
    });
  } catch (error) {
    logger.error('❌ Ошибка загрузки работ:', error);
    runInAction(() => {
      this._error = error.message;
      this._works = []; // Очищаем работы при ошибке
    });
  } finally {
    runInAction(() => {
      this._isLoading = false;
    });
  }
}
  

  _transformWorkData(workData) {
  if (!workData) return null;

  logger.log('🔄 Transforming work data:', workData);

  // Извлекаем атрибуты в зависимости от формата Strapi
  const attributes = workData.attributes || workData;
  const id = workData.id || attributes.id;

  logger.log(`🔄 Transforming work ID ${id}:`, {
    hasAttributes: !!attributes,
    hasImagesInAttributes: !!attributes.images,
    hasImagesInWorkData: !!workData.images,
    imagesType: typeof (attributes.images || workData.images),
    imagesIsArray: Array.isArray(attributes.images || workData.images),
    workDataKeys: Object.keys(workData),
    attributesKeys: Object.keys(attributes)
  });

  // Обрабатываем изображения - используем массив images (как в TkanStore)
  // Strapi v4: images может быть в workData.images или attributes.images
  // Формат: { data: [ { id, attributes: { url: string } } ] } или массив
  let imagesData = null;
  
  // Проверяем различные варианты расположения данных images
  if (workData.images) {
    imagesData = workData.images;
    logger.log('🖼️ Found images in workData.images');
  } else if (attributes.images) {
    imagesData = attributes.images;
    logger.log('🖼️ Found images in attributes.images');
  } else if (workData.attributes?.images) {
    imagesData = workData.attributes.images;
    logger.log('🖼️ Found images in workData.attributes.images');
  }
  
  logger.log('🖼️ Raw images data from work:', JSON.stringify(imagesData, null, 2));
  logger.log('🖼️ Images data type:', typeof imagesData, 'isArray:', Array.isArray(imagesData));
  logger.log('🖼️ Has imagesData.data:', !!imagesData?.data, 'isArray:', Array.isArray(imagesData?.data));
  
  // Дополнительная диагностика структуры
  if (imagesData) {
    logger.log('🖼️ Images data keys:', Object.keys(imagesData));
    if (imagesData.data && Array.isArray(imagesData.data) && imagesData.data.length > 0) {
      logger.log('🖼️ First image in data array:', JSON.stringify(imagesData.data[0], null, 2));
    }
  }
  logger.log('🖼️ Images location check:', {
    hasWorkDataImages: !!workData.images,
    hasAttributesImages: !!attributes.images,
    workDataImagesType: typeof workData.images,
    attributesImagesType: typeof attributes.images
  });
  
  const images = this._processImageArray(imagesData);
  logger.log('🖼️ Processed images array:', images);
  
  // Первое изображение используется для карточки
  const imageUrl = images.length > 0 ? images[0] : '/placeholder-product.svg';
  logger.log('🖼️ Final image URL for card:', imageUrl);

  // Обрабатываем связанные ткани (fabrics)
  const fabricsData = attributes.fabrics || workData.fabrics;
  const fabrics = this._processFabricsArray(fabricsData);

  const transformedWork = {
    id: id,
    title: attributes.title,
    description: attributes.description,
    image: imageUrl, // Для обратной совместимости с карточками
    images: images, // Массив всех изображений
    fabrics: fabrics, // Массив связанных тканей
    link: attributes.link || '#'
  };

  logger.log('✅ Transformed work:', {
    id: transformedWork.id,
    title: transformedWork.title,
    imagesCount: transformedWork.images.length,
    images: transformedWork.images,
    imageUrl: transformedWork.image,
    fabricsCount: transformedWork.fabrics.length
  });
  return transformedWork;
}

  // Обработка массива связанных тканей из Strapi
  _processFabricsArray(fabricsData) {
    if (!fabricsData) return [];
    
    logger.log('🧵 Processing fabrics array:', fabricsData);

    // Формат Strapi v4: { data: [ { id, attributes: {...} } ] }
    if (fabricsData.data && Array.isArray(fabricsData.data)) {
      return fabricsData.data.map(fabric => this._transformFabricData(fabric)).filter(f => f !== null);
    }
    
    // Если это простой массив
    if (Array.isArray(fabricsData)) {
      return fabricsData.map(fabric => this._transformFabricData(fabric)).filter(f => f !== null);
    }
    
    return [];
  }

  // Трансформация данных ткани (используем логику из TkanStore)
  _transformFabricData(fabricData) {
    if (!fabricData) return null;

    const attributes = fabricData.attributes || fabricData;
    const id = fabricData.id || attributes.id;

    // Обрабатываем изображение
    const imageData = attributes.image || fabricData.image;
    const imagesData = attributes.images || fabricData.images;
    
    const mainImage = buildImageUrl(imageData, '/placeholder-product.jpg');
    const galleryImages = this._processImageArray(imagesData);
    
    const displayImage = mainImage !== '/placeholder-product.jpg' 
      ? mainImage 
      : (galleryImages.length > 0 ? galleryImages[0] : '/placeholder-product.jpg');

    return {
      id: id,
      name: attributes.title || attributes.name,
      title: attributes.title || attributes.name,
      price: parseFloat(attributes.price) || 0,
      discountPrice: attributes.discount_price ? parseFloat(attributes.discount_price) : null,
      discount: attributes.discount ? parseInt(attributes.discount) : null,
      stock: attributes.stock ? parseInt(attributes.stock) : 0,
      img: displayImage,
      image: displayImage,
      images: galleryImages,
      inStock: (attributes.stock || 0) > 0
    };
  }

  // Хелпер для получения URL изображения из Strapi (как в TkanStore)
  _getStrapiImageUrl(imageData) {
    if (!imageData) {
      logger.log('🖼️ No image data provided');
      return '/placeholder-product.svg';
    }

    logger.log('🖼️ Processing image data:', imageData);
    const url = buildImageUrl(imageData, '/placeholder-product.svg');
    logger.log('🖼️ Built image URL:', url);
    return url;
  }

  // Обработка массива изображений из Strapi (используем ту же логику, что и в TkanStore)
  _processImageArray(imagesData) {
    if (!imagesData) {
      logger.log('🖼️ No images data provided');
      return [];
    }
    
    logger.log('🖼️ Processing work image array - raw data:', JSON.stringify(imagesData, null, 2));
    logger.log('🖼️ Images data type:', typeof imagesData, 'isArray:', Array.isArray(imagesData));

    // Формат Strapi v4: { data: [ { attributes: { url: string } } ] }
    if (imagesData.data && Array.isArray(imagesData.data)) {
      logger.log('🖼️ Found data array with', imagesData.data.length, 'items');
      const images = imagesData.data.map(img => {
        logger.log('🖼️ Processing image from data array:', img);
        // Используем тот же метод, что и в TkanStore
        return this._getStrapiImageUrl(img);
      }).filter(url => url && url !== '/placeholder-product.svg');
      
      logger.log('🖼️ Processed images from data array:', images);
      return images;
    }
    
    // Если это простой массив объектов с изображениями
    if (Array.isArray(imagesData)) {
      logger.log('🖼️ Found direct array with', imagesData.length, 'items');
      const images = imagesData.map(img => {
        logger.log('🖼️ Processing image from direct array:', img);
        // Используем тот же метод, что и в TkanStore
        return this._getStrapiImageUrl(img);
      }).filter(url => url && url !== '/placeholder-product.svg');
      
      logger.log('🖼️ Processed images from direct array:', images);
      return images;
    }
    
    logger.log('🖼️ No valid images found after all attempts');
    return [];
  }

  // Моковые данные (для разработки, когда API недоступен)
  _getMockData(page, limit) {
    const allWorks = [
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