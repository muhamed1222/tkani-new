import { memo, useState } from "react";
import styles from "./OrderCard.module.css";
import { ordersAPI } from "../../http/api";

/**
 * Компонент карточки заказа
 * @param {Object} props - Пропсы компонента
 * @param {Object} props.order - Объект заказа
 * @param {number} props.order.id - ID заказа
 * @param {string} props.order.date - Дата заказа
 * @param {string} props.order.created_at - Дата создания заказа
 * @param {string} props.order.status - Статус заказа (placed, processing, delivering, delivered)
 * @param {number} props.order.items_count - Количество товаров
 * @param {number} props.order.total - Общая сумма заказа
 * @param {number} props.order.total_price - Общая цена заказа
 * @param {string} props.order.delivery_method - Способ доставки
 * @param {string} props.order.payment_method - Способ оплаты
 * @param {string} props.order.delivery_date - Дата доставки
 * @param {Array} props.order.items - Массив товаров в заказе
 * @param {Function} [props.onCancelOrder] - Callback для отмены заказа
 * @param {Function} [props.onOrderUpdate] - Callback при обновлении заказа
 */
export const OrderCard = memo(({ 
  order, 
  onCancelOrder,
  onOrderUpdate 
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);

  if (!order) {
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

  const formatPrice = (price) => {
    if (!price) return "0 ₽";
    return `${price.toLocaleString("ru-RU")} ₽`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Оформлен":
      case "placed":
        return styles.statusPlaced;
      case "В обработке":
      case "processing":
        return styles.statusProcessing;
      case "Доставляется":
      case "delivering":
        return styles.statusDelivering;
      case "Доставлен":
      case "delivered":
        return styles.statusDelivered;
      default:
        return styles.statusPlaced;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      placed: "Оформлен",
      processing: "В обработке",
      delivering: "Доставляется",
      delivered: "Доставлен",
    };
    return statusMap[status] || status || "Оформлен";
  };

  // Проверка, можно ли отменить заказ
  const canCancelOrder = () => {
    const cancellableStatuses = ["placed", "processing"];
    return cancellableStatuses.includes(order.status);
  };

  // Обработка отмены заказа
  const handleCancelOrder = async () => {
    if (!canCancelOrder()) {
      return;
    }

    const confirmed = window.confirm(
      `Вы уверены, что хотите отменить заказ от ${formatDate(order.created_at || order.date)}?`
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      if (onCancelOrder) {
        await onCancelOrder(order.id);
      } else {
        // Используем API напрямую, если callback не передан
        await ordersAPI.updateOrderStatus(order.id, "cancelled", "Отменен пользователем");
      }

      // Вызываем callback обновления, если передан
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (err) {
      setError(err.message || "Ошибка при отмене заказа");
      console.error("Ошибка отмены заказа:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <article 
      className={styles.orderCard}
      aria-labelledby={`order-${order.id}-title`}
    >
      <header className={styles.orderHeader}>
        <h4 id={`order-${order.id}-title`} className={styles.orderDate}>
          Заказ от {formatDate(order.created_at || order.date)}
        </h4>
        <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`} role="status" aria-label={`Статус заказа: ${getStatusText(order.status)}`}>
          <span className={styles.statusText}>
            {getStatusText(order.status)}
          </span>
        </div>
      </header>

      <div className={styles.orderContent}>
        {/* Изображения товаров */}
        {order.items && order.items.length > 0 && (
          <div className={styles.productImages} role="list" aria-label="Товары в заказе">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className={styles.productImageContainer} role="listitem">
                <img
                  src={item.image || item.product?.image || "/placeholder-product.jpg"}
                  alt={item.name || item.product?.name || "Товар"}
                  className={styles.productImage}
                />
              </div>
            ))}
          </div>
        )}

        {/* Информация о заказе */}
        <dl className={styles.orderInfo}>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>
              {order.items_count || order.items?.length || 0} товара на сумму
            </dt>
            <dd className={styles.infoValue}>
              {formatPrice(order.total || order.total_price || 0)}
            </dd>
          </div>

          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Способ получения</dt>
            <dd className={styles.infoValue}>
              {order.delivery_method || "Самовывоз"}
            </dd>
          </div>

          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Способ оплаты</dt>
            <dd className={styles.infoValue}>
              {order.payment_method || "Наличными при получении"}
            </dd>
          </div>

          {order.delivery_date && (
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Дата доставки</dt>
              <dd className={styles.infoValue}>
                {order.delivery_date}
              </dd>
            </div>
          )}
        </dl>

        {/* Сообщение об ошибке */}
        {error && (
          <div className={styles.errorMessage} role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {/* Действия с заказом */}
        {canCancelOrder() && (
          <div className={styles.orderActions}>
            <button
              type="button"
              onClick={handleCancelOrder}
              className={styles.cancelButton}
              disabled={isCancelling}
              aria-label={`Отменить заказ от ${formatDate(order.created_at || order.date)}`}
            >
              {isCancelling ? "Отмена..." : "Отменить заказ"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для мемоизации
  return (
    prevProps.order?.id === nextProps.order?.id &&
    prevProps.order?.status === nextProps.order?.status &&
    prevProps.order?.total === nextProps.order?.total &&
    prevProps.order?.items_count === nextProps.order?.items_count
  );
});

OrderCard.displayName = 'OrderCard';

