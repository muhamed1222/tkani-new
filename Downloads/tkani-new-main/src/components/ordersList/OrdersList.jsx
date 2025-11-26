// src/components/ordersList/OrdersList.jsx
import { useContext, useEffect, useState } from "react";
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

  useEffect(() => {
  const loadOrders = async () => {
    try {
      console.log('🔄 Начинаем загрузку заказов...');
      console.log('🔐 Токен пользователя:', user.token ? 'присутствует' : 'отсутствует');
      console.log('👤 Пользователь авторизован:', user.isAuth);
      
      setIsLoading(true);
      setError(null);

      let response;
      
      try {
        console.log('📡 Пробуем получить заказы через ordersAPI.getMyOrders()');
        response = await ordersAPI.getMyOrders();
        console.log('✅ Ответ от API (базовый populate):', response);
      } catch (err) {
        console.log('❌ Базовый populate не сработал:', err);
        console.log('📡 Пробуем глубокий populate...');
        response = await ordersAPI.getMyOrdersDeep();
        console.log('✅ Ответ от API (глубокий populate):', response);
      }

      // Обрабатываем разные форматы ответа
      const apiOrders = response.data || response.orders || [];
      console.log('📦 Сырые данные заказов из API:', apiOrders);
      console.log('📊 Количество заказов:', apiOrders.length);
      
      if (apiOrders.length === 0) {
        console.log('📭 Нет заказов для отображения');
        setOrders([]);
        return;
      }

    

      // Преобразуем данные
      const transformedOrders = apiOrders.map(transformOrderData);
      console.log('🔄 Преобразованные заказы:', transformedOrders);
      
      // ФИЛЬТР ДЛЯ ДИАГНОСТИКИ - временно уберем фильтр чтобы видеть ВСЕ заказы
      const placedOrders = transformedOrders.filter(order => order.status === 'placed');
      console.log('📋 Заказы со статусом "placed":', placedOrders);
      
      setOrders(placedOrders);
      
    } catch (err) {
      console.error('❌ Ошибка загрузки заказов:', err);
      console.error('Детали ошибки:', {
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

  if (user.isAuth) {
    loadOrders();
  } else {
    console.log('👤 Пользователь не авторизован, пропускаем загрузку заказов');
    setIsLoading(false);
    setOrders([]);
    setError(null);
  }
}, [user.isAuth, user.token]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log('🔄 Начинаем загрузку заказов со статусом "placed"...');
        
        setIsLoading(true);
        setError(null);

        // Пробуем разные методы populate
        let response;
        
        // Сначала пробуем базовый populate
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

        // Преобразуем данные и фильтруем только заказы со статусом "placed"
        const transformedOrders = apiOrders
          .map(transformOrderData)
          .filter(order => order.status === 'placed'); // Фильтруем только оформленные
        
        console.log('🔄 Преобразованные заказы со статусом "placed":', transformedOrders);
        
        setOrders(transformedOrders);
      } catch (err) {
        console.error('❌ Ошибка загрузки заказов:', err);
        setError(err.message);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.isAuth) {
      loadOrders();
    } else {
      setIsLoading(false);
      setOrders([]);
      setError(null);
    }
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

  const handleCancelOrder = async (orderId) => {
    try {
      console.log('🔄 Отмена заказа:', orderId);
      user.forceTokenSync?.();
      
      const response = await ordersAPI.updateOrderStatus(
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
      console.error('❌ Ошибка отмены заказа:', err);
      alert('Не удалось отменить заказ: ' + err.message);
    }
  };

  const handleOrderUpdate = () => {
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
        console.error('❌ Ошибка обновления заказов:', err);
      }
    };
    loadOrders();
  };

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