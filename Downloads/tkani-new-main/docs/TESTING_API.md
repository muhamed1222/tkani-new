# Тестирование интеграции API работ

## Быстрая проверка подключения

### 1. Убедитесь, что бэкенд запущен

Ваш Flask сервер должен быть запущен на порту 5000:

```bash
# В директории бэкенда
python app.py
# или
flask run
```

### 2. Проверьте, что endpoint работает

Откройте в браузере или используйте curl:

```bash
curl http://localhost:5000/api/works?page=1&limit=12
```

Должен вернуться JSON ответ:

```json
{
  "works": [],
  "total": 0,
  "page": 1,
  "totalPages": 0
}
```

Если база пустая, массив `works` будет пустым.

### 3. Добавьте тестовые данные в базу

Вы можете добавить тестовые работы через Python консоль:

```python
from app import app, db
from models import Work

with app.app_context():
    # Создаем тестовую работу
    work = Work(
        title='Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"',
        image='/uploads/works/work1.jpg',
        link='/work/1'
    )
    db.session.add(work)
    db.session.commit()
    print(f"Создана работа с ID: {work.id}")
```

Или добавьте несколько работ сразу:

```python
from app import app, db
from models import Work

with app.app_context():
    works_data = [
        {
            'title': 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"',
            'image': '/uploads/works/work1.jpg',
            'link': '/work/1'
        },
        {
            'title': 'Платье из вискозного шифона "Флаурэль" для выстаки "Гранд Текстиль"',
            'image': '/uploads/works/work2.jpg',
            'link': '/work/2'
        },
        # Добавьте больше работ...
    ]
    
    for work_data in works_data:
        work = Work(**work_data)
        db.session.add(work)
    
    db.session.commit()
    print(f"Создано {len(works_data)} работ")
```

### 4. Проверьте фронтенд

1. Убедитесь, что фронтенд запущен:
   ```bash
   npm run dev
   ```

2. Откройте страницу "Работы из наших тканей": `http://localhost:5173/our_works`

3. Откройте консоль браузера (F12) и проверьте:
   - Нет ли ошибок CORS
   - Выполняется ли запрос к `/api/works`
   - Какой ответ приходит от сервера

### 5. Проверка в Network tab

1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Обновите страницу `/our_works`
4. Найдите запрос к `/api/works`
5. Проверьте:
   - Status: должен быть 200
   - Response: должен содержать JSON с полями `works`, `total`, `page`, `totalPages`

## Возможные проблемы и решения

### Проблема: CORS ошибка

**Ошибка в консоли:**
```
Access to fetch at 'http://localhost:5000/api/works' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Решение:**
Убедитесь, что в вашем Flask `app.py` настроен CORS:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Разрешить все источники
# или
CORS(app, origins=["http://localhost:5173"])  # Только ваш фронтенд
```

### Проблема: 404 Not Found

**Ошибка:**
```
GET http://localhost:5000/api/works 404 (Not Found)
```

**Решение:**
1. Проверьте, что Blueprint зарегистрирован в `app.py`:
   ```python
   from routes.works import works_bp
   app.register_blueprint(works_bp, url_prefix='/api')
   ```

2. Проверьте, что роут определен правильно в `routes/works.py`

### Проблема: Пустой ответ или ошибка 500

**Решение:**
1. Проверьте логи Flask сервера
2. Убедитесь, что база данных создана: `db.create_all()`
3. Проверьте, что модель `Work` импортирована правильно

### Проблема: Данные не отображаются

**Решение:**
1. Проверьте формат ответа API - должен быть:
   ```json
   {
     "works": [...],
     "total": 12,
     "page": 1,
     "totalPages": 1
   }
   ```

2. Проверьте консоль браузера на ошибки JavaScript
3. Убедитесь, что `WorksStore` правильно обрабатывает ответ

## Автоматическое тестирование

Вы можете создать простой тестовый скрипт:

```python
# test_api.py
import requests

def test_get_works():
    url = "http://localhost:5000/api/works"
    params = {"page": 1, "limit": 12}
    
    response = requests.get(url, params=params)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "works" in data
    assert "total" in data
    assert "page" in data
    assert "totalPages" in data
    assert isinstance(data["works"], list)
    
    print("✅ API работает корректно!")
    print(f"Всего работ: {data['total']}")
    print(f"Текущая страница: {data['page']}")
    print(f"Всего страниц: {data['totalPages']}")

if __name__ == "__main__":
    test_get_works()
```

Запустите:
```bash
pip install requests
python test_api.py
```

## Проверка пагинации

1. Добавьте больше 12 работ в базу
2. Проверьте, что пагинация работает:
   - `GET /api/works?page=1&limit=12` - первые 12 работ
   - `GET /api/works?page=2&limit=12` - следующие 12 работ
3. На фронтенде проверьте, что кнопки пагинации работают

## Готово!

Если все работает, вы должны видеть:
- ✅ Запросы к API выполняются без ошибок
- ✅ Данные отображаются на странице
- ✅ Пагинация работает
- ✅ Индикатор загрузки показывается во время запроса

