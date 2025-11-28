import { memo } from "react";
import styles from "./Alert.module.css";

/**
 * Компонент уведомления/алерта
 * @param {Object} props - Пропсы компонента
 * @param {React.ReactNode} props.children - Содержимое алерта
 * @param {string} props.variant - Вариант: 'success', 'error', 'warning', 'info'
 * @param {string} props.title - Заголовок алерта
 * @param {boolean} props.dismissible - Можно ли закрыть
 * @param {Function} props.onDismiss - Обработчик закрытия
 * @param {string} props.className - Дополнительные классы
 * @param {Object} props... - Остальные пропсы передаются в div элемент
 */
export const Alert = memo(({
  children,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  className = "",
  ...props
}) => {
  const alertClasses = [
    styles.alert,
    styles[variant],
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={alertClasses} role="alert" {...props}>
      <div className={styles.content}>
        {title && (
          <h5 className={styles.title}>{title}</h5>
        )}
        <div className={styles.message}>{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={onDismiss}
          aria-label="Закрыть"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
});

Alert.displayName = 'Alert';



