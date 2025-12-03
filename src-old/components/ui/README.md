# UI Kit - Библиотека компонентов

Переиспользуемая библиотека UI компонентов для проекта "Центр Ткани".

## Установка и использование

```javascript
import { Button, Input, Card, Badge, Alert, Modal } from '../components/ui';
```

## Компоненты

### Button

Кнопка с различными вариантами и размерами.

```jsx
import { Button } from '../components/ui';

// Primary кнопка
<Button variant="primary" onClick={handleClick}>
  Нажми меня
</Button>

// Secondary кнопка
<Button variant="secondary" size="large">
  Вторичная кнопка
</Button>

// Disabled состояние
<Button variant="primary" disabled>
  Отключена
</Button>

// Full width
<Button variant="primary" fullWidth>
  На всю ширину
</Button>
```

**Пропсы:**
- `variant`: `'primary' | 'secondary' | 'tertiary' | 'outline'` (по умолчанию: `'primary'`)
- `size`: `'small' | 'medium' | 'large'` (по умолчанию: `'medium'`)
- `disabled`: `boolean` (по умолчанию: `false`)
- `fullWidth`: `boolean` (по умолчанию: `false`)
- `type`: `'button' | 'submit' | 'reset'` (по умолчанию: `'button'`)
- `onClick`: `Function`
- `children`: `React.ReactNode`

---

### Input

Поле ввода с поддержкой ошибок и меток.

```jsx
import { Input } from '../components/ui';

// Базовое поле
<Input
  type="text"
  placeholder="Введите текст"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// С меткой и ошибкой
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={hasError}
  errorMessage="Неверный email"
/>

// Отключенное поле
<Input
  label="Недоступно"
  value="Недоступно"
  disabled
/>
```

**Пропсы:**
- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'search'` (по умолчанию: `'text'`)
- `label`: `string` - Метка поля
- `placeholder`: `string`
- `value`: `string`
- `onChange`: `Function`
- `error`: `boolean` (по умолчанию: `false`)
- `errorMessage`: `string` - Сообщение об ошибке
- `disabled`: `boolean` (по умолчанию: `false`)
- `id`: `string` - ID поля (генерируется автоматически, если не указан)

---

### Card

Карточка для отображения контента.

```jsx
import { Card } from '../components/ui';

// Обычная карточка
<Card>
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>

// Карточка с обводкой
<Card variant="outlined">
  Контент
</Card>

// Кликабельная карточка
<Card clickable onClick={handleClick}>
  Нажми меня
</Card>
```

**Пропсы:**
- `variant`: `'default' | 'outlined' | 'elevated'` (по умолчанию: `'default'`)
- `clickable`: `boolean` (по умолчанию: `false`)
- `onClick`: `Function` - Обработчик клика (работает только если `clickable={true}`)
- `children`: `React.ReactNode`

---

### Badge

Бейдж/тег для отображения статусов и меток.

```jsx
import { Badge } from '../components/ui';

// Primary бейдж
<Badge variant="primary">Новинка</Badge>

// Success бейдж
<Badge variant="success">В наличии</Badge>

// Error бейдж
<Badge variant="error">Скидка -50%</Badge>

// Outline бейдж
<Badge variant="outline">Хлопок</Badge>
```

**Пропсы:**
- `variant`: `'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline'` (по умолчанию: `'primary'`)
- `size`: `'small' | 'medium' | 'large'` (по умолчанию: `'medium'`)
- `children`: `React.ReactNode`

---

### Alert

Уведомление/алерт для отображения сообщений.

```jsx
import { Alert } from '../components/ui';

// Success алерт
<Alert variant="success" title="Успешно!">
  Товар успешно добавлен в корзину
</Alert>

// Error алерт
<Alert variant="error" title="Ошибка!">
  Не удалось обработать запрос
</Alert>

// Закрываемый алерт
<Alert
  variant="info"
  title="Информация"
  dismissible
  onDismiss={() => setShowAlert(false)}
>
  Доставка осуществляется в течение 2-4 дней
</Alert>
```

**Пропсы:**
- `variant`: `'success' | 'error' | 'warning' | 'info'` (по умолчанию: `'info'`)
- `title`: `string` - Заголовок алерта
- `dismissible`: `boolean` (по умолчанию: `false`)
- `onDismiss`: `Function` - Обработчик закрытия (работает только если `dismissible={true}`)
- `children`: `React.ReactNode`

---

### Modal

Модальное окно для отображения контента поверх страницы.

```jsx
import { Modal } from '../components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Открыть модальное окно</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Заголовок модального окна"
        size="medium"
      >
        <p>Содержимое модального окна</p>
        <Button onClick={() => setIsOpen(false)}>Закрыть</Button>
      </Modal>
    </>
  );
}
```

**Пропсы:**
- `isOpen`: `boolean` - Открыто ли модальное окно
- `onClose`: `Function` - Обработчик закрытия
- `title`: `string` - Заголовок модального окна
- `size`: `'small' | 'medium' | 'large'` (по умолчанию: `'medium'`)
- `closeOnOverlayClick`: `boolean` (по умолчанию: `true`) - Закрывать при клике на overlay
- `children`: `React.ReactNode`

**Особенности:**
- Автоматически блокирует скролл body при открытии
- Закрывается по нажатию Escape
- Адаптивный дизайн для мобильных устройств

---

## Примеры использования

### Форма с валидацией

```jsx
import { Button, Input, Alert } from '../components/ui';
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    // Логика отправки формы
  };

  return (
    <form>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!error}
        errorMessage={error}
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <Alert variant="error" title="Ошибка">
          {error}
        </Alert>
      )}
      <Button variant="primary" onClick={handleSubmit} fullWidth>
        Войти
      </Button>
    </form>
  );
}
```

### Карточка товара

```jsx
import { Card, Badge, Button } from '../components/ui';

function ProductCard({ product }) {
  return (
    <Card variant="outlined" clickable onClick={() => navigate(`/product/${product.id}`)}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <div>
        <Badge variant="success">В наличии</Badge>
        {product.isNew && <Badge variant="primary">Новинка</Badge>}
      </div>
      <p>{product.price} ₽</p>
      <Button variant="primary" fullWidth>
        В корзину
      </Button>
    </Card>
  );
}
```

---

## Стилизация

Все компоненты используют CSS Modules и следуют дизайн-системе проекта:
- Цвета: бордовый (#9B1E1C), черный (#101010), серые оттенки
- Шрифт: Inter
- Скругления: 8px для кнопок, 20px для карточек
- Переходы: 0.2s ease

---

## Доступность

Все компоненты включают:
- ARIA атрибуты
- Поддержку клавиатуры
- Фокус-индикаторы
- Семантическую разметку

---

## Расширение

Для добавления новых компонентов:
1. Создайте папку компонента в `src/components/ui/`
2. Создайте файлы `ComponentName.jsx` и `ComponentName.module.css`
3. Экспортируйте компонент в `src/components/ui/index.js`



