import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';
import { compressBreadcrumbs } from './compressBreadcrumbs';
import logger from '../../utils/logger';

/**
 * Генерирует JSON-LD разметку для SEO (schema.org BreadcrumbList)
 * 
 * @param {Array<{label: string, href?: string}>} items - Массив breadcrumbs
 * @param {string} baseUrl - Базовый URL сайта
 * @returns {Object} - JSON-LD объект
 */
const generateBreadcrumbSchema = (items, baseUrl = '') => {
  if (!items || items.length === 0) {
    return null;
  }

  // Фильтруем только валидные элементы (без ellipsis)
  const validItems = items.filter(item => !item.isEllipsis && item.label);

  if (validItems.length === 0) {
    return null;
  }

  const itemListElement = validItems.map((item, index) => {
    const position = index + 1;
    const itemUrl = item.href 
      ? (item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`)
      : undefined;

    return {
      '@type': 'ListItem',
      position,
      name: item.label,
      ...(itemUrl && { item: itemUrl })
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  };
};

/**
 * Универсальный компонент Breadcrumbs с автоматическим сокращением длинных цепочек
 * Production-quality версия с SEO, улучшенным UI/UX и обработкой edge-cases
 * 
 * @param {Object} props
 * @param {Array<{label: string, href?: string}>|null} props.items - Массив элементов breadcrumb
 * @param {React.ReactNode|string} props.separator - Разделитель между элементами (по умолчанию SVG-стрелка)
 * @param {string} props.className - Дополнительный CSS класс
 * @param {boolean} props.enableSEO - Включить JSON-LD разметку для SEO (по умолчанию true)
 * @param {string} props.baseUrl - Базовый URL для SEO разметки
 * @param {string} props.seoSchemaId - ID для script тега с JSON-LD (по умолчанию 'breadcrumb-schema')
 */
export const BreadcrumbsCompressed = ({ 
  items = null, 
  separator = null,
  className = '',
  enableSEO = true,
  baseUrl = '',
  seoSchemaId = 'breadcrumb-schema'
}) => {
  // Обработка edge-cases: null, undefined, не массив
  const validItems = useMemo(() => {
    if (items === null || items === undefined) {
      return [];
    }
    
    if (!Array.isArray(items)) {
      logger.warn('BreadcrumbsCompressed: items должен быть массивом, получен', typeof items);
      return [];
    }
    
    return items;
  }, [items]);

  // Сжимаем breadcrumbs, если элементов больше 3
  const compressedItems = useMemo(() => {
    return compressBreadcrumbs(validItems);
  }, [validItems]);

  // Генерируем SEO разметку
  const seoSchema = useMemo(() => {
    if (!enableSEO || compressedItems.length === 0) {
      return null;
    }
    
    // Определяем baseUrl автоматически, если не передан
    const finalBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    
    return generateBreadcrumbSchema(compressedItems, finalBaseUrl);
  }, [compressedItems, enableSEO, baseUrl]);

  // Вставляем JSON-LD разметку в head
  useEffect(() => {
    if (!seoSchema) {
      return;
    }

    // Удаляем старый script, если есть
    const existingScript = document.getElementById(seoSchemaId);
    if (existingScript) {
      existingScript.remove();
    }

    // Создаем новый script с JSON-LD
    const script = document.createElement('script');
    script.id = seoSchemaId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(seoSchema);
    document.head.appendChild(script);

    // Cleanup при размонтировании
    return () => {
      const scriptToRemove = document.getElementById(seoSchemaId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [seoSchema, seoSchemaId]);

  // Если нет элементов, не рендерим ничего
  if (compressedItems.length === 0) {
    return null;
  }

  // Компонент разделителя по умолчанию (SVG-стрелка)
  const DefaultSeparator = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={styles.separator}
      aria-hidden="true"
    >
      <path 
        d="M6 4L10 8L6 12" 
        stroke="#101010" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  // Рендерим разделитель
  const renderSeparator = () => {
    if (separator === null || separator === undefined) {
      return <DefaultSeparator />;
    }
    if (typeof separator === 'string') {
      return <span className={styles.separatorText}>{separator}</span>;
    }
    return separator;
  };

  return (
    <>
      <nav 
        aria-label="breadcrumb" 
        className={`${styles.breadcrumbs} ${className}`}
      >
        <ol>
          {compressedItems.map((item, index) => {
            const isLast = index === compressedItems.length - 1;
            const isEllipsis = item.isEllipsis;

            return (
              <React.Fragment key={`breadcrumb-${index}-${item.label}`}>
                {index > 0 && (
                  <li className={styles.chevron} aria-hidden="true">
                    {renderSeparator()}
                  </li>
                )}
                <li>
                  {isEllipsis ? (
                    <span className={styles.ellipsis} aria-hidden="true">
                      {item.label}
                    </span>
                  ) : isLast ? (
                    <span 
                      className={styles.title_path} 
                      aria-current="page"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link 
                      className={styles.title_path} 
                      to={item.href || '#'}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

/**
 * Пример использования:
 * 
 * import { BreadcrumbsCompressed } from './components/breadcrumbs/BreadcrumbsCompressed';
 * 
 * // Базовое использование
 * <BreadcrumbsCompressed 
 *   items={[
 *     { label: 'Главная', href: '/' },
 *     { label: 'Каталог', href: '/catalog' },
 *     { label: 'Текущая страница' }
 *   ]} 
 * />
 * 
 * // С автоматическим построением (через useAutoBreadcrumbs)
 * import { useAutoBreadcrumbs } from './components/breadcrumbs/useAutoBreadcrumbs';
 * 
 * function MyComponent() {
 *   const breadcrumbs = useAutoBreadcrumbs({ labelMap: { '/custom': 'Кастомная страница' } });
 *   return <BreadcrumbsCompressed items={breadcrumbs} />;
 * }
 * 
 * // Отключить SEO
 * <BreadcrumbsCompressed items={items} enableSEO={false} />
 * 
 * // Кастомный разделитель
 * <BreadcrumbsCompressed items={items} separator=" > " />
 */