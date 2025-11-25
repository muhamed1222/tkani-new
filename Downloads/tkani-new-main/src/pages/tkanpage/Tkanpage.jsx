import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Tkanpage.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { Context } from "../../main";
import { cartAPI } from "../../http/api";
import { BASKET_ROUTE, DEFAULT_PRODUCT_VALUES, DISCOUNT_TIERS, CONTACT_PHONE, TELEGRAM_LINK, SHOP_ROUTE } from "../../utils/consts";
import { showToast } from "../../components/ui/Toast";
import { ProductSection } from "../../components/productsection2/ProductSection";

export const Tkanpage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tkans } = useContext(Context);
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

  // Переносим проверки загрузки и ошибок в самое начало рендера
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

  const handleDecrease = () => {
    if (quantity > 0.5) {
      const newValue = Math.max(0.5, quantity - 0.1);
      setQuantity(Math.round(newValue * 10) / 10);
    }
  };

  const handleIncrease = () => {
    if (quantity >= 1000) {
      showToast('Максимальное количество: 1000 метров', 'error');
      return;
    }
    const newValue = Math.min(1000, quantity + 0.1);
    setQuantity(Math.round(newValue * 10) / 10);
  };

  const handleQuantityChange = (e) => {
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

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart(product.id, quantity);
      showToast('Товар добавлен в корзину', 'success');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      showToast('Не удалось добавить товар в корзину', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart(product.id, quantity);
      showToast('Товар добавлен в корзину', 'success');
      setTimeout(() => {
        navigate(BASKET_ROUTE);
      }, 500);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      showToast('Не удалось добавить товар в корзину', 'error');
      setIsAddingToCart(false);
    }
  };

  // Функция расчета цены с учетом персональных скидок
  const calculatePrice = (qty) => {
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

  // Подготавливаем данные для секций продуктов (аналогично Shop компоненту)
  const prepareProductsData = () => {
    const allProducts = tkans.tkans || [];
    const currentProductId = product.id;

    // Исключаем текущий товар из рекомендаций
    const otherProducts = allProducts.filter(p => p.id !== currentProductId);
    
    // 1. Новинки - сортируем по новизне (по ID в обратном порядке)
    const newArrivals = [...otherProducts]
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
    
    // 2. Акции и скидки - только товары со скидкой больше 0%
    const discountedProducts = otherProducts
      .filter(p => p.discount > 0)
      .slice(0, 4);
    
    // 3. Похожие товары - по тому же типу или бренду
    const similarProducts = otherProducts
      .filter(p => p.typeId === product.typeId || p.brandId === product.brandId)
      .slice(0, 4);
    
    // Если похожих товаров мало, добавляем случайные
    if (similarProducts.length < 4) {
      const randomProducts = otherProducts
        .filter(p => !similarProducts.some(sp => sp.id === p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4 - similarProducts.length);
      similarProducts.push(...randomProducts);
    }

    return {
      newArrivals,
      discountedProducts, 
      similarProducts
    };
  };

  const productsData = prepareProductsData();

  return (
    <div className={styles.container}>
      <Breadcrumbs />
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
              <div className={styles.quantityControl}>
                <button
                  className={styles.quantityButton}
                  onClick={handleDecrease}
                  disabled={quantity <= 0.5}
                >
                  <span>-</span>
                </button>
                <input
                  type="number"
                  step="0.1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  className={styles.quantityInput}
                />
                <button
                  className={styles.quantityButton}
                  onClick={handleIncrease}
                >
                  <span>+</span>
                </button>
              </div>
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
              {isAddingToCart ? 'Добавление...' : 'Добавить в корзину'}
            </button>
            <button 
              className={styles.buyNowButton} 
              onClick={handleBuyNow}
              disabled={isAddingToCart || (product.stock !== undefined && product.stock <= 0)}
            >
              {isAddingToCart ? 'Добавление...' : 'Купить в один клик'}
            </button>
          </div>

   {/* Блок персональных скидок */}
{quantity >= 5 && (
  <div className={styles.discountInfo}>
    <p className={styles.discountInfoLabel}>Персональные скидки от количества:</p>
    <p className={quantity >= 5 && quantity < 10 ? styles.discountTierActive : styles.discountInfoPrice}>
      От 5м одного отреза - 640 ₽
    </p>
    <p className={quantity >= 10 ? styles.discountTierActive : styles.discountInfoPrice}>
      От 10м одного отреза - 420 ₽
    </p>
    <p className={styles.discountInfoContact}>
      Запросить цену от 30 метров:{" "}
      <a href={`tel:${CONTACT_PHONE}`} className={styles.discountInfoPhone}>
        {CONTACT_PHONE}
      </a>
    </p>
    <a 
      href={TELEGRAM_LINK} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.discountInfoLink}
    >
      Телеграм
    </a>
  </div>
)}
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

      {/* Секции с товарами под карточкой товара */}
      {tkans.isLoading ? (
        <div className="flex justify-center items-center py-[40px]">
          <div className="text-[#888888] text-[16px]">Загрузка товаров...</div>
        </div>
      ) : tkans.error ? (
        <div className="flex justify-center items-center py-[40px]">
          <div className="text-[#9b1e1c] text-[16px]">Ошибка загрузки: {tkans.error}</div>
        </div>
      ) : (
        <>
          {/* Похожие товары */}
          {productsData.similarProducts.length > 0 && (
            <ProductSection 
              title="Похожие товары" 
              products={productsData.similarProducts} 
              linkTo={SHOP_ROUTE}
              keyPrefix="similar"
            />
          )}
          
        </>
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