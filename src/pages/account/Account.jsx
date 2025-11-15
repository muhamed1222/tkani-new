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
    <div className={styles.account}>
      <div className={styles.breadcrumbsContainer}>
        <Breadcrumbs />
      </div>
      <div className={styles.tabsRoot}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tabButton} ${activeTab === "account" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("account")}
          >
            Аккаунт
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "orders" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Мои заказы
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "history" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("history")}
          >
            История заказов
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "notifications" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Уведомления
          </button>
        </div>

        <div className={styles.contentArea}>
          {activeTab === "account" && <Personal_account />}
          {activeTab === "orders" && (
            <div className={styles.tabContent}>
              <OrdersList />
            </div>
          )}
          {activeTab === "history" && (
            <div className={styles.tabContent}>
              <OrderHistoryList />
            </div>
          )}
          {activeTab === "notifications" && (
            <div className={styles.tabContent}>
              <NotificationsList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});