import styles from "./TermsOfService.module.css";
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";

export const TermsOfService = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Breadcrumbs />
        
        <div className={styles.content}>
          <h1 className={styles.title}>Условия пользования</h1>
          
          <div className={styles.sections}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1.</span> Общие положения
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  1.1. Настоящие Условия пользования (далее — «Условия») регулируют отношения между интернет-магазином «Центр Ткани» (далее — «Магазин») и пользователем сайта (далее — «Пользователь»).
                </p>
                <p className={styles.paragraph}>
                  1.2. Используя сайт и его сервисы, Пользователь соглашается с настоящими Условиями в полном объеме.
                </p>
                <p className={styles.paragraph}>
                  1.3. Если Пользователь не согласен с какими-либо положениями настоящих Условий, он должен прекратить использование сайта.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2.</span> Предмет соглашения
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  2.1. Магазин предоставляет Пользователю возможность просмотра каталога товаров, оформления заказов и получения информации о товарах и услугах.
                </p>
                <p className={styles.paragraph}>
                  2.2. Все материалы сайта, включая тексты, изображения, логотипы, являются собственностью Магазина и защищены законодательством об интеллектуальной собственности.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3.</span> Регистрация и учетная запись
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  3.1. Для оформления заказа Пользователь может пройти регистрацию на сайте или оформить заказ без регистрации.
                </p>
                <p className={styles.paragraph}>
                  3.2. При регистрации Пользователь обязуется предоставить достоверную и актуальную информацию.
                </p>
                <p className={styles.paragraph}>
                  3.3. Пользователь несет ответственность за сохранность своих учетных данных и за все действия, совершенные под его учетной записью.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>4.</span> Оформление и оплата заказа
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  4.1. Заказ считается оформленным после подтверждения Пользователем всех данных заказа и получения подтверждения от Магазина.
                </p>
                <p className={styles.paragraph}>
                  4.2. Оплата заказа может производиться наличными при получении, банковской картой онлайн или иными способами, указанными на сайте.
                </p>
                <p className={styles.paragraph}>
                  4.3. Цены на товары указаны в рублях и могут быть изменены Магазином в любое время без предварительного уведомления.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>5.</span> Доставка товаров
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  5.1. Способы и сроки доставки товаров указаны на сайте в разделе «Доставка».
                </p>
                <p className={styles.paragraph}>
                  5.2. Стоимость доставки рассчитывается индивидуально в зависимости от адреса доставки и выбранного способа.
                </p>
                <p className={styles.paragraph}>
                  5.3. Риск случайной гибели или повреждения товара переходит к Пользователю с момента передачи товара курьеру или в пункт выдачи.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>6.</span> Возврат и обмен товара
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  6.1. Пользователь имеет право вернуть или обменять товар надлежащего качества в течение 14 дней с момента покупки, если товар не был в употреблении и сохранены его потребительские свойства.
                </p>
                <p className={styles.paragraph}>
                  6.2. Возврат товара ненадлежащего качества осуществляется в соответствии с законодательством о защите прав потребителей.
                </p>
                <p className={styles.paragraph}>
                  6.3. Для возврата товара необходимо связаться с Магазином по указанным контактам.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>7.</span> Ответственность сторон
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  7.1. Магазин не несет ответственности за ущерб, причиненный Пользователю в результате использования или невозможности использования сайта.
                </p>
                <p className={styles.paragraph}>
                  7.2. Пользователь обязуется использовать сайт в соответствии с законодательством и не нарушать права третьих лиц.
                </p>
                <p className={styles.paragraph}>
                  7.3. Магазин оставляет за собой право приостановить или прекратить доступ Пользователя к сайту в случае нарушения настоящих Условий.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>8.</span> Заключительные положения
              </h2>
              <div className={styles.sectionContent}>
                <p className={styles.paragraph}>
                  8.1. Магазин оставляет за собой право вносить изменения в настоящие Условия в любое время.
                </p>
                <p className={styles.paragraph}>
                  8.2. Актуальная версия Условий всегда доступна на сайте.
                </p>
                <p className={styles.paragraph}>
                  8.3. Все споры решаются путем переговоров, а при невозможности достижения соглашения — в соответствии с законодательством Российской Федерации.
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

