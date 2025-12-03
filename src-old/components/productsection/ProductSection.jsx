import { Link } from "react-router-dom";
import { ProductCard } from "../productcard/ProductCard";
import { SHOP_ROUTE } from "../../utils/consts";
import styles from "./ProductSection.module.css";

export const ProductSection = ({ title, products, linkTo = SHOP_ROUTE, keyPrefix = "" }) => {
  return (
    <div className="max-w-[1440px] w-full mx-auto px-[20px] sm:px-[50px] py-[40px]">
      <div className="flex flex-col gap-[16px]">
        {/* Заголовок блока */}
        <div className="flex items-center justify-between px-[10px] py-0 w-full">
          <div className="flex gap-[10px] items-center justify-center">
            <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[38px] tracking-[-0.8px] whitespace-nowrap">
              {title}
            </h2>
          </div>
          <Link 
            to={linkTo}
            className="flex gap-[10px] items-center justify-center hover:opacity-80 transition-opacity"
          >
            <span className="font-inter font-medium leading-[1.2] text-[#9b1e1c] text-[16px] whitespace-nowrap">
              Посмотреть все
            </span>
          </Link>
        </div>
        
        {/* Сетка товаров */}
        <div className={styles.productGrid}>
          {products.map((product, index) => (
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
};