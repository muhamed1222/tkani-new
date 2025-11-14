import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { RatingBadge } from "./RatingBadge";

export const Footer = () => {
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
              <Link to="/" className={styles.link}>
                Шёлк
              </Link>
              <Link to="/" className={styles.link}>
                Футер
              </Link>
              <Link to="/" className={styles.link}>
                Трикотаж
              </Link>
              <Link to="/" className={styles.link}>
                Вискоза
              </Link>
              <Link to="/" className={styles.link}>
                Тенсель
              </Link>
              <Link to="/" className={styles.link}>
                Муслин
              </Link>
              <Link to="/" className={styles.link}>
                Тенсель
              </Link>
              <Link to="/" className={styles.link}>
                Лён
              </Link>
              <Link to="/" className={styles.link}>
                Купра
              </Link>
              <Link to="/" className={styles.link}>
                Хлопок
              </Link>
              <Link to="/" className={styles.link}>
                Штапель
              </Link>
              <Link to="/" className={styles.link}>
                Джинса
              </Link>
            </nav>
          </div>

          <div className={styles.footer_section}>
            <h3 className={styles.section_title}>Для дома</h3>
            <nav className={styles.nav}>
              <Link to="/" className={styles.link}>
                Сатин Турция
              </Link>
              <Link to="/" className={styles.link}>
                Сатин Китай
              </Link>
              <Link to="/" className={styles.link}>
                Тенсель 60s
              </Link>
              <Link to="/" className={styles.link}>
                Поплин Турция
              </Link>
              <Link to="/" className={styles.link}>
                Дак
              </Link>
              <Link to="/" className={styles.link}>
                Вафельное полотно
              </Link>
              <Link to="/" className={styles.link}>
                Махра
              </Link>
              <Link to="/" className={styles.link}>
                Пике косичка
              </Link>
              <Link to="/" className={styles.link}>
                Фланель
              </Link>
              <Link to="/" className={styles.link}>
                Муслин
              </Link>
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


