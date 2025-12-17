// src/utils/apiConfig.js
// Централизованная конфигурация для работы с API и URL

/**
 * Получает базовый URL API из переменных окружения
 * В режиме разработки использует относительный путь для прокси Vite
 * @returns {string} Базовый URL API
 */
export const getApiUrl = () => {
  // Если задана переменная окружения, используем её
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // В dev режиме используем относительный путь (проксируется через Vite)
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // В production используем дефолтный URL
  return 'http://localhost:1337/api';
};

/**
 * Получает базовый URL Strapi (без /api) для работы с изображениями
 * @returns {string} Базовый URL Strapi
 */
export const getStrapiUrl = () => {
  // Если задана переменная окружения для Strapi URL, используем её
  if (import.meta.env.VITE_STRAPI_URL) {
    return import.meta.env.VITE_STRAPI_URL;
  }
  
  const apiUrl = getApiUrl();
  
  // Если это относительный путь (dev режим с прокси), используем прямой URL для изображений
  if (apiUrl.startsWith('/')) {
    return 'http://localhost:1337';
  }
  
  // Если URL заканчивается на /api, убираем его
  if (apiUrl.endsWith('/api')) {
    return apiUrl.replace('/api', '');
  }
  
  // Дефолтный URL
  return 'http://localhost:1337';
};

/**
 * Строит полный URL изображения из данных Strapi
 * @param {string|object} imageData - Данные изображения (URL строка или объект Strapi)
 * @param {string} fallback - URL изображения по умолчанию
 * @returns {string} Полный URL изображения
 */
export const buildImageUrl = (imageData, fallback = '/placeholder-product.jpg') => {
  if (!imageData) {
    return fallback;
  }

  const strapiUrl = getStrapiUrl();

  // Если это уже полный URL (начинается с http)
  if (typeof imageData === 'string' && imageData.startsWith('http')) {
    return imageData;
  }

  // Если это строка без протокола
  if (typeof imageData === 'string') {
    // Если строка начинается с /, добавляем базовый URL
    if (imageData.startsWith('/')) {
      return `${strapiUrl}${imageData}`;
    }
    return `${strapiUrl}/${imageData}`;
  }

  // Если это объект Strapi v4 с data (может быть массив или одиночный объект)
  if (imageData.data) {
    // Если это массив (multiple: true) - берем первый элемент
    if (Array.isArray(imageData.data) && imageData.data.length > 0) {
      const firstImage = imageData.data[0];
      // Проверяем различные форматы: attributes.url, url напрямую
      const url = firstImage.attributes?.url || firstImage.url || firstImage.attributes?.data?.attributes?.url;
      if (url && url.trim()) {
        return url.startsWith('http') ? url : `${strapiUrl}${url}`;
      }
    }
    // Если это одиночный файл (не массив)
    if (imageData.data.attributes || imageData.data.url) {
      const url = imageData.data.attributes?.url || imageData.data.url || imageData.data.attributes?.data?.attributes?.url;
      if (url && url.trim()) {
        return url.startsWith('http') ? url : `${strapiUrl}${url}`;
      }
    }
  }

  // Если это объект с attributes напрямую (Strapi v4 формат для одного изображения)
  if (imageData.attributes) {
    // Проверяем url в attributes
    if (imageData.attributes.url) {
      const url = imageData.attributes.url;
      if (url && url.trim()) {
        return url.startsWith('http') ? url : `${strapiUrl}${url}`;
      }
    }
    // Проверяем вложенную структуру data.attributes.url
    if (imageData.attributes.data) {
      if (Array.isArray(imageData.attributes.data) && imageData.attributes.data.length > 0) {
        const url = imageData.attributes.data[0].attributes?.url || imageData.attributes.data[0].url;
        if (url && url.trim()) {
          return url.startsWith('http') ? url : `${strapiUrl}${url}`;
        }
      } else if (imageData.attributes.data.attributes?.url || imageData.attributes.data.url) {
        const url = imageData.attributes.data.attributes?.url || imageData.attributes.data.url;
        if (url && url.trim()) {
          return url.startsWith('http') ? url : `${strapiUrl}${url}`;
        }
      }
    }
  }

  // Если это объект с url напрямую
  if (imageData.url) {
    return imageData.url.startsWith('http') 
      ? imageData.url 
      : `${strapiUrl}${imageData.url}`;
  }

  return fallback;
};

/**
 * Получает URL аватара пользователя из данных Strapi
 * @param {object} avatarData - Данные аватара пользователя
 * @returns {string|null} URL аватара или null
 */
export const getAvatarUrl = (avatarData) => {
  if (!avatarData) {
    return null;
  }

  const strapiUrl = getStrapiUrl();

  // Формат Strapi v4: { data: { attributes: { url: string } } }
  if (avatarData.data?.attributes?.url) {
    const url = avatarData.data.attributes.url;
    return url.startsWith('http') ? url : `${strapiUrl}${url}`;
  }

  // Прямой доступ к url
  if (avatarData.data?.url) {
    const url = avatarData.data.url;
    return url.startsWith('http') ? url : `${strapiUrl}${url}`;
  }

  // Если url есть напрямую
  if (avatarData.url) {
    return avatarData.url.startsWith('http') 
      ? avatarData.url 
      : `${strapiUrl}${avatarData.url}`;
  }

  // Если это ID файла, строим URL через API
  if (typeof avatarData === 'number' || (typeof avatarData === 'string' && !avatarData.includes('/'))) {
    return `${strapiUrl}/api/upload/files/${avatarData}`;
  }

  return null;
};
