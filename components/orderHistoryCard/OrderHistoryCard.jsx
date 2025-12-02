import styles from "./OrderHistoryCard.module.css";

export const OrderHistoryCard = ({ order, onRepeatOrder }) => {
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

  const handleRepeatOrder = () => {
    if (onRepeatOrder) {
      onRepeatOrder(order);
    }
  };

  return (
    <article className={styles.orderCard} aria-labelledby={`order-history-${order.id}-title`}>
      <header className={styles.orderHeader}>
        <h4 id={`order-history-${order.id}-title`} className={styles.orderDate}>
          Заказ от {formatDate(order.created_at || order.date)}
        </h4>
        <div className={styles.statusBadge} role="status" aria-label="Статус заказа: Завершен">
          <span className={styles.statusText}>
            Завершен
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
              {order.delivery_method || "Почта России"}
            </dd>
          </div>

          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Способ оплаты</dt>
            <dd className={styles.infoValue}>
              {order.payment_method || "Банковской картой на сайте"}
            </dd>
          </div>

          <div className={styles.orderFooter}>
            {order.delivery_date && (
              <div className={styles.infoRow}>
                <dt className={styles.infoLabel}>Дата доставки</dt>
                <dd className={styles.infoValue}>
                  {order.delivery_date}
                </dd>
              </div>
            )}
            <button
              type="button"
              onClick={handleRepeatOrder}
              className={styles.repeatButton}
              aria-label={`Повторить заказ от ${formatDate(order.created_at || order.date)}`}
            >
              Повторить заказ
            </button>
          </div>
        </dl>
      </div>
    </article>
  );
};

