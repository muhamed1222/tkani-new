import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";
import { OrderCard } from "../orderCard/OrderCard";
import styles from "./OrdersList.module.css";

export const OrdersList = observer(() => {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Реализовать загрузку заказов через API
    // Пока используем моковые данные
    const mockOrders = [
      {
        id: 1,
        date: "2025-09-02",
        created_at: "2025-09-02",
        status: "placed",
        items_count: 3,
        total: 1600,
        total_price: 1600,
        delivery_method: "Самовывоз",
        payment_method: "Наличными при получении",
        delivery_date: "11 сентября, 11:00 - 13:00",
        items: [
          {
            id: 1,
            name: "Ткань 1",
            image: "/textile-blue.jpg",
            product: {
              name: "Ткань 1",
              image: "/textile-blue.jpg",
            },
          },
          {
            id: 2,
            name: "Ткань 2",
            image: "/textile-brown.jpg",
            product: {
              name: "Ткань 2",
              image: "/textile-brown.jpg",
            },
          },
          {
            id: 3,
            name: "Ткань 3",
            image: "/textile-yellow.jpg",
            product: {
              name: "Ткань 3",
              image: "/textile-yellow.jpg",
            },
          },
        ],
      },
      {
        id: 2,
        date: "2025-09-01",
        created_at: "2025-09-01",
        status: "placed",
        items_count: 2,
        total: 1200,
        total_price: 1200,
        delivery_method: "Самовывоз",
        payment_method: "Наличными при получении",
        delivery_date: "10 сентября, 14:00 - 16:00",
        items: [
          {
            id: 4,
            name: "Ткань 4",
            image: "/textile-green.jpg",
            product: {
              name: "Ткань 4",
              image: "/textile-green.jpg",
            },
          },
          {
            id: 5,
            name: "Ткань 5",
            image: "/textile-blue.jpg",
            product: {
              name: "Ткань 5",
              image: "/textile-blue.jpg",
            },
          },
        ],
      },
    ];

    setIsLoading(false);
    setOrders(mockOrders);

    // TODO: Реализовать загрузку через API
    // try {
    //   const response = await ordersAPI.getMyOrders();
    //   setOrders(response.orders || []);
    // } catch (err) {
    //   setError(err.message);
    // } finally {
    //   setIsLoading(false);
    // }
  }, [user.isAuth]);

  if (isLoading) {
    return (
      <div className={styles.ordersList}>
        <h3 className={styles.title}>Мои заказы</h3>
        <p className={styles.loading}>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.ordersList}>
        <h3 className={styles.title}>Мои заказы</h3>
        <p className={styles.error}>Ошибка загрузки: {error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.ordersList}>
        <h3 className={styles.title}>Мои заказы</h3>
        <p className={styles.empty}>У вас пока нет заказов</p>
      </div>
    );
  }

  return (
    <div className={styles.ordersList}>
      <h3 className={styles.title}>Мои заказы</h3>
      <div className={styles.ordersGrid}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
});

