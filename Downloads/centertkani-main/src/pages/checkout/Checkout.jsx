// src/pages/checkout/Checkout.jsx
import logger from '../../utils/logger';
import { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Checkout.module.css";
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from "../../components/breadcrumbs";
import { Context } from "../../main";
import { cartAPI } from "../../http/api";
import { SHOP_ROUTE } from "../../utils/consts";
import { showToast } from "../../components/ui/Toast";
import { buildImageUrl } from "../../utils/apiConfig";

export const Checkout = observer(() => {
  const context = useContext(Context);
  const breadcrumbs = useAutoBreadcrumbs({ context });
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Данные формы
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    address: "",
    postcode: "",
    region: "",
    orderComments: "",
    deliveryMethod: "pickup",
    paymentMethod: "card"
  });

  const [formErrors, setFormErrors] = useState({});

  // Функция валидации формы
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "Имя обязательно для заполнения";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Фамилия обязательна для заполнения";
    }

    if (!formData.email.trim()) {
      errors.email = "Email обязателен для заполнения";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Введите корректный email адрес";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Телефон обязателен для заполнения";
    }

    // Валидация адреса доставки (если не самовывоз)
    if (formData.deliveryMethod !== 'pickup') {
      if (!formData.city.trim()) {
        errors.city = "Город обязателен для заполнения";
      }
      if (!formData.address.trim()) {
        errors.address = "Адрес обязателен для заполнения";
      }
      if (!formData.postcode.trim()) {
        errors.postcode = "Почтовый индекс обязателен для заполнения";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Заполните все обязательные поля правильно', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Формируем полное имя клиента
      const fullNameParts = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean);
      const fullName = fullNameParts.join(' ').trim();
      
      // Формируем полный адрес доставки
      let deliveryAddress = '';
      if (formData.deliveryMethod === 'pickup') {
        deliveryAddress = 'ул. Кабардинская 158, Нальчик, КБР';
      } else {
        const addressParts = [];
        if (formData.address) addressParts.push(formData.address.trim());
        if (formData.city) addressParts.push(`г. ${formData.city.trim()}`);
        if (formData.region) addressParts.push(formData.region.trim());
        if (formData.postcode) addressParts.push(`индекс: ${formData.postcode.trim()}`);
        deliveryAddress = addressParts.join(', ');
      }

      // Формируем данные для checkout
      const checkoutData = {
        // Личные данные
        customer_name: fullName,
        customer_firstName: formData.firstName.trim(),
        customer_lastName: formData.lastName.trim(),
        customer_middleName: formData.middleName.trim() || '',
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        customer_company: formData.company.trim() || '',
        
        // Адресные данные
        customer_city: formData.city.trim() || '',
        customer_address: formData.address.trim() || '',
        customer_postcode: formData.postcode.trim() || '',
        customer_region: formData.region.trim() || '',
        
        // Данные доставки
        delivery_method: formData.deliveryMethod,
        delivery_address: deliveryAddress,
        delivery_type: formData.deliveryMethod === 'pickup' ? 'pickup' : 'delivery',
        delivery_price: getDeliveryCost(),
        
        // Данные оплаты
        payment_method: formData.paymentMethod,
        
        // Комментарий к заказу
        order_comments: formData.orderComments.trim() || '',
        
        // Товары из корзины
        items: cartItems.map(item => {
          const product = item.product || item;
          const price = product.discount_price || product.price || 0;
          const quantity = item.quantity || 1;
          
          return {
            product_name: product.name || product.title || 'Товар',
            product_article: product.article || 'N/A',
            product_price: price,
            quantity: quantity,
            total: price * quantity
          };
        }),
        
        // Итоговые суммы
        subtotal: Math.round(subtotal),
        discount: Math.round(discount),
        delivery_cost: getDeliveryCost(),
        total: Math.round(finalTotal)
      };

      logger.log('📤 Отправляемые данные заказа:', JSON.stringify(checkoutData, null, 2));

      // Используем checkout метод корзины
      const response = await cartAPI.checkout(checkoutData);
      
      if (response.success) {
        showToast('Заказ успешно оформлен! Проверьте вашу почту', 'success');
        
        // Очистка корзины после успешного заказа
        await cartAPI.clearCart();
        
        // Перенаправление на страницу профиля с заказами
        navigate('/');
      } else {
        throw new Error(response.message || 'Ошибка оформления заказа');
      }
      
    } catch (error) {
      logger.error('Ошибка оформления заказа:', error);
      showToast(error.message || 'Не удалось оформить заказ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Загрузка корзины при монтировании или использование одного товара из state
  useEffect(() => {
    // Проверяем, передан ли один товар через state
    if (location.state?.singleProduct) {
      const singleProduct = location.state.singleProduct;
      setCartItems([singleProduct]);
      setIsLoading(false);
      logger.log('Используется один товар для оформления:', singleProduct);
    } else {
      // Загружаем корзину как обычно
      loadCart();
    }
  }, [location.state]);

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response && response.data && response.data.items) {
        const validItems = response.data.items.filter(item => item.product);
        setCartItems(validItems);
      }
    } catch (error) {
      logger.error('Ошибка загрузки корзины:', error);
      showToast('Не удалось загрузить корзину', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Расчеты стоимости
  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.product || item;
    const price = product.discount_price || product.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const discount = cartItems.reduce((sum, item) => {
    const product = item.product || item;
    const originalPrice = product.price || 0;
    const discountPrice = product.discount_price || originalPrice;
    const quantity = item.quantity || 1;
    return sum + ((originalPrice - discountPrice) * quantity);
  }, 0);

  const total = subtotal - discount;

  // Стоимость доставки
  const getDeliveryCost = () => {
    switch (formData.deliveryMethod) {
      case 'pickup': return 0;
      case 'russian_post': return 190;
      case 'cdek': return 390;
      case 'ozon': return 490;
      default: return 0;
    }
  };

  const deliveryCost = getDeliveryCost();
  const finalTotal = total + deliveryCost;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <BreadcrumbsCompressed items={breadcrumbs} />
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <BreadcrumbsCompressed items={breadcrumbs} />
        <div className={styles.emptyCart}>
          <p>Корзина пуста</p>
          <Link to={SHOP_ROUTE} className={styles.backToShop}>
            Вернуться в магазин
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BreadcrumbsCompressed items={breadcrumbs} />
      
      <div className={styles.checkoutContent}>
        <div className={styles.checkoutForm}>
          <h1 className={styles.title}>Оформление заказа</h1>
          
          <form id="checkout-form" onSubmit={handleSubmit}>
            {/* Личные данные */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Личные данные</h2>
                <span className={styles.stepNumber}>Шаг 1</span>
              </div>
              <div className={`${styles.formRow} ${styles.formRowThree}`}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Имя *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.firstName ? styles.inputError : ''}`}
                    required
                    placeholder="Введите имя"
                  />
                  {formErrors.firstName && (
                    <p className={styles.fieldError}>{formErrors.firstName}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Фамилия *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.lastName ? styles.inputError : ''}`}
                    required
                    placeholder="Введите фамилию"
                  />
                  {formErrors.lastName && (
                    <p className={styles.fieldError}>{formErrors.lastName}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Отчество</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Введите отчество (необязательно)"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                    required
                    placeholder="example@mail.ru"
                  />
                  {formErrors.email && (
                    <p className={styles.fieldError}>{formErrors.email}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Телефон *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                    required
                    placeholder="+7 (999) 999-99-99"
                  />
                  {formErrors.phone && (
                    <p className={styles.fieldError}>{formErrors.phone}</p>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Компания (необязательно)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Название компании"
                  />
                </div>
              </div>
            </div>

            {/* Адрес доставки (показывается только если не самовывоз) */}
            {formData.deliveryMethod !== 'pickup' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Адрес доставки</h2>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Город *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.city ? styles.inputError : ''}`}
                      placeholder="Например: Москва"
                      required={formData.deliveryMethod !== 'pickup'}
                    />
                    {formErrors.city && (
                      <p className={styles.fieldError}>{formErrors.city}</p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Регион/Область</label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Например: Московская область"
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Адрес *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.address ? styles.inputError : ''}`}
                      placeholder="Улица, дом, квартира"
                      required={formData.deliveryMethod !== 'pickup'}
                    />
                    {formErrors.address && (
                      <p className={styles.fieldError}>{formErrors.address}</p>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Почтовый индекс *</label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className={`${styles.input} ${formErrors.postcode ? styles.inputError : ''}`}
                      placeholder="Например: 123456"
                      required={formData.deliveryMethod !== 'pickup'}
                    />
                    {formErrors.postcode && (
                      <p className={styles.fieldError}>{formErrors.postcode}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Способ доставки */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Способ доставки</h2>
                <span className={styles.stepNumber}>Шаг 2</span>
              </div>
              <div className={styles.deliveryOptions}>
                <label className={`${styles.deliveryRadioLabel} ${formData.deliveryMethod === 'pickup' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={handleInputChange}
                    className={styles.deliveryRadioInput}
                  />
                  <div className={styles.deliveryRadioCustom}></div>
                  <div className={styles.deliveryRadioContent}>
                    <div>
                      <span className={styles.deliveryRadioTitle}>Самовывоз</span>
                    </div>
                    <div>
                      <span className={styles.deliveryRadioDescription}>ул. Кабардинская 158, Нальчик, КБР</span>
                    </div>
                    <span className={styles.deliveryRadioPrice}>Бесплатно</span>
                  </div>
                </label>

                <label className={`${styles.deliveryRadioLabel} ${formData.deliveryMethod === 'russian_post' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="russian_post"
                    checked={formData.deliveryMethod === 'russian_post'}
                    onChange={handleInputChange}
                    className={styles.deliveryRadioInput}
                  />
                  <div className={styles.deliveryRadioCustom}></div>
                  <div className={styles.deliveryRadioContent}>
                    <div>
                      <span className={styles.deliveryRadioTitle}>Почта России</span>
                    </div>
                    <div>
                      <span className={styles.deliveryRadioDescription}>5-7 дней</span>
                    </div>
                    <span className={styles.deliveryRadioPrice}>~190 ₽</span>
                  </div>
                </label>

                <label className={`${styles.deliveryRadioLabel} ${formData.deliveryMethod === 'cdek' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="cdek"
                    checked={formData.deliveryMethod === 'cdek'}
                    onChange={handleInputChange}
                    className={styles.deliveryRadioInput}
                  />
                  <div className={styles.deliveryRadioCustom}></div>
                  <div className={styles.deliveryRadioContent}>
                    <div>
                      <span className={styles.deliveryRadioTitle}>СДЭК</span>
                    </div>
                    <div>
                      <span className={styles.deliveryRadioDescription}>2-4 дня</span>
                    </div>
                    <span className={styles.deliveryRadioPrice}>~390 ₽</span>
                  </div>
                </label>

                <label className={`${styles.deliveryRadioLabel} ${formData.deliveryMethod === 'ozon' ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="ozon"
                    checked={formData.deliveryMethod === 'ozon'}
                    onChange={handleInputChange}
                    className={styles.deliveryRadioInput}
                  />
                  <div className={styles.deliveryRadioCustom}></div>
                  <div className={styles.deliveryRadioContent}>
                    <div>
                      <span className={styles.deliveryRadioTitle}>Ozon</span>
                    </div>
                    <div>
                      <span className={styles.deliveryRadioDescription}>1-2 дня</span>
                    </div>
                    <span className={styles.deliveryRadioPrice}>~490 ₽</span>
                  </div>
                </label>
              </div>
              <p className={styles.deliveryNote}>
                *Для курьерской доставки по городу — свяжитесь с менеджером
              </p>
            </div>

            {/* Комментарии к заказу */}
            <div className={styles.section}>
              <div className={`${styles.formGroup} ${styles.commentsGroup}`}>
                <label className={styles.label}>Комментарии к заказу (необязательно)</label>
                <textarea
                  name="orderComments"
                  value={formData.orderComments}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Особые пожелания по доставке, время звонка и т.д."
                  rows="4"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Боковая панель с итогами */}
        <div className={styles.orderSummary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Итоговый заказ</h2>
            
            <div className={styles.orderItems}>
              {cartItems.map((item, index) => {
                const product = item.product || item;
                const imageData = product.images?.[0];
                
                const placeholderUrl = '/placeholder-product.svg';
                const imageUrl = imageData ? buildImageUrl(imageData, placeholderUrl) : placeholderUrl;
                
                const productName = product.name || product.title || 'Товар';
                const productPrice = product.discount_price || product.price || 0;
                const quantity = item.quantity || 1;
                
                return (
                  <div key={index} className={styles.orderItem}>
                    <div className={styles.imageContainer}>
                      <img 
                        src={imageUrl || placeholderUrl} 
                        alt={productName}
                        className={styles.itemImage}
                        onError={(e) => {
                          if (e.target.src !== placeholderUrl) {
                            e.target.src = placeholderUrl;
                          }
                        }}
                      />
                      <span className={styles.itemQuantity}>×{quantity}</span>
                    </div>
                    <div className={styles.itemContent}>
                      <span className={styles.itemName}>
                        {productName}
                      </span>
                      <span className={styles.itemPrice}>
                        <span className={styles.currentPrice}>{productPrice * quantity} ₽</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>{cartItems.length} товара на сумму</span>
                <span>{Math.round(subtotal)} ₽</span>
              </div>
              {discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Скидка</span>
                  <span className={styles.discountValue}>-{Math.round(discount)} ₽</span>
                </div>
              )}
              {deliveryCost > 0 && (
                <div className={styles.summaryRow}>
                  <span>Доставка</span>
                  <span>{deliveryCost} ₽</span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Итого к оплате:</span>
                <span className={styles.summaryItog}>{Math.round(finalTotal)} ₽</span>
              </div>
            </div>

            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                className={styles.checkboxInput} 
                form="checkout-form"
                required 
              />
              <div className={styles.checkboxCustom}>
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className={styles.checkboxText}>
                Я соглашаюсь на обработку персональных данных и принимаю условия продажи
              </span>
            </label>

            <button 
              type="submit" 
              form="checkout-form"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
            </button>

            <p className={styles.securityNote}>
              Ваши данные защищены. Мы не передаем их третьим лицам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});