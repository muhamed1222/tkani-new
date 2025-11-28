import { Link } from "react-router-dom";
import { SHOP_ROUTE } from "../../utils/consts";

export const Page404 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F0EE] p-4">
      <div className="flex flex-col items-center gap-[40px]">
        {/* Картинка 404 - десктопная версия */}
        <img 
          src="/404.png" 
          alt="404" 
          className="hidden md:block w-[673px] h-[253px]"
        />
        
        {/* Картинка 404 - мобильная версия (уменьшена в 1.2 раза) */}
        <img 
          src="/404mobile.png" 
          alt="404" 
          className="block md:hidden w-full max-w-[200px] h-auto"
        />
        
        {/* Текст "Страница не найдена" */}
        <div className="text-center">
          <h2 className="font-inter text-[20px] font-medium leading-[120%] text-[#101010]">
            Страница не найдена
          </h2>
        </div>

        {/* Кнопка "Вернуться на главную" */}
        <Link 
          to={SHOP_ROUTE}
          className="flex w-[194px] h-[33px] px-[14px] py-[8px] justify-center items-center gap-[10px] rounded-[6px] bg-[#888] hover:bg-[#666] transition-colors"
        >
          <span className="font-inter text-[14px] font-medium leading-[120%] text-white">
            Вернуться на главную
          </span>
        </Link>
      </div>
    </div>
  );
};