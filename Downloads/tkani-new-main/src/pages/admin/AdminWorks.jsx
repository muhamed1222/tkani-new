import { useState, useEffect } from "react";
import { adminAPI } from "../../http/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const AdminWorks = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    link: "",
    tags: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getWorks();
      setWorks(data.works || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Ошибка загрузки данных");
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const workData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image,
        link: formData.link.trim() || undefined,
        tags: formData.tags.trim() || undefined,
      };

      if (editingWork) {
        await adminAPI.updateWork(editingWork.id, workData);
      } else {
        await adminAPI.createWork(workData);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || "Ошибка сохранения работы");
      console.error("Ошибка сохранения работы:", err);
    }
  };

  const handleEdit = (work) => {
    setEditingWork(work);
    setFormData({
      title: work.title || "",
      description: work.description || "",
      image: null,
      link: work.link || "",
      tags: work.tags || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (workId) => {
    if (!confirm("Вы уверены, что хотите удалить эту работу?")) {
      return;
    }

    try {
      await adminAPI.deleteWork(workId);
      loadData();
    } catch (err) {
      setError(err.message || "Ошибка удаления работы");
      console.error("Ошибка удаления работы:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      link: "",
      tags: "",
    });
    setEditingWork(null);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL.replace("/api/v1", "")}/static/works/${imagePath}`;
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
        <h2 className="text-2xl font-bold text-accentDark">Работы</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-accentDark text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          + Добавить работу
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>
      )}

      {/* Таблица работ */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Изображение</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {works.map((work) => (
              <tr key={work.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{work.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getImageUrl(work.image) ? (
                    <img
                      src={getImageUrl(work.image)}
                      alt={work.title}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{work.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {work.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(work)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(work.id)}
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-accentDark mb-4">
              {editingWork ? "Редактировать работу" : "Добавить работу"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ссылка
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Теги
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="тег1, тег2, тег3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Изображение
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {editingWork && editingWork.image && (
                    <p className="text-xs text-gray-500 mt-1">
                      Текущее: {editingWork.image}
                    </p>
                  )}
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
                  {editingWork ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

