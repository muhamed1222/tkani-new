import { useEffect, useContext } from "react";
import { observer } from "mobx-react-lite";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { WorkCard } from "../../components/workcard/WorkCard";
import { Context } from "../../main";
import styles from "./OurWorks.module.css";

export const OurWorks = observer(() => {
  const { works } = useContext(Context);

  // Загружаем работы при монтировании компонента
  useEffect(() => {
    works.fetchWorks(works.currentPage, works.itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= works.totalPages) {
      works.setCurrentPage(page);
      works.fetchWorks(page, works.itemsPerPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-[10px] items-center px-0 py-[20px] w-full bg-[#F1F0EE]">
      <div className="flex flex-col gap-[40px] items-start w-full max-w-[1440px] px-[20px] sm:px-[50px]">
        <div className="flex flex-col gap-[20px] items-start w-full">
          {/* Breadcrumbs */}
          <div className="flex gap-[8px] items-center py-0 w-full">
            <Breadcrumbs />
          </div>

          {/* Заголовок и количество товаров */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-[10px] w-full">
            <h1 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[28px] sm:text-[38px] tracking-[-0.8px] whitespace-nowrap">
              Работы из наших тканей
            </h1>
            <div className="flex gap-[10px] items-center justify-center pb-[6px]">
              <p className="font-inter font-medium leading-[1.2] text-[#888888] text-[16px] sm:text-[18px] tracking-[-0.4px] whitespace-nowrap">
                {works.totalItems} {works.totalItems === 1 ? "товар" : works.totalItems < 5 ? "товара" : "товаров"}
              </p>
            </div>
          </div>

          {/* Индикатор загрузки */}
          {works.isLoading && (
            <div className="flex items-center justify-center w-full py-[40px]">
              <p className="font-inter font-medium text-[#888888] text-[16px]">Загрузка...</p>
            </div>
          )}

          {/* Сообщение об ошибке */}
          {works.error && !works.isLoading && (
            <div className="flex items-center justify-center w-full py-[40px]">
              <p className="font-inter font-medium text-[#9b1e1c] text-[16px]">
                Ошибка загрузки: {works.error}
              </p>
            </div>
          )}

          {/* Сетка работ - адаптивная */}
          {!works.isLoading && (
            <div className="flex flex-col gap-[16px] items-start w-full">
              <div className={styles.worksGrid}>
                {works.works.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Пагинация */}
        {!works.isLoading && works.totalPages > 1 && (
          <div className="flex gap-[8px] items-center justify-center w-full">
            {/* Кнопка "Назад" */}
            <button
              onClick={() => handlePageChange(works.currentPage - 1)}
              disabled={works.currentPage === 1}
              className={`bg-white flex gap-[6px] h-[40px] items-center justify-center px-[13px] py-[9px] rounded-[10px] transition-colors ${
                works.currentPage === 1 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-[#F1F0EE] cursor-pointer"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                <path d="M5 3L9 7L5 11" stroke={works.currentPage === 1 ? "#C2C2C2" : "#4D4D4D"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={`font-inter font-medium leading-[1.2] text-[16px] ${
                works.currentPage === 1 ? "text-[#C2C2C2]" : "text-[#4D4D4D]"
              }`}>
                Назад
              </span>
            </button>

            {/* Номера страниц */}
            {Array.from({ length: works.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`flex flex-col gap-[10px] items-center justify-center px-[16px] py-[9px] rounded-[10px] h-[40px] w-[40px] transition-colors ${
                  works.currentPage === page
                    ? "bg-[#9b1e1c] text-white"
                    : "bg-white text-[#101010] hover:bg-[#F1F0EE]"
                }`}
              >
                <span className="font-inter font-medium leading-[1.2] text-[16px] text-center whitespace-nowrap">
                  {page}
                </span>
              </button>
            ))}

            {/* Кнопка "Вперед" */}
            <button
              onClick={() => handlePageChange(works.currentPage + 1)}
              disabled={works.currentPage === works.totalPages}
              className={`bg-white flex gap-[6px] h-[40px] items-center justify-center px-[13px] py-[9px] rounded-[10px] transition-colors ${
                works.currentPage === works.totalPages 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-[#F1F0EE] cursor-pointer"
              }`}
            >
              <span className={`font-inter font-medium leading-[1.2] text-[16px] ${
                works.currentPage === works.totalPages ? "text-[#C2C2C2]" : "text-[#4D4D4D]"
              }`}>
                Вперед
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3L9 7L5 11" stroke={works.currentPage === works.totalPages ? "#C2C2C2" : "#4D4D4D"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});