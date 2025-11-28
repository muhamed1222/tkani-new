import { observer } from "mobx-react-lite"
import styles from "./Brandbar.module.css"
import { Context } from "../../main";
import { useContext } from "react";


export let Brandbar =observer(() => {
    const {tkans} = useContext(Context)

    return(

        
    <>
        {tkans.brands.map(brand =>
            <li key={brand.id}
            className="">{brand.name}</li>
        )}

        

    

    </>
)})