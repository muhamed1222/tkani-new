import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getCategoryNameMap, getCategoryCatalogType } from '../../utils/catalogCategories';

/**
 * Нормализует строку для breadcrumb label
 * Заменяет дефисы на пробелы и делает первую букву заглавной
 * 
 * @param {string} str - Строка для нормализации
 * @returns {string} - Нормализованная строка
 */
const normalizeLabel = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Хук для автоматического построения breadcrumbs из URL
 * 
 * @param {Object} options
 * @param {Object} options.labelMap - Маппинг путей на кастомные названия
 * @param {Object} options.context - Контекст приложения (для получения данных товаров/работ)
 * @returns {Array<{label: string, href?: string}>} - Массив breadcrumbs
 */
export const useAutoBreadcrumbs = ({ labelMap = {}, context = null } = {}) => {
  const location = useLocation();
  const params = useParams();
  
  const breadcrumbs = useMemo(() => {
    const pathname = location.pathname;
    const pathnames = pathname.split('/').filter((x) => x);
    
    // Дефолтный маппинг путей
    const defaultLabelMap = {
      '/': 'Главная',
      '/AboutUs': 'О нас',
      '/about_us': 'О нас',
      '/catalog': 'Каталог',
      '/catalog-clothing': 'Каталог',
      '/furniture': 'Фурнитура',
      '/discounts': 'Скидки и акции',
      '/account': 'Личный кабинет',
      '/personal_account': 'Личный кабинет',
      '/our_works': 'Работы из наших тканей',
      '/privacy_policy': 'Политика конфиденциальности',
      '/privacy-policy': 'Политика конфиденциальности',
      '/terms_of_service': 'Условия пользования',
      '/terms-of-service': 'Условия пользования',
      '/basket': 'Корзина',
      '/checkout': 'Оформление заказа',
      '/login': 'Вход',
      '/registration': 'Регистрация',
      '/forgot-password': 'Восстановление пароля',
      '/verify-code': 'Подтверждение кода',
      '/reset-password': 'Сброс пароля',
      '/admin': 'Админ-панель',
      '/uikit': 'UI Kit',
    };
    
    // Объединяем дефолтный маппинг с переданным
    const mergedLabelMap = { ...defaultLabelMap, ...labelMap };
    
    // Если мы на главной странице
    if (pathnames.length === 0) {
      return [{ label: mergedLabelMap['/'] || 'Главная' }];
    }
    
    const result = [];
    
    // Всегда добавляем "Главная"
    result.push({
      label: mergedLabelMap['/'] || 'Главная',
      href: '/'
    });
    
    // Проверяем специальные случаи
    const isTkanPage = pathnames[0] === 'tkan' && pathnames[1] !== undefined;
    const isWorkPage = pathnames[0] === 'work' && pathnames[1] !== undefined;
    const isCheckoutPage = pathnames[0] === 'checkout';
    const isClothingCatalog = pathnames[0] === 'catalog-clothing';
    const isHomeCatalog = pathnames[0] === 'catalog' && pathnames.length === 1;
    const isCatalogCategory = pathnames.length >= 2 && 
      (pathnames[0] === 'catalog' || pathnames[0] === 'catalog-clothing') && 
      pathnames[1] !== undefined;
    
    // Обработка страницы работы
    if (isWorkPage) {
      const workId = params.id;
      const work = context?.works?.selectedWork;
      const workName = work?.title || (context?.works?.isLoadingWork ? 'Загрузка...' : 'Работа');
      
      result.push({
        label: mergedLabelMap['/our_works'] || 'Работы из наших тканей',
        href: '/our_works'
      });
      
      result.push({
        label: workName
      });
      
      return result;
    }
    
    // Обработка страницы товара
    if (isTkanPage) {
      const productId = params.id;
      const product = context?.tkans?.selectedTkan?.id?.toString() === productId
        ? context.tkans.selectedTkan
        : context?.tkans?.tkans?.find(t => t.id?.toString() === productId);
      
      const productName = product?.name || product?.title || 
        (context?.tkans?.isLoading || context?.tkans?.isLoadingTkan ? 'Загрузка...' : 'Товар');
      
      const productCategory = product?.category;
      const categoryName = productCategory?.name || null;
      const categorySlug = productCategory?.slug || null;
      
      // Определяем тип каталога
      const getProductCatalogType = () => {
        if (typeof window !== 'undefined') {
          const savedType = sessionStorage.getItem('productCatalogType');
          if (savedType === 'clothing' || savedType === 'home') {
            return savedType;
          }
          
          if (document.referrer) {
            if (document.referrer.includes('/catalog-clothing')) return 'clothing';
            if (document.referrer.includes('/catalog')) return 'home';
          }
        }
        
        const categoryCatalogType = categorySlug ? getCategoryCatalogType(categorySlug) : null;
        return categoryCatalogType || 'home';
      };
      
      const finalCatalogType = getProductCatalogType();
      const finalCatalogLink = finalCatalogType === 'clothing' ? '/catalog-clothing' : '/catalog';
      const finalCatalogSectionName = finalCatalogType === 'clothing' ? 'Для одежды' : 'Для дома';
      
      result.push({
        label: 'Каталог',
        href: finalCatalogLink
      });
      
      result.push({
        label: finalCatalogSectionName,
        href: finalCatalogLink
      });
      
      if (categoryName && categorySlug) {
        result.push({
          label: categoryName,
          href: `${finalCatalogLink}/${categorySlug}`
        });
      }
      
      result.push({
        label: productName
      });
      
      return result;
    }
    
    // Обработка страницы оформления заказа
    if (isCheckoutPage) {
      result.push({
        label: mergedLabelMap['/basket'] || 'Корзина',
        href: '/basket'
      });
      
      result.push({
        label: mergedLabelMap['/checkout'] || 'Оформление заказа'
      });
      
      return result;
    }
    
    // Обработка базовой страницы каталога
    if ((isHomeCatalog || isClothingCatalog) && pathnames.length === 1) {
      const catalogSectionName = isClothingCatalog ? 'Для одежды' : 'Для дома';
      result.push({
        label: catalogSectionName
      });
      
      return result;
    }
    
    // Обработка страницы категории каталога
    if (isCatalogCategory) {
      const categorySlug = pathnames[1];
      const categoryCatalogType = getCategoryCatalogType(categorySlug);
      const correctCatalogType = categoryCatalogType || (isClothingCatalog ? 'clothing' : 'home');
      const correctCatalogLink = correctCatalogType === 'clothing' ? '/catalog-clothing' : '/catalog';
      const correctCatalogSectionName = correctCatalogType === 'clothing' ? 'Для одежды' : 'Для дома';
      const correctCategoryMap = correctCatalogType === 'clothing' 
        ? getCategoryNameMap(true) 
        : getCategoryNameMap(false);
      
      result.push({
        label: 'Каталог',
        href: correctCatalogLink
      });
      
      result.push({
        label: correctCatalogSectionName,
        href: correctCatalogLink
      });
      
      result.push({
        label: correctCategoryMap[categorySlug] || normalizeLabel(categorySlug)
      });
      
      return result;
    }
    
    // Обычная обработка для других страниц
    pathnames.forEach((value, index) => {
      // Пропускаем числовые ID (например, /work/33 -> пропускаем "33")
      if (!isNaN(value) && index > 0) {
        return;
      }
      
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      
      // Проверяем маппинг для полного пути и для отдельного значения
      const name = mergedLabelMap[to] || 
                   mergedLabelMap[`/${value}`] || 
                   normalizeLabel(value);
      
      result.push({
        label: name,
        href: isLast ? undefined : to
      });
    });
    
    return result;
  }, [location.pathname, params, labelMap, context]);
  
  return breadcrumbs;
};
