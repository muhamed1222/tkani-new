import logger from '../../utils/logger';
import { useState, useContext, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context } from "../../main";
import { cartAPI } from "../../http/api";
import { TKAN_ROUTE } from "../../utils/consts";
import { showToast } from "../../components/ui/Toast";
import { buildImageUrl } from "../../utils/apiConfig";
import { QuantityControl } from "../quantityControl";
import styles from "./ProductCard.module.css";

export const ProductCard = observer(({ product, showHover = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1.0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const location = useLocation();
  const { cart } = useContext(Context);
  
  // Сохраняем информацию о каталоге при переходе на товар
  const handleProductClick = useCallback((e) => {
    // Проверяем, был ли клик на кнопках управления количеством
    const target = e.target;
    const isControlButton = target.closest(`.${styles.quantitySelector}`) || 
                           target.closest(`.${styles.cartButton}`) ||
                           target.closest(`.${styles.quantityControl}`);
    
    // Если клик был на кнопке управления - отменяем переход
    if (isControlButton) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    const isClothingCatalog = location.pathname.includes('/catalog-clothing');
    const isHomeCatalog = location.pathname.includes('/catalog') && !location.pathname.includes('/catalog-clothing');
    if (isClothingCatalog || isHomeCatalog) {
      sessionStorage.setItem('productCatalogType', isClothingCatalog ? 'clothing' : 'home');
    }
  }, [location.pathname]);
  
  // Цена за метр
  const pricePerMeter = useMemo(() => product.price || 800, [product.price]);
  
  // Итоговая цена (с учетом скидки от 5 метров - 50%)
  const totalPrice = useMemo(() => {
    return quantity >= 5 
      ? (pricePerMeter * quantity * 0.5).toFixed(2)
      : (pricePerMeter * quantity).toFixed(2);
  }, [quantity, pricePerMeter]);
  
  // Обработчики для кнопок "+" и "-" с stopPropagation
  const handleDecrease = useCallback((newQuantity, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuantity(newQuantity);
  }, []);
  
  const handleIncrease = useCallback((newQuantity, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuantity(newQuantity);
  }, []);

  const handleQuantityChange = useCallback((value) => {
    setQuantity(value);
  }, []);
  
  const handleQuantityBlur = useCallback((value) => {
    setQuantity(value);
  }, []);
  
  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      const response = await cartAPI.addToCart(product.id, quantity, product);
      
      const wasExisting = response.data?.wasExisting || false;
      
      if (wasExisting) {
        showToast(`Метраж товара увеличен на ${quantity} м`, 'success');
      } else {
        showToast('Товар добавлен в корзину', 'success');
      }
      
      if (cart && cart.fetchCart) {
        cart.fetchCart();
      }
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      logger.error('Ошибка добавления в корзину:', error);
      showToast('Ошибка при добавлении товара в корзину', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, quantity, isAddingToCart, cart]);
  
  // Получаем URL изображения с плейсхолдером
  const getProductImage = useMemo(() => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return buildImageUrl(product.images[0], '/placeholder-product.svg');
    }
    if (product.image) {
      return buildImageUrl(product.image, '/placeholder-product.svg');
    }
    if (product.img) {
      return buildImageUrl(product.img, '/placeholder-product.svg');
    }
    return '/placeholder-product.svg';
  }, [product.images, product.image, product.img]);
  
  const handleImageError = useCallback((e) => {
    e.target.src = '/placeholder-product.svg';
  }, []);

  return (
    <div 
      className={styles.productCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={`${TKAN_ROUTE}/${product.id}`}
        className="flex flex-col items-center p-[6px] md:p-[8px] h-full relative z-0"
        onClick={handleProductClick}
      >
        {/* Изображение */}
        <div className={styles.imageContainer}>
          <img 
            src={getProductImage} 
            alt={product.name || product.title || 'Товар'} 
            className={styles.productImage}
            onError={handleImageError}
          />
        </div>
        
        {/* Контент по умолчанию */}
        {(!showHover || !isHovered) && (
          <div className={styles.defaultContent}>
            <div className={styles.productInfo}>
              <p className={styles.productName}>
                {product.name || product.title || 'Товар'}
              </p>
              <div className={styles.priceContainer}>
                <p className={styles.productPrice}>
                  {product.price || 0} ₽ /м
                </p>
              </div>
            </div>
          </div>
        )}
          
        {/* Контент при наведении */}
        {showHover && (
          <div 
            className={`${styles.hoverContent} ${
              isHovered 
                ? styles.hoverContentVisible 
                : styles.hoverContentHidden
            }`}
            onClick={(e) => e.stopPropagation()} // Дополнительная защита
          >
            <div className={styles.hoverActions}>
            {isHovered && (
              <div className={styles.defaultContent}>
                <div className={styles.productInfo}>
                  <p className={styles.productName}>
                    {product.name || product.title || 'Товар'}
                  </p>
                  <div className={styles.priceContainer}>
                    <p className={styles.productPrice}>
                      {product.price} ₽ /м
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div 
              className={styles.hoverControls}
              onClick={(e) => e.stopPropagation()} // Останавливаем клик на элементах управления
            >
              <p className={styles.discountNote}>
                *Скидка от 5 метров
              </p>
              <div className={styles.actionsContainer}>
                <div className={styles.quantityPriceRow}>
                  <div className={styles.quantitySelector}>
                    <QuantityControl
                      quantity={quantity}
                      onDecrease={handleDecrease}
                      onIncrease={handleIncrease}
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      min={0.5}
                      max={1000}
                      step={0.1}
                      showToast={showToast}
                    />
                  </div>
                  <p className={styles.totalPrice}>
                    {totalPrice} ₽
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(e);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
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
      </Link>
    </div>
  );
});