import { memo, useEffect } from "react";
import styles from "./Modal.module.css";

/**
 * Компонент модального окна
 * @param {Object} props - Пропсы компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Обработчик закрытия
 * @param {React.ReactNode} props.children - Содержимое модального окна
 * @param {string} props.title - Заголовок модального окна
 * @param {boolean} props.closeOnOverlayClick - Закрывать при клике на overlay
 * @param {string} props.size - Размер: 'small', 'medium', 'large'
 * @param {string} props.className - Дополнительные классы
 */
export const Modal = memo(({
  isOpen,
  onClose,
  children,
  title,
  closeOnOverlayClick = true,
  size = "medium",
  className = ""
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className={`${styles.modal} ${styles[size]} ${className}`}>
        {(title || onClose) && (
          <div className={styles.header}>
            {title && (
              <h3 id="modal-title" className={styles.title}>
                {title}
              </h3>
            )}
            {onClose && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Закрыть модальное окно"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';



