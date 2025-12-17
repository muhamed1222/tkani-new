import logger from '../../utils/logger';
import { useState, useEffect } from "react";
import styles from "./AboutUs.module.css";
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from "../../components/breadcrumbs";
import { ChevronIcon } from "../../components/ui/ChevronIcon";
import { contactAPI } from "../../http/api";

export const AboutUs = () => {
  const breadcrumbs = useAutoBreadcrumbs();
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
      logger.error("Ошибка отправки формы:", error);
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
        <BreadcrumbsCompressed items={breadcrumbs} />
      </div>
      <section id="about" className={styles.section_about}>
        <div className={styles.title_text} >
          <h3>Центр ткани.</h3>
          <h3>Центр материалов, идей и творчества</h3>
        </div>
        <div className={styles.tiles} >
          <div className={styles.tiles_container}>
            <div className={styles.tiles_text}>
              <p>
                Мы специализируемся на натуральных тканях для одежды 
                и домашнего текстиля потому что верим: это комфорт, здоровье 
                и подлинное эстетика. Присоединяйтесь к сообществу тех, кто шьет 
                с любовью и выбирает осознанно.
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
               Центр Ткани-надежный партнер, который разделяет ваши ценности и стремление создать качественный товар.
                Мы работаем с любителями, профессионалами, мелкими и крупными швейными производствами. Мы за прозрачность, 
                справедливость и открытый доступ к розничными и оптовым ценам. Экспертные консультации. Быстрое обслуживание. 
             Мы верим, что наш подход к работе и ваш интерес помогут создать синергию для взаимного роста.</p>
            </div>
          </div>
        </div>
        <div className={styles.icon_container}>
          <p>
           Натуральные ткани с разных уголков мира
          </p>
          <p>🇹🇷 🇧🇾 🇮🇳 🇦🇪 🇪🇺 🇨🇳 🇰🇷 </p>
           <p>
           Работаем с 2020 года
          </p>
        </div>
      </section>

      <section id="pay-and-delivery" className={styles.section_pay_delivery}>
        <div className={styles.section_pay_delivery_text}>
          <h3>Доставка и оплата</h3>
          <div className={styles.pay_delivery_content}>
            <p>
              После оформления заказа с вами свяжется наш работник для уточнения деталей и подтверждения заказа. 
              Далее вам будет предложено оплатить любым удобным способом: банковской картой, СБП, на расчетный счет.
            </p>
            <p>
              Отправляем как вам удобно: Почтой России, СДЭК, Озон доставкой (в ваш пункт выдачи), автобусами в соседние 
              республики и транспортными компаниями по всей России и СНГ.
            </p>
          </div>
        </div>
      </section>

      <section id="questions" className={styles.section_questions}>
  <h3 className={styles.section_questions_title}>
    Часто задаваемые вопросы
  </h3>
  <div className={styles.questions_content}>
    <div className={styles.question_delivery}>
      {/* <h3>Вопросы о доставке</h3> */}
      <div className={styles.overlays}>
        <div
          className={`${styles.modal_link_name} ${
            overlayOpen === 1 ? styles.opened : ""
          }`}
        >
          <div className={styles.question_header} onClick={(e) => divClick(1, e)}>
            <span>Я тут первый раз. С чего начать? </span>
            <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 1} />
          </div>
          {overlayOpen === 1 && (
            <div className={styles.answer}>
              <p>Как упомянуто выше, вам нужно добавить товары в корзину и оформить заказ. Не переживайте, мы видим все заказы и обязательно отпишемся с наших рабочих аккаунтов. Просим оставлять корректный номер телефона. 
Вы не оплачиваете заказ до тех пор, пока мы не согласуем с вами наличие и другие нюансы. Если нужна консультация, всегда рады помочь вам. 
Стоимость доставки рассчитывается после сборка заказа (по габаритам посылки). Мы учтем ваше пожелание и отправим товар как вам удобно. Также , можем предварительно сравнить цены и предложить вам лучший вариант. Возможна отправка в любой город России. В СНГ транспортными компаниями. </p>
            </div>
          )}
        </div>
        
        <div
          className={`${styles.modal_link_name} ${
            overlayOpen === 2 ? styles.opened : ""
          }`}
        >
          <div className={styles.question_header} onClick={(e) => divClick(2, e)}>
            <span>Вы шьете из ваших тканей?</span>
            <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 2} />
          </div>
          {overlayOpen === 2 && (
            <div className={styles.answer}>
              <p>Да, у нас есть ателье при магазине. Мы шьем только предметы домашнего текстиля: постельное белье, покрывала, скатерти, чехлы для мебели, банные халаты и др. Исключительно индивидуальный,  качественный пошив по вашим размерам и предпочтениям.  

Рюши и классика, комбинированный комплект или однотонный, стандартный размер или простынь длиной 3 метра - выбор всегда за вами. А наши мастера подробно проконсультируют и помогут с выбором. 

Просто напишите нам на рабочий номер +7 (928) 716-66-26. Оформление заказов через корзину не требуется. </p>
            </div>
          )}
        </div>
        
        <div
          className={`${styles.modal_link_name} ${
            overlayOpen === 3 ? styles.opened : ""
          }`}
        >
          <div className={styles.question_header} onClick={(e) => divClick(3, e)}>
            <span>Как стирать и гладить натуральные ткани?</span>
            <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 3} />
          </div>
          {overlayOpen === 3 && (
            <div className={styles.answer}>
              <p>Все натуральные ткани имеют усадку. Но не стоит бояться или пренебрегать этим этапом. Более того, это залог хорошего конечного результата. Мы советуем стирать в стиральной машине при 30-40 градусах, 15-30 минут. 
Но, конечно, такие ткани как натуральный шелк и кашемир лучше стирать руками.
Сминаемость тоже индивидуальна. Но это не недостаток, а признак натуральности. 
Советуем добавлять небольшое количество кондиционера для белья и пользоваться утюгом с хорошим потоком горячего воздуха. </p>
            </div>
          )}
        </div>
        
        <div
          className={`${styles.modal_link_name} ${
            overlayOpen === 4 ? styles.opened : ""
          }`}
        >
          <div className={styles.question_header} onClick={(e) => divClick(4, e)}>
            <span>Могу я получить образец ткани?</span>
            <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 4} />
          </div>
          {overlayOpen === 4 && (
            <div className={styles.answer}>
              <p>Да, мы высылаем образцы по запросу (если они есть). Но на некоторые ткани образцов вообще не бывает, к сожалению. 

В описаниях к товарам мы стараемся как можно подробнее изложить характеристики и свойства тканей. 
Также, максимально точно передаем оттенок. 
Но иногда цветопередача немного отличается в зависимости от экрана конкретного устройства. Если у вас возникнут вопросы, напишите нам. Мы вышлем дополнительные фотографии. </p>
            </div>
          )}
        </div>
        
        <div
          className={`${styles.modal_link_name} ${
            overlayOpen === 5 ? styles.opened : ""
          }`}
        >
          <div className={styles.question_header} onClick={(e) => divClick(5, e)}>
            <span>Самовывоз из магазина.</span>
            <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 5} />
          </div>
          {overlayOpen === 5 && (
            <div className={styles.answer}>
              <p>Просто сообщите нам об этом. Мы должны будем отрезать ткани до вашего прихода.  
Адрес есть выше, но не будет лишним продублировать еще раз: 
Кабардино-Балкария, г.Нальчик, ул. Кабардинская 158. </p>
            </div>
          )}
        </div>
        
        <div
          className={`${styles.modal_link_name} ${
            overlayOpen === 6 ? styles.opened : ""
          }`}
        >
          <div className={styles.question_header} onClick={(e) => divClick(6, e)}>
            <span>С моим заказом что-то не так. Что делать?</span>
            <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 6} />
          </div>
          {overlayOpen === 6 && (
            <div className={styles.answer}>
              <p>
Мы тщательно проверяем каждый отрез перед отправкой. Но человеческий фактор иногда дает о себе знать и брак все же попадает в руки клиенту. 

Если такое случилось, не переживайте. 
До начала раскроя сфотографируйте дефект при хорошем освещении и свяжитесь с нами. Мы оперативно решим вопрос: заменим отрез или вернем деньги. 

Если в вашем заказе чего-то не хватает, то обратитесь к нам сразу после обнаружения. Спустя 1-2 месяца после получения проверить состав заказа будет невозможно :( </p>
            </div>
          )}
        </div>
        <div
          className={`${styles.modal_link_name} ${
            overlayOpen === 7 ? styles.opened : ""
          }`}
        >
          <div className={styles.question_header} onClick={(e) => divClick(7, e)}>
            <span>Что значит маркировка «OEKO-TEX Standard 100”?</span>
            <ChevronIcon className={styles.chevron_icon} isOpen={overlayOpen === 7} />
          </div>
          {overlayOpen === 7 && (
            <div className={styles.answer}>
              <p>Это важный международный сертификат, который гарантирует, что готовая ткань прошла тесты на отсутствие вредных веществ и безопасна для человека. Это не то же самое что «органика» «GOTS», которая касается экологичности самого процесса производства.</p>
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
                  href="mailto:centertkani-shop@yandex.com" 
                  className={styles.info_text_link}
                >
                <p className={styles.info_text}>centertkani-shop@yandex.com</p>
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