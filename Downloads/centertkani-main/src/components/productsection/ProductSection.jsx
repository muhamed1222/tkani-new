import { memo, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../productcard/ProductCard";
import { SHOP_ROUTE } from "../../utils/consts";
import styles from "./ProductSection.module.css";

export const ProductSection = memo(({ title, products = [], linkTo = SHOP_ROUTE, keyPrefix = "", noPadding = false }) => {
  // Отслеживаем размер окна для адаптивности
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1440; // Значение по умолчанию для SSR
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Определяем количество товаров для отображения в зависимости от устройства
  // Мемоизируем для избежания пересчета при каждом рендере
  const visibleProducts = useMemo(() => {
    // Для десктопа (1024px и выше) - всегда 4 товара
    // Важно: используем >= 1024, чтобы на всех размерах от 1024px (включая 1439px) показывалось 4 карточки
    if (windowWidth >= 1024) {
      return products.slice(0, 4);
    }
    // Для планшета (744px - 1023px) - 3 товара
    else if (windowWidth >= 744) {
      return products.slice(0, 3);
    }
    // Для телефона (до 743px) - 2 товара
    else {
      return products.slice(0, 2);
    }
  }, [products, windowWidth]);

  const containerClasses = noPadding 
    ? "max-w-[1340px] w-full mx-auto py-[22px] md:py-[34px] lg:py-[46px]" 
    : "max-w-[1340px] w-full mx-auto px-[14px] md:px-[16px] lg:px-[20px] py-[22px] md:py-[34px] lg:py-[46px]";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col gap-[16px]">
        {/* Заголовок блока */}
        <div className={`flex items-center ${noPadding ? '' : 'px-[10px]'} py-0 w-full`}>
          <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[26px] md:text-[32px] lg:text-[38px] tracking-[-0.8px] whitespace-nowrap">
            {title}
          </h2>
        </div>
        
        {/* Сетка товаров */}
        <div className={styles.productGrid}>
          {visibleProducts.map((product, index) => (
            <ProductCard 
              key={keyPrefix ? `${keyPrefix}-${product.id}` : product.id} 
              product={product} 
              showHover={true} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для React.memo
  return (
    prevProps.title === nextProps.title &&
    prevProps.linkTo === nextProps.linkTo &&
    prevProps.keyPrefix === nextProps.keyPrefix &&
    prevProps.noPadding === nextProps.noPadding &&
    prevProps.products.length === nextProps.products.length &&
    prevProps.products.every((product, index) => {
      const nextProduct = nextProps.products[index];
      return product && nextProduct && product.id === nextProduct.id;
    })
  );
});