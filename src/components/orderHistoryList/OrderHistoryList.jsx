import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";
import { OrderHistoryCard } from "../orderHistoryCard/OrderHistoryCard";
import styles from "./OrderHistoryList.module.css";

export const OrderHistoryList = observer(() => {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Реализовать загрузку истории заказов через API
    // Пока используем моковые данные
    const mockOrders = [
      {
        id: 1,
        date: "2025-05-02",
        created_at: "2025-05-02",
        status: "completed",
        items_count: 1,
        total: 400,
        total_price: 400,
        delivery_method: "Почта России",
        payment_method: "Банковской картой на сайте",
        delivery_date: "4 мая, 11:00 - 13:00",
        items: [
          {
            id: 1,
            name: "Ткань 1",
            image: "/textile-green.jpg",
            product: {
              name: "Ткань 1",
              image: "/textile-green.jpg",
            },
          },
        ],
      },
      {
        id: 2,
        date: "2025-01-11",
        created_at: "2025-01-11",
        status: "completed",
        items_count: 2,
        total: 800,
        total_price: 800,
        delivery_method: "Почта России",
        payment_method: "Банковской картой на сайте",
        delivery_date: "12 января, 11:00 - 13:00",
        items: [
          {
            id: 4,
            name: "Ткань 4",
            image: "/textile-blue.jpg",
            product: {
              name: "Ткань 4",
              image: "/textile-blue.jpg",
            },
          },
          {
            id: 5,
            name: "Ткань 5",
            image: "/textile-brown.jpg",
            product: {
              name: "Ткань 5",
              image: "/textile-brown.jpg",
            },
          },
        ],
      },
    ];

    setIsLoading(false);
    setOrders(mockOrders);

    // TODO: Реализовать загрузку через API
    // try {
    //   const response = await ordersAPI.getMyOrders({ status: "completed" });
    //   setOrders(response.orders || []);
    // } catch (err) {
    //   setError(err.message);
    // } finally {
    //   setIsLoading(false);
    // }
  }, [user.isAuth]);

  const handleRepeatOrder = (order) => {
    // TODO: Реализовать повтор заказа через API
    console.log("Repeat order:", order);
    // Можно добавить логику добавления товаров в корзину
  };

  if (isLoading) {
    return (
      <section className={styles.orderHistoryList} aria-labelledby="history-heading">
        <h3 id="history-heading" className={styles.title}>История заказов</h3>
        <p className={styles.loading} role="status" aria-live="polite">Загрузка...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.orderHistoryList} aria-labelledby="history-heading">
        <h3 id="history-heading" className={styles.title}>История заказов</h3>
        <p className={styles.error} role="alert" aria-live="assertive">Ошибка загрузки: {error}</p>
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

