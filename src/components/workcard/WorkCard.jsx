import { Link } from "react-router-dom";
import { useState } from "react";

export const WorkCard = ({ work }) => {
  const [imageError, setImageError] = useState(false);
  // Используем placeholder по умолчанию, если изображение не указано
  const defaultPlaceholder = "https://via.placeholder.com/800x600/F1F0EE/888888?text=Work+Image";
  const [imageSrc, setImageSrc] = useState(work?.image || defaultPlaceholder);

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      // Используем placeholder, если изображение не загрузилось
      setImageSrc(defaultPlaceholder);
      // Предотвращаем бесконечный цикл ошибок
      e.target.onerror = null;
    }
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
            />
          </div>
          
          {/* Контент */}
          <div className="flex flex-col gap-[16px] items-start pb-[8px] pt-0 px-[8px] w-full">
            {/* Название */}
            <div className="flex flex-col gap-[16px] items-start w-full">
              <p className="font-inter font-semibold leading-[1.2] text-[#101010] text-[16px] w-full whitespace-pre-wrap">
                {work.title || "Платье из вискозного шифона \"Флаурэль\" для выстаки \"Гранд Текстиль\""}
              </p>
            </div>
            
            {/* Кнопка "Посмотреть" */}
            <Link
              to={work.link || "#"}
              className="border border-[rgba(16,16,16,0.15)] flex h-[40px] items-center justify-center min-h-[40px] px-[17px] py-[11px] rounded-[8px] w-full hover:bg-[#F1F0EE] transition-colors"
            >
              <span className="font-inter font-medium leading-[1.2] text-[#101010] text-[16px] text-center whitespace-nowrap">
                Посмотреть
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

