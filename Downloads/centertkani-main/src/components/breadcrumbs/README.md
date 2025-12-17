# BreadcrumbsCompressed

Production-quality универсальный компонент хлебных крошек (breadcrumbs) с автоматическим сокращением длинных цепочек, SEO-разметкой и улучшенным UI/UX.

## Особенности

- ✅ **Автоматическое сокращение** цепочек длиннее 3 элементов
- ✅ **SEO-оптимизация** с JSON-LD разметкой (schema.org BreadcrumbList)
- ✅ **Автоматическое построение** из URL через хук `useAutoBreadcrumbs`
- ✅ **Улучшенный UI/UX**: truncate текста, адаптивность, SVG-стрелки
- ✅ **Обработка edge-cases**: null, пустые массивы, дубликаты
- ✅ **SSR-совместимость**: безопасная работа без window
- ✅ **Универсальный API** с массивом объектов
- ✅ **Настраиваемый разделитель**

## Установка

Компонент находится в проекте:
```
src/components/breadcrumbs/
```

## Быстрый старт

### Базовое использование с автоматическим построением

```jsx
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from '../../components/breadcrumbs';
import { useContext } from 'react';
import { Context } from '../../main';

function MyComponent() {
  const context = useContext(Context);
  const breadcrumbs = useAutoBreadcrumbs({ context });
  
  return <BreadcrumbsCompressed items={breadcrumbs} />;
}
```

### Ручное построение breadcrumbs

```jsx
import { BreadcrumbsCompressed } from '../../components/breadcrumbs';

const breadcrumbs = [
  { label: 'Главная', href: '/' },
  { label: 'Каталог', href: '/catalog' },
  { label: 'Для дома', href: '/catalog/home' },
  { label: 'Вафельное полотно голубое' }
];

<BreadcrumbsCompressed items={breadcrumbs} />
```

## API

### BreadcrumbsCompressed

#### Props

| Prop | Тип | Обязательный | По умолчанию | Описание |
|------|-----|---------------|--------------|----------|
| `items` | `Array<{label: string, href?: string}> \| null` | Да | `null` | Массив элементов breadcrumb |
| `separator` | `React.ReactNode \| string \| null` | Нет | `null` | Разделитель между элементами. `null` = SVG-стрелка по умолчанию |
| `className` | `string` | Нет | `''` | Дополнительный CSS класс |
| `enableSEO` | `boolean` | Нет | `true` | Включить JSON-LD разметку для SEO |
| `baseUrl` | `string` | Нет | `''` | Базовый URL для SEO разметки (автоматически определяется из window.location.origin) |
| `seoSchemaId` | `string` | Нет | `'breadcrumb-schema'` | ID для script тега с JSON-LD |

#### Формат элементов

```typescript
{
  label: string;    // Текст, отображаемый в breadcrumb (обязательно)
  href?: string;    // URL для ссылки (опционально, последний элемент не должен иметь href)
}
```

**Важно:**
- Последний элемент в массиве всегда отображается как текст (не ссылка)
- Элементы с `isEllipsis: true` создаются автоматически функцией `compressBreadcrumbs` и не должны передаваться вручную

### useAutoBreadcrumbs

Хук для автоматического построения breadcrumbs из текущего URL.

#### Параметры

```typescript
useAutoBreadcrumbs({
  labelMap?: Record<string, string>,  // Маппинг путей на кастомные названия
  context?: Context                    // Контекст приложения (для получения данных товаров/работ)
})
```

#### Возвращает

`Array<{label: string, href?: string}>` - Массив breadcrumbs

#### Примеры

```jsx
// Базовое использование
const breadcrumbs = useAutoBreadcrumbs();

// С кастомными названиями
const breadcrumbs = useAutoBreadcrumbs({
  labelMap: {
    '/custom': 'Кастомная страница',
    '/catalog/home': 'Для дома'
  }
});

// С контекстом (для страниц товаров/работ)
const context = useContext(Context);
const breadcrumbs = useAutoBreadcrumbs({ context });
```

## Логика сокращения

Функция `compressBreadcrumbs` автоматически сокращает цепочки:

- **≤3 элемента**: показываются все элементы
- **>3 элемента**: показываются:
  1. Первый элемент
  2. Эллипсис (`...`)
  3. Предпоследний элемент
  4. Последний элемент

### Примеры сокращения

```jsx
// 4 элемента
['A', 'B', 'C', 'D'] → ['A', '...', 'C', 'D']

// 5 элементов
['A', 'B', 'C', 'D', 'E'] → ['A', '...', 'D', 'E']

// 6 элементов
['A', 'B', 'C', 'D', 'E', 'F'] → ['A', '...', 'E', 'F']
```

## SEO (JSON-LD разметка)

Компонент автоматически генерирует и вставляет JSON-LD разметку для поисковых систем:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Каталог",
      "item": "https://example.com/catalog"
    }
  ]
}
```

Разметка вставляется в `<head>` документа через `<script type="application/ld+json">`.

### Отключение SEO

```jsx
<BreadcrumbsCompressed items={breadcrumbs} enableSEO={false} />
```

## UI/UX улучшения

### Truncate текста

Длинные labels автоматически обрезаются с `text-overflow: ellipsis`:
- Максимальная ширина: `160px` (десктоп), `120px` (планшет), `80px` (мобильный)
- `white-space: nowrap` для предотвращения переноса

### Адаптивность

Компонент полностью адаптивен:
- **Десктоп**: полная ширина элементов
- **Планшет (≤768px)**: уменьшенные размеры, меньшие отступы
- **Мобильный (≤480px)**: компактный вид, минимальные отступы

### Разделитель

По умолчанию используется SVG-стрелка. Можно заменить:

```jsx
// Текстовый разделитель
<BreadcrumbsCompressed items={items} separator=" > " />

// Кастомный компонент
<BreadcrumbsCompressed 
  items={items} 
  separator={<span className="custom-separator">→</span>}
/>
```

## Обработка edge-cases

Компонент корректно обрабатывает все граничные случаи:

- ✅ `items = null` → возвращает `null` (не рендерится)
- ✅ `items = []` → возвращает `null` (не рендерится)
- ✅ `items = 1 элемент` → показывается полностью
- ✅ `items = 2 элемента` → показываются оба
- ✅ `items = 3 элемента` → показываются все три
- ✅ Длинные `label` → автоматически обрезаются с ellipsis
- ✅ Повторяющиеся сегменты → дубликаты фильтруются
- ✅ Элементы без `href` → корректно обрабатываются
- ✅ SSR (без `window`) → безопасная работа, SEO разметка добавляется только на клиенте

## Структура файлов

```
src/components/breadcrumbs/
├── BreadcrumbsCompressed.jsx    # Основной компонент
├── useAutoBreadcrumbs.js         # Хук для автоматического построения
├── compressBreadcrumbs.js         # Функция сокращения
├── Breadcrumbs.module.css         # Стили
├── index.js                      # Единая точка экспорта
├── BreadcrumbsCompressed.example.jsx  # Примеры использования
└── README.md                     # Документация
```

## Стилизация

Компонент использует CSS модуль `Breadcrumbs.module.css`. Основные классы:

- `.breadcrumbs` - контейнер навигации
- `.title_path` - стиль для ссылок и текста (с truncate)
- `.ellipsis` - стиль для эллипсиса
- `.chevron` - контейнер для разделителя
- `.separator` - стиль для SVG разделителя
- `.separatorText` - стиль для текстового разделителя

Вы можете переопределить стили, добавив свои классы через `className` или модифицировав CSS модуль.

## Примеры использования

### Пример 1: Автоматическое построение (рекомендуется)

```jsx
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from '../../components/breadcrumbs';
import { useContext } from 'react';
import { Context } from '../../main';

function CatalogPage() {
  const context = useContext(Context);
  const breadcrumbs = useAutoBreadcrumbs({ context });
  
  return <BreadcrumbsCompressed items={breadcrumbs} />;
}
```

### Пример 2: Ручное построение

```jsx
import { BreadcrumbsCompressed } from '../../components/breadcrumbs';

function CustomPage() {
  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: 'Текущая страница' }
  ];
  
  return <BreadcrumbsCompressed items={breadcrumbs} />;
}
```

### Пример 3: С кастомными названиями

```jsx
const breadcrumbs = useAutoBreadcrumbs({
  labelMap: {
    '/catalog': 'Каталог товаров',
    '/catalog/home': 'Ткани для дома'
  }
});

<BreadcrumbsCompressed items={breadcrumbs} />
```

### Пример 4: Отключение SEO

```jsx
<BreadcrumbsCompressed items={breadcrumbs} enableSEO={false} />
```

### Пример 5: Кастомный разделитель

```jsx
<BreadcrumbsCompressed 
  items={breadcrumbs} 
  separator=" → "
/>
```

## Миграция со старого компонента

Старый компонент `Breadcrumbs.jsx` был удален. Все использования заменены на новый `BreadcrumbsCompressed` с `useAutoBreadcrumbs`.

### Было:
```jsx
import { Breadcrumbs } from "../../components/breadcrumbs/Breadcrumbs";
<Breadcrumbs />
```

### Стало:
```jsx
import { BreadcrumbsCompressed, useAutoBreadcrumbs } from "../../components/breadcrumbs";
const context = useContext(Context);
const breadcrumbs = useAutoBreadcrumbs({ context });
<BreadcrumbsCompressed items={breadcrumbs} />
```

## Особенности SSR

Компонент полностью совместим с SSR:

- Проверка `typeof window !== 'undefined'` перед использованием `window`
- SEO разметка добавляется только на клиенте через `useEffect`
- Безопасная работа с `sessionStorage` и `document.referrer`

## Производительность

- Использование `useMemo` для оптимизации вычислений
- Мемоизация сжатых breadcrumbs
- Мемоизация SEO разметки
- Минимальные ре-рендеры

## Поддержка

Все вопросы и предложения по улучшению компонента приветствуются.
