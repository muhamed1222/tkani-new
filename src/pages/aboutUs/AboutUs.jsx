import { useState, useEffect } from "react";
import styles from "./AboutUs.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";

export const AboutUs = () => {
  const [overlayOpen, setOverlayOpen] = useState(null);
  
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
  
  // Обработка изменения полей
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      // Здесь должен быть реальный API endpoint
      // Пока используем заглушку с задержкой
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
        }),
      });
      
      // Если API не настроен, используем заглушку
      if (!response.ok && response.status === 404) {
        // Имитация успешной отправки
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubmitStatus("success");
        // Очистка формы
        setFormData({
          name: "",
          phone: "",
          message: "",
          privacy: false,
        });
      } else if (response.ok) {
        const data = await response.json();
        setSubmitStatus("success");
        // Очистка формы
        setFormData({
          name: "",
          phone: "",
          message: "",
          privacy: false,
        });
      } else {
        throw new Error("Ошибка при отправке формы");
      }
    } catch (error) {
      console.error("Ошибка отправки формы:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const scrollToHashElement = (hash) => {
      if (!hash) return false;
      
      const element = document.getElementById(hash);
      if (element) {
        const headerHeight = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        return true;
      }
      return false;
    };

    const handleHashScroll = (hash = null) => {
      const targetHash = hash || window.location.hash.replace("#", "");
      if (targetHash) {
        // Пробуем несколько раз с увеличивающейся задержкой для надежности
        let attempts = 0;
        const maxAttempts = 5;
        
        const tryScroll = () => {
          attempts++;
          if (scrollToHashElement(targetHash) || attempts >= maxAttempts) {
            return;
          }
          setTimeout(tryScroll, 100);
        };
        
        // Начальная задержка больше при переходе с другой страницы
        const initialDelay = window.location.pathname.includes('AboutUs') ? 50 : 300;
        setTimeout(tryScroll, initialDelay);
      }
    };
    
    // Обработка при первой загрузке страницы
    handleHashScroll();
    
    // Обработка при изменении hash (клик на ссылку с якорем)
    window.addEventListener("hashchange", () => handleHashScroll());
    
    // Обработка кликов на ссылки с якорями (когда уже на странице)
    const handleLinkClick = (e) => {
      const link = e.target.closest('a[href*="#"]');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.includes('#') && href.includes('AboutUs')) {
          const hash = href.split('#')[1];
          if (hash) {
            // Если уже на странице AboutUs, обрабатываем скролл напрямую
            if (window.location.pathname.includes('AboutUs')) {
              e.preventDefault();
              window.history.pushState(null, '', `#${hash}`);
              handleHashScroll(hash);
            }
          }
        }
      }
    };
    
    // Добавляем обработчик клика на весь документ
    document.addEventListener('click', handleLinkClick, true);
    
    // Обработка при изменении location (для React Router)
    const checkHash = () => {
      if (window.location.hash) {
        handleHashScroll();
      }
    };
    
    // Проверяем hash после небольшой задержки для React Router
    setTimeout(checkHash, 100);
    
    return () => {
      window.removeEventListener("hashchange", () => handleHashScroll());
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);
  

  return (
    <div className={styles.wrapper}>
      <div className={styles.breadcrumbs_container}>
        <Breadcrumbs />
      </div>
      <section id="about" className={styles.section_about}>
        <div className={styles.title_text}>
          <p>Давайте знакомиться!</p>
          <h3>Мы — магазин натуральных тканей</h3>
        </div>
        <div className={styles.tiles}>
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
            />
          </div>

          <div className={styles.tiles_container}>
            <img
              src="/Rectangle 02.jpg"
              alt="Ткани"
              className={styles.tiles_img}
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
            <img src="/rokt-logo.svg" alt="Логотип" />
            <img src="/ideo-logo.svg" alt="Логотип" />
            <img src="/finsweet-logo.svg" alt="Логотип" />
            <img src="/vml-logo.svg" alt="Логотип" />
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
            <div id={styles.pay_card_img01}></div>
            <p>Банковской картой на сайте</p>
          </div>
          <div className={styles.pay_card}>
            <div id={styles.pay_card_img02}></div>
            <p>Наличными при получении</p>
          </div>
          <div className={styles.pay_card}>
            <div id={styles.pay_card_img03}></div>
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
          <div className={`${styles.delivery_card} ${styles.delivery_card_active}`}>
            <div className={styles.delivery_card_title}>
              <h5>Самовывоз</h5>
              <span className={styles.delivery_badge}>1</span>
            </div>
            <p>
              ул. Московская 21/3,<br />пн-пт 10:00-18:00
            </p>
          </div>
          <div className={styles.delivery_card}>
            <div className={styles.delivery_card_title}>
              <h5>СДЭК</h5>
              <span className={styles.delivery_badge}>2</span>
            </div>
            <p>2-4 дня</p>
          </div>
          <div className={styles.delivery_card}>
            <div className={styles.delivery_card_title}>
              <h5>Почта России</h5>
              <span className={styles.delivery_badge}>3</span>
            </div>
            <p>5-7 дней</p>
          </div>
          <div className={styles.delivery_card}>
            <div className={styles.delivery_card_title}>
              <h5>Ozon</h5>
              <span className={styles.delivery_badge}>4</span>
            </div>
            <p>1-2 дня</p>
          </div>
          <div className={styles.delivery_card}>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 1 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 2 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 3 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 4 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 5 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 6 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 7 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevron_icon}>
                    <path d="M6 4L10 8L6 12" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {overlayOpen === 8 && (
                  <div className={styles.answer}>
                    <p>Текст</p>
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
                <p className={styles.info_text}>ул. Кабардинская 158, Нальчик, КБР</p>
              </div>

              <div className={styles.info_container}>
                <div className={styles.info_name}>
                  <img src="/call-01.svg" alt="Иконка" className={styles.info_icon} />
                  <p>Телефон</p>
                </div>
                <p className={styles.info_text}>+7 (928) 716-66-26</p>
              </div>

              <div className={styles.info_container}>
                <div className={styles.info_name}>
                  <img src="/mail-01.svg" alt="Иконка" className={styles.info_icon} />
                  <p>E-mail</p>
                </div>
                <p className={styles.info_text}>center.tkani@yandex.ru</p>
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
                  {isSubmitting ? "Отправка..." : "Отправить"}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.contacts_map}>
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=43.629167%2C43.492385&utm_campaign=desktop&utm_medium=search&utm_source=maps&z=18"
              frameBorder="0"
              allowFullScreen={true}
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};
