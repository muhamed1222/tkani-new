// src/components/orderHistoryList/OrderHistoryList.jsx
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";
import { OrderHistoryCard } from "../orderHistoryCard/OrderHistoryCard";
import { ordersAPI, getImageUrl } from "../../http/api";
import { useTokenSync } from "../../hooks/useTokenSync";
import styles from "./OrderHistoryList.module.css";

export const OrderHistoryList = observer(() => {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useTokenSync();

  useEffect(() => {
    const loadCompletedOrders = async () => {
      try {
        console.log('🔄 Начинаем загрузку завершенных заказов...');
        
        setIsLoading(true);
        setError(null);

        if (!user.isAuth) {
          console.log('👤 Пользователь не авторизован');
          setOrders([]);
          return;
        }

        let response;
        
        // Пробуем разные методы populate для получения заказов
        try {
          response = await ordersAPI.getMyOrders();
          console.log('✅ Ответ от API (базовый populate):', response);
        } catch (err) {
          console.log('❌ Базовый populate не сработал, пробуем глубокий...');
          response = await ordersAPI.getMyOrdersDeep();
          console.log('✅ Ответ от API (глубокий populate):', response);
        }

        // Обрабатываем разные форматы ответа
        const apiOrders = response.data || response.orders || [];
        console.log('📦 Сырые данные заказов из API:', apiOrders);
        
        if (apiOrders.length === 0) {
          console.log('📭 Нет заказов для отображения');
          setOrders([]);
          return;
        }

        // ДИАГНОСТИКА: Выводим все статусы заказов
        console.log('🔍 Статусы всех заказов:');
        apiOrders.forEach((order, index) => {
          const orderData = order.attributes || order;
          console.log(`Заказ ${index + 1}: ID=${order.id}, Статус=${orderData.status}, Номер=${orderData.order_number}`);
        });

        // Преобразуем данные и фильтруем только завершенные заказы
        const transformedOrders = apiOrders
          .map(transformOrderData)
          .filter(order => order.status === 'confirmed'); // Фильтруем только завершенные
        
        console.log('🔄 Преобразованные завершенные заказы:', transformedOrders);
        console.log('📊 Найдено завершенных заказов:', transformedOrders.length);
        
        setOrders(transformedOrders);
      } catch (err) {
        console.error('❌ Ошибка загрузки завершенных заказов:', err);
        setError(err.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedOrders();
  }, [user.isAuth, user.token]);

  // Функция преобразования данных
  const transformOrderData = (apiOrder) => {
    console.log('🔄 Преобразование данных заказа:', apiOrder);
    
    const isStrapiFormat = apiOrder.attributes !== undefined;
    const rawData = isStrapiFormat ? apiOrder.attributes : apiOrder;
    
    console.log('📦 Сырые данные заказа:', rawData);
    console.log('🛒 Товары в заказе (сырые):', rawData.items);

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
      console.log('🎉 Товары найдены! Количество:', rawData.items.length);
      
      items = rawData.items.map((item, index) => {
        const itemData = isStrapiFormat ? (item.attributes || item) : item;
        
        console.log(`📦 Товар ${index + 1}:`, itemData);
        
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
      console.log('⚠️ Товары не найдены в данных API');
      // Создаем моковые товары на основе items_count
      const itemCount = rawData.items_count || 2;
      console.log(`🛠️ Создаем ${itemCount} моковых товара`);
      
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
  };

  const handleRepeatOrder = (order) => {
    // TODO: Реализовать повтор заказа через API
    console.log("Repeat order:", order);
    // Можно добавить логику добавления товаров в корзину
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
          />
        ))}
      </div>
    </section>
  );
});