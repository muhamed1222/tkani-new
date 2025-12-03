import { observer } from "mobx-react-lite"
import styles from "./Shop.module.css"
import { Context } from "../../main";
import { useContext, useEffect, useMemo } from "react";
import { Slider } from "../../components/slider/Slider"
import { ProductSection } from "../../components/productsection/ProductSection";
import { SHOP_ROUTE } from "../../utils/consts";

export let Shop = observer(() => {
    const { tkans } = useContext(Context)
    
    // Загружаем товары при монтировании компонента
    useEffect(() => {
        if (!tkans.tkans || tkans.tkans.length === 0 || tkans.tkans.length === 4) {
            tkans.fetchTkans();
        }
        tkans.fetchTypes();
        tkans.fetchBrands();
    }, []);
    
    const leftSlides = [
        "/LeftSlider/IMG1.JPG",
        "/LeftSlider/IMG2.JPEG",
        "/LeftSlider/IMG3.PNG",
        "/LeftSlider/IMG4.PNG",
    ];
    
    const rightSlides = [
        "/RightSlider/IMG1.PNG",
        "/RightSlider/IMG2.JPG",
        "/RightSlider/IMG3.JPEG",
        "/RightSlider/IMG4.PNG",
    ];
    
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
        const combinations = [...allProducts]
            .sort(() => Math.random() - 0.5) // Перемешиваем массив
            .slice(0, 4);
        
        return {
            newArrivals,
            discountedProducts,
            combinations
        };
    }, [tkans.tkans]);
    
    return(
        <>
        {/* Слайдеры */}
        <div className="max-w-[1440px] w-full mx-auto px-[20px] py-[40px]">
            <div className="flex flex-col md:flex-row gap-[16px]">
                <Slider 
                    slides={leftSlides}
                    title={["ТКАНИ ДЛЯ", "ОДЕЖДЫ"]}
                    textPosition="left"
                    totalSlides={4}
                />
                <Slider 
                    slides={rightSlides}
                    title={["ТКАНИ ДЛЯ", "ДОМА"]}
                    textPosition="right"
                    totalSlides={4}
                />
            </div>
        </div>
        
        {/* Блоки товаров */}
        {tkans.isLoading ? (
            <div className="flex justify-center items-center py-[40px]">
                <div className="text-[#888888] text-[16px]">Загрузка товаров...</div>
            </div>
        ) : tkans.error ? (
            <div className="flex justify-center items-center py-[40px]">
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
            </>
        )}
        
        {/* Блок "О нас" */}
        <div className="flex gap-[32px] items-start justify-center px-0 py-[32px] w-full">
            <div className="bg-white flex flex-col items-center justify-center p-[64px] rounded-[16px] w-full max-w-[1340px] mx-auto">
                <div className="flex flex-col gap-[4px] items-start w-full">
                    {/* Заголовок */}
                    <div className="flex flex-col items-center w-full">
                        <p className="font-inter font-medium leading-[1.2] text-[#888888] text-[16px] text-center whitespace-nowrap">
                            Дорогие покупатели!
                        </p>
                    </div>
                    <div className="flex flex-col items-start w-full">
                        <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[38px] text-center tracking-[-0.8px] w-full whitespace-pre-wrap">
                            Магазин натуральных тканей
                        </h2>
                    </div>
                    
                    {/* Две карточки с текстом */}
                    <div className="flex flex-col sm:flex-row gap-[16px] items-start w-full pt-[20px]">
                        <div className="bg-[#f1f0ee] flex flex-[1_0_0] flex-col h-[250px] items-center justify-center min-h-px min-w-px p-[64px] rounded-[16px]">
                            <p className="font-inter font-medium leading-[24px] text-[#101010] text-[17px] text-center tracking-[-0.48px] w-full">
                                <span className="font-inter font-bold text-[#101010]">«Центр ткани»</span>
                                <span>{` — это магазин натуральных тканей и трикотажа высокого качества. У нас вы найдёте широкий выбор материалов для одежды и текстиля: хлопок, лен, футер и многое другое.`}</span>
                            </p>
                        </div>
                        <div className="bg-[#f1f0ee] flex flex-[1_0_0] flex-col h-[250px] items-center justify-center min-h-px min-w-px p-[64px] rounded-[16px]">
                            <p className="font-inter font-medium leading-[24px] text-[#101010] text-[17px] text-center tracking-[-0.48px] w-full">
                                <span>{`Мы работаем с 2020 года и сотрудничаем напрямую с ведущими фабриками `}</span>
                                <span className="font-inter font-bold text-[#101010]">Турции, Беларуси и Китая</span>
                                <span>{`. Среди наших партнёров — `}</span>
                                <span className="font-inter font-bold text-[#101010]">Sabaev, Wella, IPEKER, Оршанский льнокомбинат</span>
                                <span>{` и другие известные производители.`}</span>
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Футер */}
                <div className="flex gap-[10px] items-center justify-center px-[10px] py-[20px] w-full">
                    <p className="font-inter font-medium leading-[1.2] text-[#101010] text-[16px] text-center max-w-[592px] whitespace-pre-wrap">
                        Мы всегда стараемся радовать вас актуальными коллекциями и качественным обслуживанием.
                    </p>
                </div>
            </div>
        </div>
        </>
    )
})