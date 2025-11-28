import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./WorkPage.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { Context } from "../../main";
import { cartAPI } from "../../http/api";
import { showToast } from "../../components/ui/Toast";
import { ProductSection } from "../../components/productsection2/ProductSection";
import { SHOP_ROUTE } from "../../utils/consts";

export const WorkPage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { works, tkans, cart } = useContext(Context); 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [addingProducts, setAddingProducts] = useState({}); // Состояние для отслеживания добавления каждого товара

  useEffect(() => {
    if (id) {
      works.fetchWorkById(id);
    }
    // Также загружаем все товары для секций
    if (!tkans.tkans || tkans.tkans.length === 0) {
      tkans.fetchTkans();
    }
  }, [id, works, tkans]);

  const work = works.selectedWork;
  const isLoading = works.isLoadingWork;
  const error = works.errorWork;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || "Работа не найдена"}
        </div>
      </div>
    );
  }

  const images = work.images || (work.image ? [work.image] : []);
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

  // Функция добавления в корзину
  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (addingProducts[productId]) return;
    
    setAddingProducts(prev => ({ ...prev, [productId]: true }));
    
    try {
      await cartAPI.addToCart(productId, 1.0); // Добавляем 1 метр по умолчанию
      showToast('Товар добавлен в корзину', 'success');
      // Обновляем данные корзины в store
      cart.fetchCart();
    } catch (error) {
    } finally {
      setAddingProducts(prev => ({ ...prev, [productId]: false }));
    }
  };

  const description = work.description || '';
  const shouldShowReadMore = description.length > 200;
  const displayDescription = showFullDescription 
    ? description 
    : (shouldShowReadMore ? description.substring(0, 200) + '...' : description);

  // Подготавливаем данные для секций с тканями
  const prepareProductsData = () => {
    const allProducts = tkans.tkans || [];
    
    // Берем 4 случайные ткани
    const similarProducts = [...allProducts]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    return {
      similarProducts
    };
  };

  const productsData = prepareProductsData();

  // Получаем 3 случайные ткани для карточек в описании
  const featuredProducts = tkans.tkans ? [...tkans.tkans].sort(() => Math.random() - 0.5).slice(0, 3) : [];

  return (
    <div className={styles.container}>
      <Breadcrumbs />
      <div className={styles.content}>
        <div className={styles.imagesSection}>
          <div className={styles.mainImage} onClick={() => openModal(selectedImageIndex)}>
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={work.title}
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
                    alt={`${work.title} ${index + 1}`}
                    onError={() => handleImageError(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.workInfo}>
          <div className={styles.workHeader}>
            <div className={styles.workTitleSection}>
              <h1 className={styles.workTitle}>{work.title}</h1>
      {work.link && work.link !== '#' && (
        <div className={styles.workLink}>

            {work.link}
      
        </div>
      )}
            </div>
          </div>
          
          {/* Заголовок "Ткани, использованные в работе" */}
          {featuredProducts.length > 0 && (
            <div className={styles.fabricsSection}>
              <h2 className={styles.fabricsTitle}>Ткани, использованные в работе</h2>
              
              {/* Карточки товаров */}
              <div className={styles.featuredProducts}>
                {/* Первая строка - 2 карточки */}
                <div className={styles.productsRow}>
                  {featuredProducts.slice(0, 2).map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productImage}>
                        <img 
                          src={product.image || product.img || "/placeholder-product.jpg"} 
                          alt={product.name}
                          className={styles.productImg}
                        />
                      </div>
                      <div className={styles.productContent}>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <div className={styles.productBottom}>
                          <span className={styles.productPrice}>
                            {product.discountPrice ? (
                              <>
                                <span className={styles.oldPrice}>{product.price} ₽</span>
                                <span className={styles.currentPrice}>{product.discountPrice} ₽</span>
                              </>
                            ) : (
                              <span className={styles.currentPrice}>{product.price} ₽</span>
                            )}
                          </span>
                          <button 
                            className={styles.cartButton}
                            onClick={(e) => handleAddToCart(product.id, e)}
                            disabled={addingProducts[product.id] || (product.stock !== undefined && product.stock <= 0)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M4.99951 4V4.75H3.01238C2.05284 4.75 1.24813 5.47444 1.14768 6.42872L0.38453 14.4287C0.26799 15.5358 1.13603 16.5 2.24922 16.5H13.75C14.8631 16.5 15.7312 15.5358 15.6147 14.4287L14.8515 6.42872C14.751 5.47444 13.9463 4.75 12.9868 4.75H10.9995V4C10.9995 2.34315 9.65636 1 7.99951 1C6.34266 1 4.99951 2.34315 4.99951 4ZM7.99951 2.5C7.17108 2.5 6.49951 3.17157 6.49951 4V4.75H9.49951V4C9.49951 3.17157 8.82794 2.5 7.99951 2.5ZM6.49951 9.25C6.49951 10.0746 7.17493 10.75 7.99951 10.75C8.82409 10.75 9.49951 10.0746 9.49951 9.25V8.5C9.49951 8.08579 9.16373 7.75 8.74951 7.75C8.3353 7.75 7.99951 8.08579 7.99951 8.5V9.25C7.99951 9.66421 7.66373 10 7.24951 10C6.8353 10 6.49951 9.66421 6.49951 9.25V8.5C6.49951 8.08579 6.16373 7.75 5.74951 7.75C5.3353 7.75 4.99951 8.08579 4.99951 8.5V9.25C4.99951 10.0746 5.67493 10.75 6.49951 10.75C7.32409 10.75 7.99951 10.0746 7.99951 9.25V8.5C7.99951 8.08579 8.3353 7.75 8.74951 7.75C9.16373 7.75 9.49951 8.08579 9.49951 8.5V9.25C9.49951 10.9069 8.15636 12.25 6.49951 12.25C4.84266 12.25 3.49951 10.9069 3.49951 9.25V8.5C3.49951 8.08579 3.8353 7.75 4.24951 7.75C4.66373 7.75 4.99951 8.08579 4.99951 8.5V9.25Z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Вторая строка - 1 карточка (если есть третья карточка) */}
                {featuredProducts.length > 2 && (
                  <div className={styles.productsRow}>
                    <div className={styles.productCard}>
                      <div className={styles.productImage}>
                        <img 
                          src={featuredProducts[2].image || featuredProducts[2].img || "/placeholder-product.jpg"} 
                          alt={featuredProducts[2].name}
                          className={styles.productImg}
                        />
                      </div>
                      <div className={styles.productContent}>
                        <h3 className={styles.productName}>{featuredProducts[2].name}</h3>
                        <div className={styles.productBottom}>
                          <span className={styles.productPrice}>
                            {featuredProducts[2].discountPrice ? (
                              <>
                                <span className={styles.oldPrice}>{featuredProducts[2].price} ₽</span>
                                <span className={styles.currentPrice}>{featuredProducts[2].discountPrice} ₽</span>
                              </>
                            ) : (
                              <span className={styles.currentPrice}>{featuredProducts[2].price} ₽</span>
                            )}
                          </span>
                          <button 
                            className={styles.cartButton}
                            onClick={(e) => handleAddToCart(featuredProducts[2].id, e)}
                            disabled={addingProducts[featuredProducts[2].id] || (featuredProducts[2].stock !== undefined && featuredProducts[2].stock <= 0)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M4.99951 4V4.75H3.01238C2.05284 4.75 1.24813 5.47444 1.14768 6.42872L0.38453 14.4287C0.26799 15.5358 1.13603 16.5 2.24922 16.5H13.75C14.8631 16.5 15.7312 15.5358 15.6147 14.4287L14.8515 6.42872C14.751 5.47444 13.9463 4.75 12.9868 4.75H10.9995V4C10.9995 2.34315 9.65636 1 7.99951 1C6.34266 1 4.99951 2.34315 4.99951 4ZM7.99951 2.5C7.17108 2.5 6.49951 3.17157 6.49951 4V4.75H9.49951V4C9.49951 3.17157 8.82794 2.5 7.99951 2.5ZM6.49951 9.25C6.49951 10.0746 7.17493 10.75 7.99951 10.75C8.82409 10.75 9.49951 10.0746 9.49951 9.25V8.5C9.49951 8.08579 9.16373 7.75 8.74951 7.75C8.3353 7.75 7.99951 8.08579 7.99951 8.5V9.25C7.99951 9.66421 7.66373 10 7.24951 10C6.8353 10 6.49951 9.66421 6.49951 9.25V8.5C6.49951 8.08579 6.16373 7.75 5.74951 7.75C5.3353 7.75 4.99951 8.08579 4.99951 8.5V9.25C4.99951 10.0746 5.67493 10.75 6.49951 10.75C7.32409 10.75 7.99951 10.0746 7.99951 9.25V8.5C7.99951 8.08579 8.3353 7.75 8.74951 7.75C9.16373 7.75 9.49951 8.08579 9.49951 8.5V9.25C9.49951 10.9069 8.15636 12.25 6.49951 12.25C4.84266 12.25 3.49951 10.9069 3.49951 9.25V8.5C3.49951 8.08579 3.8353 7.75 4.24951 7.75C4.66373 7.75 4.99951 8.08579 4.99951 8.5V9.25Z" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={styles.workDetails}>
            <div className={styles.description}>
              <h2 className={styles.sectionTitle}>Описание работы</h2>
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

      {/* Секции с товарами под карточкой работы */}
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
          {/* Посмотрите также (ткани) */}
          {productsData.similarProducts.length > 0 && (
            <ProductSection 
              title="Похожие ткани" 
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
                alt={`${work.title} ${modalImageIndex + 1}`}
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