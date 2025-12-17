# Инструкция по настройке каталога категорий в Strapi

## ✅ Что было сделано

1. ✅ Добавлен API метод `getCatalogSections()` для получения каталога категорий из Strapi
2. ✅ Обновлен `TkanStore` с методом `fetchCatalogSections()` для загрузки данных
3. ✅ Обновлен компонент `Typebar` для загрузки данных из Strapi вместо статического файла
4. ✅ Добавлен fallback на статические данные, если данные из Strapi еще не загружены

## 📋 Что нужно сделать в Strapi Admin

### Шаг 1: Обновить Content Type `Category`

1. Откройте Strapi Admin панель
2. Перейдите в **Content-Type Builder**
3. Найдите Content Type **Category**
4. Добавьте следующие поля (если их еще нет):

   **Поле `section` (Enumeration):**
   - Тип: Enumeration
   - Обязательное: Да
   - Значения: `clothing`, `home`
   - Описание: Раздел каталога (Для одежды / Для дома)

   **Поле `order` (Number):**
   - Тип: Number (Integer)
   - Обязательное: Нет
   - Описание: Порядок отображения в разделе

5. Сохраните изменения

### Шаг 2: Заполнить данные категорий

Для каждой категории установите:

#### Раздел "Для одежды" (section: `clothing`):

| Название | Slug | Section | Order |
|----------|------|---------|-------|
| Дак | dak | clothing | 1 |
| Вафельное полотно | vafelnoe-polotno | clothing | 2 |
| Лен постельный | len-postelnyj | clothing | 3 |
| Сатин Туриция | satin-turiciya | clothing | 4 |
| Махра | mahra | clothing | 5 |
| Муслин | muslin | clothing | 6 |
| Тенсель | tensel | clothing | 7 |
| Поплин Туриция | poplin-turiciya | clothing | 8 |
| Пике косичка | pike-kosichka | clothing | 9 |
| Фланель | flanel | clothing | 10 |
| Сатин люкс | satin-lyuks | clothing | 11 |

#### Раздел "Для дома" (section: `home`):

| Название | Slug | Section | Order |
|----------|------|---------|-------|
| Муслин | muslin | home | 1 |
| Штапель | shtapel | home | 2 |
| Купра | kupra | home | 3 |
| Шелк | shelk | home | 4 |
| Джинса | dzhinsa | home | 5 |
| Тенсель | tensel | home | 6 |
| Хлопок | hlopok | home | 7 |
| Трикотаж | trikotazh | home | 8 |
| Лен | len | home | 9 |

### Шаг 3: Проверить работу

1. Убедитесь, что все категории имеют поле `section` заполненным
2. Убедитесь, что все категории имеют поле `slug` заполненным
3. Проверьте, что данные отображаются на фронтенде

## 🔄 Как это работает

1. При загрузке компонента `Typebar` вызывается `fetchCatalogSections()`
2. Метод делает два запроса к Strapi API:
   - `/api/categories?filters[section][$eq]=clothing&sort=order:asc`
   - `/api/categories?filters[section][$eq]=home&sort=order:asc`
3. Данные сохраняются в `TkanStore.catalogSections`
4. Компонент `Typebar` использует эти данные для отображения
5. Если данные из Strapi еще не загружены, используется fallback на статические данные из `catalogCategories.js`

## 📝 Примечания

- Если категория не найдена в Strapi, используется fallback на статический маппинг slug'ов
- Порядок категорий определяется полем `order` в Strapi
- Если поле `order` не заполнено, категории будут отсортированы по порядку создания

## 🐛 Отладка

Если каталог не отображается:

1. Проверьте консоль браузера на наличие ошибок
2. Убедитесь, что Strapi API доступен по адресу из `VITE_STRAPI_URL`
3. Проверьте, что все категории имеют поле `section` заполненным
4. Проверьте Network tab в DevTools - должны быть запросы к `/api/categories`
