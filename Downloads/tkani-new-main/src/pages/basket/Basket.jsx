import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Basket.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { cartAPI } from "../../http/api";
import { SHOP_ROUTE, DISCOUNT_TIERS, CONTACT_PHONE, TELEGRAM_LINK } from "../../utils/consts";
import { showToast } from "../../components/ui/Toast";

export const Basket = observer(() => {
  console.log('Basket component rendering...');
  
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Basket useEffect triggered, calling loadCart()');
    loadCart();
  }, []);

  useEffect(() => {
    // Обновляем состояние "Выбрать все" при изменении выбранных товаров
    if (cartItems.length > 0) {
      setSelectAll(selectedItems.size === cartItems.length && cartItems.length > 0);
    }
  }, [selectedItems, cartItems]);

  const loadCart = async () => {
    setIsLoading(true);
    setError(null);
    
    console.log('=== Начало загрузки корзины ===');
    console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1');
    
    try {
      console.log('Вызов cartAPI.getCart()...');
      const response = await cartAPI.getCart();
      
      // Логируем ответ для отладки
      console.log('=== Ответ от API ===');
      console.log('Cart API Response:', response);
      console.log('Тип ответа:', typeof response);
      console.log('Является массивом:', Array.isArray(response));
      
      // Обрабатываем разные форматы ответа
      let items = [];
      
      // Новый формат: { items: [...] }
      if (response && response.items && Array.isArray(response.items)) {
        items = response.items;
      }
      // Формат: { data: { items: [...] } }
      else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      }
      // Формат: { cart: [...] }
      else if (response && response.cart && Array.isArray(response.cart)) {
        items = response.cart;
      }
      // Формат: массив напрямую
      else if (Array.isArray(response)) {
        items = response;
      }
      // Формат: { data: [...] }
      else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      // Если ответ пустой или null
      else if (!response) {
        items = [];
      }
      // Неожиданный формат
      else {
        console.warn('Неожиданный формат ответа корзины:', response);
        items = [];
      }
      
      if (import.meta.env.DEV) {
        console.log('Parsed cart items:', items);
      }
      
      setCartItems(items);
      // Автоматически выбираем все товары при загрузке
      if (items.length > 0) {
        setSelectedItems(new Set(items.map(item => (item.product?.id || item.id))));
      } else {
        setSelectedItems(new Set());
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      });
      
      // Показываем более детальную ошибку
      if (error.status === 401) {
        setError('Необходима авторизация для просмотра корзины');
      } else if (error.status === 404) {
        setError('Корзина не найдена');
      } else if (error.status >= 500) {
        setError('Ошибка сервера. Попробуйте позже');
      } else {
        setError(`Не удалось загрузить корзину: ${error.message || 'Неизвестная ошибка'}`);
      }
      
      setCartItems([]);
      setSelectedItems(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => (item.product?.id || item.id))));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleRemoveItem = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      showToast('Товар удален из корзины', 'success');
      loadCart();
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      showToast('Не удалось удалить товар', 'error');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    if (newQuantity > 1000) {
      showToast('Максимальное количество: 1000 метров', 'error');
      return;
    }
    try {
      await cartAPI.updateCart(productId, newQuantity);
      loadCart();
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      showToast('Не удалось обновить количество', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Breadcrumbs />
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Breadcrumbs />
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  // Пустая корзина
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Breadcrumbs />
          <h1 className={styles.title}>Корзина</h1>
        </div>
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H20C20.5523 4 21 4.44772 21 5C21 5.55228 20.5523 6 20 6H19V19C19 20.6569 17.6569 22 16 22H8C6.34315 22 5 20.6569 5 19V6H4C3.44772 6 3 5.55228 3 5C3 4.44772 3.44772 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19V6H7Z" fill="#A8A090"/>
            </svg>
          </div>
          <div className={styles.emptyCartContent}>
            <p className={styles.emptyCartText}>Тут пока пусто</p>
            <Link to={SHOP_ROUTE} className={styles.backToHomeButton}>
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Расчет итогов
  const selectedItemsList = cartItems.filter(item => {
    const itemId = item.product?.id || item.id;
    return selectedItems.has(itemId);
  });

  const subtotal = selectedItemsList.reduce((sum, item) => {
    const product = item.product || item;
    const price = product.price || item.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const discount = selectedItemsList.reduce((sum, item) => {
    const product = item.product || item;
    const originalPrice = product.price || item.price || 0;
    const discountPrice = product.discountPrice || (originalPrice * (1 - (product.discount || 0) / 100));
    const quantity = item.quantity || 1;
    return sum + ((originalPrice - discountPrice) * quantity);
  }, 0);

  const total = subtotal - discount;

  return (
    <div className={styles.container}>
      <Breadcrumbs />
      <div className={styles.cartContent}>
        <div className={styles.cartItemsSection}>
          <div className={styles.cartHeader}>
            <h1 className={styles.title}>Корзина</h1>
            <p className={styles.itemsCount}>{cartItems.length} {cartItems.length === 1 ? 'товар' : cartItems.length < 5 ? 'товара' : 'товаров'}</p>
          </div>
          <div className={styles.cartItemsList}>
            <div className={styles.selectAllRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className={styles.checkboxInput}
                />
                <div className={`${styles.checkboxCustom} ${selectAll ? styles.checkboxChecked : ''}`}>
                  {selectAll && (
                    <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={styles.selectAllText}>Выбрать все</span>
              </label>
            </div>
            <div className={styles.itemsList}>
              {cartItems.map((item, index) => {
                // Обрабатываем разные форматы данных из API
                let product, itemId, quantity, originalPrice, discountPrice;
                
                // Формат 1: { product: {...}, quantity: ... }
                if (item.product) {
                  product = item.product;
                  itemId = product.id || item.id;
                  quantity = item.quantity || 1;
                  originalPrice = product.price || 0;
                  discountPrice = product.discountPrice || product.discount_price || (originalPrice * (1 - (product.discount || 0) / 100));
                }
                // Формат 2: товар напрямую в item
                else {
                  product = item;
                  itemId = item.id || item.product_id;
                  quantity = item.quantity || 1;
                  originalPrice = item.price || 0;
                  discountPrice = item.discountPrice || item.discount_price || (originalPrice * (1 - (item.discount || 0) / 100));
                }
                
                // Логируем для отладки
                if (import.meta.env.DEV && index === 0) {
                  console.log('Sample cart item structure:', {
                    rawItem: item,
                    parsedProduct: product,
                    itemId,
                    quantity,
                    originalPrice,
                    discountPrice
                  });
                }
                
                const isSelected = selectedItems.has(itemId);
                const hasDiscount = discountPrice < originalPrice;

                return (
                  <div key={itemId} className={styles.cartItem}>
                    <div className={styles.itemLeft}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(itemId)}
                          className={styles.checkboxInput}
                        />
                        <div className={`${styles.checkboxCustom} ${isSelected ? styles.checkboxChecked : ''}`}>
                          {isSelected && (
                            <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </label>
                      <div className={styles.itemContent}>
                        <div className={styles.itemImage}>
                          <img 
                            src={product.image || product.img || product.images?.[0] || '/placeholder-product.jpg'} 
                            alt={product.name || product.title || 'Товар'}
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div className={styles.itemInfo}>
                          <h3 className={styles.itemName}>{product.name || product.title || 'Без названия'}</h3>
                          <div className={styles.quantityControl}>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateQuantity(itemId, quantity - 0.1)}
                              disabled={quantity <= 0.1}
                            >
                              <span>-</span>
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              value={quantity}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value) && value >= 0.1) {
                                  handleUpdateQuantity(itemId, value);
                                }
                              }}
                              className={styles.quantityInput}
                            />
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateQuantity(itemId, quantity + 0.1)}
                            >
                              <span>+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <div className={styles.itemPrice}>
                        {hasDiscount ? (
                          <>
                            <span className={styles.currentPrice}>{Math.round(discountPrice)} ₽</span>
                            <span className={styles.oldPrice}>{originalPrice} ₽</span>
                          </>
                        ) : (
                          <span className={styles.currentPrice}>{originalPrice} ₽</span>
                        )}
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveItem(itemId)}
                        aria-label="Удалить товар"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="#888888" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.orderSummary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Итоговый заказ</h2>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>{selectedItemsList.length} {selectedItemsList.length === 1 ? 'товар' : selectedItemsList.length < 5 ? 'товара' : 'товаров'} на сумму</span>
                <span className={styles.summaryValue}>{Math.round(subtotal)} ₽</span>
              </div>
              {discount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Скидка</span>
                  <span className={styles.summaryValue}>{Math.round(discount)} ₽</span>
                </div>
              )}
              <div className={styles.summaryTotalRow}>
                <span className={styles.summaryTotalLabel}>{selectedItemsList.length} {selectedItemsList.length === 1 ? 'товар' : selectedItemsList.length < 5 ? 'товара' : 'товаров'}</span>
                <span className={styles.summaryTotalValue}>{Math.round(total)} ₽</span>
              </div>
            </div>
            <button className={styles.checkoutButton}>
              Оформить заказ
            </button>
          </div>
          <div className={styles.discountInfo}>
            <p>
              <span className={styles.discountInfoLabel}>Персональные скидки от количества:</span>
              <br />
              {DISCOUNT_TIERS.sort((a, b) => a.minQuantity - b.minQuantity).map((tier, index) => (
                <span key={index}>
                  От {tier.minQuantity}м одного отреза - <span className={styles.discountInfoPrice}>{tier.price} ₽</span>
                  {index < DISCOUNT_TIERS.length - 1 && <br />}
                </span>
              ))}
            </p>
            <p>
              Запросить цену от 30 метров: <a href={`tel:${CONTACT_PHONE}`} className={styles.discountInfoPhone}>{CONTACT_PHONE.replace('+7', '8')}</a>
            </p>
          </div>
          <div className={styles.socialLinks}>
            <a 
              href={TELEGRAM_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Telegram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 14.95 9.7 15.02 9.37C15.03 9.3 15.03 9.13 14.93 9.05C14.84 8.97 14.7 9 14.59 9.02C14.43 9.05 12.34 10.24 8.31 12.58C7.71 12.94 7.17 13.11 6.69 13.1C6.15 13.08 5.1 12.84 4.29 12.63C3.33 12.38 2.57 12.25 2.63 11.76C2.66 11.52 2.98 11.28 3.55 11.03C7.31 9.25 10.13 8.01 12.01 7.31C15.7 5.89 16.4 5.66 16.9 5.66C16.99 5.66 17.21 5.68 17.36 5.81C17.49 5.92 17.53 6.06 17.55 6.15C17.57 6.24 17.59 6.45 17.57 6.6L16.64 8.8Z" fill="#9B1E1C"/>
              </svg>
            </a>
            <a 
              href={`https://wa.me/${CONTACT_PHONE.replace('+', '')}`}
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="#9B1E1C"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});
