import { useState, useRef } from "react";
import { ProductCard } from "../productcard/ProductCard";
import styles from "./ProductSection.module.css"; // Создайте файл стилей

export const ProductSection = ({ title, products, linkTo, keyPrefix = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const nextSlide = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Прокрутка контейнера при изменении currentIndex
  const scrollToCurrent = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // Примерная ширина карточки + gap
      scrollContainerRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  // Вызываем прокрутку при изменении currentIndex
  useState(() => {
    scrollToCurrent();
  }, [currentIndex]);

  const canGoNext = currentIndex < products.length - 1;
  const canGoPrev = currentIndex > 0;

  return (
    <div className="max-w-[1440px] w-full mx-auto">
      <div className="flex flex-col gap-[16px]">
        {/* Заголовок блока с навигацией */}
        <div className="flex items-center justify-between px-[10px] py-0 w-full">
          <div className="flex gap-[10px] items-center justify-center">
            <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[38px] tracking-[-0.8px] whitespace-nowrap">
              {title}
            </h2>
          </div>
          
         {/* Навигационные кнопки */}
<div className="flex gap-[10px] items-center">
  <button 
    className={`${styles.navButton} ${styles.prevButton} ${!canGoPrev ? styles.disabled : ''}`}
    onClick={prevSlide}
    disabled={!canGoPrev}
  >
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
  <button 
    className={`${styles.navButton} ${styles.nextButton} ${!canGoNext ? styles.disabled : ''}`}
    onClick={nextSlide}
    disabled={!canGoNext}
  >
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L7 7L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
</div>
        </div>
        
        {/* Контейнер для карточек с горизонтальным скроллом */}
        <div 
          ref={scrollContainerRef}
          className={styles.cardsContainer}
        >
         <div className={styles.cardsWrapper}>
  {products.map((product, index) => (
    <div 
      key={keyPrefix ? `${keyPrefix}-${product.id}` : product.id}
      className={styles.cardItem}
    >
      <ProductCard 
        product={product} 
        showHover={true} 
      />
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  );
};