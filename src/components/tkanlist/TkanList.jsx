import { observer } from "mobx-react-lite"
import styles from "./TkanList.module.css"
import { useContext } from "react"
import { Context } from "../../main"
import { ProductCard } from "../productcard/ProductCard"

export let Tkanlist = observer(() => {
    const {tkans} = useContext(Context)
    
    return (
        <div className="flex flex-col sm:flex-row gap-[16px] items-start relative shrink-0 w-full">
            {tkans.tkans.map(tkan => (
                <ProductCard key={tkan.id} product={tkan} showHover={true} />
            ))}
        </div>
    )
})