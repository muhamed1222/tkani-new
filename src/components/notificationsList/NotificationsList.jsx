import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { NotificationCard } from "../notificationCard/NotificationCard";
import { notificationsAPI } from "../../http/api";
import { useTokenSync } from "../../hooks/useTokenSync";
import styles from "./NotificationsList.module.css";

export const NotificationsList = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useTokenSync();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        console.log('🔄 Начинаем загрузку уведомлений...');
        
        setIsLoading(true);
        setError(null);

        if (!user.isAuth) {
          console.log('👤 Пользователь не авторизован');
          setNotifications([]);
          return;
        }

        const response = await notificationsAPI.getNotifications();
        console.log('✅ Ответ от API уведомлений:', response);

        const apiNotifications = response.data || [];
        console.log('📦 Уведомления из API:', apiNotifications);
        
        setNotifications(apiNotifications);
      } catch (err) {
        console.error('❌ Ошибка загрузки уведомлений:', err);
        setError(err.message);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user.isAuth, user.token]);

  const handleViewOrder = (orderId) => {
    // Переход к заказу в личном кабинете
    navigate(`/account?tab=orders&order=${orderId}`);
    console.log("View order:", orderId);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      // Обновляем локальное состояние
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, attributes: { ...notification.attributes, is_read: true } }
            : notification
        )
      );
    } catch (err) {
      console.error('❌ Ошибка пометки уведомления как прочитанного:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      // Обновляем локальное состояние
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification, 
          attributes: { ...notification.attributes, is_read: true }
        }))
      );
    } catch (err) {
      console.error('❌ Ошибка пометки всех уведомлений как прочитанных:', err);
    }
  };

  // Преобразуем данные из Strapi формата
  const transformNotification = (apiNotification) => {
    const isStrapiFormat = apiNotification.attributes !== undefined;
    const rawData = isStrapiFormat ? apiNotification.attributes : apiNotification;
    
    return {
      id: apiNotification.id,
      message: rawData.message,
      title: rawData.title,
      date: rawData.createdAt ? new Date(rawData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      created_at: rawData.createdAt || new Date().toISOString(),
      is_read: rawData.is_read || false,
      order_id: rawData.order_id,
      type: rawData.type || 'system'
    };
  };

  const transformedNotifications = notifications.map(transformNotification);
  const newNotifications = transformedNotifications.filter((n) => !n.is_read);
  const readNotifications = transformedNotifications.filter((n) => n.is_read);

  if (isLoading) {
    return (
      <section className={styles.notificationsList} aria-labelledby="notifications-heading">
        <h3 id="notifications-heading" className={styles.title}>Уведомления</h3>
        <p className={styles.loading} role="status" aria-live="polite">Загрузка уведомлений...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.notificationsList} aria-labelledby="notifications-heading">
        <h3 id="notifications-heading" className={styles.title}>Уведомления</h3>
        <p className={styles.error} role="alert" aria-live="assertive">Ошибка загрузки уведомлений: {error}</p>
      </section>
    );
  }

  return (
    <section className={styles.notificationsList} aria-labelledby="notifications-heading">
      <header className={styles.titleContainer}>
        <h3 id="notifications-heading" className={styles.title}>Уведомления</h3>
        <div className={styles.headerActions}>
      
          {newNotifications.length > 0 && (
            <div className={styles.badge} aria-label={`Новых уведомлений: ${newNotifications.length}`}>
              {newNotifications.length}
            </div>
          )}
        </div>
      </header>

      {/* Новые уведомления */}
      {newNotifications.length > 0 && (
        <section className={styles.section} aria-labelledby="new-notifications-heading">
          <h4 id="new-notifications-heading" className={styles.sectionTitle}>Новые</h4>
          <div className={styles.notificationsGrid} role="list" aria-label="Новые уведомления">
            {newNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onViewOrder={handleViewOrder}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Прочитанные уведомления */}
      {readNotifications.length > 0 && (
        <section className={styles.section} aria-labelledby="read-notifications-heading">
          <h4 id="read-notifications-heading" className={styles.sectionTitle}>Прочитанные</h4>
          <div className={styles.notificationsGrid} role="list" aria-label="Прочитанные уведомления">
            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onViewOrder={handleViewOrder}
              />
            ))}
          </div>
        </section>
      )}

      {transformedNotifications.length === 0 && (
        <p className={styles.empty}>У вас пока нет уведомлений</p>
      )}
    </section>
  );
});