/**
 * Утилиты для поиска и работы с данными
 */

import logger from './logger';

/**
 * Санитизация строки для безопасного отображения
 * @param {string} str - строка для санитизации
 * @returns {string} - безопасная строка
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Поиск товаров по нескольким полям
 * @param {Array} products - массив товаров
 * @param {string} query - поисковый запрос
 * @returns {Array} - отфильтрованные и отсортированные товары
 */
export function searchProducts(products, query) {
  if (!Array.isArray(products) || !query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);

  if (queryWords.length === 0) {
    return [];
  }

  // Поля для поиска
  const searchFields = ['name', 'title', 'description', 'category', 'sku', 'article'];

  // Поиск и ранжирование
  const results = products
    .map(product => {
      if (!product || typeof product !== 'object') return null;

      let score = 0;
      const matchedFields = [];

      // Проверяем каждое поле
      searchFields.forEach(field => {
        const fieldValue = product[field];
        if (!fieldValue) return;

        const normalizedField = String(fieldValue).toLowerCase();

        // Точное совпадение - высший приоритет
        if (normalizedField === normalizedQuery) {
          score += 100;
          matchedFields.push(field);
          return;
        }

        // Начинается с запроса
        if (normalizedField.startsWith(normalizedQuery)) {
          score += 50;
          matchedFields.push(field);
          return;
        }

        // Содержит все слова запроса
        const allWordsMatch = queryWords.every(word => normalizedField.includes(word));
        if (allWordsMatch) {
          score += 30;
          matchedFields.push(field);
          return;
        }

        // Содержит хотя бы одно слово
        queryWords.forEach(word => {
          if (normalizedField.includes(word)) {
            score += 10;
            if (!matchedFields.includes(field)) {
              matchedFields.push(field);
            }
          }
        });
      });

      // Бонус за совпадение в названии
      if (matchedFields.includes('name') || matchedFields.includes('title')) {
        score += 20;
      }

      return score > 0 ? { product, score, matchedFields } : null;
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score) // Сортировка по релевантности
    .map(item => item.product);

  return results;
}

/**
 * Безопасное получение данных из localStorage
 * @param {string} key - ключ
 * @param {any} defaultValue - значение по умолчанию
 * @returns {any} - значение из localStorage
 */
export function safeGetFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed)) return defaultValue;
    
    // Валидация данных
    return parsed.filter(item => typeof item === 'string' && item.trim().length > 0);
  } catch (error) {
    logger.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Безопасное сохранение в localStorage
 * @param {string} key - ключ
 * @param {any} value - значение
 * @param {number} maxItems - максимальное количество элементов
 */
export function safeSetToStorage(key, value, maxItems = 10) {
  try {
    if (!Array.isArray(value)) return;
    
    // Ограничиваем размер
    const limited = value.slice(0, maxItems);
    
    // Валидация перед сохранением
    const validated = limited.filter(item => 
      typeof item === 'string' && 
      item.trim().length > 0 && 
      item.length < 200 // Защита от слишком длинных строк
    );
    
    localStorage.setItem(key, JSON.stringify(validated));
  } catch (error) {
    logger.error(`Error writing to localStorage key "${key}":`, error);
    // Если localStorage переполнен, пытаемся очистить старые данные
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Игнорируем ошибки очистки
    }
  }
}

/**
 * Получение статистики поиска из localStorage
 * @returns {Object} - объект с запросами и их частотой
 */
export function getSearchStatistics() {
  try {
    const stats = localStorage.getItem('searchStatistics');
    if (!stats) return {};
    
    const parsed = JSON.parse(stats);
    if (typeof parsed !== 'object' || parsed === null) return {};
    
    return parsed;
  } catch (error) {
    logger.error('Error reading search statistics:', error);
    return {};
  }
}

/**
 * Сохранение статистики поиска в localStorage
 * @param {Object} statistics - объект с запросами и их частотой
 */
export function saveSearchStatistics(statistics) {
  try {
    if (typeof statistics !== 'object' || statistics === null) return;
    
    // Ограничиваем количество записей (храним топ 100)
    const entries = Object.entries(statistics)
      .sort((a, b) => b[1] - a[1]) // Сортировка по частоте
      .slice(0, 100);
    
    const limited = Object.fromEntries(entries);
    localStorage.setItem('searchStatistics', JSON.stringify(limited));
  } catch (error) {
    logger.error('Error saving search statistics:', error);
    // Если localStorage переполнен, пытаемся очистить старые данные
    try {
      localStorage.removeItem('searchStatistics');
    } catch (e) {
      // Игнорируем ошибки очистки
    }
  }
}

/**
 * Увеличение счетчика для поискового запроса
 * @param {string} query - поисковый запрос
 */
export function incrementSearchCount(query) {
  if (!query || typeof query !== 'string' || query.trim() === '') return;
  
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) return; // Игнорируем слишком короткие запросы
  
  const statistics = getSearchStatistics();
  statistics[normalizedQuery] = (statistics[normalizedQuery] || 0) + 1;
  saveSearchStatistics(statistics);
}

/**
 * Получение популярных запросов на основе статистики
 * @param {number} limit - максимальное количество запросов
 * @param {Array} defaultQueries - запросы по умолчанию, если статистики нет
 * @returns {Array} - массив популярных запросов
 */
export function getPopularQueries(limit = 4, defaultQueries = ["Нитки", "Ткань", "Иглы швейные", "Атласная ткань"]) {
  const statistics = getSearchStatistics();
  const entries = Object.entries(statistics);
  
  // Если статистики нет или мало данных, возвращаем запросы по умолчанию
  if (entries.length === 0) {
    return defaultQueries.slice(0, limit);
  }
  
  // Сортируем по частоте использования (по убыванию)
  const sorted = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query]) => {
      // Восстанавливаем регистр (первая буква заглавная, остальные как в оригинале)
      const words = query.split(' ');
      return words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    });
  
  // Если популярных запросов меньше лимита, дополняем запросами по умолчанию
  // Но только если их нет в статистике
  if (sorted.length < limit) {
    const defaultFiltered = defaultQueries.filter(q => 
      !sorted.some(s => s.toLowerCase() === q.toLowerCase()) &&
      !entries.some(([statQuery]) => statQuery.toLowerCase() === q.toLowerCase())
    );
    sorted.push(...defaultFiltered.slice(0, limit - sorted.length));
  }
  
  return sorted;
}
