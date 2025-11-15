import { useState, useEffect } from "react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminProducts } from "./AdminProducts";
import { AdminOrders } from "./AdminOrders";
import { AdminUsers } from "./AdminUsers";
import { AdminCategories } from "./AdminCategories";
import { AdminBrands } from "./AdminBrands";
import { AdminWorks } from "./AdminWorks";
import { authAPI } from "../../http/api";
import { useNavigate } from "react-router-dom";

export const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authAPI.checkAuth();
      
      if (data.user && data.user.role === "admin") {
        setUser(data.user);
      } else {
        // Перенаправляем, если не админ
        navigate("/");
      }
    } catch (err) {
      console.error("Ошибка проверки авторизации:", err);
      // Если ошибка авторизации, перенаправляем на страницу входа
      if (err.status === 401) {
        navigate("/login");
      } else {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-accentDark">Загрузка...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
          <p className="text-gray-600 mb-4">
            У вас нет прав для доступа к админ-панели.
          </p>
          <p className="text-sm text-gray-500">
            Ваша роль: {user?.role || "не определена"}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Панель управления", icon: "📊" },
    { id: "products", label: "Товары", icon: "📦" },
    { id: "categories", label: "Категории", icon: "📂" },
    { id: "brands", label: "Бренды", icon: "🏷️" },
    { id: "works", label: "Работы", icon: "🎨" },
    { id: "orders", label: "Заказы", icon: "🛒" },
    { id: "users", label: "Пользователи", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-accentDark">Админ-панель</h1>
          <p className="text-gray-600 mt-1">
            Добро пожаловать, {user.first_name} {user.last_name}
          </p>
        </div>
      </div>

      {/* Табы */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-accentDark text-accentDark"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "categories" && <AdminCategories />}
        {activeTab === "brands" && <AdminBrands />}
        {activeTab === "works" && <AdminWorks />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "users" && <AdminUsers />}
      </div>
    </div>
  );
};
