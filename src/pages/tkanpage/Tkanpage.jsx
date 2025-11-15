import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Tkanpage.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { Context } from "../../main";
import { cartAPI } from "../../http/api";
import { BASKET_ROUTE } from "../../utils/consts";

export const Tkanpage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tkans } = useContext(Context);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1.0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      tkans.fetchTkanById(id);
    }
  }, [id, tkans]);

  const product = tkans.selectedTkan;
  const isLoading = tkans.isLoadingTkan;
  const error = tkans.errorTkan;

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

  const images = product.images || [product.img];
  const selectedImage = images[selectedImageIndex] || images[0];

  const handleDecrease = () => {
    if (quantity > 0.5) {
      const newValue = Math.max(0.5, quantity - 0.1);
      setQuantity(Math.round(newValue * 10) / 10);
    }
  };

  const handleIncrease = () => {
    const newValue = quantity + 0.1;
    setQuantity(Math.round(newValue * 10) / 10);
  };

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '' || inputValue === '.') {
      setQuantity('');
      return;
    }
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
  };

  const handleQuantityBlur = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0.5 || e.target.value === '') {
      setQuantity(0.5);
    } else {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      await cartAPI.addToCart(product.id, quantity);
      alert('Товар добавлен в корзину');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      alert('Не удалось добавить товар в корзину');
    }
  };

  const handleBuyNow = async () => {
    try {
      await cartAPI.addToCart(product.id, quantity);
      // Перенаправляем на страницу корзины
      navigate(BASKET_ROUTE);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      alert('Не удалось добавить товар в корзину');
    }
  };

  const discountPrice = product.discountPrice || (product.price * (1 - (product.discount || 0) / 100));
  const description = product.description || '';
  const shouldShowReadMore = description.length > 200;
  const displayDescription = showFullDescription 
    ? description 
    : (shouldShowReadMore ? description.substring(0, 200) + '...' : description);

  return (
    <div className={styles.container}>
      <Breadcrumbs />
      <div className={styles.content}>
        <div className={styles.imagesSection}>
          <div className={styles.mainImage}>
            <img src={selectedImage} alt={product.name} />
          </div>
          <div className={styles.thumbnailImages}>
            {images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={`${styles.thumbnail} ${selectedImageIndex === index ? styles.thumbnailActive : ''}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.productInfo}>
          <div className={styles.productHeader}>
            <div className={styles.productTitleSection}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              <p className={styles.productArticle}>Артикул: {product.article || `KJ${product.id}`}</p>
            </div>
            {product.discount && (
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
              <p className={styles.oldPrice}>{product.price} ₽ /м</p>
              <p className={styles.newPrice}>{Math.round(discountPrice)} ₽ /м</p>
            </div>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.addToCartButton} onClick={handleAddToCart}>
              Добавить в корзину
            </button>
            <button className={styles.buyNowButton} onClick={handleBuyNow}>
              Купить в один клик
            </button>
          </div>
          <div className={styles.discountInfo}>
            <p>
              <span className={styles.discountInfoLabel}>Персональные скидки от количества:</span>
              <br />
              От 5м одного отреза - <span className={styles.discountInfoPrice}>640 ₽</span>
              <br />
              От 10м одного отреза - <span className={styles.discountInfoPrice}>420 ₽</span>
            </p>
            <p>
              Запросить цену от 30 метров: <span className={styles.discountInfoPhone}>8 (928) 716-66-26</span>
            </p>
            <p className={styles.discountInfoLink}>Телеграм</p>
          </div>
          <div className={styles.productDetails}>
            <div className={styles.characteristics}>
              <h2 className={styles.sectionTitle}>Характеристики</h2>
              <div className={styles.characteristicsTable}>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Состав</span>
                  <span className={styles.characteristicsValue}>{product.composition || '100% хлопок'}</span>
                </div>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Ширина</span>
                  <span className={styles.characteristicsValue}>{product.width || '150см'}</span>
                </div>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Плотность</span>
                  <span className={styles.characteristicsValue}>{product.density || '90гр'}</span>
                </div>
                <div className={styles.characteristicsRow}>
                  <span className={styles.characteristicsLabel}>Страна производства</span>
                  <span className={styles.characteristicsValue}>{product.country || 'Россия'}</span>
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
    </div>
  );
});
