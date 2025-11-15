import { useState, useEffect } from "react";
import { adminAPI } from "../../http/api";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err.message || "Ошибка загрузки статистики");
      console.error("Ошибка загрузки статистики:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-accentDark">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statusLabels = {
    created: "Создан",
    paid: "Оплачен",
    shipped: "Отправлен",
    cancelled: "Отменен",
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-accentDark mb-6">Панель управления</h2>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Всего товаров</div>
          <div className="text-3xl font-bold text-accentDark">{stats.total_products}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Всего заказов</div>
          <div className="text-3xl font-bold text-accentDark">{stats.total_orders}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Всего пользователей</div>
          <div className="text-3xl font-bold text-accentDark">{stats.total_users}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Общая выручка</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.total_revenue.toLocaleString("ru-RU")} ₽
          </div>
        </div>
      </div>

      {/* Заказы по статусам */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold text-accentDark mb-4">Заказы по статусам</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.orders_by_status || {}).map(([status, count]) => (
            <div key={status} className="p-4 bg-gray-50 rounded">
              <div className="text-gray-600 text-sm">{statusLabels[status] || status}</div>
              <div className="text-2xl font-bold text-accentDark">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Товары с низким остатком */}
      {stats.low_stock_products > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-800 font-semibold">
              ⚠️ Внимание: {stats.low_stock_products} товаров с низким остатком (меньше 10 шт.)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

