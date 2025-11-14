import { observer } from "mobx-react-lite"
import styles from "./Shop.module.css"
import { Context } from "../../main";
import { useState, useRef, useContext } from "react";
import { Slider } from "../../components/slider/Slider"
import { ProductCard } from "../../components/productcard/ProductCard";
import { Link } from "react-router-dom";
import { SHOP_ROUTE } from "../../utils/consts";

export let Shop = observer(() =>{
    const {tkans} = useContext(Context)
    
    const leftSlides = [
        "/Hero Image Left.jpg",
        "/Hero Image Left.jpg",
        "/Hero Image Left.jpg",
        "/Hero Image Left.jpg",
    ];
    
    const rightSlides = [
        "/Hero Image Right.jpg",
        "/Hero Image Right.jpg",
        "/Hero Image Right.jpg",
        "/Hero Image Right.jpg",
    ];
    
    // Получаем первые 4 товара для блока "Новинки"
    const newArrivals = tkans.tkans.slice(0, 4);
    
    return(
        <>
        {/* Слайдеры */}
        <div className="max-w-[1440px] w-full mx-auto px-[20px] py-[40px]">
            <div className="flex flex-col md:flex-row gap-[16px]">
                <Slider 
                    slides={leftSlides}
                    title={["ТКАНЬ ДЛЯ", "ОДЕЖДЫ"]}
                    textPosition="left"
                    totalSlides={4}
                />
                <Slider 
                    slides={rightSlides}
                    title={["ТКАНЬ ДЛЯ", "ДОМА"]}
                    textPosition="right"
                    totalSlides={4}
                />
            </div>
        </div>
        
        {/* Блок "Новинки" */}
        <div className="max-w-[1440px] w-full mx-auto px-[20px] sm:px-[50px] py-[40px]">
            <div className="flex flex-col gap-[16px]">
                {/* Заголовок блока */}
                <div className="flex items-center justify-between px-[10px] py-0 w-full">
                    <div className="flex gap-[10px] items-center justify-center">
                        <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[38px] tracking-[-0.8px] whitespace-nowrap">
                            Новинки
                        </h2>
                    </div>
                    <Link 
                        to={SHOP_ROUTE}
                        className="flex gap-[10px] items-center justify-center hover:opacity-80 transition-opacity"
                    >
                        <span className="font-inter font-medium leading-[1.2] text-[#9b1e1c] text-[16px] whitespace-nowrap">
                            Посмотреть все
                        </span>
                    </Link>
                </div>
                
                {/* Сетка товаров */}
                <div className="flex flex-col sm:flex-row gap-[16px] items-start w-full">
                    {newArrivals.map(tkan => (
                        <ProductCard key={tkan.id} product={tkan} showHover={true} />
                    ))}
                </div>
            </div>
        </div>
        
        {/* Блок "Акции и скидки" */}
        <div className="max-w-[1440px] w-full mx-auto px-[20px] sm:px-[50px] py-[40px]">
            <div className="flex flex-col gap-[16px]">
                {/* Заголовок блока */}
                <div className="flex items-center justify-between px-[10px] py-0 w-full">
                    <div className="flex gap-[10px] items-center justify-center">
                        <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[38px] tracking-[-0.8px] whitespace-nowrap">
                            Акции и скидки
                        </h2>
                    </div>
                    <Link 
                        to={SHOP_ROUTE}
                        className="flex gap-[10px] items-center justify-center hover:opacity-80 transition-opacity"
                    >
                        <span className="font-inter font-medium leading-[1.2] text-[#9b1e1c] text-[16px] whitespace-nowrap">
                            Посмотреть все
                        </span>
                    </Link>
                </div>
                
                {/* Сетка товаров */}
                <div className="flex flex-col sm:flex-row gap-[16px] items-start w-full">
                    {newArrivals.map(tkan => (
                        <ProductCard key={`duplicate1-${tkan.id}`} product={tkan} showHover={true} />
                    ))}
                </div>
            </div>
        </div>
        
        {/* Блок "Комбинации" */}
        <div className="max-w-[1440px] w-full mx-auto px-[20px] sm:px-[50px] py-[40px]">
            <div className="flex flex-col gap-[16px]">
                {/* Заголовок блока */}
                <div className="flex items-center justify-between px-[10px] py-0 w-full">
                    <div className="flex gap-[10px] items-center justify-center">
                        <h2 className="font-inter font-semibold leading-[1.2] text-[#101010] text-[38px] tracking-[-0.8px] whitespace-nowrap">
                            Комбинации
                        </h2>
                    </div>
                    <Link 
                        to={SHOP_ROUTE}
                        className="flex gap-[10px] items-center justify-center hover:opacity-80 transition-opacity"
                    >
                        <span className="font-inter font-medium leading-[1.2] text-[#9b1e1c] text-[16px] whitespace-nowrap">
                            Посмотреть все
                        </span>
                    </Link>
                </div>
                
                {/* Сетка товаров */}
                <div className="flex flex-col sm:flex-row gap-[16px] items-start w-full">
                    {newArrivals.map(tkan => (
                        <ProductCard key={`duplicate2-${tkan.id}`} product={tkan} showHover={true} />
                    ))}
                </div>
            </div>
        </div>
        
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