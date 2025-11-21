import { memo, forwardRef } from "react";
import styles from "./Input.module.css";

/**
 * Компонент поля ввода
 * @param {Object} props - Пропсы компонента
 * @param {string} props.type - Тип поля: 'text', 'email', 'password', 'number', 'tel', 'search'
 * @param {string} props.placeholder - Плейсхолдер
 * @param {string} props.value - Значение
 * @param {Function} props.onChange - Обработчик изменения
 * @param {boolean} props.error - Есть ли ошибка
 * @param {string} props.errorMessage - Сообщение об ошибке
 * @param {boolean} props.disabled - Отключено ли поле
 * @param {string} props.className - Дополнительные классы
 * @param {string} props.label - Метка поля
 * @param {string} props.id - ID поля
 * @param {Object} props... - Остальные пропсы передаются в input элемент
 */
export const Input = memo(forwardRef(({
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = false,
  errorMessage = "",
  disabled = false,
  className = "",
  label = "",
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputClasses = [
    styles.input,
    error && styles.error,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputContainer}>
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && errorMessage && (
        <div id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
}));

Input.displayName = 'Input';



