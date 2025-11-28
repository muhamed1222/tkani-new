import { useState, useEffect } from "react";
import { adminAPI, catalogAPI } from "../../http/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Пагинация и фильтрация
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Для отображения в input
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    brand_id: "",
    image: null,
    discount: "",
    discount_price: "",
    article: "",
    composition: "",
    width: "",
    density: "",
    country: "",
    is_new: false,
    images: [],
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, searchQuery, filterCategory, filterBrand, filterStock]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Формируем параметры запроса
      const params = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (searchQuery) {
        params.q = searchQuery;
      }
      if (filterCategory) {
        params.category_id = filterCategory;
      }
      if (filterBrand) {
        params.brand_id = filterBrand;
      }
      if (filterStock) {
        params.stock_status = filterStock;
      }
      
      const [productsData, categoriesData, brandsData] = await Promise.all([
        adminAPI.getProducts(params),
        catalogAPI.getCategories(),
        catalogAPI.getBrands(),
      ]);
      
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
      setBrands(brandsData.brands || []);
      
      // Обновляем пагинацию
      if (productsData.pagination) {
        setPagination({
          total: productsData.pagination.total || 0,
          pages: productsData.pagination.pages || 0,
        });
      }
      
      setError(null);
    } catch (err) {
      setError(err.message || "Ошибка загрузки данных");
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Обработка поиска с debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Обновляем отображаемое значение сразу
    setCurrentPage(1); // Сбрасываем на первую страницу при поиске
    
    // Debounce для поиска
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearchQuery(value); // Обновляем реальный запрос через 500мс
    }, 500);
    
    setSearchTimeout(timeout);
  };
  
  // Обработка изменения фильтров
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтра
    
    switch (filterType) {
      case 'category':
        setFilterCategory(value);
        break;
      case 'brand':
        setFilterBrand(value);
        break;
      case 'stock':
        setFilterStock(value);
        break;
      default:
        break;
    }
  };
  
  // Обработка пагинации
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] || null });
    } else if (name === "images") {
      setFormData({ ...formData, images: Array.from(files || []) });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        image: formData.image,
        discount: formData.discount ? parseInt(formData.discount) : undefined,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : undefined,
        article: formData.article || undefined,
        composition: formData.composition || undefined,
        width: formData.width || undefined,
        density: formData.density || undefined,
        country: formData.country || undefined,
        is_new: formData.is_new,
        images: formData.images.length > 0 ? formData.images : undefined,
      };

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, productData);
      } else {
        await adminAPI.createProduct(productData);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || "Ошибка сохранения товара");
      console.error("Ошибка сохранения товара:", err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      stock: product.stock || "",
      category_id: product.category_id || "",
      brand_id: product.brand_id || "",
      image: null,
      discount: product.discount || "",
      discount_price: product.discount_price || "",
      article: product.article || "",
      composition: product.composition || "",
      width: product.width || "",
      density: product.density || "",
      country: product.country || "",
      is_new: product.is_new || false,
      images: [],
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) {
      return;
    }

    try {
      await adminAPI.deleteProduct(productId);
      loadData();
    } catch (err) {
      setError(err.message || "Ошибка удаления товара");
      console.error("Ошибка удаления товара:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      brand_id: "",
      image: null,
      discount: "",
      discount_price: "",
      article: "",
      composition: "",
      width: "",
      density: "",
      country: "",
      is_new: false,
      images: [],
    });
      setEditingProduct(null);
  };
  
  // Очистка timeout при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

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
        <h2 className="text-2xl font-bold text-accentDark">Товары</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-accentDark text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          + Добавить товар
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">{error}</div>
      )}

      {/* Поиск и фильтры */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Поиск */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Поиск по названию или описанию..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Фильтр по категории */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              value={filterCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по бренду */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Бренд
            </label>
            <select
              value={filterBrand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Все бренды</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по наличию */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Наличие
            </label>
            <select
              value={filterStock}
              onChange={(e) => handleFilterChange('stock', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Все</option>
              <option value="in_stock">В наличии</option>
              <option value="out_of_stock">Нет в наличии</option>
              <option value="low_stock">Мало на складе</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица товаров */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Изображение</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Остаток</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getImageUrl(product.image) ? (
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.title}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.price} ₽
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Страница {currentPage} из {pagination.pages} (всего: {pagination.total})
            </span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-4 border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="10">10 на странице</option>
              <option value="20">20 на странице</option>
              <option value="50">50 на странице</option>
              <option value="100">100 на странице</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперед
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно для создания/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-accentDark mb-4">
              {editingProduct ? "Редактировать товар" : "Добавить товар"}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Остаток
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Бренд
                    </label>
                    <select
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Выберите бренд</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Скидка (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена со скидкой
                    </label>
                    <input
                      type="number"
                      name="discount_price"
                      value={formData.discount_price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Артикул
                  </label>
                  <input
                    type="text"
                    name="article"
                    value={formData.article}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Состав
                    </label>
                    <input
                      type="text"
                      name="composition"
                      value={formData.composition}
                      onChange={handleInputChange}
                      placeholder="100% хлопок"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ширина
                    </label>
                    <input
                      type="text"
                      name="width"
                      value={formData.width}
                      onChange={handleInputChange}
                      placeholder="150см"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Плотность
                    </label>
                    <input
                      type="text"
                      name="density"
                      value={formData.density}
                      onChange={handleInputChange}
                      placeholder="90гр"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Страна производства
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Россия"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={formData.is_new}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-accentDark border-gray-300 rounded focus:ring-accentDark"
                    />
                    <span className="text-sm font-medium text-gray-700">Новинка</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Главное изображение
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {editingProduct && editingProduct.image && (
                    <p className="text-xs text-gray-500 mt-1">
                      Текущее: {editingProduct.image}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дополнительные изображения
                  </label>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {formData.images.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Выбрано файлов: {formData.images.length}
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
                  {editingProduct ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

