import logger from '../../utils/logger';
import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Tkanpage.module.css";
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from "../../components/breadcrumbs";
import { Context } from "../../main";
import { cartAPI } from "../../http/api";
import { BASKET_ROUTE, SHOP_ROUTE, DEFAULT_PRODUCT_VALUES, CONTACT_PHONE, TELEGRAM_LINK, DISCOUNT_TIERS } from "../../utils/consts";
import { showToast } from "../../components/ui/Toast";
import { ProductSection } from "../../components/productsection2/ProductSection";
import { QuantityControl } from "../../components/quantityControl";

export const Tkanpage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(Context);
  const { tkans } = context;
  const breadcrumbs = useAutoBreadcrumbs({ context });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1.0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      tkans.fetchTkanById(id);
    }
    // Также загружаем все товары для секций
    if (!tkans.tkans || tkans.tkans.length === 0) {
      tkans.fetchTkans();
    }
  }, [id, tkans]);

  const product = tkans.selectedTkan;
  const isLoading = tkans.isLoadingTkan;
  const error = tkans.errorTkan;

  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ДО РАННИХ ВОЗВРАТОВ!
  // Получаем рекомендованные товары (исключая текущий товар)
  const recommendedProducts = useMemo(() => {
    if (!tkans.tkans || tkans.tkans.length === 0 || !product) {
      return [];
    }
    // Фильтруем текущий товар и берем случайные товары
    const filtered = tkans.tkans.filter(tkan => tkan.id !== product.id);
    // Перемешиваем и берем первые 4
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [tkans.tkans, product?.id]);

  // Переносим проверки загрузки и ошибок ПОСЛЕ всех хуков
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || "Товар не найден"}
        </div>
      </div>
    );
  }

  // Все функции, которые используют product, объявляем после проверок
  const images = product.images || (product.img ? [product.img] : []);
  const validImages = images.filter((img, idx) => !imageErrors.has(idx));
  const selectedImage = validImages[selectedImageIndex] || validImages[0] || null;

  const handleImageError = (index) => {
    setImageErrors(prev => new Set([...prev, index]));
    if (selectedImageIndex === index) {
      const nextValidIndex = validImages.findIndex((_, idx) => idx !== index && !imageErrors.has(idx));
      if (nextValidIndex !== -1) {
        setSelectedImageIndex(nextValidIndex);
      }
    }
  };

  const openModal = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    if (modalImageIndex < validImages.length - 1) {
      setModalImageIndex(modalImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (modalImageIndex > 0) {
      setModalImageIndex(modalImageIndex - 1);
    }
  };

  const handleDecrease = (newQuantity) => {
    setQuantity(newQuantity);
  };

  const handleIncrease = (newQuantity) => {
    setQuantity(newQuantity);
  };

  const handleQuantityChange = (value) => {
      setQuantity(value);
  };

  const handleQuantityBlur = (value) => {
    setQuantity(value);
  };

  // Функция расчета цены с учетом персональных скидок
  const calculatePrice = (qty) => {
    if (!product || !product.price) {
      return 0;
    }
    
    const basePrice = product.price;
    const baseDiscount = product.discount || 0;
    const baseDiscountPrice = product.discountPrice || (basePrice * (1 - baseDiscount / 100));
    
    // Проверяем персональные скидки от количества (от большего к меньшему)
    const sortedTiers = [...DISCOUNT_TIERS].sort((a, b) => b.minQuantity - a.minQuantity);
    for (const tier of sortedTiers) {
      if (qty >= tier.minQuantity) {
        return tier.price;
      }
    }
    
    // Если не достигнут порог персональных скидок, возвращаем базовую цену со скидкой
    return baseDiscountPrice;
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      // Передаем данные товара для локальной корзины
      const response = await cartAPI.addToCart(product.id, quantity, product);
      
      // Проверяем, был ли товар уже в корзине
      const wasExisting = response.data?.wasExisting || false;
      
      if (wasExisting) {
        showToast(`Метраж товара увеличен на ${quantity} м`, 'success');
      } else {
      showToast('Товар добавлен в корзину', 'success');
      }
      
      // Отправляем событие обновления корзины
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      logger.error('Ошибка добавления в корзину:', error);
      showToast('Не удалось добавить товар в корзину', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (isAddingToCart) return;
    
    // Проверяем, что товар загружен
    if (!product || !product.id) {
      logger.error('Товар не загружен');
      showToast('Товар не загружен. Попробуйте позже.', 'error');
      return;
    }
    
    // Проверяем количество
    if (quantity <= 0) {
      showToast('Укажите количество товара', 'error');
      return;
    }
    
    try {
      // Переходим на страницу оформления заказа с одним товаром
      // Не добавляем товар в корзину, передаем напрямую на checkout
      // Используем текущую цену с учетом всех скидок
      const pricePerMeter = calculatePrice(quantity);
      
      // Сериализуем только необходимые данные товара (избегаем циклических ссылок и функций)
      const serializedProduct = {
        id: product.id,
        name: product.name || product.title || '',
        price: pricePerMeter,
        discountPrice: pricePerMeter,
        discount: product.discount || 0,
        stock: product.stock,
        images: product.images ? (Array.isArray(product.images) ? product.images.map(img => typeof img === 'string' ? img : (img.url || img)) : []) : [],
        image: product.image || product.img || '',
        category: product.category ? (typeof product.category === 'object' ? { id: product.category.id, name: product.category.name } : product.category) : null,
        brand: product.brand ? (typeof product.brand === 'object' ? { id: product.brand.id, name: product.brand.name } : product.brand) : null,
        description: product.description || '',
        article: product.article || ''
      };
      
      const singleProductItem = {
        id: Date.now(), // Временный ID
        product: serializedProduct,
        quantity: quantity,
        price: pricePerMeter
      };
      
      logger.log('Переход на checkout с товаром:', singleProductItem);
      
      navigate('/checkout', {
        state: {
          singleProduct: singleProductItem
        }
      });
    } catch (error) {
      logger.error('Ошибка при переходе на оформление заказа:', error);
      showToast('Не удалось перейти на страницу оформления заказа', 'error');
    }
  };

  // Текущая цена за метр с учетом всех скидок
  const currentPricePerMeter = calculatePrice(quantity);
  // Итоговая стоимость
  const totalPrice = Math.round(currentPricePerMeter * quantity);
  
  // Определяем активную скидку для подсветки
  const getActiveTier = (qty) => {
    const sortedTiers = [...DISCOUNT_TIERS].sort((a, b) => b.minQuantity - a.minQuantity);
    return sortedTiers.find(tier => qty >= tier.minQuantity) || null;
  };
  
  const activeTier = getActiveTier(quantity);
  const baseDiscountPrice = product.discountPrice || (product.price * (1 - (product.discount || 0) / 100));
  
  const description = product.description || '';
  const shouldShowReadMore = description.length > 200;
  const displayDescription = showFullDescription 
    ? description 
    : (shouldShowReadMore ? description.substring(0, 200) + '...' : description);

  // Проверяем есть ли скидка (корректная проверка)
  const hasDiscount = product.discount > 0;

  return (
    <div className={styles.container}>
      <BreadcrumbsCompressed items={breadcrumbs} />
      <div className={styles.content}>
        <div className={styles.imagesSection}>
          <div className={styles.mainImage} onClick={() => openModal(selectedImageIndex)}>
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name}
                onError={() => handleImageError(selectedImageIndex)}
              />
            ) : (
              <div className={styles.placeholderImage}>Нет изображения</div>
            )}
          </div>
          {validImages.length > 0 && (
            <div className={styles.thumbnailImages}>
              {validImages.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${selectedImageIndex === index ? styles.thumbnailActive : ''}`}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    openModal(index);
                  }}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    onError={() => handleImageError(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.productInfo}>
          <div className={styles.productHeader}>
            <div className={styles.productTitleSection}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              <p className={styles.productArticle}>Артикул: {product.article || `KJ${product.id}`}</p>
            </div>
            {hasDiscount && (
              <div className={styles.discountBadge}>
                <span>Скидка {product.discount}%</span>
              </div>
            )}
          </div>
          
          <div className={styles.productActions}>
            <div className={styles.quantitySection}>
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
            <div className={styles.priceSection}>
              {/* Показываем старую цену только если есть скидка */}
              {currentPricePerMeter < product.price && (
                <p className={styles.oldPrice}>{product.price} ₽ /м</p>
              )}
              <p className={styles.newPrice}>{Math.round(currentPricePerMeter)} ₽ /м</p>
              {quantity > 0 && (
                <p className={styles.totalPrice}>Итого: {totalPrice} ₽</p>
              )}
            </div>
          </div>
          <div className={styles.actionButtons}>
            <button 
              className={styles.addToCartButton} 
              onClick={handleAddToCart}
              disabled={isAddingToCart || (product.stock !== undefined && product.stock <= 0)}
            >
              {isAddingToCart ? 'Добавление...' : 'В корзину'}
            </button>
            <button 
              className={styles.buyNowButton} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logger.log('Кнопка Оформить нажата');
                handleBuyNow();
              }}
              disabled={(product.stock !== undefined && product.stock <= 0) || quantity <= 0}
            >
              Оформить
            </button>
          </div>

          {product.stock !== undefined && product.stock <= 0 && (
            <p className={styles.outOfStock}>Товар закончился</p>
          )}
          <div className={styles.productDetails}>
            <div className={styles.characteristics}>
              <h2 className={styles.sectionTitle}>Характеристики</h2>
              <div className={styles.characteristicsTable}>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Состав</span>
                  <span className={styles.characteristicsValue}>{product.composition || DEFAULT_PRODUCT_VALUES.composition}</span>
                </div>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Ширина</span>
                  <span className={styles.characteristicsValue}>{product.width || DEFAULT_PRODUCT_VALUES.width}</span>
                </div>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Плотность</span>
                  <span className={styles.characteristicsValue}>{product.density || DEFAULT_PRODUCT_VALUES.density}</span>
                </div>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Страна производства</span>
                  <span className={styles.characteristicsValue}>{product.country || DEFAULT_PRODUCT_VALUES.country}</span>
                </div>
              </div>
            </div>
            <div className={styles.description}>
              <h2 className={styles.sectionTitle}>Описание</h2>
              <div className={styles.descriptionContent}>
                <p className={styles.descriptionText}>
                  {displayDescription}
                </p>
                {shouldShowReadMore && (
                  <button
                    className={styles.readMoreButton}
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? 'Свернуть' : 'Читать полностью'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Блок рекомендованных товаров */}
      {recommendedProducts.length > 0 && (
        <ProductSection 
          title="Рекомендованные товары" 
          products={recommendedProducts} 
          linkTo={SHOP_ROUTE}
          keyPrefix="recommended"
          noPadding={true}
        />
      )}

      {/* Модальное окно для просмотра изображений */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalImageContainer}>
              <img 
                src={validImages[modalImageIndex]} 
                alt={`${product.name} ${modalImageIndex + 1}`}
                className={styles.modalImage}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeButton} onClick={closeModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M0.530273 12.5303L6.53027 6.53027M12.5303 0.530273L6.53027 6.53027M6.53027 6.53027L0.530273 0.530273L12.5303 12.5303" stroke="#888888" strokeWidth="1.5"/>
                </svg>
              </button>
              <button className={styles.modalCloseText} onClick={closeModal}>
                Закрыть
              </button>
            </div>
            
            {/* Стрелки навигации */}
            {modalImageIndex > 0 && (
              <button className={`${styles.navButton} ${styles.prevButton}`} onClick={prevImage}>
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            {modalImageIndex < validImages.length - 1 && (
              <button className={`${styles.navButton} ${styles.nextButton}`} onClick={nextImage}>
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L7 7L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});