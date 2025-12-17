import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Context } from "../../main";
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from "../../components/breadcrumbs";
import { ProductCard } from "../../components/productcard/ProductCard";

export const Discounts = observer(() => {
  const context = useContext(Context);
  const { tkans } = context;
  const breadcrumbs = useAutoBreadcrumbs({ context });
  
  // Получаем все товары для отображения
  const products = tkans.tkans || [];

  return (
    <div className="flex flex-col gap-[10px] items-center px-0 py-[20px] w-full bg-[#F1F0EE]">
      <div className="flex flex-col gap-[20px] items-start w-full max-w-[1440px] px-[14px] md:px-[16px] lg:px-[20px]">
        {/* Breadcrumbs */}
        <BreadcrumbsCompressed items={breadcrumbs} />

        {/* Заголовок и количество товаров */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-[10px] w-full">
          <h1 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[26px] md:text-[32px] lg:text-[38px] tracking-[-0.8px] whitespace-nowrap">
            Скидки и акции
          </h1>
          <div className="flex gap-[10px] items-center justify-center pb-[6px]">
            <p className="font-inter font-medium leading-[1.2] text-[#888888] text-[16px] sm:text-[18px] tracking-[-0.4px] whitespace-nowrap">
              {products.length} {products.length === 1 ? "товар" : products.length < 5 ? "товара" : "товаров"}
            </p>
          </div>
        </div>

        {/* Сетка товаров - адаптивная */}
      <div className="flex flex-col gap-[16px] items-start w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[10px] md:gap-[12px] xl:gap-[14px] w-full">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showHover={true} />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
});

