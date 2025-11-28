import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Account.module.css";
import { Personal_account } from "../../components/personal_account/Personal_account";
import { OrdersList } from "../../components/ordersList/OrdersList";
import { OrderHistoryList } from "../../components/orderHistoryList/OrderHistoryList";
import { NotificationsList } from "../../components/notificationsList/NotificationsList";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { Context } from "../../main";
import { LOGIN_ROUTE } from "../../utils/consts";

export let Account = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    if (!user.isAuth) {
      navigate(LOGIN_ROUTE);
    }
  }, [user.isAuth, navigate]);

  if (!user.isAuth) {
    return null;
  }

  return (
    <main className={styles.account}>
      <nav className={styles.breadcrumbsContainer} aria-label="Хлебные крошки">
        <Breadcrumbs />
      </nav>
      <div className={styles.tabsRoot}>
        <nav className={styles.tabsList} aria-label="Навигация по разделам личного кабинета">
          <button
            className={`${styles.tabButton} ${activeTab === "account" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("account")}
            aria-current={activeTab === "account" ? "page" : undefined}
          >
            Аккаунт
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "orders" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("orders")}
            aria-current={activeTab === "orders" ? "page" : undefined}
          >
            Мои заказы
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "history" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("history")}
            aria-current={activeTab === "history" ? "page" : undefined}
          >
            История заказов
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "notifications" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("notifications")}
            aria-current={activeTab === "notifications" ? "page" : undefined}
          >
            Уведомления
          </button>
        </nav>

        <div className={styles.contentArea}>
          {activeTab === "account" && <Personal_account />}
          {activeTab === "orders" && (
            <section className={styles.tabContent} aria-labelledby="orders-heading">
              <OrdersList />
            </section>
          )}
          {activeTab === "history" && (
            <section className={styles.tabContent} aria-labelledby="history-heading">
              <OrderHistoryList />
            </section>
          )}
          {activeTab === "notifications" && (
            <section className={styles.tabContent} aria-labelledby="notifications-heading">
              <NotificationsList />
            </section>
          )}
        </div>
      </div>
    </main>
  );
});