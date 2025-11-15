import styles from "./OrderCard.module.css";

export const OrderCard = ({ order }) => {
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

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <h4 className={styles.orderDate}>
          Заказ от {formatDate(order.created_at || order.date)}
        </h4>
        <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
          <span className={styles.statusText}>
            {getStatusText(order.status)}
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
              {order.delivery_method || "Самовывоз"}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Способ оплаты</span>
            <span className={styles.infoValue}>
              {order.payment_method || "Наличными при получении"}
            </span>
          </div>

          {order.delivery_date && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Дата доставки</span>
              <span className={styles.infoValue}>
                {order.delivery_date}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

