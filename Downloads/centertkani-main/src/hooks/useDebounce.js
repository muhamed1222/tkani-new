import { useState, useEffect } from 'react';

/**
 * Хук для дебаунса значения
 * @param {any} value - значение для дебаунса
 * @param {number} delay - задержка в миллисекундах
 * @returns {any} - дебаунсированное значение
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
