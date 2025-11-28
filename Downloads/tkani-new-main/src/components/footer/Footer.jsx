import styles from "./Footer.module.css";
import { Link, useLocation } from "react-router-dom";
import { RatingBadge } from "./RatingBadge";
import { 
  CATALOG_ROUTE, 
  CATALOG_CLOTHING_ROUTE,
  ACCOUNT_ROUTE,
  ABOUTUS_ROUTE,
  PRIVACY_POLICY_ROUTE,
  TERMS_OF_SERVICE_ROUTE,
  DISCOUNTS_ROUTE
} from "../../utils/consts";
import { clothingCategories, homeCategories } from "../../utils/catalogCategories";

export const Footer = () => {
  const location = useLocation();
  
  // Определяем текущую категорию из URL
  const pathname = location.pathname;
  const isClothingCatalog = pathname.includes('/catalog-clothing');
  
  // Извлекаем slug категории из пути
  const getCurrentCategorySlug = () => {
    if (pathname.includes('/catalog-clothing/')) {
      return pathname.split('/catalog-clothing/')[1]?.split('/')[0] || null;
    }
    if (pathname.includes('/catalog/')) {
      return pathname.split('/catalog/')[1]?.split('/')[0] || null;
    }
    return null;
  };
  
  const currentCategorySlug = getCurrentCategorySlug();
  
  // Проверяем, является ли категория активной
  const isActiveCategory = (slug) => {
    if (!currentCategorySlug) return false;
    return currentCategorySlug === slug;
  };

  // Обработчик клика для прокрутки вверх
  const handleCategoryClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

   // Обработка клика на якорные ссылки AboutUs
    const handleAboutUsLinkClick = (e, hash) => {
      // Если уже на странице AboutUs, обновляем hash и делаем плавный скролл
      if (location.pathname === ABOUTUS_ROUTE) {
        e.preventDefault();
        window.location.hash = hash;
        // Вызываем событие для плавного скролла
        window.dispatchEvent(new CustomEvent('scrollToHash', { detail: { hash: hash.replace('#', '') } }));
        return false;
      }
      // Если не на странице AboutUs, разрешаем обычный переход
      return true;
    };

  return (
    <footer className={styles.wrapper}>
      <section className={styles.top_section}>
        <h3 className={styles.top_section_title}>
          Широкий выбор высококачественных
          <br /> текстильных материалов со скидками до 50%
        </h3>
        <Link to={DISCOUNTS_ROUTE} className={styles.top_section_btn}>
          Перейти в каталог
        </Link>
      </section>

      <section className={styles.bottom_section}>
        <div className={styles.footer_content}>

          <div className={styles.footer_section}>
            <h3 className={styles.section_title}>Для одежды</h3>
            <nav className={styles.nav} aria-label="Категории для одежды">
              {clothingCategories.map((category, index) => {
                const isActive = isClothingCatalog && isActiveCategory(category.slug);
                return (
                  <Link 
                    key={index}
                    to={`${CATALOG_CLOTHING_ROUTE}/${category.slug}`} 
                    className={`${styles.link} ${isActive ? styles.link_active : ''}`}
                    onClick={handleCategoryClick}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={styles.footer_section}>
            <h3 className={styles.section_title}>Для дома</h3>
            <nav className={styles.nav} aria-label="Категории для дома">
              {homeCategories.map((category, index) => {
                const isActive = !isClothingCatalog && isActiveCategory(category.slug);
                return (
                  <Link 
                    key={index}
                    to={`${CATALOG_ROUTE}/${category.slug}`} 
                    className={`${styles.link} ${isActive ? styles.link_active : ''}`}
                    onClick={handleCategoryClick}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={styles.footer_section}>
            <h3 className={styles.section_title}>Компания</h3>
            <nav className={styles.nav} aria-label="Информация о компании">
              <Link to={ACCOUNT_ROUTE} className={styles.link}>
                Личный кабинет
              </Link>
               <Link 
            to={`${ABOUTUS_ROUTE}#about`} 
            onClick={(e) => {
              handleAboutUsLinkClick(e, '#about');
            }}   className={styles.link}>
                О нас
              </Link>
             <Link 
            to={`${ABOUTUS_ROUTE}#contacts`} 
            onClick={(e) => {
              handleAboutUsLinkClick(e, '#contacts');
            }} className={styles.link}>
                Контакты
              </Link>
              <Link
              to={`${ABOUTUS_ROUTE}#pay`} 
              onClick={(e) => handleAboutUsLinkClick(e, '#pay')} className={styles.link}>
                Оплата и доставка
              </Link>
              <Link
            to={`${ABOUTUS_ROUTE}#questions`} 
            onClick={(e) => {
              handleAboutUsLinkClick(e, '#questions');
            }} className={styles.link}>
                Часто задаваемые вопросы
              </Link>
              <Link to={PRIVACY_POLICY_ROUTE} className={styles.link}>
                Политика конфиденциальности
              </Link>
              <Link to={TERMS_OF_SERVICE_ROUTE} className={styles.link}>
                Условия пользования
              </Link>
            </nav>
          </div>

        </div>

        <div className={styles.footer_bottom}>
          <div className={styles.logo_container}>
            <div className={styles.logo}>
              <img
                src="/Logo Icon.svg"
                alt="Логотип Центр Ткани"
                className={styles.logo_img}
              />
              <img
                src="/CENTER TKANI.svg"
                alt="Центр Ткани"
                className={styles.logo_text}
              />
            </div>
            <div className={styles.social_links}>
              <div className={styles.social_icons}>
                <a 
                  href="https://www.instagram.com/your_account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Подписаться на Instagram"
                  className={styles.social_link}
                >
                  <img src="/insta.svg" alt="" aria-hidden="true" />
                  <span className={styles.sr_only}>Instagram</span>
                </a>
                <a 
                  href="https://wa.me/79001234567" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Написать в WhatsApp"
                  className={styles.social_link}
                >
                  <img src="/whatsapp.svg" alt="" aria-hidden="true" />
                  <span className={styles.sr_only}>WhatsApp</span>
                </a>
                <a 
                  href="https://t.me/your_account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Подписаться на Telegram"
                  className={styles.social_link}
                >
                  <img src="/telegram.svg" alt="" aria-hidden="true" />
                  <span className={styles.sr_only}>Telegram</span>
                </a>
              </div>
            </div>
            <div className={styles.copyright_container}>
              <small className={styles.copyright}>
                © {new Date().getFullYear()} Центр Ткани. Все права защищены.
              </small>
            </div>
          </div>
          <div className={styles.links_container}>
            <RatingBadge />
            <div className={styles.studio_credit}>
              <small className={styles.studio_copyright}>
                Разработано <a href="https://outcasts.dev" target="_blank" rel="noopener noreferrer" className={styles.studio_link}>outcasts.dev</a>
              </small>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};


