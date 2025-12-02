import { useState, useEffect } from "react";
import styles from "./AboutUs.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
import { ChevronIcon } from "../../components/ui/ChevronIcon";
import { contactAPI } from "../../http/api";

export const AboutUs = () => {
  const [overlayOpen, setOverlayOpen] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(1); // По умолчанию активна первая карточка
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
    privacy: false,
  });
  
  // Состояние ошибок валидации
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    message: "",
    privacy: "",
  });
  
  // Состояние отправки
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const divClick = (index, e) => {
    e.stopPropagation();
    setOverlayOpen(overlayOpen === index ? null : index);
  };

  const handleDeliveryClick = (index) => {
    setActiveDelivery(index);
  };
  
  // Форматирование телефона
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 1) return `+7 (${digits}`;
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };
  
  // Обработка изменения полей
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Применяем маску для телефона
    let processedValue = value;
    if (name === "phone" && type !== "checkbox") {
      processedValue = formatPhone(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    
    // Очистка статуса отправки при изменении
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };
  
  // Валидация телефона (российский формат)
  const validatePhone = (phone) => {
    // Удаляем все нецифровые символы
    const digitsOnly = phone.replace(/\D/g, "");
    // Проверяем, что номер начинается с 7 или 8 и содержит 11 цифр
    if (digitsOnly.length === 11 && (digitsOnly.startsWith("7") || digitsOnly.startsWith("8"))) {
      return true;
    }
    // Или формат +7 (XXX) XXX-XX-XX
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone);
  };
  
  // Валидация формы
  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
      message: "",
      privacy: "",
    };
    
    let isValid = true;
    
    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно для заполнения";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
      isValid = false;
    }
    
    // Валидация телефона
    if (!formData.phone.trim()) {
      newErrors.phone = "Телефон обязателен для заполнения";
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Введите корректный номер телефона";
      isValid = false;
    }
    
    // Валидация сообщения
    if (!formData.message.trim()) {
      newErrors.message = "Сообщение обязательно для заполнения";
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Сообщение должно содержать минимум 10 символов";
      isValid = false;
    }
    
    // Валидация чекбокса
    if (!formData.privacy) {
      newErrors.privacy = "Необходимо согласие на обработку персональных данных";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Обработка отправки формы
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Валидация
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  setSubmitStatus(null);
  
  try {
    await contactAPI.sendMessage({ 
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
    });
    
      setSubmitStatus("success");
      // Очистка формы
      setFormData({
        name: "",
        phone: "",
        message: "",
        privacy: false,
      });
  } catch (error) {
    console.error("Ошибка отправки формы:", error);
    setSubmitStatus("error");  
  } finally {
    setIsSubmitting(false);
  }
};

  // Плавный скролл к якорям
  useEffect(() => {
    const HEADER_HEIGHT = 100;
    
    const scrollToHash = (hash = null) => {
      const targetHash = hash || window.location.hash.replace("#", "");
      if (!targetHash) return;
      
      const element = document.getElementById(targetHash);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - HEADER_HEIGHT;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    };
    
    // Скролл при первой загрузке страницы
    const timer = setTimeout(() => {
      scrollToHash();
    }, 100);
        
    // Плавный скролл при изменении hash
    const handleHashChange = () => {
      setTimeout(() => {
        scrollToHash();
      }, 50);
    };
    
    // Слушаем событие для программного изменения hash
    const handleCustomHashChange = (e) => {
      if (e.detail && e.detail.hash) {
        setTimeout(() => {
          scrollToHash(e.detail.hash);
        }, 50);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scrollToHash", handleCustomHashChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scrollToHash", handleCustomHashChange);
    };
  }, []);
  

  return (
    <div className={styles.wrapper}>
      <div className={styles.breadcrumbs_container}>
        <Breadcrumbs />
      </div>
      <section id="about" className={styles.section_about}>
        <div className={styles.title_text} >
          <p>Давайте знакомиться!</p>
          <h3>Мы — магазин натуральных тканей</h3>
        </div>
        <div className={styles.tiles} >
          <div className={styles.tiles_container}>
            <div className={styles.tiles_text}>
              <p>
                <b>«Центр ткани»</b> — это магазин натуральных тканей и
                трикотажа высокого качества. У нас вы найдёте широкий выбор
                материалов для одежды и текстиля: хлопок, лен, футер и многое
                другое.
              </p>
            </div>
            <img
              src="/Rectangle 01.jpg"
              alt="Ткани"
              className={styles.tiles_img}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className={styles.tiles_container}>
            <img
              src="/Rectangle 02.jpg"
              alt="Ткани"
              className={styles.tiles_img}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className={styles.tiles_text}>
              <p>
                Мы работаем с 2020 года и сотрудничаем напрямую с ведущими
                фабриками <b>Турции, Беларуси и Китая</b>. Среди наших партнёров
                — <b>Sabaev, Wella, IPEKER, Оршанский льнокомбинат</b> и другие
                известные производители.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.icon_container}>
          <p>
            Мы всегда стараемся радовать вас актуальными коллекциями и качественным обслуживанием.
          </p>
          <div className={styles.icons}>
            <img src="/rokt-logo.svg" alt="Логотип" onError={(e) => { e.target.style.display = 'none'; }} />
            <img src="/ideo-logo.svg" alt="Логотип" onError={(e) => { e.target.style.display = 'none'; }} />
            <img src="/finsweet-logo.svg" alt="Логотип" onError={(e) => { e.target.style.display = 'none'; }} />
            <img src="/vml-logo.svg" alt="Логотип" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        </div>
      </section>

      <section id="pay" className={styles.section_pay}>
        <div className={styles.section_pay_text}>
          <h3>Оплата</h3>
          <p>Вы можете оплатить заказ любым предложенным удобным способом.</p>
        </div>
        <div className={styles.section_pay_cards}>
          <div className={styles.pay_card}>
            <div className={styles.pay_card_img01}></div>
            <p>Банковской картой на сайте</p>
          </div>
          <div className={styles.pay_card}>
            <div className={styles.pay_card_img02}></div>
            <p>Наличными при получении</p>
          </div>
          <div className={styles.pay_card}>
            <div className={styles.pay_card_img03}></div>
            <p>Оплата по счету на юридическое лицо</p>
          </div>
        </div>
      </section>

      <section id="delivery" className={styles.section_delivery}>
        <div className={styles.section_delivery_text}>
          <h3>Доставка</h3>
          <p>
            Отгружаем посылки два раза в неделю (среда/суббота) Сдеком, Почтой
            России. Оптовые заказы отправляем транспортными компаниями Magic Trans, DPD,
            Деловые Линии, Кит.
          </p>
        </div>
        <div className={styles.section_delivery_cards}>
          <div 
            className={`${styles.delivery_card} ${activeDelivery === 1 ? styles.delivery_card_active : ""}`}
            onClick={() => handleDeliveryClick(1)}
          >
            <div className={styles.delivery_card_title}>
              <h5>Самовывоз</h5>
              <span className={styles.delivery_badge}>1</span>
            </div>
            <p>
              ул. Кабардинская 158, Нальчик, КБР<br />пн-пт 10:00-18:00
            </p>
          </div>
          <div 
            className={`${styles.delivery_card} ${activeDelivery === 2 ? styles.delivery_card_active : ""}`}
            onClick={() => handleDeliveryClick(2)}
          >
            <div className={styles.delivery_card_title}>
              <h5>СДЭК</h5>
              <span className={styles.delivery_badge}>2</span>
            </div>
            <p>2-4 дня</p>
          </div>
          <div 
            className={`${styles.delivery_card} ${activeDelivery === 3 ? styles.delivery_card_active : ""}`}
            onClick={() => handleDeliveryClick(3)}
          >
            <div className={styles.delivery_card_title}>
              <h5>Почта России</h5>
              <span className={styles.delivery_badge}>3</span>
            </div>
            <p>5-7 дней</p>
          </div>
          <div 
            className={`${styles.delivery_card} ${activeDelivery === 4 ? styles.delivery_card_active : ""}`}
            onClick={() => handleDeliveryClick(4)}
          >
            <div className={styles.delivery_card_title}>
              <h5>Ozon</h5>
              <span className={styles.delivery_badge}>4</span>
            </div>
            <p>1-2 дня</p>
          </div>
          <div 
            className={`${styles.delivery_card} ${activeDelivery === 5 ? styles.delivery_card_active : ""}`}
            onClick={() => handleDeliveryClick(5)}
          >
            <div className={styles.delivery_card_title}>
              <h5>Доставка курьером</h5>
              <span className={styles.delivery_badge}>5</span>
            </div>
            <p>1-2 дня</p>
          </div>
        </div>
      </section>

      <section id="questions" className={styles.section_questions}>
        <h3 className={styles.section_questions_title}>
          Часто задаваемые вопросы
        </h3>
        <div className={styles.questions_content}>
          <div className={styles.question_delivery}>
            <h3>Вопросы о доставке</h3>
            <div className={styles.overlays}>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 1 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(1, e)}>
                  <span>Как узнать трек-номер</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 1} />
                </div>
                {overlayOpen === 1 && (
                  <div className={styles.answer}>
                    <p>Трек-номер отправки вы получите на указанный при оформлении заказа email и SMS на телефон. Также трек-номер можно найти в личном кабинете в разделе "Мои заказы".</p>
                  </div>
                )}
              </div>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 2 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(2, e)}>
                  <span>Сроки отправки заказа</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 2} />
                </div>
                {overlayOpen === 2 && (
                  <div className={styles.answer}>
                    <p>Заказы отправляются два раза в неделю: по средам и субботам. После отправки вы получите уведомление с трек-номером. Время обработки заказа составляет 1-2 рабочих дня.</p>
                  </div>
                )}
              </div>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 3 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(3, e)}>
                  <span>Доставка в регионы</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 3} />
                </div>
                {overlayOpen === 3 && (
                  <div className={styles.answer}>
                    <p>Мы доставляем заказы по всей России через СДЭК, Почту России и другие транспортные компании. Стоимость доставки рассчитывается автоматически при оформлении заказа в зависимости от веса, габаритов и пункта назначения.</p>
                  </div>
                )}
              </div>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 4 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(4, e)}>
                  <span>Самовывоз заказа</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 4} />
                </div>
                {overlayOpen === 4 && (
                  <div className={styles.answer}>
                    <p>Вы можете забрать заказ самостоятельно по адресу: ул. Кабардинская 158, Нальчик, КБР. Режим работы: понедельник-пятница с 10:00 до 18:00. Пожалуйста, предварительно свяжитесь с нами для уточнения готовности заказа.</p>
                  </div>
                )}
              </div>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 5 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(5, e)}>
                  <span>Как рассчитать стоимость доставки</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 5} />
                </div>
                {overlayOpen === 5 && (
                  <div className={styles.answer}>
                    <p>Стоимость доставки рассчитывается автоматически при оформлении заказа в корзине. Выберите способ доставки и укажите адрес - система покажет точную стоимость. Для оптовых заказов стоимость доставки согласовывается индивидуально с менеджером.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.question_order}>
            <h3>Вопросы по заказу</h3>
            <div className={styles.overlays}>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 6 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(6, e)}>
                  <span>Оплата заказа</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 6} />
                </div>
                {overlayOpen === 6 && (
                  <div className={styles.answer}>
                    <p>Мы принимаем оплату банковской картой на сайте, наличными при получении заказа (для самовывоза и курьерской доставки), а также по счету для юридических лиц. Оплата банковской картой проходит через защищенный платежный шлюз.</p>
                  </div>
                )}
              </div>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 7 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(7, e)}>
                  <span>Обмен и возврат</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 7} />
                </div>
                {overlayOpen === 7 && (
                  <div className={styles.answer}>
                    <p>Возврат товара возможен в течение 14 дней с момента получения при сохранении товарного вида, упаковки и этикеток. Товар должен быть не использованным. Для возврата свяжитесь с нами по телефону или email, мы предоставим инструкции по возврату.</p>
                  </div>
                )}
              </div>
              <div
                className={`${styles.modal_link_name} ${
                  overlayOpen === 8 ? styles.opened : ""
                }`}
              >
                <div className={styles.question_header} onClick={(e) => divClick(8, e)}>
                  <span>Оформление заказа</span>
                  <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 8} />
                </div>
                {overlayOpen === 8 && (
                  <div className={styles.answer}>
                    <p>Для оформления заказа добавьте товары в корзину, перейдите в корзину и заполните форму заказа: укажите контактные данные, выберите способ доставки и оплаты. После подтверждения заказа вы получите уведомление на email. Для оптовых заказов свяжитесь с нами по телефону.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" className={styles.section_contacts}>
        <h3 className={styles.section_contacts_title}>Контакты</h3>

        <div className={styles.contacts_wrapper}>
          <div className={styles.contacts_container}>
            <div className={styles.contacts_info}>
              <div className={styles.info_container}>
                <div className={styles.info_name}>
                  <img src="/location-01.svg" alt="Иконка" className={styles.info_icon} />
                  <p>Наш адрес</p>
                </div>
                <a 
                  href="https://yandex.com/maps/-/CLGRvAp8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.info_text_link}
                >
                <p className={styles.info_text}>ул. Кабардинская 158, Нальчик, КБР</p>
                </a>
              </div>

              <div className={styles.info_container}>
                <div className={styles.info_name}>
                  <img src="/call-01.svg" alt="Иконка" className={styles.info_icon} />
                  <p>Телефон</p>
                </div>
                <a 
                  href="tel:+79287166626" 
                  className={styles.info_text_link}
                >
                <p className={styles.info_text}>+7 (928) 716-66-26</p>
                </a>
              </div>

              <div className={styles.info_container}>
                <div className={styles.info_name}>
                  <img src="/mail-01.svg" alt="Иконка" className={styles.info_icon} />
                  <p>E-mail</p>
                </div>
                <a 
                  href="mailto:center.tkani@yandex.ru" 
                  className={styles.info_text_link}
                >
                <p className={styles.info_text}>center.tkani@yandex.ru</p>
                </a>
              </div>

              <div className={styles.info_container}>
                <div className={styles.info_name}>
                  <img src="/clock-01.svg" alt="Иконка" className={styles.info_icon} />
                  <p>Часы работы</p>
                </div>
                <p className={styles.info_text}>Пн-Сб: 9:00 - 18:00</p>
              </div>
            </div>

            <form className={styles.contacts_form} onSubmit={handleSubmit}>
              <div className={styles.form_header}>
                <h3>Напишите нам по любому вопросу</h3>
                <div className={styles.form_fields}>
                  <div className={styles.form_inputs}>
                    <div className={styles.input}>
                      <p>Имя </p>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? styles.input_error : ""}
                        disabled={isSubmitting}
                        placeholder="Введите ваше имя"
                      />
                      {errors.name && (
                        <span className={styles.error_message}>{errors.name}</span>
                      )}
                    </div>
                    <div className={styles.input}>
                      <p>Телефон</p>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+7 (XXX) XXX-XX-XX"
                        className={errors.phone ? styles.input_error : ""}
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <span className={styles.error_message}>{errors.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.input}>
                    <p>Сообщение</p>
                    <textarea
                      name="message"
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? styles.input_error : ""}
                      disabled={isSubmitting}
                      placeholder="Напишите ваше сообщение здесь..."
                      rows="5"
                    ></textarea>
                    {errors.message && (
                      <span className={styles.error_message}>{errors.message}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.form_footer}>
                <div className={styles.checkbox_text}>
                  <label htmlFor="privacy" className={styles.checkbox_label}>
                    <input
                      type="checkbox"
                      name="privacy"
                      id="privacy"
                      className={styles.checkbox_input}
                      checked={formData.privacy}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <div className={`${styles.checkbox_custom} ${
                      formData.privacy ? styles.checkbox_checked : ""
                    } ${isSubmitting ? styles.checkbox_disabled : ""}`}>
                      {formData.privacy && (
                        <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>
                      Я прочитал Privacy Policy и согласен с условиями безопасности и
                      обработки персональных данных
                    </span>
                  </label>
                </div>
                {errors.privacy && (
                  <span className={styles.error_message}>{errors.privacy}</span>
                )}
                {submitStatus === "success" && (
                  <div className={styles.success_message}>
                    Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className={styles.error_message_block}>
                    Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.
                  </div>
                )}
                <button
                  type="submit"
                  className={styles.subm_btn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Отправка..." : "Отправить сообщение"}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.contacts_map}>
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=43.629167%2C43.492385&utm_campaign=desktop&utm_medium=search&utm_source=maps&z=18"
              frameBorder="0"
              allowFullScreen={true}
              title="Карта расположения магазина"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};