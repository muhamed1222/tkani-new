import { observer } from "mobx-react-lite"
import styles from "./Shop.module.css"
import { Context } from "../../main";
import { useContext, useEffect, useMemo } from "react";
import { Slider } from "../../components/slider/Slider"
import { ProductSection } from "../../components/productsection/ProductSection";
import { SHOP_ROUTE } from "../../utils/consts";

export let Shop = observer(() => {
    const { tkans } = useContext(Context)
    
    // Загружаем товары и баннеры при монтировании компонента
    useEffect(() => {
        if (!tkans.tkans || tkans.tkans.length === 0 || tkans.tkans.length === 4) {
            tkans.fetchTkans();
        }
        tkans.fetchTypes();
        tkans.fetchBanners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Получаем баннеры из store
    const banners = tkans.banners;
    
    // Обрабатываем баннеры для слайдеров
    const processBannerData = (bannerList, defaultSlides, defaultTitle, defaultTextPosition = "left") => {
        if (bannerList.length > 0) {
            // Берем изображения из всех баннеров, используем fallback если нет изображения
            const slides = bannerList.map((banner, index) => {
                const img = banner.image;
                // Проверяем, что это валидный URL (не placeholder и не пустая строка)
                if (img && img !== '/placeholder-product.jpg' && img.trim() !== '') {
                    return img;
                }
                // Если нет изображения у баннера, используем fallback из defaultSlides
                const fallbackIndex = index % defaultSlides.length;
                return defaultSlides[fallbackIndex];
            });
            
            // totalSlides равен количеству баннеров (все баннеры должны показываться)
            const totalSlides = bannerList.length;
            
            return {
                slides: slides,
                title: defaultTitle,
                textPosition: defaultTextPosition,
                totalSlides: totalSlides
            };
        }
        
        return {
            slides: defaultSlides,
            title: defaultTitle,
            textPosition: defaultTextPosition,
            totalSlides: defaultSlides.length
        };
    };
    
    // Данные для левого слайдера (clothing)
    const leftSliderData = processBannerData(
        banners.clothing,
        [
            "/LeftSlider/IMG1.JPG",
            "/LeftSlider/IMG2.JPEG",
            "/LeftSlider/IMG3.PNG",
            "/LeftSlider/IMG4.PNG",
        ],
        ["ТКАНИ ДЛЯ", "ОДЕЖДЫ"],
        "left"
    );
    
    // Данные для правого слайдера (home)
    const rightSliderData = processBannerData(
        banners.home,
        [
            "/RightSlider/IMG1.PNG",
            "/RightSlider/IMG2.JPG",
            "/RightSlider/IMG3.JPEG",
            "/RightSlider/IMG4.PNG",
        ],
        ["ТКАНИ ДЛЯ", "ДОМА"],
        "right"
    );
    
    // Мемоизируем вычисления для оптимизации
    const productsData = useMemo(() => {
        const allProducts = tkans.tkans || [];
        
        // 1. Новинки - сортируем по новизне (по ID или дате создания)
        const newArrivals = [...allProducts]
            .sort((a, b) => {
                // Сортируем по ID в обратном порядке (предполагая что новые товары имеют больший ID)
                // Или можно использовать createdAt если есть такое поле
                return b.id - a.id;
            })
            .slice(0, 4);
        
        // 2. Акции и скидки - только товары со скидкой больше 0%
        const discountedProducts = allProducts
            .filter(product => product.discount > 0)
            .slice(0, 4);
        
        // 3. Комбинации - случайные товары из всех категорий
        // Используем стабильную сортировку на основе ID для избежания пересортировки при каждом рендере
        const shuffled = [...allProducts].sort((a, b) => {
            // Используем ID для стабильной "случайной" сортировки
            const seed = (a.id || 0) + (b.id || 0);
            return (seed % 3) - 1; // Простая псевдослучайная сортировка
        });
        const combinations = shuffled.slice(0, 4);
        
        // 4. Фурнитура - еще одна выборка случайных товаров из всех категорий
        // Используем другую сортировку для получения других товаров
        const shuffledForFurniture = [...allProducts].sort((a, b) => {
            // Используем ID для другой стабильной "случайной" сортировки
            const seed = (a.id || 0) * 2 + (b.id || 0);
            return (seed % 5) - 2; // Другая псевдослучайная сортировка
        });
        const furniture = shuffledForFurniture.slice(0, 4);
        
        // 5. Рекомендованные товары - популярные товары (можно использовать товары с наибольшим ID или другие критерии)
        const recommended = [...allProducts]
            .sort((a, b) => {
                // Сортируем по ID в обратном порядке, но используем другую логику для разнообразия
                return (b.id || 0) - (a.id || 0);
            })
            .slice(0, 4);
        
        // Убеждаемся, что каждая секция содержит минимум 4 товара (или все доступные, если меньше)
        // Для Фурнитуры стараемся выбрать другие товары, начиная с индекса 4, если их достаточно
        const furnitureFallback = allProducts.length >= 8 
            ? allProducts.slice(4, 8) 
            : (allProducts.length >= 4 ? allProducts.slice(0, Math.min(4, allProducts.length)) : furniture);
        
        return {
            newArrivals: newArrivals.length >= 4 ? newArrivals : (allProducts.length >= 4 ? allProducts.slice(0, 4) : newArrivals),
            discountedProducts: discountedProducts.length >= 4 
                ? discountedProducts 
                : (discountedProducts.length > 0 
                    ? discountedProducts 
                    : allProducts.slice(0, Math.min(4, allProducts.length))),
            combinations: combinations.length >= 4 ? combinations : (allProducts.length >= 4 ? allProducts.slice(0, 4) : combinations),
            furniture: furniture.length >= 4 ? furniture : furnitureFallback,
            recommended: recommended.length >= 4 ? recommended : (allProducts.length >= 4 ? allProducts.slice(0, 4) : recommended)
        };
    }, [tkans.tkans]);
    
    return(
        <>
{/* Слайдеры - показываем только если есть баннеры из Strapi */}
{(leftSliderData.totalSlides > 0 || rightSliderData.totalSlides > 0) && (
<div className="max-w-[1440px] w-full mx-auto px-[14px] md:px-[16px] lg:px-[20px] py-[12px] md:py-[16px]">
  <div className="flex flex-col lg:flex-row gap-[16px] h-[700px] md:h-[760px] lg:h-[640px]">
      {leftSliderData.totalSlides > 0 && (
    <Slider 
      slides={leftSliderData.slides}
      title={leftSliderData.title}
      textPosition={leftSliderData.textPosition}
      totalSlides={leftSliderData.totalSlides}
    />
      )}
      {rightSliderData.totalSlides > 0 && (
    <Slider 
      slides={rightSliderData.slides}
      title={rightSliderData.title}
      textPosition={rightSliderData.textPosition}
      totalSlides={rightSliderData.totalSlides}
    />
      )}
  </div>
</div>
)}
        
        {/* Блоки товаров */}
        {tkans.isLoading ? (
            <div className="flex justify-center items-center py-[40px] md:py-[16px]">
                <div className="text-[#888888] text-[16px]">Загрузка товаров...</div>
            </div>
        ) : tkans.error ? (
            <div className="flex justify-center items-center py-[40px] md:py-[16px]">
                <div className="text-[#9b1e1c] text-[16px]">Ошибка загрузки: {tkans.error}</div>
            </div>
        ) : (
            <>
                {/* Новинки - сортировка по новизне */}
                <ProductSection 
                    title="Новинки" 
                    products={productsData.newArrivals} 
                    linkTo={SHOP_ROUTE}
                    keyPrefix="new"
                />
                
                {/* Акции и скидки - только товары со скидкой */}
                <ProductSection 
                    title="Акции и скидки" 
                    products={productsData.discountedProducts} 
                    linkTo={SHOP_ROUTE}
                    keyPrefix="discounts"
                />
                
                {/* Комбинации - случайные товары */}
                <ProductSection 
                    title="Комбинации" 
                    products={productsData.combinations} 
                    linkTo={SHOP_ROUTE}
                    keyPrefix="combinations"
                />
                
                {/* Фурнитура - случайные товары */}
                <ProductSection 
                    title="Фурнитура" 
                    products={productsData.furniture} 
                    linkTo={SHOP_ROUTE}
                    keyPrefix="furniture"
                />
            </>
        )}
        
        {/* Блок "О нас" */}
<div className="flex gap-[32px] items-start justify-center px-[14px] md:px-[16px] lg:px-[20px] py-[40px] w-full max-w-[1340px] mx-auto">
    <div className="bg-white flex flex-col items-center justify-center p-[24px] md:p-[40px] lg:p-[64px] rounded-[16px] w-full max-w-[1340px] mx-auto">
        <div className="flex flex-col gap-[32px] items-start w-full">
            {/* Заголовок */}
            <div className="flex flex-col items-center w-full">
                {/* Приветствие */}
                <p className="font-inter text-[#888888] text-center whitespace-nowrap
                    text-[16px] font-medium leading-[1.2]
                    md:text-[16px] md:leading-[120%]
                    sm:text-[14px] sm:leading-[120%]">
                    Дорогие покупатели!
                </p>
                {/* Основной заголовок */}
                <h2 className="font-inter font-semibold text-[#101010] text-center tracking-[-0.8px] w-full whitespace-pre-wrap
                    text-[26px] leading-[1.2]
                    md:text-[32px] md:leading-[120%]
                    lg:text-[38px] lg:leading-[1.2]">
                    Магазин натуральных тканей
                </h2>
            </div>
            
            {/* Две карточки с текстом */}
            <div className="flex flex-col md:flex-row gap-[16px] items-stretch w-full">
                {/* Первая карточка */}
                <div className="bg-[#f1f0ee] flex flex-1 flex-col items-center justify-center rounded-[16px]
                    h-[250px] p-[24px] w-full
                    md:h-auto md:min-h-[250px] md:p-[40px]
                    lg:h-[250px] lg:p-[64px]">
                    <p className="font-inter text-[#101010] text-center tracking-[-0.48px] w-full
                        text-[16px] font-medium leading-[24px]
                        md:text-[15px] md:leading-[24px]
                        lg:text-[14px] lg:leading-[24px]">
                        <span className="font-bold">«Центр ткани»</span>
                        <span>{` — это магазин натуральных тканей и трикотажа высокого качества. У нас вы найдёте широкий выбор материалов для одежды и текстиля: хлопок, лен, футер и многое другое.`}</span>
                    </p>
                </div>
                
                {/* Вторая карточка */}
                <div className="bg-[#f1f0ee] flex flex-1 flex-col items-center justify-center rounded-[16px]
                    h-[250px] p-[24px] w-full
                    md:h-auto md:min-h-[250px] md:p-[40px]
                    lg:h-[250px] lg:p-[64px]">
                    <p className="font-inter text-[#101010] text-center tracking-[-0.48px] w-full
                        text-[16px] font-medium leading-[24px]
                        md:text-[15px] md:leading-[24px]
                        lg:text-[14px] lg:leading-[24px]">
                        <span>{`Мы работаем с 2020 года и сотрудничаем напрямую с ведущими фабриками `}</span>
                        <span className="font-bold">Турции, Беларуси и Китая</span>
                        <span>{`. Среди наших партнёров — `}</span>
                        <span className="font-bold">Sabaev, Wella, IPEKER, Оршанский льнокомбинат</span>
                        <span>{` и другие известные производители.`}</span>
                    </p>
                </div>
            </div>
                    {/* Футер */}
        <div className="flex gap-[10px] items-center justify-center w-full">
            <p className="font-inter font-medium text-[#101010] text-center max-w-[592px] whitespace-pre-wrap
                text-[16px] leading-[1.2]
                md:text-[16px] md:leading-[120%]
                sm:text-[14px] sm:leading-[120%]">
                Мы всегда стараемся радовать вас актуальными коллекциями и качественным обслуживанием.
            </p>
        </div>
        </div>
    </div>
</div>
                
        </>
    )
})