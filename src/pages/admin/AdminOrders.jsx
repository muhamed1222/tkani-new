import { useState, useEffect } from "react";
import { adminAPI } from "../../http/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      
      const data = await adminAPI.getAllOrders(params);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.message || "Ошибка загрузки заказов");
      console.error("Ошибка загрузки заказов:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, comment = "") => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus, comment);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        const data = await adminAPI.getOrder(orderId);
        setSelectedOrder(data.order);
      }
    } catch (err) {
      setError(err.message || "Ошибка обновления статуса");
      console.error("Ошибка обновления статуса:", err);
    }
  };

  const statusLabels = {
    created: "Создан",
    paid: "Оплачен",
    shipped: "Отправлен",
    cancelled: "Отменен",
  };

  const statusColors = {
    created: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    shipped: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL.replace("/api/v1", "")}/static/products/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-accentDark">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-accentDark">Заказы</h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Все статусы</option>
          <option value="created">Создан</option>
          <option value="paid">Оплачен</option>
          <option value="shipped">Отправлен</option>
          <option value="cancelled">Отменен</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>
      )}

      {/* Таблица заказов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.user?.first_name} {order.user?.last_name}
                  <br />
                  <span className="text-gray-500">{order.user?.email}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.total} ₽
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Детали
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Назад
          </button>
          <span className="px-4 py-2">
            Страница {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Вперед
          </button>
        </div>
      )}

      {/* Модальное окно с деталями заказа */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-accentDark">Заказ #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Информация о пользователе */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Пользователь</h4>
                <p>
                  {selectedOrder.user?.first_name} {selectedOrder.user?.last_name}
                </p>
                <p className="text-gray-600">{selectedOrder.user?.email}</p>
                {selectedOrder.phone && (
                  <p className="text-gray-600 mt-1">
                    Телефон: <a href={`tel:${selectedOrder.phone}`} className="text-blue-600 hover:underline">{selectedOrder.phone}</a>
                  </p>
                )}
              </div>

              {/* Информация о доставке и оплате */}
              {(selectedOrder.delivery_address || selectedOrder.delivery_method || selectedOrder.payment_method) && (
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Доставка и оплата</h4>
                  {selectedOrder.delivery_address && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-medium">Адрес доставки:</span> {selectedOrder.delivery_address}
                    </p>
                  )}
                  {selectedOrder.delivery_method && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-medium">Способ доставки:</span> {selectedOrder.delivery_method}
                    </p>
                  )}
                  {selectedOrder.payment_method && (
                    <p className="text-gray-700">
                      <span className="font-medium">Способ оплаты:</span> {selectedOrder.payment_method}
                    </p>
                  )}
                </div>
              )}

              {/* Комментарий к заказу */}
              {selectedOrder.comment && (
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Комментарий</h4>
                  <p className="text-gray-700">{selectedOrder.comment}</p>
                </div>
              )}

              {/* Товары в заказе */}
              <div>
                <h4 className="font-semibold mb-2">Товары</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                      {getImageUrl(item.product?.image) && (
                        <img
                          src={getImageUrl(item.product.image)}
                          alt={item.product?.title}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.title}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {item.price} ₽ = {item.quantity * item.price} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Итого */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Итого:</span>
                  <span>{selectedOrder.total} ₽</span>
                </div>
              </div>

              {/* Изменение статуса */}
              <div>
                <h4 className="font-semibold mb-2">Изменить статус</h4>
                <div className="flex space-x-2">
                  {Object.keys(statusLabels).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedOrder.id, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded-md ${
                        selectedOrder.status === status
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-accentDark text-white hover:bg-opacity-90"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* История заказа */}
              {selectedOrder.history && selectedOrder.history.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">История изменений</h4>
                  <div className="space-y-2">
                    {selectedOrder.history.map((history, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {statusLabels[history.status] || history.status}
                          </span>
                          <span className="text-gray-600">
                            {new Date(history.created_at).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        {history.comment && (
                          <p className="text-gray-600 mt-1">{history.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

