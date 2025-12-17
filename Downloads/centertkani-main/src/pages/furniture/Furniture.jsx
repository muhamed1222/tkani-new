// src/pages/furniture/Furniture.jsx
import { observer } from "mobx-react-lite";
import { useContext, useState, useEffect } from "react";
import { Context } from "../../main";
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from "../../components/breadcrumbs";
import { ProductCard } from "../../components/productcard/ProductCard";
import { FURNITURE_ROUTE } from "../../utils/consts";
import styles from "./Furniture.module.css";

export const Furniture = observer(() => {
  const context = useContext(Context);
  const { tkans } = context;
  const breadcrumbs = useAutoBreadcrumbs({ context });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 15 товаров на странице

  // Загрузка товаров фурнитуры
  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      if (!isMounted) return;
      
      // Пока загружаем все товары, позже можно добавить фильтрацию по категории фурнитуры
      await tkans.fetchTkans();
      
      if (isMounted) {
        setCurrentPage(1); // Сбрасываем на первую страницу
      }
    };

    loadProducts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const products = tkans.tkans || [];

  // Логика пагинации
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Функция для отображения номеров страниц
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;
    
    if (totalPages <= maxVisiblePages) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Показываем первую, последнюю и текущую с соседями
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4);
      } else if (currentPage >= totalPages - 2) {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Прокрутка к верху страницы при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-[10px] items-center px-0 py-[20px] w-full min-h-screen bg-[#F1F0EE]">
      <div className={`flex flex-col gap-[16px] items-start w-full max-w-[1440px] px-[14px] md:px-[16px] lg:px-[20px] ${styles.containerPadding}`}>
        {/* Breadcrumbs */}
        <BreadcrumbsCompressed items={breadcrumbs} />
      </div>

      {/* Заголовок категории */}
      <div className="bg-[rgba(155,30,28,0.1)] flex items-center justify-center px-[20px] sm:px-[30px] py-[14px] w-full">
        <h1 className="font-inter font-semibold leading-[1.2] text-[#9b1e1c] text-[26px] md:text-[32px] lg:text-[38px] tracking-[-0.8px] whitespace-nowrap">
          Фурнитура
        </h1>
      </div>

      <div className={`flex flex-col gap-[16px] items-start w-full max-w-[1440px] px-[14px] md:px-[16px] lg:px-[20px] ${styles.containerPadding}`}>
        {/* Основной контент */}
        <div className="flex items-start py-0 w-full">
          {/* Сетка товаров */}
          <div className="flex flex-1 flex-col items-start min-w-0 w-full">
            <div className="flex flex-col gap-[24px] items-start w-full">
              {/* Заголовок и количество товаров */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-[10px] w-full">
                <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[26px] md:text-[32px] lg:text-[38px] tracking-[-0.8px] whitespace-nowrap">
                  Все товары
                </h2>
                <div className="flex gap-[10px] items-center justify-center pb-[6px]">
                  <p className="font-inter font-medium leading-[1.2] text-[#888888] text-[16px] sm:text-[18px] tracking-[-0.4px] whitespace-nowrap">
                    {products.length} {products.length === 1 ? "товар" : products.length < 5 ? "товара" : "товаров"}
                  </p>
                </div>
              </div>

              {/* Индикатор загрузки */}
              {tkans.isLoading && (
                <div className="w-full text-center py-8">
                  <p>Загрузка товаров...</p>
                </div>
              )}

              {/* Сообщение об ошибке */}
              {tkans.error && (
                <div className="w-full text-center py-8 text-red-500">
                  <p>Ошибка загрузки: {tkans.error}</p>
                </div>
              )}

              {/* Сетка товаров */}
              {!tkans.isLoading && !tkans.error && (
                <>
                  <div className={`grid w-full ${styles.productsGrid}`}>
                    {currentProducts.map((product) => (
                      <ProductCard key={product.id} product={product} showHover={true} />
                    ))}
                  </div>

                  {/* Сообщение если товаров нет */}
                  {currentProducts.length === 0 && (
                    <div className="w-full text-center py-8">
                      <p>Товары отсутствуют</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Пагинация - показываем только если есть больше 1 страницы */}
            {!tkans.isLoading && !tkans.error && totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 w-full">
                <div className="flex items-center gap-2 bg-white p-4 rounded-2xl">
                  {/* Кнопка "Назад" */}
                  <button
                    className={`h-10 flex items-center justify-center gap-[6px] px-[13px] py-[9px] rounded-[10px] transition-all ${
                      currentPage === 1 
                        ? "bg-white cursor-not-allowed opacity-60" 
                        : "bg-white hover:bg-[#E4E2DF]"
                    }`}
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M9 3L5 7L9 11" 
                        stroke={currentPage === 1 ? "#C2C2C2" : "#4D4D4D"} 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={`text-[16px] font-medium leading-[1.2] ${currentPage === 1 ? "text-[#C2C2C2]" : "text-[#4D4D4D]"}`}>
                      Назад
                    </span>
                  </button>

                  {/* Номера страниц */}
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[16px] font-medium transition-all ${
                        currentPage === page
                          ? "bg-[#9B1E1C] text-white"
                          : "bg-white text-[#101010] hover:bg-[#E4E2DF]"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Кнопка "Вперед" */}
                  <button
                    className={`h-10 flex items-center justify-center gap-[6px] px-[13px] py-[9px] rounded-[10px] transition-all ${
                      currentPage === totalPages 
                        ? "bg-white cursor-not-allowed opacity-60" 
                        : "bg-white hover:bg-[#E4E2DF]"
                    }`}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span className={`text-[16px] font-medium leading-[1.2] ${currentPage === totalPages ? "text-[#C2C2C2]" : "text-[#4D4D4D]"}`}>
                      Вперед
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M5 3L9 7L5 11" 
                        stroke={currentPage === totalPages ? "#C2C2C2" : "#4D4D4D"} 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});



