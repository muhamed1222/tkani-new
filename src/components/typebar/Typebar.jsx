import { observer } from "mobx-react-lite"
import styles from "./Typebar.module.css"
import { Context } from "../../main";
import { useState, useRef, useContext } from "react";
import { Brandbar } from "../brandbar/Brandbar";

export let Typebar = observer(() =>{
    const {tkans} = useContext(Context)
    
    // Данные для категорий и тканей
    const categories = [
        {
            id: 1,
            name: 'Для одежды',
            items: ['Дак', 'Вафельное полотно', 'Лен постельный', 'Сатин Туриция', 'Махра', 'Муслин', 'Тенсель', 'Поплин Туриция', 'Пике косичка', 'Фланель', 'Сатин люкс']
        },
        {
            id: 2,
            name: 'Для дома',
            items: ['Муслин', 'Штапель', 'Купра', 'Шелк', 'Джинса', 'Тенсель', 'Хлопок', 'Трикотаж', 'Лен']
        }
    ]
    
    return(
        <>
        <div className="bg-white flex gap-[7px] p-[8px] rounded-[14px] w-[560px]">
            {categories.map(category => (
                <div key={category.id} className="bg-[#F1F0EE] flex flex-col items-start px-[12px] py-[8px] rounded-[8px] flex-1">
                    {/* Заголовок категории */}
                    <div className="pb-[8px] pl-[5px] w-full">
                        <h3 className="text-[#161616] text-[17px] font-medium leading-[27px] whitespace-nowrap">
                            {category.name}
                        </h3>
                    </div>
                    
                    {/* Список тканей */}
                    {category.items.map((item, index) => (
                        <div 
                            key={index}
                            className="flex h-[32px] items-center justify-between px-[8px] py-[5px] rounded-[8px] w-full hover:bg-white transition-colors cursor-pointer"
                        >
                            <span className="text-[#4D4D4D] text-[14px] font-medium leading-[22px] whitespace-nowrap">
                                {item}
                            </span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 3L9 7L5 11" stroke="#4D4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    ))}
                </div>
            ))}
        </div>
        </>
    )
})