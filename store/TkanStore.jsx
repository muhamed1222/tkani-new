import { makeAutoObservable, runInAction } from "mobx";
import { catalogAPI } from "../http/api";

export default class TkanStore {
  constructor() {
    // Инициализация пустых массивов и состояний
    this._types = []
    this._brands = []
    this._tkans = []
    this._selectedType = {}
    this._selectedBrand = {}
    this._isLoading = false;
    this._error = null;
    this._selectedTkan = null;
    this._isLoadingTkan = false;
    this._errorTkan = null;
    this._currentCategorySlug = null;

    makeAutoObservable(this);
  }

  // Отладочный метод для проверки всех товаров
  async debugAllProducts() {
    try {
      console.log('🔍 DEBUG: Fetching ALL products to check their categories');
      const response = await catalogAPI.getProducts({'populate': '*'});
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`📦 Total products found: ${response.data.length}`);
        
        response.data.forEach((product, index) => {
          const attributes = product.attributes || product;
          const category = attributes.category?.data;
          
          console.log(`📦 Product ${index + 1}:`, {
            id: product.id,
            title: attributes.title,
            category: category ? {
              id: category.id,
              name: category.attributes?.name,
              slug: category.attributes?.slug
            } : 'NO CATEGORY'
          });
        });
      }
      
      return response;
    } catch (error) {
      console.error('DEBUG Error:', error);
    }
  }

  // Загрузка товаров с фильтрацией по категории
  async fetchTkansByCategory(categorySlug, params = {}) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
      this._currentCategorySlug = categorySlug;
    });

    try {
      console.log('🎯 Starting client-side filtering for category:', categorySlug);
      
      // Загружаем ВСЕ товары
      await this.fetchTkans();
      
      // Фильтруем на клиенте
      runInAction(() => {
        const allProducts = this._tkans;
        console.log('📦 All products before filtering:', allProducts.length);
        
        const filteredProducts = allProducts.filter(product => {
          // Проверяем категорию товара
          const productCategorySlug = product.category?.slug;
          console.log(`🔍 Product "${product.title}" category slug:`, productCategorySlug);
          
          const isMatch = productCategorySlug === categorySlug;
          console.log(`🔍 Match with "${categorySlug}":`, isMatch);
          
          return isMatch;
        });
        
        this._tkans = filteredProducts;
        console.log(`✅ Client-side filtered: ${filteredProducts.length} products for category "${categorySlug}"`);
        
        // Выводим отладочную информацию о найденных товарах
        filteredProducts.forEach((product, index) => {
          console.log(`📦 Filtered product ${index + 1}:`, {
            title: product.title,
            category: product.category
          });
        });
      });
    } catch (error) {
      console.error('❌ Error in client-side filtering:', error);
      runInAction(() => {
        this._error = error.message;
        this._tkans = [];
      });
    } finally {
      runInAction(() => {
        this._isLoading = false;
        console.log('✅ Loading completed, isLoading set to false');
      });
    }
  }

  // Загрузка всех товаров с сервера
  async fetchTkans(params = {}) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
      this._currentCategorySlug = null;
    });

    try {
      const response = await catalogAPI.getProducts(params);
      console.log('📦 RAW API Response:', response);

      runInAction(() => {
        // Обработка формата Strapi v4
        if (response.data && Array.isArray(response.data)) {
          this._tkans = response.data.map(item => this._transformProductData(item));
          console.log('✅ Товары преобразованы:', this._tkans);
        } 
        // Обработка старого формата
        else if (response.items && Array.isArray(response.items)) {
          this._tkans = response.items.map(item => this._transformProductData(item));
        } 
        // Fallback на пустой массив
        else {
          console.warn('Неизвестный формат ответа, используем пустой массив');
          this._tkans = [];
        }
      });
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      runInAction(() => {
        this._error = error.message;
        this._tkans = [];
      });
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Трансформация данных товара из Strapi
  _transformProductData(productData) {
    if (!productData) return null;

    console.log('🔄 Transforming product data:', productData);

    // Извлекаем атрибуты в зависимости от формата Strapi
    const attributes = productData.attributes || productData;
    const id = productData.id || attributes.id;

    // Обрабатываем категорию
    let category = null;
    if (attributes.category?.data) {
      const categoryData = attributes.category.data;
      category = {
        id: categoryData.id,
        name: categoryData.attributes?.name || categoryData.name,
        slug: categoryData.attributes?.slug || categoryData.slug
      };
      console.log('📂 Extracted category:', category);
    } else if (attributes.category) {
      category = attributes.category;
      console.log('📂 Direct category:', category);
    }

    // Обрабатываем изображения
    const mainImage = this._getStrapiImageUrl(attributes.image);
    const galleryImages = this._processImageArray(attributes.images);
    
    // Если нет основного изображения, но есть галерея - используем первое из галереи
    const displayImage = mainImage !== '/placeholder-product.jpg' 
      ? mainImage 
      : (galleryImages.length > 0 ? galleryImages[0] : '/placeholder-product.jpg');

    const transformedProduct = {
      id: id,
      name: attributes.title || attributes.name,
      title: attributes.title || attributes.name,
      price: parseFloat(attributes.price) || 0,
      discountPrice: attributes.discount_price ? parseFloat(attributes.discount_price) : null,
      discount: attributes.discount ? parseInt(attributes.discount) : null,
      stock: attributes.stock ? parseInt(attributes.stock) : 0,
      article: attributes.article || `KJ${id}`,
      composition: attributes.composition || '',
      width: attributes.width || '',
      density: attributes.density || '',
      country: attributes.country || '',
      rating: attributes.rating ? parseFloat(attributes.rating) : 0,
      reviews_count: attributes.reviews_count ? parseInt(attributes.reviews_count) : 0,
      description: attributes.description || '',
      
      // Категория
      category: category,
      
      // Изображения
      img: displayImage,
      image: displayImage,
      images: galleryImages,
      
      // Для совместимости
      inStock: (attributes.stock || 0) > 0,
      category_id: attributes.category?.data?.id || attributes.category_id
    };

    console.log('✅ Transformed product with category:', transformedProduct.category);
    return transformedProduct;
  }

  // Обработка массива изображений из Strapi
  _processImageArray(imagesData) {
    if (!imagesData) return [];
    
    console.log('🖼️ Processing image array:', imagesData);

    // Формат Strapi v4: { data: [ { attributes: { url: string } } ] }
    if (imagesData.data && Array.isArray(imagesData.data)) {
      return imagesData.data.map(img => this._getStrapiImageUrl(img)).filter(url => url !== '/placeholder-product.jpg');
    }
    
    // Если это простой массив объектов с изображениями
    if (Array.isArray(imagesData)) {
      return imagesData.map(img => this._getStrapiImageUrl(img)).filter(url => url !== '/placeholder-product.jpg');
    }
    
    return [];
  }

  // Хелпер для получения URL изображения из Strapi
  _getStrapiImageUrl(imageData) {
    if (!imageData) {
      console.log('🖼️ No image data provided');
      return '/placeholder-product.jpg';
    }

    console.log('🖼️ Processing image data:', imageData);

    // Если это уже строка с URL
    if (typeof imageData === 'string') {
      const url = imageData.startsWith('http') 
        ? imageData 
        : `http://localhost:1337${imageData}`;
      console.log('🖼️ String URL:', url);
      return url;
    }
    
    // Формат Strapi v4: { data: { attributes: { url: string, formats: {...} } } }
    if (imageData.data) {
      const attributes = imageData.data.attributes || imageData.data;
      if (attributes && attributes.url) {
        const url = `http://localhost:1337${attributes.url}`;
        console.log('🖼️ Strapi v4 URL from data:', url);
        return url;
      }
    }
    
    // Если это объект с attributes (формат Strapi v4)
    if (imageData.attributes) {
      if (imageData.attributes.url) {
        const url = `http://localhost:1337${imageData.attributes.url}`;
        console.log('🖼️ Strapi v4 URL from attributes:', url);
        return url;
      }
    }
    
    // Если это объект с url (простой формат)
    if (imageData.url) {
      const url = imageData.url.startsWith('http') 
        ? imageData.url 
        : `http://localhost:1337${imageData.url}`;
      console.log('🖼️ Simple object URL:', url);
      return url;
    }

    console.log('🖼️ No valid image URL found, using fallback');
    return '/placeholder-product.jpg';
  }

  // Загрузка категорий с сервера
  async fetchTypes() {
    try {
      const response = await catalogAPI.getCategories();
      console.log('📦 RAW Categories Response:', response);

      runInAction(() => {
        // Обработка формата Strapi v4
        if (response.data && Array.isArray(response.data)) {
          this._types = response.data.map(item => {
            const attributes = item.attributes || item;
            return {
              id: item.id,
              name: attributes.name || attributes.title,
              slug: attributes.slug,
              image: this._getStrapiImageUrl(attributes.image)
            };
          });
        } else if (Array.isArray(response)) {
          this._types = response;
        } else if (response.categories && Array.isArray(response.categories)) {
          this._types = response.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }));
        } else {
          this._types = [];
        }
        console.log('✅ Категории загружены:', this._types);
      });
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      runInAction(() => {
        this._types = [];
      });
    }
  }

  // Загрузка брендов с сервера
  async fetchBrands() {
    try {
      const response = await catalogAPI.getBrands();
      console.log('📦 RAW Brands Response:', response);

      runInAction(() => {
        // Обработка формата Strapi v4
        if (response.data && Array.isArray(response.data)) {
          this._brands = response.data.map(item => {
            const attributes = item.attributes || item;
            return {
              id: item.id,
              name: attributes.name || attributes.title,
              image: this._getStrapiImageUrl(attributes.image)
            };
          });
        } else if (Array.isArray(response)) {
          this._brands = response;
        } else if (response.brands && Array.isArray(response.brands)) {
          this._brands = response.brands.map(brand => ({
            id: brand.id,
            name: brand.name
          }));
        } else {
          this._brands = [];
        }
        console.log('✅ Бренды загружены:', this._brands);
      });
    } catch (error) {
      console.error('Ошибка загрузки брендов:', error);
      runInAction(() => {
        this._brands = [];
      });
    }
  }

  // Загрузка товара по ID
  async fetchTkanById(id) {
    runInAction(() => {
      this._isLoadingTkan = true;
      this._errorTkan = null;
    });

    try {
      const response = await catalogAPI.getProduct(id);
      console.log('📦 RAW Product Response:', response);

      runInAction(() => {
        // Обработка формата Strapi v4
        if (response.data) {
          this._selectedTkan = this._transformProductData(response.data);
        } else if (response.product) {
          // Старый формат: { product: {...} }
          const product = response.product;
          this._selectedTkan = this._transformProductData(product);
        } else {
          // Старый формат: объект товара напрямую
          this._selectedTkan = this._transformProductData(response);
        }
        console.log('✅ Товар загружен:', this._selectedTkan);
      });
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
      runInAction(() => {
        this._errorTkan = error.message;
        this._selectedTkan = null;
      });
    } finally {
      runInAction(() => {
        this._isLoadingTkan = false;
      });
    }
  }

  // Временный метод для тестирования
  async testCategoryFiltering() {
    runInAction(() => {
      this._isLoading = true;
    });

    try {
      // Создаем тестовые данные
      const testProducts = [
        {
          id: 1,
          title: 'Тестовый товар 1 - Дак',
          price: 1000,
          category: { slug: 'dak', name: 'Дак' },
          image: '/placeholder-product.jpg'
        },
        {
          id: 2, 
          title: 'Тестовый товар 2 - Дак',
          price: 1500,
          category: { slug: 'dak', name: 'Дак' },
          image: '/placeholder-product.jpg'
        },
        {
          id: 3,
          title: 'Тестовый товар 3 - Другая категория',
          price: 2000,
          category: { slug: 'other', name: 'Другая' },
          image: '/placeholder-product.jpg'
        }
      ];

      runInAction(() => {
        this._tkans = testProducts;
        console.log('✅ Test data loaded:', this._tkans);
      });
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Сеттеры
  setTypes(types) {
    this._types = types;
  }

  setBrands(brands) {
    this._brands = brands;
  }

  setTkans(tkans) {
    this._tkans = tkans;
  }

  setSelectedType(type) {
    this._selectedType = type;
  }

  setSelectedBrand(brand) {
    this._selectedBrand = brand;
  }

  setSelectedTkan(tkan) {
    this._selectedTkan = tkan;
  }

  // Геттеры
  get types() {
    return this._types;
  }

  get brands() {
    return this._brands;
  }

  get tkans() {
    return this._tkans;
  }

  get selectedType() {
    return this._selectedType;
  }

  get selectedBrand() {
    return this._selectedBrand;
  }

  get isLoading() {
    return this._isLoading;
  }

  get error() {
    return this._error;
  }

  get selectedTkan() {
    return this._selectedTkan;
  }

  get isLoadingTkan() {
    return this._isLoadingTkan;
  }

  get errorTkan() {
    return this._errorTkan;
  }

  get currentCategorySlug() {
    return this._currentCategorySlug;
  }
}