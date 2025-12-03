import { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";
import { cartAPI } from "../../http/api";
import { TKAN_ROUTE } from "../../utils/consts";
import { showToast } from "../../components/ui/Toast";
import styles from "./ProductCard.module.css";

export const ProductCard = observer(({ product, showHover = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1.0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const location = useLocation();
  const { cart } = useContext(Context);
  
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
    if (quantity >= 1000) {
      showToast('Максимальное количество: 1000 метров', 'error');
      return;
    }
    const newValue = Math.min(1000, quantity + 0.1);
    setQuantity(Math.round(newValue * 10) / 10);
  };

  const handleQuantityChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const inputValue = e.target.value;
    if (inputValue === '' || inputValue === '.') {
      setQuantity('');
      return;
    }
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0.5 && value <= 1000) {
      setQuantity(value);
    }
  };

  const handleQuantityBlur = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0.5 || e.target.value === '') {
      setQuantity(0.5);
    } else if (value > 1000) {
      setQuantity(1000);
      showToast('Максимальное количество: 1000 метров', 'error');
    } else {
      setQuantity(Math.round(value * 10) / 10);
    }
  };
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart(product.id, quantity);
      showToast('Товар добавлен в корзину', 'success');
      // Обновляем данные корзины в store
      cart.fetchCart();
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <div 
      className={styles.productCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={`${TKAN_ROUTE}/${product.id}`}
        className="flex flex-col items-center p-[10px] h-full relative z-0"
        onClick={handleProductClick}
      >
        {/* Изображение */}
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
            isHovered 
              ? styles.hoverCardVisible 
              : styles.hoverCardHidden
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
              isHovered 
                ? styles.hoverContentVisible 
                : styles.hoverContentHidden
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
                          quantity <= 0.5 
                            ? styles.quantityButtonDisabled 
                            : styles.quantityButtonActive
                        }`}
                      >
                        <p className={styles.quantityButtonText}>-</p>
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantityBlur}
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
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || (product.stock !== undefined && product.stock <= 0)}
                  className={`${styles.cartButton} ${
                    isAddingToCart || (product.stock !== undefined && product.stock <= 0)
                      ? styles.cartButtonDisabled
                      : styles.cartButtonActive
                  }`}
                >
                  <p className={styles.buttonText}>
                    {isAddingToCart 
                      ? 'Добавление...' 
                      : (product.stock !== undefined && product.stock <= 0)
                        ? 'Нет в наличии'
                        : 'В корзину'
                    }
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});