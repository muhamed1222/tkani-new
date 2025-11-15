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
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <h4 className={styles.orderDate}>
          Заказ от {formatDate(order.created_at || order.date)}
        </h4>
        <div className={styles.statusBadge}>
          <span className={styles.statusText}>
            Завершен
          </span>
        </div>
      </div>

      <div className={styles.orderContent}>
        {/* Изображения товаров */}
        {order.items && order.items.length > 0 && (
          <div className={styles.productImages}>
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className={styles.productImageContainer}>
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
        <div className={styles.orderInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              {order.items_count || order.items?.length || 0} товара на сумму
            </span>
            <span className={styles.infoValue}>
              {formatPrice(order.total || order.total_price || 0)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Способ получения</span>
            <span className={styles.infoValue}>
              {order.delivery_method || "Почта России"}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Способ оплаты</span>
            <span className={styles.infoValue}>
              {order.payment_method || "Банковской картой на сайте"}
            </span>
          </div>

          <div className={styles.orderFooter}>
            {order.delivery_date && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Дата доставки</span>
                <span className={styles.infoValue}>
                  {order.delivery_date}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleRepeatOrder}
              className={styles.repeatButton}
            >
              Повторить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

