import { observer } from "mobx-react-lite"
import { Link } from "react-router-dom"
import { Context } from "../../main";
import { useContext, useEffect } from "react";
import { CATALOG_ROUTE, CATALOG_CLOTHING_ROUTE, FURNITURE_ROUTE } from "../../utils/consts";
import { getClothingCategoryNames, getHomeCategoryNames, getFabricSlugMap } from "../../utils/catalogCategories";

export let Typebar = observer(() =>{
    const {tkans} = useContext(Context)
    
    // Загружаем каталог категорий из Strapi при монтировании компонента
    useEffect(() => {
        tkans.fetchCatalogSections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Получаем данные каталога из store
    const catalogSections = tkans.catalogSections;
    
    // Fallback на статические данные, если данные из Strapi еще не загружены
    const clothingItemsFromStrapi = catalogSections.clothing.length > 0 
        ? catalogSections.clothing.map(cat => cat.name)
        : getClothingCategoryNames();
    
    const homeItemsFromStrapi = catalogSections.home.length > 0
        ? catalogSections.home.map(cat => cat.name)
        : getHomeCategoryNames();
    
    // Маппинг названий тканей к slug'ам
    // Используем данные из Strapi, если они доступны, иначе fallback на статический маппинг
    const getFabricSlug = (itemName) => {
        // Сначала проверяем данные из Strapi
        const clothingCat = catalogSections.clothing.find(cat => cat.name === itemName);
        if (clothingCat) return clothingCat.slug;
        
        const homeCat = catalogSections.home.find(cat => cat.name === itemName);
        if (homeCat) return homeCat.slug;
        
        // Fallback на статический маппинг
        const fabricSlugMap = getFabricSlugMap();
        return fabricSlugMap[itemName];
    };
    
    const categories = [
        {
            id: 1,
            name: 'Для одежды',
            route: CATALOG_CLOTHING_ROUTE,
            firstItem: clothingItemsFromStrapi[0], // Первая категория, на которую ведет заголовок
            items: clothingItemsFromStrapi
        },
        {
            id: 2,
            name: 'Для дома',
            route: CATALOG_ROUTE,
            firstItem: homeItemsFromStrapi[0], // Первая категория, на которую ведет заголовок
            items: homeItemsFromStrapi
        },
        {
            id: 3,
            name: 'Фурнитура',
            route: FURNITURE_ROUTE,
            firstItem: null,
            items: []
        }
    ]
    
    return(
        <>
        <div className="bg-white flex gap-[7px] p-[8px] rounded-[14px] w-[840px]">
            {categories.map(category => (
                <div key={category.id} className="bg-[#F1F0EE] flex flex-col items-start px-[8px] py-[8px] rounded-[8px] flex-1">
                    {/* Заголовок категории - ссылка */}
                    <Link 
                        to={category.firstItem ? `${category.route}/${getFabricSlug(category.firstItem)}` : category.route}
                        className="pb-[8px] pl-[8px] w-full hover:opacity-80 transition-opacity"
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