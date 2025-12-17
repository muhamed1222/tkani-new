// src/components/orderHistoryList/OrderHistoryList.jsx
import logger from '../../utils/logger';
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { OrderHistoryCard } from "../orderHistoryCard/OrderHistoryCard";
import { ordersAPI, getImageUrl, cartAPI } from "../../http/api";
import { useTokenSync } from "../../hooks/useTokenSync";
import { showToast } from "../ui/Toast";
import { BASKET_ROUTE } from "../../utils/consts";
import styles from "./OrderHistoryList.module.css";

export const OrderHistoryList = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repeatingOrderId, setRepeatingOrderId] = useState(null);

  useTokenSync();

  // Функция преобразования данных (мемоизирована)
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
      logger.log(`🛠️ Создаем ${itemCount} моковых товара`);
      
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

  useEffect(() => {
    const loadCompletedOrders = async () => {
      if (!user.isAuth) {
        logger.log('👤 Пользователь не авторизован');
        setIsLoading(false);
        setOrders([]);
        setError(null);
        return;
      }

      try {
        logger.log('🔄 Начинаем загрузку завершенных заказов...');
        
        setIsLoading(true);
        setError(null);

        let response;
        
        // Пробуем разные методы populate для получения заказов
        try {
          response = await ordersAPI.getMyOrders();
          logger.log('✅ Ответ от API (базовый populate):', response);
        } catch {
          logger.log('❌ Базовый populate не сработал, пробуем глубокий...');
          response = await ordersAPI.getMyOrdersDeep();
          logger.log('✅ Ответ от API (глубокий populate):', response);
        }

        // Обрабатываем разные форматы ответа
        const apiOrders = response.data || response.orders || [];
        logger.log('📦 Сырые данные заказов из API:', apiOrders);
        
        if (apiOrders.length === 0) {
          logger.log('📭 Нет заказов для отображения');
          setOrders([]);
          return;
        }

        // Преобразуем данные и фильтруем только завершенные заказы
       const transformedOrders = apiOrders
  .map(transformOrderData)
  .filter(order => order.status === 'completed' || order.status === 'confirmed');
        
        logger.log('🔄 Преобразованные завершенные заказы:', transformedOrders);
        logger.log('📊 Найдено завершенных заказов:', transformedOrders.length);
        
        setOrders(transformedOrders);
      } catch (err) {
        logger.error('❌ Ошибка загрузки завершенных заказов:', err);
        setError(err.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedOrders();
  }, [user.isAuth, user.token, transformOrderData]);

  const handleRepeatOrder = async (order) => {
    if (!user.isAuth) {
      showToast('Для повторного заказа необходимо авторизоваться', 'error');
      return;
    }

    if (!order.items || order.items.length === 0) {
      showToast('В заказе нет товаров для добавления', 'error');
      return;
    }

    setRepeatingOrderId(order.id);

    try {
      logger.log('🔄 Повтор заказа:', order.id);
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Добавляем каждый товар из заказа в корзину
      for (const item of order.items) {
        try {
          const productId = item.product?.id || item.product_id || item.id;
          const quantity = item.quantity || 1;

          if (!productId) {
            logger.warn('⚠️ Пропущен товар без ID:', item);
            errorCount++;
            continue;
          }

          logger.log(`📦 Добавляем товар ${productId} в количестве ${quantity}`);
          
          await cartAPI.addToCart(productId, quantity);
          successCount++;
        } catch (itemError) {
          logger.error('❌ Ошибка добавления товара:', itemError);
          errorCount++;
          errors.push(itemError.message || 'Ошибка добавления товара');
        }
      }

      if (successCount > 0) {
        showToast(
          `В корзину добавлено товаров: ${successCount}${errorCount > 0 ? ` (ошибок: ${errorCount})` : ''}`,
          errorCount > 0 ? 'warning' : 'success'
        );
        
        // Переходим в корзину после небольшой задержки
        setTimeout(() => {
          navigate(BASKET_ROUTE);
        }, 1000);
      } else {
        showToast(
          `Не удалось добавить товары в корзину: ${errors[0] || 'Неизвестная ошибка'}`,
          'error'
        );
      }
    } catch (error) {
      logger.error('❌ Ошибка повторного заказа:', error);
      showToast('Ошибка при повторном заказе. Попробуйте позже.', 'error');
    } finally {
      setRepeatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <section className={styles.orderHistoryList} aria-labelledby="history-heading">
        <h3 id="history-heading" className={styles.title}>История заказов</h3>
        <p className={styles.loading} role="status" aria-live="polite">Загрузка истории заказов...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.orderHistoryList} aria-labelledby="history-heading">
        <h3 id="history-heading" className={styles.title}>История заказов</h3>
        <p className={styles.error} role="alert" aria-live="assertive">Ошибка загрузки истории заказов: {error}</p>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className={styles.orderHistoryList} aria-labelledby="history-heading">
        <h3 id="history-heading" className={styles.title}>История заказов</h3>
        <p className={styles.empty}>У вас пока нет завершенных заказов</p>
      </section>
    );
  }

  return (
    <section className={styles.orderHistoryList} aria-labelledby="history-heading">
      <h3 id="history-heading" className={styles.title}>История заказов</h3>
      <div className={styles.ordersGrid} role="list">
        {orders.map((order) => (
          <OrderHistoryCard
            key={order.id}
            order={order}
            onRepeatOrder={handleRepeatOrder}
            isRepeating={repeatingOrderId === order.id}
          />
        ))}
      </div>
    </section>
  );
});