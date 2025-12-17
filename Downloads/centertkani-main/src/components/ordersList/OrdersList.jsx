// src/components/ordersList/OrdersList.jsx
import logger from '../../utils/logger';
import { useContext, useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";
import { OrderCard } from "../orderCard/OrderCard";
import { ordersAPI, getImageUrl } from "../../http/api";
import { useTokenSync } from "../../hooks/useTokenSync";
import styles from "./OrdersList.module.css";

export const OrdersList = observer(() => {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useTokenSync();

  // Функция преобразования данных (вынесена до useEffect для использования)
  const transformOrderData = useCallback((apiOrder) => {
    logger.log('🔄 Преобразование данных заказа:', apiOrder);
    
    const isStrapiFormat = apiOrder.attributes !== undefined;
    const rawData = isStrapiFormat ? apiOrder.attributes : apiOrder;
    
    logger.log('📦 Сырые данные заказа:', rawData);
    logger.log('🛒 Товары в заказе (сырые):', rawData.items);

    // Базовые поля
    const baseOrder = {
      id: apiOrder.id,
      date: rawData.createdAt ? new Date(rawData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      created_at: rawData.createdAt || new Date().toISOString(),
      status: rawData.status || 'placed',
      items_count: rawData.items_count || 0,
      total: rawData.total_price || 0,
      total_price: rawData.total_price || 0,
      delivery_method: rawData.delivery_method || 'Самовывоз',
      payment_method: rawData.payment_method || 'Наличными при получении',
      delivery_date: rawData.delivery_date || 'Дата уточняется',
      order_number: rawData.order_number || `ORD-${apiOrder.id}`,
    };

    // Обрабатываем товары
    let items = [];
    
    // Если товары есть в данных
    if (rawData.items && Array.isArray(rawData.items) && rawData.items.length > 0) {
      logger.log('🎉 Товары найдены! Количество:', rawData.items.length);
      
      items = rawData.items.map((item, index) => {
        const itemData = isStrapiFormat ? (item.attributes || item) : item;
        
        logger.log(`📦 Товар ${index + 1}:`, itemData);
        
        let imageUrl = '/default-textile.jpg';
        
        if (itemData.image) {
          imageUrl = getImageUrl(itemData.image);
        } else {
          // Используем моковые изображения если нет в API
          const mockImages = ['/textile-blue.jpg', '/textile-brown.jpg', '/textile-yellow.jpg', '/textile-green.jpg'];
          imageUrl = mockImages[index % mockImages.length];
        }
        
        return {
          id: itemData.id || index + 1,
          name: itemData.name || `Товар ${index + 1}`,
          image: imageUrl,
          quantity: itemData.quantity || 1,
          price: itemData.price || 0,
          product: {
            name: itemData.name || `Товар ${index + 1}`,
            image: imageUrl,
          }
        };
      });
    } else {
      logger.log('⚠️ Товары не найдены в данных API');
      // Создаем моковые товары на основе items_count
      const itemCount = rawData.items_count || 2;
      
      items = Array.from({ length: itemCount }, (_, index) => {
        const mockImages = ['/textile-blue.jpg', '/textile-brown.jpg', '/textile-yellow.jpg', '/textile-green.jpg'];
        const imageUrl = mockImages[index % mockImages.length];
        
        return {
          id: index + 1,
          name: `Товар ${index + 1}`,
          image: imageUrl,
          quantity: 1,
          price: Math.round((rawData.total_price || 1800) / itemCount),
          product: {
            name: `Товар ${index + 1}`,
            image: imageUrl,
          }
        };
      });
    }

    const transformedOrder = {
      ...baseOrder,
      items
    };
    
    return transformedOrder;
  }, []);

  // Единый useEffect для загрузки заказов
  useEffect(() => {
    const loadOrders = async () => {
      if (!user.isAuth) {
        logger.log('👤 Пользователь не авторизован, пропускаем загрузку заказов');
        setIsLoading(false);
        setOrders([]);
        setError(null);
        return;
      }

      try {
        logger.log('🔄 Начинаем загрузку заказов со статусом "placed"...');
        logger.log('🔐 Токен пользователя:', user.token ? 'присутствует' : 'отсутствует');
        
        setIsLoading(true);
        setError(null);

        // Пробуем разные методы populate
        let response;
        
        // Сначала пробуем базовый populate
        try {
          logger.log('📡 Пробуем получить заказы через ordersAPI.getMyOrders()');
          response = await ordersAPI.getMyOrders();
          logger.log('✅ Ответ от API (базовый populate):', response);
        } catch (err) {
          logger.log('❌ Базовый populate не сработал:', err);
          logger.log('📡 Пробуем глубокий populate...');
          response = await ordersAPI.getMyOrdersDeep();
          logger.log('✅ Ответ от API (глубокий populate):', response);
        }

        // Обрабатываем разные форматы ответа
        const apiOrders = response.data || response.orders || [];
        logger.log('📦 Сырые данные заказов из API:', apiOrders);
        logger.log('📊 Количество заказов:', apiOrders.length);
        
        if (apiOrders.length === 0) {
          logger.log('📭 Нет заказов для отображения');
          setOrders([]);
          return;
        }

        // Преобразуем данные и фильтруем только заказы со статусом "placed"
        const transformedOrders = apiOrders
  .map(transformOrderData)
  .filter(order => 
    order.status === 'new' ||      // Новый статус из бэкенда
    order.status === 'placed' ||   // Старый статус (если где-то еще используется)
    order.status === 'processing'  // Заказы в обработке
  );

        logger.log('🔄 Преобразованные заказы со статусом "placed":', transformedOrders);
        
        setOrders(transformedOrders);
      } catch (err) {
        logger.error('❌ Ошибка загрузки заказов:', err);
        logger.error('Детали ошибки:', {
          message: err.message,
          status: err.status,
          stack: err.stack
        });
        setError(err.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user.isAuth, user.token, transformOrderData]);


  const handleCancelOrder = useCallback(async (orderId) => {
    try {
      logger.log('🔄 Отмена заказа:', orderId);
      user.forceTokenSync?.();
      
      await ordersAPI.updateOrderStatus(
        orderId, 
        "cancelled", 
        "Отменен пользователем"
      );
      
      // Обновляем список заказов
      const updatedResponse = await ordersAPI.getMyOrders();
      const apiOrders = updatedResponse.data || updatedResponse.orders || [];
      const transformedOrders = apiOrders
        .map(transformOrderData)
        .filter(order => order.status === 'placed');
      setOrders(transformedOrders);
      
    } catch (err) {
      logger.error('❌ Ошибка отмены заказа:', err);
      setError('Не удалось отменить заказ: ' + err.message);
    }
  }, [user, transformOrderData]);

  const handleOrderUpdate = useCallback(() => {
    const loadOrders = async () => {
      try {
        user.forceTokenSync?.();
        const response = await ordersAPI.getMyOrders();
        const apiOrders = response.data || response.orders || [];
        const transformedOrders = apiOrders
          .map(transformOrderData)
          .filter(order => order.status === 'placed');
        setOrders(transformedOrders);
      } catch (err) {
        logger.error('❌ Ошибка обновления заказов:', err);
      }
    };
    loadOrders();
  }, [user, transformOrderData]);

  if (isLoading) {
    return (
      <section className={styles.ordersList} aria-labelledby="orders-heading">
        <h3 id="orders-heading" className={styles.title}>Мои заказы</h3>
        <p className={styles.loading} role="status" aria-live="polite">Загрузка заказов...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.ordersList} aria-labelledby="orders-heading">
        <h3 id="orders-heading" className={styles.title}>Мои заказы</h3>
        <p className={styles.error} role="alert" aria-live="assertive">Ошибка загрузки заказов: {error}</p>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className={styles.ordersList} aria-labelledby="orders-heading">
        <h3 id="orders-heading" className={styles.title}>Мои заказы</h3>
        <p className={styles.empty}>У вас пока нет оформленных заказов</p>
      </section>
    );
  }

  return (
    <section className={styles.ordersList} aria-labelledby="orders-heading">
      <h3 id="orders-heading" className={styles.title}>Мои заказы</h3>
      <div className={styles.ordersGrid} role="list">
        {orders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order}
            onCancelOrder={handleCancelOrder}
            onOrderUpdate={handleOrderUpdate}
          />
        ))}
      </div>
    </section>
  );
});