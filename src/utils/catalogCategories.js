// Единый источник данных для категорий каталога

// Категории для одежды
export const clothingCategories = [
  { name: "Дак", slug: "dak" },
  { name: "Вафельное полотно", slug: "vafelnoe-polotno" },
  { name: "Лен постельный", slug: "len-postelnyj" },
  { name: "Сатин Туриция", slug: "satin-turiciya" },
  { name: "Махра", slug: "mahra" },
  { name: "Муслин", slug: "muslin" },
  { name: "Тенсель", slug: "tensel" },
  { name: "Поплин Туриция", slug: "poplin-turiciya" },
  { name: "Пике косичка", slug: "pike-kosichka" },
  { name: "Фланель", slug: "flanel" },
  { name: "Сатин люкс", slug: "satin-lyuks" },
];

// Категории для дома
export const homeCategories = [
  { name: "Муслин", slug: "muslin" },
  { name: "Штапель", slug: "shtapel" },
  { name: "Купра", slug: "kupra" },
  { name: "Шелк", slug: "shelk" },
  { name: "Джинса", slug: "dzhinsa" },
  { name: "Тенсель", slug: "tensel" },
  { name: "Хлопок", slug: "hlopok" },
  { name: "Трикотаж", slug: "trikotazh" },
  { name: "Лен", slug: "len" },
];

// Преобразование в формат для Catalog.jsx (с id и дополнительными полями)
export const getClothingCategoriesForCatalog = () => {
  return clothingCategories.map((cat, index) => ({
    id: index + 1,
    name: cat.name,
    slug: cat.slug,
    hasSubmenu: false,
    parentId: null,
  }));
};

export const getHomeCategoriesForCatalog = () => {
  return homeCategories.map((cat, index) => ({
    id: index + 1,
    name: cat.name,
    slug: cat.slug,
    hasSubmenu: false,
    parentId: null,
  }));
};

// Получение массива названий для Typebar
export const getClothingCategoryNames = () => {
  return clothingCategories.map(cat => cat.name);
};

export const getHomeCategoryNames = () => {
  return homeCategories.map(cat => cat.name);
};

// Маппинг slug -> название для breadcrumbs
export const getCategoryNameMap = (isClothing = false) => {
  const categories = isClothing ? clothingCategories : homeCategories;
  const map = {};
  categories.forEach(cat => {
    map[cat.slug] = cat.name;
  });
  return map;
};

// Маппинг название -> slug для Typebar
export const getFabricSlugMap = () => {
  const map = {};
  [...clothingCategories, ...homeCategories].forEach(cat => {
    map[cat.name] = cat.slug;
  });
  return map;
};

