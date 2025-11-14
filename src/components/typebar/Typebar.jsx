import { observer } from "mobx-react-lite"
import { Link } from "react-router-dom"
import styles from "./Typebar.module.css"
import { Context } from "../../main";
import { useState, useRef, useContext } from "react";
import { Brandbar } from "../brandbar/Brandbar";
import { CATALOG_ROUTE, CATALOG_CLOTHING_ROUTE } from "../../utils/consts";
import { getClothingCategoryNames, getHomeCategoryNames, getFabricSlugMap } from "../../utils/catalogCategories";

export let Typebar = observer(() =>{
    const {tkans} = useContext(Context)
    
    // Маппинг названий тканей к slug'ам (используем единый источник данных)
    const fabricSlugMap = getFabricSlugMap();
    
    // Получаем slug для ткани
    const getFabricSlug = (itemName) => {
        return fabricSlugMap[itemName];
    };
    
    // Данные для категорий и тканей (используем единый источник данных)
    const clothingItems = getClothingCategoryNames();
    const homeItems = getHomeCategoryNames();
    
    const categories = [
        {
            id: 1,
            name: 'Для одежды',
            route: CATALOG_CLOTHING_ROUTE,
            firstItem: clothingItems[0], // Первая категория, на которую ведет заголовок
            items: clothingItems
        },
        {
            id: 2,
            name: 'Для дома',
            route: CATALOG_ROUTE,
            firstItem: homeItems[0], // Первая категория, на которую ведет заголовок
            items: homeItems
        }
    ]
    
    return(
        <>
        <div className="bg-white flex gap-[7px] p-[8px] rounded-[14px] w-[560px]">
            {categories.map(category => (
                <div key={category.id} className="bg-[#F1F0EE] flex flex-col items-start px-[12px] py-[8px] rounded-[8px] flex-1">
                    {/* Заголовок категории - ссылка */}
                    <Link 
                        to={category.firstItem ? `${category.route}/${getFabricSlug(category.firstItem)}` : category.route}
                        className="pb-[8px] pl-[5px] w-full hover:opacity-80 transition-opacity"
                    >
                        <h3 className="text-[#161616] text-[17px] font-medium leading-[27px] whitespace-nowrap">
                            {category.name}
                        </h3>
                    </Link>
                    
                    {/* Список тканей */}
                    {category.items.map((item, index) => {
                        const slug = getFabricSlug(item);
                        const link = slug ? `${category.route}/${slug}` : category.route;
                        
                        return (
                            <Link
                                key={index}
                                to={link}
                                className="flex h-[32px] items-center px-[8px] py-[5px] rounded-[8px] w-full hover:bg-white transition-colors cursor-pointer"
                            >
                                <span className="text-[#4D4D4D] text-[14px] font-medium leading-[22px] whitespace-nowrap">
                                    {item}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            ))}
        </div>
        </>
    )
})