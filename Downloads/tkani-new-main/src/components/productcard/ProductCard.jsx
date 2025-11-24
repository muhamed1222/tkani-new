import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { TKAN_ROUTE } from "../../utils/consts";
import { cartAPI } from "../../http/api";
import { showToast } from "../../components/ui/Toast";
import { Context } from "../../main";
import styles from "./ProductCard.module.css";

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
      className={`group bg-white border-[1.2px] border-[rgba(16,16,16,0.1)] rounded-[20px] w-full overflow-visible relative ${styles.productCard}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={`${TKAN_ROUTE}/${product.id}`}
        className="flex flex-col items-center p-[10px] h-full relative z-0"
        onClick={handleProductClick}
      >
        {/* Изображение - квадратное на мобильных и планшетах */}
        <div className={styles.imageContainer}>
          <img 
            src={product.img} 
            alt={product.name} 
            className={styles.productImage}
          />
          
          {/* Элемент с точками в левом нижнем углу */}
          <div className={styles.dotsIndicator}>
            <div className={styles.dotLarge}></div>
            <div className={styles.dotSmall}></div>
            <div className={styles.dotSmall}></div>
            <div className={styles.dotSmall}></div>
          </div>
        </div>
        
        {/* Контент по умолчанию */}
        <div className={styles.defaultContent}>
          <div className={styles.productInfo}>
            <p className={styles.productName}>
              {product.name}
            </p>
            <div className={styles.priceContainer}>
              <p className={styles.productPrice}>
                {product.price} ₽ /м
              </p>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Контент при наведении (если включен) - абсолютное позиционирование */}
      {showHover && (
        <div 
          className={`${styles.hoverCard} ${
            isHovered ? styles.hoverCardVisible : styles.hoverCardHidden
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Ссылка для перехода на детальную страницу - покрывает всю карточку */}
          <Link 
            to={`${TKAN_ROUTE}/${product.id}`}
            className={styles.productLink}
            onClick={handleProductClick}
          />
          
          {/* Статичная часть: изображение, название и цена */}
          <div className={styles.imageContainer}>
            <img 
              src={product.img} 
              alt={product.name}
              className={styles.productImage}
            />
            
            {/* Элемент с точками в левом нижнем углу */}
            <div className={styles.dotsIndicator}>
              <div className={styles.dotLarge}></div>
              <div className={styles.dotSmall}></div>
              <div className={styles.dotSmall}></div>
              <div className={styles.dotSmall}></div>
            </div>
          </div>
          
          <div className={styles.defaultContent}>
            <div className={styles.productInfo}>
              <p className={styles.productName}>
                {product.name}
              </p>
              <div className={styles.priceContainer}>
                <p className={styles.productPrice}>
                  {product.price} ₽ /м
                </p>
              </div>
            </div>
          </div>
          
          {/* Анимируется только самая нижняя часть с дополнительным контентом */}
          <div 
            className={`${styles.hoverContent} ${
              isHovered ? styles.hoverContentVisible : styles.hoverContentHidden
            }`}
          >
            <div className={styles.hoverActions}>
              <p className={styles.discountNote}>
                *Скидка от 5 метров
              </p>
              <div className={styles.actionsContainer}>
                <div className={styles.quantityPriceRow}>
                  <div className={styles.quantitySelector}>
                    <div className={styles.quantityControls}>
                      <button
                        onClick={handleDecrease}
                        disabled={quantity <= 0.5}
                        className={`${styles.quantityButton} ${
                          quantity <= 0.5 ? styles.quantityButtonDisabled : styles.quantityButtonActive
                        }`}
                      >
                        <p className={styles.quantityButtonText}>-</p>
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
                        className={styles.quantityInput}
                      />
                      <button
                        onClick={handleIncrease}
                        className={`${styles.quantityButton} ${styles.quantityButtonActive}`}
                      >
                        <p className={styles.quantityButtonText}>+</p>
                      </button>
                    </div>
                  </div>
                  <p className={styles.totalPrice}>
                    {totalPrice} ₽
                  </p>
                </div>
                
                {/* Кнопки в одну строку на мобильных и планшетах */}
                <div className={styles.buttonsRow}>
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className={`${styles.cartButton} ${
                      isAddingToCart ? styles.cartButtonDisabled : styles.cartButtonActive
                    }`}
                  >
                    {isAddingToCart ? (
                      <p className={styles.buttonText}>Добавление...</p>
                    ) : (
                      <p className={styles.buttonText}>В корзину</p>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className={`${styles.buyButton} ${
                      isAddingToCart ? styles.buyButtonDisabled : styles.buyButtonActive
                    }`}
                  >
                    <p className={styles.buttonText}>Купить в 1 клик</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};