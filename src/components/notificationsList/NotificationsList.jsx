import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { NotificationCard } from "../notificationCard/NotificationCard";
import styles from "./NotificationsList.module.css";

export const NotificationsList = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Реализовать загрузку уведомлений через API
    // Пока используем моковые данные
    const mockNotifications = [
      {
        id: 1,
        message: "Ваш заказ от 02.09.2025 оформлен и ожидает сборки",
        date: "2025-09-02",
        created_at: "2025-09-02",
        is_read: false,
        order_id: 1,
      },
      {
        id: 2,
        message: "Ваш заказ от 02.09.2025 оформлен и ожидает сборки",
        date: "2025-09-02",
        created_at: "2025-09-02",
        is_read: false,
        order_id: 2,
      },
      {
        id: 3,
        message: "Ваш заказ от 02.09.2025 оформлен и ожидает сборки",
        date: "2025-09-02",
        created_at: "2025-09-02",
        is_read: true,
        order_id: 3,
      },
      {
        id: 4,
        message: "Ваш заказ от 02.09.2025 оформлен и ожидает сборки",
        date: "2025-09-02",
        created_at: "2025-09-02",
        is_read: true,
        order_id: 4,
      },
      {
        id: 5,
        message: "Ваш заказ от 02.09.2025 оформлен и ожидает сборки",
        date: "2025-09-02",
        created_at: "2025-09-02",
        is_read: true,
        order_id: 5,
      },
      {
        id: 6,
        message: "Ваш заказ от 02.09.2025 оформлен и ожидает сборки",
        date: "2025-09-02",
        created_at: "2025-09-02",
        is_read: true,
        order_id: 6,
      },
    ];

    setIsLoading(false);
    setNotifications(mockNotifications);

    // TODO: Реализовать загрузку через API
    // try {
    //   const response = await notificationsAPI.getNotifications();
    //   setNotifications(response.notifications || []);
    // } catch (err) {
    //   setError(err.message);
    // } finally {
    //   setIsLoading(false);
    // }
  }, [user.isAuth]);

  const handleViewOrder = (orderId) => {
    // TODO: Реализовать переход к заказу
    // navigate(`/account?tab=orders&order=${orderId}`);
    console.log("View order:", orderId);
  };

  const newNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  if (isLoading) {
    return (
      <div className={styles.notificationsList}>
        <h3 className={styles.title}>Уведомления</h3>
        <p className={styles.loading}>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.notificationsList}>
        <h3 className={styles.title}>Уведомления</h3>
        <p className={styles.error}>Ошибка загрузки: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.notificationsList}>
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>Уведомления</h3>
        {newNotifications.length > 0 && (
          <div className={styles.badge}>{newNotifications.length}</div>
        )}
      </div>

      {/* Новые уведомления */}
      {newNotifications.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Новые</h4>
          <div className={styles.notificationsGrid}>
            {newNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onViewOrder={handleViewOrder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Прочитанные уведомления */}
      {readNotifications.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Прочитанные</h4>
          <div className={styles.notificationsGrid}>
            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onViewOrder={handleViewOrder}
              />
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <p className={styles.empty}>У вас пока нет уведомлений</p>
      )}
    </div>
  );
});

