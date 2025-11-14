import { observer } from "mobx-react-lite"
import styles from "./Shop.module.css"
import { Context } from "../../main";
import { useState, useRef, useContext } from "react";
import { Tkanlist } from "../../components/tkanlist/TkanList";
import { Slider } from "../../components/slider/Slider"

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
    
    return(
        <>
        <div className="max-w-[1440px] w-full mx-auto px-[20px] py-[40px]">
            <div className="flex gap-[16px]">
                <Slider 
                    slides={leftSlides}
                    title="ТКАНЬ ДЛЯ ОДЕЖДЫ"
                    textPosition="left"
                    totalSlides={4}
                />
                <Slider 
                    slides={rightSlides}
                    title="ТКАНЬ ДЛЯ\nДОМА"
                    textPosition="right"
                    totalSlides={4}
                />
            </div>
        </div>
        
        <div className="max-w-[1440px] w-full mx-auto">
            <Tkanlist/>
        </div>

        
        </>
    )
})