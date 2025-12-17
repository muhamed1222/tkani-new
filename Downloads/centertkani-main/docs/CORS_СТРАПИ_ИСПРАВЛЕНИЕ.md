# Добавление порта 5175 в CORS Strapi

## Инструкция

Добавьте порт 5175 в конфигурацию CORS Strapi, если хотите использовать прямой доступ к API (без прокси Vite).

### Шаги:

1. Откройте файл: `/Users/kelemetovmuhamed/Desktop/ct-2025/tkani-new-back-strapi/strapi/config/middlewares.js`

2. Добавьте `'http://localhost:5175'` в массив `origin`:

```javascript
{
  name: 'strapi::cors',
  config: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175', // ← ДОБАВЬТЕ ЭТУ СТРОКУ
      'http://localhost:5001',
      'https://centertkani.ru',
      'https://www.centertkani.ru',
      'https://api.centertkani.ru',
    ],
    // ...
  },
}
```

3. Перезапустите Strapi сервер

### Примечание

Если используете прокси Vite (рекомендуется), этот шаг не обязателен - прокси решает проблему CORS автоматически.
