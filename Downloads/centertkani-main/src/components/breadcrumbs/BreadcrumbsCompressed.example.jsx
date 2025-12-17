import React from 'react';
import { BreadcrumbsCompressed } from './BreadcrumbsCompressed';

/**
 * Примеры использования компонента BreadcrumbsCompressed
 */
export const BreadcrumbsExamples = () => {
  // Пример 1: Короткая цепочка (показывается полностью)
  const shortBreadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: 'Текущая страница' }
  ];

  // Пример 2: Длинная цепочка (автоматически сокращается)
  const longBreadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: 'Для дома', href: '/catalog/home' },
    { label: 'Ткани', href: '/catalog/home/fabrics' },
    { label: 'Вафельное полотно', href: '/catalog/home/fabrics/waffle' },
    { label: 'Вафельное полотно голубое' }
  ];

  // Пример 3: Очень длинная цепочка
  const veryLongBreadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: 'Для дома', href: '/catalog/home' },
    { label: 'Ткани', href: '/catalog/home/fabrics' },
    { label: 'Хлопок', href: '/catalog/home/fabrics/cotton' },
    { label: 'Вафельное полотно', href: '/catalog/home/fabrics/cotton/waffle' },
    { label: 'Голубое', href: '/catalog/home/fabrics/cotton/waffle/blue' },
    { label: 'Вафельное полотно голубое' }
  ];

  // Пример 4: Минимальная цепочка (1 элемент)
  const singleBreadcrumb = [
    { label: 'Главная' }
  ];

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h3>Пример 1: Короткая цепочка (3 элемента)</h3>
        <BreadcrumbsCompressed items={shortBreadcrumbs} />
      </div>

      <div>
        <h3>Пример 2: Длинная цепочка (6 элементов - сокращается)</h3>
        <BreadcrumbsCompressed items={longBreadcrumbs} />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          Ожидаемый результат: Главная → ... → Вафельное полотно → Вафельное полотно голубое
        </p>
      </div>

      <div>
        <h3>Пример 3: Очень длинная цепочка (8 элементов - сокращается)</h3>
        <BreadcrumbsCompressed items={veryLongBreadcrumbs} />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          Ожидаемый результат: Главная → ... → Голубое → Вафельное полотно голубое
        </p>
      </div>

      <div>
        <h3>Пример 4: Минимальная цепочка (1 элемент)</h3>
        <BreadcrumbsCompressed items={singleBreadcrumb} />
      </div>

      <div>
        <h3>Пример 5: С текстовым разделителем</h3>
        <BreadcrumbsCompressed 
          items={longBreadcrumbs} 
          separator=" > "
        />
      </div>

      <div>
        <h3>Пример 6: С кастомным разделителем (компонент)</h3>
        <BreadcrumbsCompressed 
          items={longBreadcrumbs} 
          separator={
            <span style={{ margin: '0 8px', color: '#9B1E1C' }}>→</span>
          }
        />
      </div>
    </div>
  );
};

export default BreadcrumbsExamples;
