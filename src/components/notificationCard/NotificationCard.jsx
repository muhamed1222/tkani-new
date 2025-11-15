import styles from "./NotificationCard.module.css";

export const NotificationCard = ({ notification, onViewOrder }) => {
  if (!notification) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleViewOrder = () => {
    if (onViewOrder && notification.order_id) {
      onViewOrder(notification.order_id);
    }
  };

  const buttonClass = notification.is_read
    ? styles.viewButtonRead
    : styles.viewButtonNew;

  return (
    <article className={styles.notificationCard} role="listitem" aria-labelledby={`notification-${notification.id}-title`}>
      <div className={styles.notificationContent}>
        <h4 id={`notification-${notification.id}-title`} className={styles.notificationTitle}>
          {notification.message || notification.title}
        </h4>
        <time className={styles.notificationDate} dateTime={notification.created_at || notification.date}>
          {formatDate(notification.created_at || notification.date)}
        </time>
      </div>
      {notification.order_id && (
        <button
          type="button"
          onClick={handleViewOrder}
          className={buttonClass}
          aria-label={`Перейти к заказу ${notification.order_id}`}
        >
          К заказу
        </button>
      )}
    </article>
  );
};

