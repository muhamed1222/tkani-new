/**
 * Сокращает массив breadcrumbs, если элементов больше 3
 * Формат: первый → ... → предпоследний → последний
 * 
 * @param {Array<{label: string, href?: string}>} breadcrumbs - Массив элементов breadcrumb
 * @returns {Array<{label: string, href?: string, isEllipsis?: boolean}>} - Сокращенный массив
 */

import logger from '../../utils/logger';

export const compressBreadcrumbs = (breadcrumbs) => {
  // Защита от null/undefined
  if (!breadcrumbs) {
    return [];
  }

  // Проверка на массив
  if (!Array.isArray(breadcrumbs)) {
    logger.warn('compressBreadcrumbs: ожидается массив, получен', typeof breadcrumbs);
    return [];
  }

  // Фильтрация и валидация элементов
  const validBreadcrumbs = breadcrumbs
    .filter((item) => {
      // Проверяем наличие label
      if (!item || typeof item !== 'object') {
        return false;
      }
      
      // label должен быть непустой строкой
      if (!item.label || typeof item.label !== 'string' || item.label.trim() === '') {
        return false;
      }
      
      return true;
    })
    .map((item, index, array) => {
      // Убираем дубликаты по href (если есть)
      if (item.href) {
        const isDuplicate = array.slice(0, index).some(
          (prevItem) => prevItem.href === item.href
        );
        if (isDuplicate && index > 0) {
          return null;
        }
      }
      return item;
    })
    .filter(Boolean); // Удаляем null элементы

  // Если после фильтрации нет элементов
  if (validBreadcrumbs.length === 0) {
    return [];
  }

  // Если элементов 3 или меньше, возвращаем как есть
  if (validBreadcrumbs.length <= 3) {
    return validBreadcrumbs;
  }

  // Если элементов больше 3, сокращаем:
  // первый → ... → предпоследний → последний
  const first = validBreadcrumbs[0];
  const secondToLast = validBreadcrumbs[validBreadcrumbs.length - 2];
  const last = validBreadcrumbs[validBreadcrumbs.length - 1];

  return [
    first,
    { label: '...', isEllipsis: true },
    secondToLast,
    last
  ];
};
