import styles from "./PrivacyPolicy.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";

export const PrivacyPolicy = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Breadcrumbs />
        
        <div className={styles.content}>
          <h1 className={styles.title}>Политика конфиденциальности</h1>
          
          <div className={styles.sections}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1.</span> Общие положения
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  1.1. Обработка персональных данных осуществляется в соответствии с ФЗ "О персональных данных" № 152-ФЗ от 27.07.2006.
                </p>
                <p className={styles.paragraph}>
                  1.2. Пользователь, передавая свои персональные данные, даёт согласие на их обработку.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2.</span> Персональные данные, собираемые на сайте:
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  2.1. Имя, номер телефона, адрес электронной почты, адрес доставки, иные сведения, вводимые пользователем при оформлении заказа, подписке, отправке формы обратной связи, в онлайн-чате.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3.</span> Цели обработки персональных данных:
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  3.1. Обработка заказов и доставка товаров.
                  <br />
                  3.2. Обратная связь с пользователем.
                  <br />
                  3.3. Рассылка акций, новостей и предложений (при согласии пользователя).
                  <br />
                  3.4. Поведенческая аналитика и улучшение качества сервиса.
                  <br />
                  3.5. Ретаргетинг и показ персонализированной рекламы.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>4.</span> Передача данных третьим лицам:
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  4.1. CRM Retail CRM для обработки заказов.
                  <br />
                  4.2. Сервис Unisender для рассылки.
                  <br />
                  4.3. Службы доставки: СДЭК, Почта России.
                  <br />
                  4.4. Рекламные платформы: Яндекс, SberAds.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>5.</span> Хранение и защита данных:
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  5.1. Данные хранятся на хостинге AdminVPS и в CRM.
                  <br />
                  5.2. Срок хранения — 1 год после выполнения заказа или до отзыва согласия.
                  <br />
                  5.3. Используются технические и организационные меры для защиты данных.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>6.</span> Права пользователя:
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  6.1. Пользователь имеет право отозвать согласие на обработку данных.
                  <br />
                  6.2. Для этого можно:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    отправить письмо на Email: center.tkani@yandex.ru;
                  </li>
                  <li className={styles.listItem}>
                    воспользоваться формой на сайте;
                  </li>
                  <li className={styles.listItem}>
                    позвонить по телефону: +7 (928) 716-66-26.
                  </li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>7.</span> Заключительные положения:
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  7.1. Политика может быть изменена. Актуальная версия всегда доступна на сайте.
                </p>
                <p className={styles.paragraph}>
                  Дата последнего обновления: май 2025 года.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
