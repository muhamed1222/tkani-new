# API История активности - Краткая справка

## Все эндпоинты

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/user/activity` | Получить всю историю (места + маршруты) |
| GET | `/user/activity/places` | Получить историю посещенных мест |
| GET | `/user/activity/routes` | Получить историю пройденных маршрутов |
| POST | `/user/activity/places/:placeId` | Добавить место в историю |
| POST | `/user/activity/routes/:routeId` | Добавить маршрут в историю |
| DELETE | `/user/activity/places/:placeId` | Удалить место из истории |
| DELETE | `/user/activity/routes/:routeId` | Удалить маршрут из истории |

## Авторизация

Все эндпоинты требуют Bearer Token:
```
Authorization: Bearer <токен>
```

## Быстрые примеры

### Получить историю мест
```bash
curl -X GET "http://localhost:8080/user/activity/places" \
  -H "Authorization: Bearer ваш_токен"
```

### Добавить место в историю
```bash
curl -X POST "http://localhost:8080/user/activity/places/1" \
  -H "Authorization: Bearer ваш_токен"
```

### Добавить маршрут в историю
```bash
curl -X POST "http://localhost:8080/user/activity/routes/1" \
  -H "Authorization: Bearer ваш_токен"
```

### Получить всю историю
```bash
curl -X GET "http://localhost:8080/user/activity" \
  -H "Authorization: Bearer ваш_токен"
```

### Удалить место из истории
```bash
curl -X DELETE "http://localhost:8080/user/activity/places/1" \
  -H "Authorization: Bearer ваш_токен"
```

## Формат ответа

### GET /user/activity/places
```json
[
  {
    "place_id": 1,
    "place": { ... },
    "passed_at": "2025-01-15T10:30:00Z"
  }
]
```

### GET /user/activity/routes
```json
[
  {
    "route_id": 1,
    "route": { ... },
    "passed_at": "2025-01-15T10:30:00Z"
  }
]
```

### GET /user/activity
```json
{
  "places": [ ... ],
  "routes": [ ... ]
}
```

### POST /user/activity/places/:placeId
```json
{
  "message": "Место добавлено в историю",
  "passed_at": "2025-01-15T10:30:00Z"
}
```

## Коды ошибок

- `200` - Успех
- `400` - Неверные параметры
- `401` - Не авторизован
- `404` - Ресурс не найден
- `500` - Ошибка сервера

## Особенности

1. ✅ Автоматическая сортировка по дате (новые первые)
2. ✅ При повторном добавлении обновляется дата
3. ✅ Проверка существования места/маршрута
4. ✅ Загрузка связанных данных (изображения, тип, район)

Полная документация: `API_ACTIVITY.md`

