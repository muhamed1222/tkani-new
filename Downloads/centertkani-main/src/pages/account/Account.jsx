import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Account.module.css";
import { Personal_account } from "../../components/personal_account/Personal_account";
import { OrdersList } from "../../components/ordersList/OrdersList";
import { OrderHistoryList } from "../../components/orderHistoryList/OrderHistoryList";
import { NotificationsList } from "../../components/notificationsList/NotificationsList";
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from "../../components/breadcrumbs";
import { Context } from "../../main";
import { LOGIN_ROUTE } from "../../utils/consts";

export let Account = observer(() => {
  const context = useContext(Context);
  const { user } = context;
  const breadcrumbs = useAutoBreadcrumbs({ context });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Получаем активную вкладку из URL или используем значение по умолчанию
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['account', 'orders', 'history', 'notifications'];
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'account';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  // Синхронизация URL с состоянием вкладки
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Обновление URL при изменении вкладки
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
        <BreadcrumbsCompressed items={breadcrumbs} />
      </nav>
      <div className={styles.tabsRoot}>
        <nav className={styles.tabsList} aria-label="Навигация по разделам личного кабинета">
          <button
            className={`${styles.tabButton} ${activeTab === "account" ? styles.tabButtonActive : ""}`}
            onClick={() => handleTabChange("account")}
            aria-current={activeTab === "account" ? "page" : undefined}
          >
            Аккаунт
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "orders" ? styles.tabButtonActive : ""}`}
            onClick={() => handleTabChange("orders")}
            aria-current={activeTab === "orders" ? "page" : undefined}
          >
            Мои заказы
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "history" ? styles.tabButtonActive : ""}`}
            onClick={() => handleTabChange("history")}
            aria-current={activeTab === "history" ? "page" : undefined}
          >
            История заказов
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "notifications" ? styles.tabButtonActive : ""}`}
            onClick={() => handleTabChange("notifications")}
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