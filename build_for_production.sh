#!/bin/bash

# Скрипт для сборки фронтенда для production
# Использование: ./build_for_production.sh yourdomain.ru

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Ошибка: Укажите домен${NC}"
    echo "Использование: ./build_for_production.sh yourdomain.ru [api_domain] [cms_domain]"
    echo ""
    echo "Примеры:"
    echo "  ./build_for_production.sh yourdomain.ru"
    echo "  ./build_for_production.sh yourdomain.ru api.yourdomain.ru cms.yourdomain.ru"
    exit 1
fi

DOMAIN=$1
API_DOMAIN=${2:-"api.$DOMAIN"}
CMS_DOMAIN=${3:-"cms.$DOMAIN"}

echo -e "${GREEN}=== Сборка фронтенда для production ===${NC}"
echo -e "Домен: ${YELLOW}$DOMAIN${NC}"
echo -e "API: ${YELLOW}https://$API_DOMAIN${NC}"
echo -e "CMS: ${YELLOW}https://$CMS_DOMAIN${NC}"
echo ""

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Ошибка: Node.js не установлен${NC}"
    exit 1
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Ошибка: npm не установлен${NC}"
    exit 1
fi

# Создание .env.production
echo -e "${YELLOW}[1/3] Создание .env.production...${NC}"
cat > .env.production << EOF
VITE_API_URL=https://$API_DOMAIN/api/v1
VITE_STRAPI_URL=https://$CMS_DOMAIN
EOF
echo -e "${GREEN}✓ .env.production создан${NC}"

# Установка зависимостей
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[2/3] Установка зависимостей...${NC}"
    npm install
    echo -e "${GREEN}✓ Зависимости установлены${NC}"
else
    echo -e "${YELLOW}[2/3] Проверка зависимостей...${NC}"
    npm install
    echo -e "${GREEN}✓ Зависимости актуальны${NC}"
fi

# Сборка проекта
echo -e "${YELLOW}[3/3] Сборка проекта...${NC}"
npm run build

if [ -d "dist" ]; then
    echo ""
    echo -e "${GREEN}=== Сборка завершена успешно! ===${NC}"
    echo ""
    echo -e "${YELLOW}Следующие шаги:${NC}"
    echo "1. Проверьте содержимое папки dist/"
    echo "2. Загрузите файлы на сервер:"
    echo "   scp -r dist/* user@server:/var/www/$DOMAIN/dist/"
    echo ""
    echo "Или создайте архив:"
    echo "   tar -czf frontend-dist.tar.gz dist/"
    echo "   scp frontend-dist.tar.gz user@server:/tmp/"
    echo ""
    echo -e "${GREEN}Размер dist/:${NC}"
    du -sh dist/
else
    echo -e "${RED}Ошибка: Папка dist/ не создана${NC}"
    exit 1
fi


