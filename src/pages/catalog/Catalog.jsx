import { observer } from "mobx-react-lite";
import { useContext, useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { ProductCard } from "../../components/productcard/ProductCard";
import { CATALOG_ROUTE } from "../../utils/consts";
import { getClothingCategoriesForCatalog, getHomeCategoriesForCatalog } from "../../utils/catalogCategories";
import styles from "./Catalog.module.css";

export const Catalog = observer(() => {
  const { tkans } = useContext(Context);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  
  // Определяем тип каталога: "home" (для дома) или "clothing" (для одежды)
  const catalogType = location.pathname.includes('/catalog-clothing') ? 'clothing' : 'home';
  const catalogTitle = catalogType === 'clothing' ? 'Для одежды' : 'Для дома';
  const catalogRoute = catalogType === 'clothing' ? '/catalog-clothing' : CATALOG_ROUTE;
  
  const [expandedFilters, setExpandedFilters] = useState({});

  // Категории тканей (используем единый источник данных)
  const fabricTypesHome = getHomeCategoriesForCatalog();
  const fabricTypesClothing = getClothingCategoriesForCatalog();

  const fabricTypes = catalogType === 'clothing' ? fabricTypesClothing : fabricTypesHome;

  // Получаем первую категорию (которая будет скрыта в фильтрах)
  const firstCategory = fabricTypes.find(f => !f.parentId && !f.isSubItem);

  // Редирект на первую категорию, если открыт базовый маршрут каталога
  useEffect(() => {
    if (!params.category && location.pathname === catalogRoute && firstCategory) {
      navigate(`${catalogRoute}/${firstCategory.slug}`, { replace: true });
    }
  }, [location.pathname, catalogRoute, params.category, navigate, firstCategory?.slug]);

  const toggleFilter = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const filter = fabricTypes.find(f => f.id === id);
    if (filter?.hasSubmenu) {
      setExpandedFilters(prev => ({
        ...prev,
        [id]: prev[id] !== undefined ? !prev[id] : !(filter.expanded || false)
      }));
    }
  };

  // Проверяем, должен ли фильтр отображаться
  const shouldShowFilter = (filter) => {
    if (!filter.parentId) return true;
    const parent = fabricTypes.find(f => f.id === filter.parentId);
    if (!parent) return true;
    const isParentExpanded = expandedFilters[parent.id] !== undefined 
      ? expandedFilters[parent.id] 
      : (parent.expanded || false);
    return isParentExpanded;
  };

  // Получаем состояние развернутости с учетом начальных значений
  const getIsExpanded = (filter) => {
    if (expandedFilters[filter.id] !== undefined) {
      return expandedFilters[filter.id];
    }
    return filter.expanded || false;
  };

  // Определяем текущую активную категорию из URL
  const currentCategory = params.category || null;
  const isActive = (slug) => {
    if (!currentCategory) return false;
    return currentCategory === slug;
  };

  // Получаем название текущей категории
  const getCurrentCategoryName = () => {
    if (!currentCategory) {
      // Если нет категории в URL, используем первую категорию
      return firstCategory ? firstCategory.name : "Однотон / Страйп";
    }
    const category = fabricTypes.find(f => f.slug === currentCategory);
    return category ? category.name : "Однотон / Страйп";
  };

  // Получаем все товары для отображения
  const products = tkans.tkans || [];

  return (
    <div className="flex flex-col gap-[10px] items-center px-0 py-[20px] w-full min-h-screen bg-[#F1F0EE]">
        <div className="flex flex-col gap-[16px] items-start w-full max-w-[1440px] px-[20px] sm:px-[50px]">
          {/* Breadcrumbs */}
          <div className="flex gap-[8px] items-center py-0 w-full">
            <Breadcrumbs />
          </div>
        </div>

        {/* Заголовок категории - на всю ширину */}
        <div className="bg-[rgba(155,30,28,0.1)] flex items-center justify-center px-[20px] sm:px-[30px] py-[14px] w-full">
          <h1 className="font-inter font-semibold leading-[1.2] text-[#9b1e1c] text-[28px] sm:text-[38px] tracking-[-0.8px] whitespace-nowrap">
            {catalogTitle}
          </h1>
        </div>

        <div className="flex flex-col gap-[16px] items-start w-full max-w-[1440px] px-[20px] sm:px-[50px]">
          {/* Основной контент: фильтры и товары */}
          <div className="flex flex-col lg:flex-row gap-[32px] items-start py-0 w-full">
            {/* Боковая панель навигации по категориям */}
            <div className="flex flex-col gap-[5px] items-start w-full lg:w-[300px] shrink-0">
              {fabricTypes.map((type) => {
                if (!shouldShowFilter(type)) return null;
                
                const isExpanded = getIsExpanded(type);
                const isActiveCategory = isActive(type.slug);
                const isSubItem = type.isSubItem;
                const hasSubmenu = type.hasSubmenu;

                return (
                  <div key={type.id} className={`w-full ${isSubItem ? "mt-0" : ""}`}>
                    <div className={`flex items-center justify-between px-[8px] py-[7px] rounded-[8px] w-full transition-colors ${
                      isActiveCategory || (isExpanded && hasSubmenu)
                        ? "bg-[#e4e2df]"
                        : "hover:bg-[#e4e2df]"
                    }`}>
                      <Link
                        to={`${catalogRoute}/${type.slug}`}
                        className={`flex-1 ${isSubItem ? "pl-[18px] pr-[5px]" : ""}`}
                      >
                        <span
                          className={`font-inter font-medium leading-[1.2] text-[16px] whitespace-nowrap ${
                            isSubItem ? "text-[#888888]" : "text-[#4d4d4d]"
                          } ${isActiveCategory ? "text-[#9b1e1c]" : ""}`}
                        >
                          {type.name}
                        </span>
                      </Link>
                      {hasSubmenu && (
                        <button
                          type="button"
                          className="flex items-center justify-center w-[16px] h-[16px] transition-transform ml-[8px] flex-shrink-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFilter(type.id, e);
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path
                              d="M6 4L10 8L6 12"
                              stroke="#4D4D4D"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Сетка товаров */}
            <div className="flex flex-[1_0_0] flex-col items-start min-h-px min-w-px w-full">
              <div className="flex flex-col gap-[24px] items-start w-full">
                {/* Заголовок и количество товаров */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-[10px] w-full">
                  <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[28px] sm:text-[38px] tracking-[-0.8px] whitespace-nowrap">
                    {getCurrentCategoryName()}
                  </h2>
                  <div className="flex gap-[10px] items-center justify-center pb-[6px]">
                    <p className="font-inter font-medium leading-[1.2] text-[#888888] text-[16px] sm:text-[18px] tracking-[-0.4px] whitespace-nowrap">
                      {products.length} {products.length === 1 ? "товар" : products.length < 5 ? "товара" : "товаров"}
                    </p>
                  </div>
                </div>

                {/* Сетка товаров - 3 колонки */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] w-full">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} showHover={true} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
});

