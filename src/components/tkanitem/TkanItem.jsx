import { observer } from "mobx-react-lite"
import styles from "./TkanItem.module.css"
import { useContext } from "react"
import { Context } from "../../main"
import { Link, useLocation } from "react-router-dom"
import { TKAN_ROUTE } from "../../utils/consts"

export let TkanItem = observer(({tkan}) => {
    const {tkans} = useContext(Context)
    const location = useLocation();
    
    // Сохраняем информацию о каталоге при переходе на товар
    const handleProductClick = () => {
        const isClothingCatalog = location.pathname.includes('/catalog-clothing');
        const isHomeCatalog = location.pathname.includes('/catalog') && !location.pathname.includes('/catalog-clothing');
        if (isClothingCatalog || isHomeCatalog) {
            sessionStorage.setItem('productCatalogType', isClothingCatalog ? 'clothing' : 'home');
        }
    };
    
    return (
        <Link 
            to={`${TKAN_ROUTE}/${tkan.id}`}
            className="bg-white border-[1.2px] border-[rgba(16,16,16,0.1)] w-full sm:flex-[1_0_0] min-h-px min-w-px relative rounded-[20px] shrink-0 hover:shadow-lg transition-shadow"
            onClick={handleProductClick}
        >
            <div className="box-border flex flex-col items-center overflow-clip p-[10px] relative rounded-[inherit] w-full">
                {/* Изображение */}
                <div className="h-[250px] sm:h-[380px] overflow-clip relative rounded-[10px] shrink-0 w-full">
                    <div className="absolute h-[433px] left-1/2 top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%] w-[338px]">
                        <img 
                            alt={tkan.name}
                            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                            src={tkan.img}
                        />
                    </div>
                </div>
                
                {/* Контент */}
                <div className="box-border flex flex-col gap-[20px] items-center pb-0 pt-[14px] px-[10px] relative shrink-0 w-full">
                    <div className="flex flex-col gap-[5px] items-start justify-end relative shrink-0 w-full">
                        {/* Название */}
                        <p className="font-inter font-semibold leading-[1.2] min-w-full not-italic relative shrink-0 text-[#101010] text-[16px] w-[min-content] whitespace-pre-wrap">
                            {tkan.name}
                        </p>
                        {/* Цена */}
                        <div className="flex gap-[10px] items-center justify-center relative shrink-0">
                            <p className="font-['Inter_Display',sans-serif] font-bold leading-[1.2] not-italic relative shrink-0 text-[#9b1e1c] text-[16px]">
                                {tkan.price} ₽ /м
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
})