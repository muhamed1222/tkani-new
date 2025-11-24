// src/components/workcard/WorkCard.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { WORK_ROUTE } from "../../utils/consts";

export const WorkCard = ({ work }) => {
  const [imageError, setImageError] = useState(false);
  const defaultPlaceholder = "https://via.placeholder.com/800x600/F1F0EE/888888?text=Work+Image";
  const [imageSrc, setImageSrc] = useState(work?.image || defaultPlaceholder);

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(defaultPlaceholder);
      e.target.onerror = null;
    }
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', imageSrc);
  };

  return (
    <div className="bg-white border-[1.2px] border-[rgba(16,16,16,0.1)] rounded-[20px] w-full overflow-hidden">
      <div className="flex flex-col items-center p-[10px]">
        <div className="flex flex-col gap-[14px] items-start w-full">
          {/* Изображение */}
          <div className="h-[380px] relative rounded-[20px] overflow-hidden w-full bg-[#F1F0EE]">
            <img 
              src={imageSrc} 
              alt={work.title} 
              className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {/* Элемент с точками в левом нижнем углу */}
            <div className="absolute left-[8px] bottom-[8px] inline-flex p-[3px] justify-center items-center gap-[3px] rounded-[26px] bg-[rgba(255,255,255,0.20)] backdrop-blur-[5px] z-10">
              <div className="w-[14px] h-[4px] rounded-[17px] bg-white"></div>
              <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
              <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
              <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
            </div>
          </div>
          
          {/* Контент */}
          <div className="flex flex-col gap-[16px] items-start pb-[8px] pt-0 px-[8px] w-full">
            {/* Название */}
            <div className="flex flex-col gap-[16px] items-start w-full">
              <p className="font-inter font-semibold leading-[1.2] text-[#101010] text-[16px] w-full whitespace-pre-wrap">
                {work.title || "Платье из вискозного шифона \"Флаурэль\" для выстаки \"Гранд Текстиль\""}
              </p>
            </div>
            
            {/* Кнопка "Подробнее" */}
            <Link
              to={`${WORK_ROUTE}/${work.id}`} // Ссылка на конкретную работу
              className="border border-[rgba(16,16,16,0.15)] flex h-[40px] items-center justify-center min-h-[40px] px-[17px] py-[11px] rounded-[8px] w-1/2 hover:bg-[#F1F0EE] transition-colors self-start"
            >
              <span className="font-inter font-medium leading-[1.2] text-[#101010] text-[16px] text-center whitespace-nowrap">
                Подробнее
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};