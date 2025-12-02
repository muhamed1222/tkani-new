import { useState, useEffect } from "react";
import { adminAPI } from "../../http/api";

export const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getBrands();
      setBrands(data.brands || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Ошибка загрузки данных");
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const brandData = {
        name: formData.name.trim(),
      };

      if (editingBrand) {
        await adminAPI.updateBrand(editingBrand.id, brandData);
      } else {
        await adminAPI.createBrand(brandData);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || "Ошибка сохранения бренда");
      console.error("Ошибка сохранения бренда:", err);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (brandId) => {
    if (!confirm("Вы уверены, что хотите удалить этот бренд?")) {
      return;
    }

    try {
      await adminAPI.deleteBrand(brandId);
      loadData();
    } catch (err) {
      setError(err.message || "Ошибка удаления бренда");
      console.error("Ошибка удаления бренда:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
    });
    setEditingBrand(null);
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
        <h2 className="text-2xl font-bold text-accentDark">Бренды</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-accentDark text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          + Добавить бренд
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>
      )}

      {/* Таблица брендов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{brand.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{brand.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно для создания/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-accentDark mb-4">
              {editingBrand ? "Редактировать бренд" : "Добавить бренд"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accentDark text-white rounded-md hover:bg-opacity-90"
                >
                  {editingBrand ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

