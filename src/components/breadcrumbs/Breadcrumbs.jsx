import React from "react";
import styles from "./Breadcrumbs.module.css";
import { Link, useLocation } from "react-router-dom";

export const Breadcrumbs = () => {
    const breadcrumbNameMap = {
        '/about_us' : 'О нас',
        '/catalog_home' : 'Для дома',
        '/discounts' : 'Скидки и акции',
        '/personal_account' : 'Личный кабинет',
        '/our_works' : 'Работы из наших тканей',
        '/privacy_policy' : 'Политика конфиденциальности',
    }

  const location = useLocation();
  const pathname = location.pathname;
  const pathnames = pathname.split("/").filter((x) => x);

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
};
