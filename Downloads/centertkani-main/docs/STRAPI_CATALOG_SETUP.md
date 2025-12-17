# Настройка каталога категорий в Strapi

## Структура Content Type в Strapi

Для управления каталогом категорий нужно обновить существующий Content Type `Category` в Strapi.

### Поля для Content Type `Category`:

1. **name** (Text, required) - Название категории
   - Пример: "Дак", "Вафельное полотно", "Муслин"

2. **slug** (UID, required, unique) - URL-friendly идентификатор
   - Пример: "dak", "vafelnoe-polotno", "muslin"

3. **section** (Enumeration, required) - Раздел каталога
   - Варианты: `clothing` (Для одежды), `home` (Для дома)

4. **order** (Number, optional) - Порядок отображения в разделе
   - Используется для сортировки категорий внутри раздела

5. **image** (Media, optional) - Изображение категории

### Пример данных для заполнения:

#### Раздел "Для одежды" (section: clothing):
1. Дак (slug: dak, order: 1)
2. Вафельное полотно (slug: vafelnoe-polotno, order: 2)
3. Лен постельный (slug: len-postelnyj, order: 3)
4. Сатин Туриция (slug: satin-turiciya, order: 4)
5. Махра (slug: mahra, order: 5)
6. Муслин (slug: muslin, order: 6)
7. Тенсель (slug: tensel, order: 7)
8. Поплин Туриция (slug: poplin-turiciya, order: 8)
9. Пике косичка (slug: pike-kosichka, order: 9)
10. Фланель (slug: flanel, order: 10)
11. Сатин люкс (slug: satin-lyuks, order: 11)

#### Раздел "Для дома" (section: home):
1. Муслин (slug: muslin, order: 1)
2. Штапель (slug: shtapel, order: 2)
3. Купра (slug: kupra, order: 3)
4. Шелк (slug: shelk, order: 4)
5. Джинса (slug: dzhinsa, order: 5)
6. Тенсель (slug: tensel, order: 6)
7. Хлопок (slug: hlopok, order: 7)
8. Трикотаж (slug: trikotazh, order: 8)
9. Лен (slug: len, order: 9)

## API Endpoint

После настройки структуры в Strapi, данные будут доступны через:

```
GET /api/categories?filters[section][$eq]=clothing&sort=order:asc
GET /api/categories?filters[section][$eq]=home&sort=order:asc
```

Или через кастомный endpoint (если создан):

```
GET /api/catalog-sections?populate=*
```

## Инструкция по настройке в Strapi Admin

1. Откройте Strapi Admin панель
2. Перейдите в Content-Type Builder
3. Найдите или создайте Content Type `Category`
4. Добавьте/обновите поля:
   - `section` (Enumeration): `clothing`, `home`
   - `order` (Number)
5. Сохраните изменения
6. Заполните данные для всех категорий с указанием раздела и порядка

## Миграция существующих данных

Если у вас уже есть категории в Strapi:

1. Для каждой категории установите поле `section`:
   - Категории из списка "Для одежды" → `section: clothing`
   - Категории из списка "Для дома" → `section: home`
2. Установите поле `order` для правильной сортировки
3. Сохраните изменения
