import { memo } from "react";
import styles from "./Badge.module.css";

/**
 * Компонент бейджа/тега
 * @param {Object} props - Пропсы компонента
 * @param {React.ReactNode} props.children - Содержимое бейджа
 * @param {string} props.variant - Вариант: 'primary', 'success', 'warning', 'error', 'info', 'outline'
 * @param {string} props.size - Размер: 'small', 'medium', 'large'
 * @param {string} props.className - Дополнительные классы
 * @param {Object} props... - Остальные пропсы передаются в span элемент
 */
export const Badge = memo(({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  ...props
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(" ");

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';



