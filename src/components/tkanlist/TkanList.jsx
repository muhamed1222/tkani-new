import { observer } from "mobx-react-lite"
import styles from "./TkanList.module.css"
import { useContext, useEffect } from "react"
import { Context } from "../../main"
import { ProductCard } from "../productcard/ProductCard"

export let Tkanlist = observer(() => {
    const {tkans} = useContext(Context)
    
    // Загружаем товары при монтировании компонента
    useEffect(() => {
        if (tkans.tkans.length === 0 || tkans.tkans.length === 4) {
            tkans.fetchTkans();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    if (tkans.isLoading) {
        return (
            <div className="flex justify-center items-center py-[40px] w-full">
                <div className="text-[#888888] text-[16px]">Загрузка товаров...</div>
            </div>
        );
    }
    
    if (tkans.error) {
        return (
            <div className="flex justify-center items-center py-[40px] w-full">
                <div className="text-[#9b1e1c] text-[16px]">Ошибка загрузки: {tkans.error}</div>
            </div>
        );
    }
    
    if (tkans.tkans.length === 0) {
        return (
            <div className="flex justify-center items-center py-[40px] w-full">
                <div className="text-[#888888] text-[16px]">Товары не найдены</div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col sm:flex-row gap-[16px] items-start relative shrink-0 w-full">
            {tkans.tkans.map(tkan => (
                <ProductCard key={tkan.id} product={tkan} showHover={true} />
            ))}
        </div>
    )
})