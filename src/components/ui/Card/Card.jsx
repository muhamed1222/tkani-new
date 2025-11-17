import { memo } from "react";
import styles from "./Card.module.css";

/**
 * Компонент карточки
 * @param {Object} props - Пропсы компонента
 * @param {React.ReactNode} props.children - Содержимое карточки
 * @param {string} props.variant - Вариант: 'default', 'outlined', 'elevated'
 * @param {boolean} props.clickable - Кликабельна ли карточка
 * @param {Function} props.onClick - Обработчик клика
 * @param {string} props.className - Дополнительные классы
 * @param {Object} props... - Остальные пропсы передаются в div элемент
 */
export const Card = memo(({
  children,
  variant = "default",
  clickable = false,
  onClick,
  className = "",
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    clickable && styles.clickable,
    className
  ].filter(Boolean).join(" ");

  return (
    <div
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable && onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';



