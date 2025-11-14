# Руководство по реализации бэкенда для API работ

## Обзор

Фронтенд ожидает REST API для работы с данными о работах из тканей. Ниже описано, что нужно реализовать на бэкенде.

## Структура базы данных

### Таблица/Модель: `works` (Работы)

```sql
CREATE TABLE works (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  image VARCHAR(500) NOT NULL,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Или для MongoDB:

```javascript
{
  _id: ObjectId,
  title: String,
  image: String,
  link: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Обязательные Endpoints

### 1. GET /api/works - Получить список работ с пагинацией

**Query параметры:**
- `page` (number, опционально) - номер страницы, по умолчанию 1
- `limit` (number, опционально) - количество элементов на странице, по умолчанию 12

**Пример запроса:**
```
GET /api/works?page=1&limit=12
```

**Формат ответа (успех):**
```json
{
  "works": [
    {
      "id": 1,
      "title": "Платье из вискозного шифона \"Флаурэль\" для выстаки \"Гранд Текстиль\"",
      "image": "/uploads/works/work1.jpg",
      "link": "/work/1"
    },
    {
      "id": 2,
      "title": "Платье из вискозного шифона \"Флаурэль\" для выстаки \"Гранд Текстиль\"",
      "image": "/uploads/works/work2.jpg",
      "link": "/work/2"
    }
  ],
  "total": 12,
  "page": 1,
  "totalPages": 1
}
```

**HTTP статусы:**
- `200 OK` - успешный запрос
- `500 Internal Server Error` - ошибка сервера

---

## Примеры реализации

### Node.js + Express + MongoDB (Mongoose)

```javascript
// routes/works.js
const express = require('express');
const router = express.Router();
const Work = require('../models/Work');

// GET /api/works
router.get('/works', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Получаем работы с пагинацией
    const works = await Work.find()
      .sort({ createdAt: -1 }) // Сортировка по дате создания (новые первые)
      .skip(skip)
      .limit(limit)
      .select('id title image link'); // Выбираем только нужные поля

    // Получаем общее количество работ
    const total = await Work.countDocuments();

    // Вычисляем общее количество страниц
    const totalPages = Math.ceil(total / limit);

    res.json({
      works,
      total,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Ошибка получения работ:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении работ',
      message: error.message 
    });
  }
});

module.exports = router;
```

**Модель Work (Mongoose):**

```javascript
// models/Work.js
const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 500
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: '#'
  }
}, {
  timestamps: true // Автоматически добавляет createdAt и updatedAt
});

module.exports = mongoose.model('Work', workSchema);
```

---

### Node.js + Express + PostgreSQL (Sequelize)

```javascript
// routes/works.js
const express = require('express');
const router = express.Router();
const { Work } = require('../models');

// GET /api/works
router.get('/works', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Получаем работы с пагинацией
    const { count, rows: works } = await Work.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'title', 'image', 'link']
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      works,
      total: count,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Ошибка получения работ:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении работ',
      message: error.message 
    });
  }
});

module.exports = router;
```

**Модель Work (Sequelize):**

```javascript
// models/Work.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Work = sequelize.define('Work', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  link: {
    type: DataTypes.STRING(500),
    defaultValue: '#'
  }
}, {
  tableName: 'works',
  timestamps: true
});

module.exports = Work;
```

---

### Python + Django REST Framework

```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from .models import Work
from .serializers import WorkSerializer

@api_view(['GET'])
def get_works(request):
    try:
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 12))
        
        works = Work.objects.all().order_by('-created_at')
        
        paginator = Paginator(works, limit)
        page_obj = paginator.get_page(page)
        
        serializer = WorkSerializer(page_obj, many=True)
        
        return Response({
            'works': serializer.data,
            'total': paginator.count,
            'page': page,
            'totalPages': paginator.num_pages
        })
    except Exception as e:
        return Response(
            {'error': 'Ошибка при получении работ', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

**Модель (models.py):**

```python
from django.db import models

class Work(models.Model):
    title = models.CharField(max_length=500)
    image = models.CharField(max_length=500)
    link = models.CharField(max_length=500, default='#', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
```

**Serializer (serializers.py):**

```python
from rest_framework import serializers
from .models import Work

class WorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Work
        fields = ['id', 'title', 'image', 'link']
```

**URLs (urls.py):**

```python
from django.urls import path
from . import views

urlpatterns = [
    path('api/works', views.get_works, name='get_works'),
]
```

---

### Python + Flask

```python
# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///works.db'
db = SQLAlchemy(app)

class Work(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    image = db.Column(db.String(500), nullable=False)
    link = db.Column(db.String(500), default='#')
    created_at = db.Column(db.DateTime, default=db.func.now())

@app.route('/api/works', methods=['GET'])
def get_works():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 12))
        
        # Пагинация
        pagination = Work.query.order_by(desc(Work.created_at)).paginate(
            page=page,
            per_page=limit,
            error_out=False
        )
        
        works = [{
            'id': work.id,
            'title': work.title,
            'image': work.image,
            'link': work.link
        } for work in pagination.items]
        
        return jsonify({
            'works': works,
            'total': pagination.total,
            'page': page,
            'totalPages': pagination.pages
        })
    except Exception as e:
        return jsonify({
            'error': 'Ошибка при получении работ',
            'message': str(e)
        }), 500
```

---

### PHP + Laravel

```php
// app/Http/Controllers/WorkController.php
<?php

namespace App\Http\Controllers;

use App\Models\Work;
use Illuminate\Http\Request;

class WorkController extends Controller
{
    public function index(Request $request)
    {
        try {
            $page = $request->query('page', 1);
            $limit = $request->query('limit', 12);
            
            $works = Work::orderBy('created_at', 'desc')
                ->paginate($limit, ['*'], 'page', $page);
            
            return response()->json([
                'works' => $works->items(),
                'total' => $works->total(),
                'page' => $works->currentPage(),
                'totalPages' => $works->lastPage()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Ошибка при получении работ',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
```

**Модель (app/Models/Work.php):**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Work extends Model
{
    protected $fillable = ['title', 'image', 'link'];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
```

**Мigration:**

```php
Schema::create('works', function (Blueprint $table) {
    $table->id();
    $table->string('title', 500);
    $table->string('image', 500);
    $table->string('link', 500)->default('#');
    $table->timestamps();
});
```

**Routes (routes/api.php):**

```php
Route::get('/works', [WorkController::class, 'index']);
```

---

## CORS настройка

Убедитесь, что ваш бэкенд разрешает запросы с фронтенда:

### Node.js/Express:

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // URL вашего фронтенда
  credentials: true
}));
```

### Django:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Flask:

```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:5173"])
```

---

## Тестирование API

Вы можете протестировать API с помощью curl:

```bash
curl http://localhost:5000/api/works?page=1&limit=12
```

Или используя Postman/Insomnia для визуального тестирования.

---

## Дополнительные рекомендации

1. **Валидация данных**: Добавьте валидацию query параметров (page > 0, limit > 0 и т.д.)

2. **Кэширование**: Для улучшения производительности можно добавить кэширование (Redis)

3. **Обработка изображений**: Убедитесь, что пути к изображениям корректны и доступны

4. **Безопасность**: Добавьте rate limiting для защиты от злоупотреблений

5. **Логирование**: Логируйте все запросы и ошибки для отладки

---

## Следующие шаги

После реализации базового endpoint `/api/works`, вы можете добавить:

- `GET /api/works/:id` - получение одной работы
- `POST /api/works` - создание работы (для админки)
- `PUT /api/works/:id` - обновление работы (для админки)
- `DELETE /api/works/:id` - удаление работы (для админки)

Эти методы уже подготовлены во фронтенде в `src/http/api.js`.

