import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import styles from "./Breadcrumbs.module.css";
import { Link, useLocation } from "react-router-dom";
import { getCategoryNameMap } from "../../utils/catalogCategories";
import { Context } from "../../main";

export const Breadcrumbs = observer(() => {
    const { tkans } = useContext(Context);
    // Маппинг категорий каталога (используем единый источник данных)
    const catalogCategoryMapHome = getCategoryNameMap(false);
    const catalogCategoryMapClothing = getCategoryNameMap(true);

    const breadcrumbNameMap = {
        '/about_us' : 'О нас',
        '/catalog' : 'Каталог',
        '/catalog_home' : 'Для дома',
        '/discounts' : 'Скидки и акции',
        '/account' : 'Личный кабинет',
        '/personal_account' : 'Личный кабинет',
        '/our_works' : 'Работы из наших тканей',
        '/privacy_policy' : 'Политика конфиденциальности',
    }

  const location = useLocation();
  const pathname = location.pathname;
  const pathnames = pathname.split("/").filter((x) => x);

  // Проверяем, находимся ли мы на странице товара
  const isTkanPage = pathnames[0] === 'tkan' && pathnames[1] !== undefined;

  // Проверяем, находимся ли мы на странице категории каталога
  const isClothingCatalog = pathnames[0] === 'catalog-clothing';
  const isCatalogCategory = pathnames.length >= 2 && (pathnames[0] === 'catalog' || pathnames[0] === 'catalog-clothing') && pathnames[1] !== undefined;
  const catalogSectionName = isClothingCatalog ? 'Для одежды' : 'Для дома';
  const catalogCategoryMap = isClothingCatalog ? catalogCategoryMapClothing : catalogCategoryMapHome;

  const ChevronIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 8L6 12" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
      <ol>
        <li>
          <Link className={styles.title} to="/">Главная</Link>
        </li>
        {pathnames.map((value, index) => {
          // Если это страница товара, обрабатываем специально
          if (isTkanPage && index === 0) {
            return (
              <React.Fragment key={`tkan-breadcrumbs`}>
                <li className={styles.chevron}>
                  <ChevronIcon />
                </li>
                <li>
                  <Link className={styles.title_path} to="/catalog">Каталог</Link>
                </li>
                <li className={styles.chevron}>
                  <ChevronIcon />
                </li>
                <li>
                  <span className={styles.title_path}>Для одежды</span>
                </li>
                <li className={styles.chevron}>
                  <ChevronIcon />
                </li>
                <li>
                  <span className={styles.title_path}>{tkans.selectedTkan?.name || 'Товар'}</span>
                </li>
              </React.Fragment>
            );
          }
          
          // Если это страница категории каталога, обрабатываем специально
          if (isCatalogCategory) {
            // Пропускаем 'catalog', так как обработаем его отдельно
            if (index === 0) {
              return null;
            }
            // Обрабатываем категорию (shelk, futer и т.д.)
            if (index === 1) {
              const catalogLink = isClothingCatalog ? '/catalog-clothing' : '/catalog';
              return (
                <React.Fragment key={`catalog-section`}>
                  <li className={styles.chevron}>
                    <ChevronIcon />
                  </li>
                  <li>
                    <Link className={styles.title_path} to={catalogLink}>Каталог</Link>
                  </li>
                  <li className={styles.chevron}>
                    <ChevronIcon />
                  </li>
                  <li>
                    <span className={styles.title_path}>{catalogSectionName}</span>
                  </li>
                  <li className={styles.chevron}>
                    <ChevronIcon />
                  </li>
                  <li>
                    <span className={styles.title_path}>{catalogCategoryMap[value] || value}</span>
                  </li>
                </React.Fragment>
              );
            }
            // Пропускаем остальные элементы, если они есть
            return null;
          }

          // Обычная обработка для других страниц
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const name = breadcrumbNameMap[to] || value;

          return (
            <React.Fragment key={to}>
              <li className={styles.chevron}>
                <ChevronIcon />
              </li>
              <li>
                {isLast ? (
                  <span className={styles.title_path}>{name}</span>
                ) : (
                  <Link className={styles.title_path} to={to}>{name}</Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
});
