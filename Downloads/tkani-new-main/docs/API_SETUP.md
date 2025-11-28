# Настройка API для страницы "Работы из наших тканей"

## Структура

Проект настроен для работы с API через следующие компоненты:

1. **`src/http/api.js`** - Базовый API сервис
2. **`src/store/WorksStore.jsx`** - MobX store для управления состоянием работ
3. **`src/pages/ourWorks/OurWorks.jsx`** - Компонент страницы, использующий store

## Настройка URL API

### Вариант 1: Через переменные окружения (рекомендуется)

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:5000/api
```

Или для production:

```env
VITE_API_URL=https://your-api-domain.com/api
```

### Вариант 2: Прямое изменение в коде

Откройте `src/http/api.js` и измените:

```javascript
const API_URL = 'http://your-api-url.com/api';
```

## Формат ответа API

API должен возвращать данные в одном из следующих форматов:

### Вариант 1: Объект с метаданными (рекомендуется)

```json
{
  "works": [
    {
      "id": 1,
      "title": "Платье из вискозного шифона \"Флаурэль\" для выстаки \"Гранд Текстиль\"",
      "image": "/path/to/image.jpg",
      "link": "/work/1"
    },
    ...
  ],
  "total": 12,
  "page": 1,
  "totalPages": 1
}
```

### Вариант 2: Простой массив

```json
[
  {
    "id": 1,
    "title": "Платье из вискозного шифона \"Флаурэль\" для выстаки \"Гранд Текстиль\"",
    "image": "/path/to/image.jpg",
    "link": "/work/1"
  },
  ...
]
```

## Endpoints API

### GET /api/works
Получить список работ с пагинацией

**Query параметры:**
- `page` (number) - номер страницы (по умолчанию: 1)
- `limit` (number) - количество элементов на странице (по умолчанию: 12)

**Пример запроса:**
```
GET /api/works?page=1&limit=12
```

### GET /api/works/:id
Получить работу по ID

**Пример запроса:**
```
GET /api/works/1
```

## Пример реализации на бэкенде

### Node.js/Express пример:

```javascript
// GET /api/works
app.get('/api/works', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  try {
    const works = await Work.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Work.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      works,
      total,
      page,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Fallback на моковые данные

Если API недоступен, приложение автоматически использует моковые данные из `WorksStore._getMockData()`. Это позволяет продолжать разработку без бэкенда.

## Отключение моковых данных

Когда API будет готов, вы можете удалить fallback логику из `WorksStore.jsx`:

```javascript
async fetchWorks(page = 1, limit = 12) {
  this._isLoading = true;
  this._error = null;

  try {
    const response = await worksAPI.getAll(page, limit);
    // Обработка ответа...
  } catch (error) {
    console.error('Ошибка загрузки работ:', error);
    this._error = error.message;
  } finally {
    this._isLoading = false;
  }
}
```

## Дополнительные методы API

В `src/http/api.js` также доступны методы для админки:

- `worksAPI.create(workData)` - создать работу
- `worksAPI.update(id, workData)` - обновить работу
- `worksAPI.delete(id)` - удалить работу

Эти методы можно использовать в админ-панели для управления работами.

