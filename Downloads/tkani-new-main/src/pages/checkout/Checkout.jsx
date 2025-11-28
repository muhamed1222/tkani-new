import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import styles from "./Checkout.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { cartAPI, authAPI, ordersAPI } from "../../http/api";
import { SHOP_ROUTE } from "../../utils/consts";
import { showToast } from "../../components/ui/Toast";

export const Checkout = observer(() => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Данные формы
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обновите handleSubmit:
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Заполните все обязательные поля правильно', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Создание заказа
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        delivery: {
          method: formData.deliveryMethod,
          address: formData.deliveryMethod === 'pickup' ? 'ул. Кабардинская 158, Нальчик, КБР' : ''
        },
        payment: {
          method: formData.paymentMethod
        },
        total: finalTotal,
        subtotal: subtotal,
        discount: discount
      };

      const response = await ordersAPI.createOrder(orderData);
      
      showToast('Заказ успешно оформлен!', 'success');
      
      // Очистка корзины после успешного заказа
      await cartAPI.clearCart();
      
      // Перенаправление на страницу успеха или профиль
      navigate('/profile/orders');
      
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      showToast('Не удалось оформить заказ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Загрузка корзины при монтировании
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response && response.data && response.data.items) {
        const validItems = response.data.items.filter(item => item.product);
        setCartItems(validItems);
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
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
    const price = item.product?.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const discount = cartItems.reduce((sum, item) => {
    const originalPrice = item.product?.price || 0;
    const discountPrice = item.product?.discountPrice || (originalPrice * (1 - (item.product?.discount || 0) / 100));
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
        <Breadcrumbs />
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <Breadcrumbs />
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
      <Breadcrumbs />
      
      <div className={styles.checkoutContent}>
        <div className={styles.checkoutForm}>
          <h1 className={styles.title}>Оформление заказа</h1>
          
          <form onSubmit={handleSubmit}>
            {/* Личные данные */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Личные данные</h2>
                <span className={styles.stepNumber}>Шаг 1</span>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Имя</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.firstName ? styles.inputError : ''}`}
                    required
                  />
                  {formErrors.firstName && (
                    <p className={styles.fieldError}>{formErrors.firstName}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Фамилия</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.lastName ? styles.inputError : ''}`}
                    required
                  />
                  {formErrors.lastName && (
                    <p className={styles.fieldError}>{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                    required
                  />
                  {formErrors.email && (
                    <p className={styles.fieldError}>{formErrors.email}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Телефон</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                    required
                  />
                  {formErrors.phone && (
                    <p className={styles.fieldError}>{formErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

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

            {/* Способ оплаты */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Способ оплаты</h2>
                <span className={styles.stepNumber}>Шаг 3</span>
              </div>
              <div className={styles.paymentOptions}>
                <label className={styles.paymentRadioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className={styles.paymentRadioInput}
                  />
                  <div className={styles.paymentRadioCustom}></div>
                  <span className={styles.paymentRadioTitle}>Банковской картой на сайте</span>
                </label>

                <label className={styles.paymentRadioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className={styles.paymentRadioInput}
                  />
                  <div className={styles.paymentRadioCustom}></div>
                  <span className={styles.paymentRadioTitle}>Наличными при получении</span>
                </label>

                <label className={styles.paymentRadioLabel}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="invoice"
                    checked={formData.paymentMethod === 'invoice'}
                    onChange={handleInputChange}
                    className={styles.paymentRadioInput}
                  />
                  <div className={styles.paymentRadioCustom}></div>
                  <span className={styles.paymentRadioTitle}>Оплата по счету на юридическое лицо</span>
                </label>
              </div>

              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkboxInput} 
                  required 
                  onChange={(e) => {
                    // Обработчик для чекбокса
                  }}
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
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
            </button>
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
        
        // Формируем полный URL изображения
        let imageUrl = '/placeholder-image.jpg';
        if (imageData?.url) {
          imageUrl = `http://localhost:1337${imageData.url}`;
        }
        
        const productName = product.name || product.title || 'Товар';
        const productPrice = product.discount_price || product.price || 0;
        
        return (
          <div key={index} className={styles.orderItem}>
            <div className={styles.imageContainer}>
              <img 
                src={imageUrl} 
                alt={productName}
                className={styles.itemImage}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            <div className={styles.itemContent}>
              <span className={styles.itemName}>
                {productName}
              </span>
              <span className={styles.itemPrice}>
                <span className={styles.currentPrice}>{productPrice} ₽</span>
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
          <span>-{Math.round(discount)} ₽</span>
        </div>
      )}
      {deliveryCost > 0 && (
        <div className={styles.summaryRow}>
          <span>Доставка</span>
          <span>{deliveryCost} ₽</span>
        </div>
      )}
      <div className={styles.summaryTotal}>
        <span>{cartItems.length} товара</span>
        <span className={styles.summaryItog}>{Math.round(finalTotal)} ₽</span>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
});