// src/components/quantityControl/QuantityControl.jsx
// Переиспользуемый компонент для управления количеством товара

import { memo } from 'react';
import styles from './QuantityControl.module.css';

export const QuantityControl = memo(({
  quantity,
  onIncrease,
  onDecrease,
  onChange,
  onBlur,
  min = 0.5,
  max = 1000,
  step = 0.1,
  disabled = false,
  className = '',
  showToast = null // Функция для показа уведомлений (опционально)
}) => {
  const handleInputChange = (e) => {
    e.stopPropagation(); // Останавливаем всплытие
    const inputValue = e.target.value;
    // Разрешаем пустую строку и точку для ввода
    if (inputValue === '' || inputValue === '.') {
      onChange?.('');
      return;
    }
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= min && value <= max) {
      onChange?.(value);
    }
  };

  const handleInputBlur = (e) => {
    e.stopPropagation(); // Останавливаем всплытие
    const inputValue = e.target.value;
    if (inputValue === '' || inputValue === '.') {
      onBlur?.(min);
      return;
    }
    const value = parseFloat(inputValue);
    if (isNaN(value) || value < min) {
      onBlur?.(min);
    } else if (value > max) {
      onBlur?.(max);
      if (showToast) {
        showToast(`Максимальное количество: ${max} метров`, 'error');
      }
    } else {
      // Округляем до одного знака после запятой
      onBlur?.(Math.round(value * 10) / 10);
    }
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Останавливаем всплытие
    
    if (quantity > min) {
      const newValue = Math.max(min, parseFloat(quantity) - step);
      const roundedValue = Math.round(newValue * 10) / 10;
      onDecrease?.(roundedValue, e); // Передаем событие
    }
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Останавливаем всплытие
    
    if (quantity >= max) {
      if (showToast) {
        showToast(`Максимальное количество: ${max} метров`, 'error');
      }
      return;
    }
    const newValue = Math.min(max, parseFloat(quantity) + step);
    const roundedValue = Math.round(newValue * 10) / 10;
    onIncrease?.(roundedValue, e); // Передаем событие
  };

  return (
    <div 
      className={`${styles.quantityControl} ${className}`}
      onClick={(e) => e.stopPropagation()} // Защита от клика на всей области
    >
      <button
        className={styles.quantityButton}
        onClick={handleDecrease}
        disabled={disabled || parseFloat(quantity) <= min}
        type="button"
        aria-label="Уменьшить количество"
      >
        <span>-</span>
      </button>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onClick={(e) => e.stopPropagation()} // Останавливаем клик на инпуте
        className={styles.quantityInput}
        disabled={disabled}
        aria-label="Количество товара"
      />
      <button
        className={styles.quantityButton}
        onClick={handleIncrease}
        disabled={disabled || parseFloat(quantity) >= max}
        type="button"
        aria-label="Увеличить количество"
      >
        <span>+</span>
      </button>
    </div>
  );
});

QuantityControl.displayName = 'QuantityControl';