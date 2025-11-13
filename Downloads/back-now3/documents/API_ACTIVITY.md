# API Документация - История активности пользователя

## Базовый URL
Все эндпоинты требуют авторизации через Bearer Token в заголовке `Authorization`.

```
Authorization: Bearer <ваш_токен>
```

## Эндпоинты

### 1. Получить всю историю активности

Возвращает список всех посещенных мест и пройденных маршрутов пользователя.

**Endpoint:** `GET /user/activity`

**Заголовки:**
```
Authorization: Bearer <токен>
```

**Параметры:** Нет

**Пример запроса:**
```bash
curl -X GET "http://localhost:8080/user/activity" \
  -H "Authorization: Bearer ваш_токен"
```

**Пример ответа (200 OK):**
```json
{
  "places": [
    {
      "place_id": 1,
      "place": {
        "id": 1,
        "name": "Кафе \"Горный Ветерок\"",
        "type": "кафе",
        "description": "Уютное кафе с кавказской кухней",
        "address": "г. Нальчик, пр. Ленина, 25",
        "latitude": 43.4981,
        "longitude": 43.7189,
        "rating": 4.5,
        "images": [...]
      },
      "passed_at": "2025-01-15T10:30:00Z"
    }
  ],
  "routes": [
    {
      "route_id": 1,
      "route": {
        "id": 1,
        "name": "Восхождение на Эльбрус",
        "description": "Легендарный маршрут к высочайшей точке Европы",
        "distance": 22.5,
        "duration": 48.0,
        "rating": 4.9,
        "type": {...},
        "area": {...}
      },
      "passed_at": "2025-01-10T08:00:00Z"
    }
  ]
}
```

---

### 2. Получить историю посещенных мест

Возвращает список всех посещенных мест пользователя с датами посещения.

**Endpoint:** `GET /user/activity/places`

**Заголовки:**
```
Authorization: Bearer <токен>
```

**Параметры:** Нет

**Пример запроса:**
```bash
curl -X GET "http://localhost:8080/user/activity/places" \
  -H "Authorization: Bearer ваш_токен"
```

**Пример ответа (200 OK):**
```json
[
  {
    "place_id": 1,
    "place": {
      "id": 1,
      "name": "Кафе \"Горный Ветерок\"",
      "type": "кафе",
      "description": "Уютное кафе с кавказской кухней",
      "address": "г. Нальчик, пр. Ленина, 25",
      "latitude": 43.4981,
      "longitude": 43.7189,
      "rating": 4.5,
      "images": [
        {
          "id": 1,
          "url": "https://picsum.photos/400/300?random=1"
        }
      ]
    },
    "passed_at": "2025-01-15T10:30:00Z"
  },
  {
    "place_id": 2,
    "place": {
      "id": 2,
      "name": "Парк \"Атажукинский\"",
      "type": "парк",
      "description": "Крупнейший парк на Северном Кавказе",
      "address": "г. Нальчик, ул. Толстого, 2",
      "latitude": 43.4925,
      "longitude": 43.6123,
      "rating": 4.8,
      "images": [...]
    },
    "passed_at": "2025-01-12T14:20:00Z"
  }
]
```

**Примечание:** Записи отсортированы по дате посещения (от новых к старым).

---

### 3. Получить историю пройденных маршрутов

Возвращает список всех пройденных маршрутов пользователя с датами прохождения.

**Endpoint:** `GET /user/activity/routes`

**Заголовки:**
```
Authorization: Bearer <токен>
```

**Параметры:** Нет

**Пример запроса:**
```bash
curl -X GET "http://localhost:8080/user/activity/routes" \
  -H "Authorization: Bearer ваш_токен"
```

**Пример ответа (200 OK):**
```json
[
  {
    "route_id": 1,
    "route": {
      "id": 1,
      "name": "Восхождение на Эльбрус",
      "description": "Легендарный маршрут к высочайшей точке Европы",
      "overview": "Маршрут начинается от поселка Терскол...",
      "distance": 22.5,
      "duration": 48.0,
      "rating": 4.9,
      "type": {
        "id": 1,
        "name": "Пеший поход"
      },
      "area": {
        "id": 1,
        "name": "Приэльбрусье"
      }
    },
    "passed_at": "2025-01-10T08:00:00Z"
  },
  {
    "route_id": 2,
    "route": {
      "id": 2,
      "name": "Чегемские водопады",
      "description": "Путь к величественным водопадам",
      "distance": 8.2,
      "duration": 4.5,
      "rating": 4.7,
      "type": {...},
      "area": {...}
    },
    "passed_at": "2025-01-05T09:15:00Z"
  }
]
```

**Примечание:** Записи отсортированы по дате прохождения (от новых к старым).

---

### 4. Добавить место в историю

Добавляет место в историю посещений пользователя. Если место уже есть в истории, обновляет дату посещения.

**Endpoint:** `POST /user/activity/places/:placeId`

**Заголовки:**
```
Authorization: Bearer <токен>
Content-Type: application/json
```

**Параметры пути:**
- `placeId` (uint, required) - ID места

**Пример запроса:**
```bash
curl -X POST "http://localhost:8080/user/activity/places/1" \
  -H "Authorization: Bearer ваш_токен" \
  -H "Content-Type: application/json"
```

**Пример ответа (200 OK) - новое место:**
```json
{
  "message": "Место добавлено в историю",
  "passed_at": "2025-01-15T10:30:00Z"
}
```

**Пример ответа (200 OK) - обновление существующего:**
```json
{
  "message": "Дата посещения обновлена",
  "passed_at": "2025-01-15T10:30:00Z"
}
```

**Ошибки:**
- `400 Bad Request` - Неверный ID места
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Место не найдено
- `500 Internal Server Error` - Ошибка сервера

---

### 5. Добавить маршрут в историю

Добавляет маршрут в историю прохождений пользователя. Если маршрут уже есть в истории, обновляет дату прохождения.

**Endpoint:** `POST /user/activity/routes/:routeId`

**Заголовки:**
```
Authorization: Bearer <токен>
Content-Type: application/json
```

**Параметры пути:**
- `routeId` (uint, required) - ID маршрута

**Пример запроса:**
```bash
curl -X POST "http://localhost:8080/user/activity/routes/1" \
  -H "Authorization: Bearer ваш_токен" \
  -H "Content-Type: application/json"
```

**Пример ответа (200 OK) - новый маршрут:**
```json
{
  "message": "Маршрут добавлен в историю",
  "passed_at": "2025-01-15T10:30:00Z"
}
```

**Пример ответа (200 OK) - обновление существующего:**
```json
{
  "message": "Дата прохождения обновлена",
  "passed_at": "2025-01-15T10:30:00Z"
}
```

**Ошибки:**
- `400 Bad Request` - Неверный ID маршрута
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Маршрут не найден
- `500 Internal Server Error` - Ошибка сервера

---

### 6. Удалить место из истории

Удаляет место из истории посещений пользователя.

**Endpoint:** `DELETE /user/activity/places/:placeId`

**Заголовки:**
```
Authorization: Bearer <токен>
```

**Параметры пути:**
- `placeId` (uint, required) - ID места

**Пример запроса:**
```bash
curl -X DELETE "http://localhost:8080/user/activity/places/1" \
  -H "Authorization: Bearer ваш_токен"
```

**Пример ответа (200 OK):**
```json
{
  "message": "Место удалено из истории"
}
```

**Ошибки:**
- `400 Bad Request` - Неверный ID места
- `401 Unauthorized` - Не авторизован
- `500 Internal Server Error` - Ошибка сервера

---

### 7. Удалить маршрут из истории

Удаляет маршрут из истории прохождений пользователя.

**Endpoint:** `DELETE /user/activity/routes/:routeId`

**Заголовки:**
```
Authorization: Bearer <токен>
```

**Параметры пути:**
- `routeId` (uint, required) - ID маршрута

**Пример запроса:**
```bash
curl -X DELETE "http://localhost:8080/user/activity/routes/1" \
  -H "Authorization: Bearer ваш_токен"
```

**Пример ответа (200 OK):**
```json
{
  "message": "Маршрут удален из истории"
}
```

**Ошибки:**
- `400 Bad Request` - Неверный ID маршрута
- `401 Unauthorized` - Не авторизован
- `500 Internal Server Error` - Ошибка сервера

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Неверные параметры запроса |
| 401 | Не авторизован (отсутствует или неверный токен) |
| 404 | Ресурс не найден (место/маршрут не существует) |
| 500 | Внутренняя ошибка сервера |

## Примечания

1. **Авторизация:** Все эндпоинты требуют валидный JWT токен в заголовке `Authorization`.

2. **Сортировка:** Все списки отсортированы по дате (`passed_at`) в порядке убывания (от новых к старым).

3. **Повторное добавление:** При повторном добавлении места/маршрута в историю дата посещения/прохождения автоматически обновляется на текущую.

4. **Валидация:** Перед добавлением в историю проверяется существование места/маршрута и его активность (`is_active = true`).

5. **Связанные данные:** При получении истории автоматически загружаются:
   - Для мест: изображения (`Place.Images`)
   - Для маршрутов: тип маршрута (`Route.Type`) и район (`Route.Area`)

## Пример использования в JavaScript/TypeScript

```javascript
// Получить всю историю активности
async function getActivityHistory(token) {
  const response = await fetch('http://localhost:8080/user/activity', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Добавить место в историю
async function addPlaceToHistory(token, placeId) {
  const response = await fetch(`http://localhost:8080/user/activity/places/${placeId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

// Получить историю мест
async function getPlacesHistory(token) {
  const response = await fetch('http://localhost:8080/user/activity/places', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Удалить место из истории
async function removePlaceFromHistory(token, placeId) {
  const response = await fetch(`http://localhost:8080/user/activity/places/${placeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
```

## Пример использования в Python

```python
import requests

BASE_URL = "http://localhost:8080"
token = "ваш_токен"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Получить всю историю активности
def get_activity_history():
    response = requests.get(f"{BASE_URL}/user/activity", headers=headers)
    return response.json()

# Добавить место в историю
def add_place_to_history(place_id):
    response = requests.post(
        f"{BASE_URL}/user/activity/places/{place_id}",
        headers=headers
    )
    return response.json()

# Получить историю мест
def get_places_history():
    response = requests.get(f"{BASE_URL}/user/activity/places", headers=headers)
    return response.json()

# Удалить место из истории
def remove_place_from_history(place_id):
    response = requests.delete(
        f"{BASE_URL}/user/activity/places/{place_id}",
        headers=headers
    )
    return response.json()
```

