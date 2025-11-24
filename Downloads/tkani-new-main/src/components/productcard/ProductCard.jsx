import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { TKAN_ROUTE } from "../../utils/consts";
import { cartAPI } from "../../http/api";
import { showToast } from "../../components/ui/Toast";
import { Context } from "../../main";

export const ProductCard = ({ product, showHover = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1.0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const location = useLocation();
  const { user } = useContext(Context);
  
  // Сохраняем информацию о каталоге при переходе на товар
  const handleProductClick = () => {
    const isClothingCatalog = location.pathname.includes('/catalog-clothing');
    const isHomeCatalog = location.pathname.includes('/catalog') && !location.pathname.includes('/catalog-clothing');
    if (isClothingCatalog || isHomeCatalog) {
      sessionStorage.setItem('productCatalogType', isClothingCatalog ? 'clothing' : 'home');
    }
  };
  
  // Цена за метр
  const pricePerMeter = product.price || 800;
  
  // Итоговая цена (с учетом скидки от 5 метров - 50%)
  const totalPrice = quantity >= 5 
    ? (pricePerMeter * quantity * 0.5).toFixed(2)
    : (pricePerMeter * quantity).toFixed(2);
  
  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0.5) {
      const newValue = Math.max(0.5, quantity - 0.1);
      setQuantity(Math.round(newValue * 10) / 10);
    }
  };
  
  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = quantity + 0.1;
    setQuantity(Math.round(newValue * 10) / 10);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем авторизацию
    if (!user.isAuth) {
      showToast('Для добавления в корзину необходимо авторизоваться', 'error');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      console.log('🛒 Добавление товара в корзину:', {
        productId: product.id,
        productName: product.name,
        quantity: quantity
      });

      const response = await cartAPI.addToCart(product.id, quantity);
      
      showToast('Товар добавлен в корзину', 'success');
      console.log('✅ Товар успешно добавлен в корзину:', response);
      
    } catch (error) {
      console.error('❌ Ошибка добавления в корзину:', error);
      
      if (error.status === 401) {
        showToast('Сессия истекла. Пожалуйста, войдите снова', 'error');
        localStorage.removeItem('authToken');
      } else if (error.status === 404) {
        showToast('Товар не найден', 'error');
      } else {
        showToast('Не удалось добавить товар в корзину', 'error');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <div 
      className="group bg-white border-[1.2px] border-[rgba(16,16,16,0.1)] rounded-[20px] w-full overflow-visible relative"
      style={{ 
        height: '457px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={`${TKAN_ROUTE}/${product.id}`}
        className="flex flex-col items-center p-[10px] h-full relative z-0"
        onClick={handleProductClick}
      >
        {/* Изображение */}
        <div className="h-[380px] overflow-hidden relative rounded-[10px] w-full flex-shrink-0">
          <img 
            src={product.img} 
            alt={product.name} 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[433px] w-[338px] object-cover"
          />
          
          {/* Элемент с точками в левом нижнем углу */}
          <div className="absolute left-[8px] bottom-[8px] inline-flex p-[3px] justify-center items-center gap-[3px] rounded-[26px] bg-[rgba(255,255,255,0.20)] backdrop-blur-[5px] z-10">
            {/* Первая точка - увеличенная */}
            <div className="w-[14px] h-[4px] rounded-[17px] bg-white"></div>
            {/* Остальные точки */}
            <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
            <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
            <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
          </div>
        </div>
        
        {/* Контент по умолчанию */}
        <div className="flex flex-col gap-[20px] items-center pt-[14px] px-[10px] w-full">
          <div className="flex flex-col gap-[5px] items-start justify-end w-full">
            <p className="text-[#101010] text-[16px] font-semibold leading-[1.2] whitespace-pre-wrap">
              {product.name}
            </p>
            <div className="flex gap-[10px] items-center justify-center">
              <p className="text-[#9B1E1C] text-[16px] font-bold leading-[1.2]">
                {product.price} ₽ /м
              </p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Контент при наведении (если включен) - абсолютное позиционирование */}
      {showHover && (
        <div 
          className={`absolute top-0 left-0 right-0 bg-white border-[1.2px] border-[rgba(16,16,16,0.1)] rounded-[20px] p-[10px] z-20 overflow-hidden transition-all duration-300 ${
            isHovered 
              ? "opacity-100 h-[608px]" 
              : "opacity-0 h-[457px] pointer-events-none"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Ссылка для перехода на детальную страницу - покрывает всю карточку */}
          <Link 
            to={`${TKAN_ROUTE}/${product.id}`}
            className="absolute inset-0 z-10"
            onClick={handleProductClick}
          />
          
          {/* Статичная часть: изображение, название и цена */}
          <div className="h-[380px] overflow-hidden relative rounded-[10px] w-full flex-shrink-0">
            <img 
              src={product.img} 
              alt={product.name}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[433px] w-[338px] object-cover"
            />
            
            {/* Элемент с точками в левом нижнем углу */}
            <div className="absolute left-[8px] bottom-[8px] inline-flex p-[3px] justify-center items-center gap-[3px] rounded-[26px] bg-[rgba(255,255,255,0.20)] backdrop-blur-[5px] z-10">
              {/* Первая точка - увеличенная */}
              <div className="w-[14px] h-[4px] rounded-[17px] bg-white"></div>
              {/* Остальные точки */}
              <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
              <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
              <div className="w-[4px] h-[4px] rounded-[17px] bg-[rgba(255,255,255,0.60)]"></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-[20px] items-center pt-[14px] px-[10px] w-full">
            <div className="flex flex-col gap-[5px] items-start justify-end w-full">
              <p className="text-[#101010] text-[16px] font-semibold leading-[1.2] whitespace-pre-wrap">
                {product.name}
              </p>
              <div className="flex gap-[10px] items-center justify-center">
                <p className="text-[#9B1E1C] text-[16px] font-bold leading-[1.2]">
                  {product.price} ₽ /м
                </p>
              </div>
            </div>
          </div>
          
          {/* Анимируется только самая нижняя часть с дополнительным контентом */}
          <div 
            className={`relative z-20 transition-all duration-300 ${
              isHovered 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex flex-col gap-[10px] items-start justify-center px-[10px] py-[10px] w-full">
              <p className="text-[#888888] text-[14px] font-normal leading-[1.2] whitespace-pre-wrap w-full">
                *Скидка от 5 метров
              </p>
              <div className="flex flex-col gap-[12px] items-start w-full">
                <div className="flex items-end justify-between w-full">
                  <div className="flex flex-col gap-[10px] items-start">
                    <div className="bg-[#E4E2DF] border border-[#E4E2DF] rounded-[8px] w-full">
                      <div className="flex items-center justify-between overflow-hidden rounded-[inherit] w-full">
                        <button
                          onClick={handleDecrease}
                          disabled={quantity <= 0.5}
                          className={`bg-white border-r-[1.2px] border-[rgba(16,16,16,0.15)] flex gap-[10px] h-[46px] items-center justify-center px-[14px] py-[8px] w-[50px] transition-opacity ${
                            quantity <= 0.5 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          <p className="text-[#888888] text-[18px] font-bold leading-[1.2]">-</p>
                        </button>
                        <input
                          type="number"
                          step="0.1"
                          value={quantity}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            if (inputValue === '' || inputValue === '.') {
                              setQuantity('');
                              return;
                            }
                            const value = parseFloat(inputValue);
                            if (!isNaN(value) && value >= 0) {
                              setQuantity(value);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseFloat(e.target.value);
                            if (isNaN(value) || value < 0.5 || e.target.value === '') {
                              setQuantity(0.5);
                            } else {
                              setQuantity(value);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-[#E4E2DE] h-[46px] px-[14px] py-[8px] w-[64px] text-[#101010] text-[18px] font-bold leading-[1.2] text-center border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={handleIncrease}
                          className="bg-white border border-[#E4E2DF] flex gap-[10px] h-[46px] items-center justify-center px-[14px] py-[8px] w-[50px] hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <p className="text-[#888888] text-[18px] font-bold leading-[1.2]">+</p>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[#101010] text-[18px] font-bold leading-[1.2]">
                    {totalPrice} ₽
                  </p>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`flex gap-[10px] items-center justify-center px-[14px] py-[8px] rounded-[8px] w-full transition-colors cursor-pointer ${
                    isAddingToCart 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#9B1E1C] hover:bg-[#860202]'
                  }`}
                >
                  {isAddingToCart ? (
                    <p className="text-white text-[16.8px] font-medium leading-[24px]">Добавление...</p>
                  ) : (
                    <p className="text-white text-[16.8px] font-medium leading-[24px]">В корзину</p>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};