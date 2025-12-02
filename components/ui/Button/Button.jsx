import { memo } from "react";
import styles from "./Button.module.css";

/**
 * Компонент кнопки
 * @param {Object} props - Пропсы компонента
 * @param {string} props.variant - Вариант кнопки: 'primary', 'secondary', 'tertiary', 'outline'
 * @param {string} props.size - Размер: 'small', 'medium', 'large'
 * @param {boolean} props.disabled - Отключена ли кнопка
 * @param {boolean} props.fullWidth - Занимает всю ширину
 * @param {React.ReactNode} props.children - Содержимое кнопки
 * @param {Function} props.onClick - Обработчик клика
 * @param {string} props.type - Тип кнопки: 'button', 'submit', 'reset'
 * @param {string} props.className - Дополнительные классы
 * @param {Object} props... - Остальные пропсы передаются в button элемент
 */
export const Button = memo(({
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';



