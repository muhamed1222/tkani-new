import styles from "./Footer.module.css";
import { Link, useLocation } from "react-router-dom";
import { RatingBadge } from "./RatingBadge";
import { CATALOG_ROUTE, CATALOG_CLOTHING_ROUTE } from "../../utils/consts";
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

  return (
    <div className={styles.wrapper}>
      <section className={styles.top_section}>
        <h3 className={styles.top_section_title}>
          Широкий выбор высококачественных
          <br /> текстильных материалов со скидками до 50%
        </h3>
        <Link to='/catalog_home' className={styles.top_section_btn}>
          Перейти в каталог
        </Link>
      </section>

      <section className={styles.bottom_section}>
        <div className={styles.footer_content}>

          <div className={styles.footer_section}>
            <h3 className={styles.section_title}>Для одежды</h3>
            <nav className={styles.nav}>
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
            <nav className={styles.nav}>
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
            <nav className={styles.nav}>
              <Link to="/personal_account" className={styles.link}>
                Личный кабинет
              </Link>
              <Link to="/about_us" className={styles.link}>
                О нас
              </Link>
              <Link to="/404" className={styles.link}>
                Контакты
              </Link>
              <Link to="/404-delivery" className={styles.link}>
                Оплата и доставка
              </Link>
              <Link to="/404" className={styles.link}>
                Часто задаваемые вопросы
              </Link>
              <Link to="/privacy_policy" className={styles.link}>
                Политика конфиденциальности
              </Link>
              <Link to="/404" className={styles.link}>
                Пользовательское соглашение
              </Link>
            </nav>
          </div>

        </div>

        <div className={styles.footer_bottom}>
          <div className={styles.logo_container}>
            <div className={styles.logo}>
              <img
                src="/Logo Icon.svg"
                alt="Логотип"
                className={styles.logo_img}
              />
              <img
                src="/CENTER TKANI.svg"
                alt="Название"
                className={styles.logo_text}
              />
            </div>
            <p>© 2025 Центр Ткани. Все права защищены.</p>
          </div>
          <div className={styles.links_container}>
            <RatingBadge />
            <div className={styles.links}>
              <p>Подпишитесь на нас в соцсетях</p>
              <a href=""><img src="/insta.svg" alt="insta" /></a>
              <a href=""><img src="/whatsapp.svg" alt="whatsapp" /></a>
              <a href=""><img src="/telegram.svg" alt="telegram" /></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


