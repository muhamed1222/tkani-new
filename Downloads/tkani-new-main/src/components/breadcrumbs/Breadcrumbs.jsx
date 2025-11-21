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
        '/AboutUs' : 'О нас',
        '/about_us' : 'О нас',
        '/catalog' : 'Каталог',
        '/catalog-clothing' : 'Каталог',
        '/discounts' : 'Скидки и акции',
        '/account' : 'Личный кабинет',
        '/personal_account' : 'Личный кабинет',
        '/our_works' : 'Работы из наших тканей',
        '/privacy_policy' : 'Политика конфиденциальности',
        '/privacy-policy' : 'Политика конфиденциальности',
        '/terms_of_service' : 'Условия пользования',
        '/terms-of-service' : 'Условия пользования',
        '/basket' : 'Корзина',
        '/login' : 'Вход',
        '/registration' : 'Регистрация',
        '/forgot-password' : 'Восстановление пароля',
        '/verify-code' : 'Подтверждение кода',
        '/reset-password' : 'Сброс пароля',
        '/admin' : 'Админ-панель',
        '/uikit' : 'UI Kit',
    }

  const location = useLocation();
  const pathname = location.pathname;
  const pathnames = pathname.split("/").filter((x) => x);

  // Проверяем, находимся ли мы на странице товара
  const isTkanPage = pathnames[0] === 'tkan' && pathnames[1] !== undefined;

  // Определяем тип каталога для страницы товара
  const getProductCatalogType = () => {
    // Сначала проверяем sessionStorage (сохранено при переходе с каталога)
    const savedType = sessionStorage.getItem('productCatalogType');
    if (savedType === 'clothing' || savedType === 'home') {
      return savedType;
    }
    
    // Если нет в sessionStorage, проверяем referrer
    if (typeof document !== 'undefined' && document.referrer) {
      if (document.referrer.includes('/catalog-clothing')) {
        return 'clothing';
      }
      if (document.referrer.includes('/catalog')) {
        return 'home';
      }
    }
    
    // По умолчанию возвращаем 'home' (более общий каталог)
    return 'home';
  };

  // Проверяем, находимся ли мы на странице категории каталога
  const isClothingCatalog = pathnames[0] === 'catalog-clothing';
  const isHomeCatalog = pathnames[0] === 'catalog' && pathnames.length === 1;
  const isCatalogCategory = pathnames.length >= 2 && (pathnames[0] === 'catalog' || pathnames[0] === 'catalog-clothing') && pathnames[1] !== undefined;
  const catalogSectionName = isClothingCatalog ? 'Для одежды' : 'Для дома';
  const catalogCategoryMap = isClothingCatalog ? catalogCategoryMapClothing : catalogCategoryMapHome;
  
  // Для страницы товара определяем тип каталога отдельно
  const productCatalogType = isTkanPage ? getProductCatalogType() : null;
  const productCatalogSectionName = productCatalogType === 'clothing' ? 'Для одежды' : 'Для дома';
  const productCatalogLink = productCatalogType === 'clothing' ? '/catalog-clothing' : '/catalog';

  const ChevronIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 8L6 12" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Если мы на главной странице, показываем только "Главная"
  if (pathnames.length === 0) {
    return (
      <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
        <ol>
          <li>
            <span className={styles.title_path}>Главная</span>
          </li>
        </ol>
      </nav>
    );
  }

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
                  <Link className={styles.title_path} to={productCatalogLink}>Каталог</Link>
                </li>
                <li className={styles.chevron}>
                  <ChevronIcon />
                </li>
                <li>
                  <span className={styles.title_path}>{productCatalogSectionName}</span>
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
          
          // Если это базовая страница каталога (без категории)
          if ((isHomeCatalog || isClothingCatalog) && pathnames.length === 1) {
            return (
              <React.Fragment key={`catalog-base`}>
                <li className={styles.chevron}>
                  <ChevronIcon />
                </li>
                <li>
                  <span className={styles.title_path}>{catalogSectionName}</span>
                </li>
              </React.Fragment>
            );
          }
          
          // Если это страница категории каталога, обрабатываем специально
          if (isCatalogCategory) {
            // Пропускаем 'catalog' или 'catalog-clothing', так как обработаем его отдельно
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
          // Проверяем маппинг для полного пути и для отдельного значения
          const name = breadcrumbNameMap[to] || breadcrumbNameMap[`/${value}`] || value;

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
