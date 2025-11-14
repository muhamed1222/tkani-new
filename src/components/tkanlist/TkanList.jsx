import { observer } from "mobx-react-lite"
import styles from "./TkanList.module.css"
import { useContext } from "react"
import { Context } from "../../main"
import { TkanItem } from "../tkanitem/TkanItem"


export let Tkanlist = observer(() =>{

const {tkans} = useContext(Context)
    return(
        <>



        <div className="w-full flex justify-between p-5 gap-3">
            {tkans.tkans.map(tkan =>
            <TkanItem key={tkan.id} tkan={tkan}/>
            )}
        </div>
       
            
        
       
        </>
    )
})