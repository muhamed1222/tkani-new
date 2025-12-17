import logger from '../utils/logger';
import { makeAutoObservable, runInAction } from "mobx";
import { catalogAPI } from "../http/api";
import { buildImageUrl } from "../utils/apiConfig";
import cache, { Cache } from "../utils/cache";
import { CACHE_TTL } from "../utils/constants";

export default class TkanStore {
  constructor() {
    // Инициализация пустых массивов и состояний
    this._types = []
    this._tkans = []
    this._selectedType = {}
    this._isLoading = false;
    this._error = null;
    this._selectedTkan = null;
    this._isLoadingTkan = false;
    this._errorTkan = null;
    this._currentCategorySlug = null;
    this._catalogSections = {
      clothing: [],
      home: []
    };
    this._banners = {
      clothing: [],
      home: []
    };
    this._isLoadingBanners = false;
    // Pagination state
    this._currentPage = 1;
    this._pageSize = 12;
    this._totalPages = 1;
    this._totalItems = 0;

    makeAutoObservable(this);
  }

  // Отладочный метод для проверки всех товаров (только в режиме разработки)
  async debugAllProducts() {
    // Защита от вызова в production
    if (import.meta.env.PROD) {
      logger.warn('⚠️ debugAllProducts() доступен только в режиме разработки');
      return null;
    }

    try {
      logger.log('🔍 DEBUG: Fetching ALL products to check their categories');
      const response = await catalogAPI.getProducts({'populate': '*'});
      
      if (response.data && Array.isArray(response.data)) {
        logger.log(`📦 Total products found: ${response.data.length}`);
        
        response.data.forEach((product, index) => {
          const attributes = product.attributes || product;
          const category = attributes.category?.data;
          
          logger.log(`📦 Product ${index + 1}:`, {
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
      logger.error('DEBUG Error:', error);
      return null;
    }
  }

  /**
   * Load products filtered by category (server-side filtering)
   * @param {string} categorySlug - Category slug to filter by
   * @param {object} params - Additional query parameters
   */
  async fetchTkansByCategory(categorySlug, params = {}) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
      this._currentCategorySlug = categorySlug;
    });

    try {
      logger.log('Fetching products for category:', categorySlug);
      
      // Use server-side filtering instead of loading all products
      // First, get category ID by slug
      const categoriesResponse = await catalogAPI.getCategories();
      let categoryId = null;
      
      if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
        const category = categoriesResponse.data.find(cat => {
          const slug = cat.attributes?.slug || cat.slug;
          return slug === categorySlug;
        });
        categoryId = category?.id;
      }
      
      if (!categoryId) {
        throw new Error(`Category not found: ${categorySlug}`);
      }
      
      // Fetch products with server-side filtering by category
      const response = await catalogAPI.getProducts({
        ...params,
        categoryId: categoryId
      });
      
      runInAction(() => {
        if (response.data && Array.isArray(response.data)) {
          this._tkans = response.data.map(item => this._transformProductData(item));
          logger.log(`Server-filtered: ${this._tkans.length} products for category "${categorySlug}"`);
        } else {
          this._tkans = [];
        }
      });
    } catch (error) {
      logger.error('Error loading products by category:', error);
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

  /**
   * Load products from server with pagination support
   * @param {object} params - Query parameters including page, pageSize
   */
  async fetchTkans(params = {}) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
      this._currentCategorySlug = null;
    });

    try {
      // Add pagination parameters
      const queryParams = {
        ...params,
        page: params.page || this._currentPage,
        pageSize: params.pageSize || this._pageSize
      };

      const response = await catalogAPI.getProducts(queryParams);
      logger.log('Products loaded from API');

      runInAction(() => {
        // Handle Strapi v4 format
        if (response.data && Array.isArray(response.data)) {
          this._tkans = response.data.map(item => this._transformProductData(item));
          
          // Update pagination info from response
          if (response.meta?.pagination) {
            this._currentPage = response.meta.pagination.page || 1;
            this._pageSize = response.meta.pagination.pageSize || 12;
            this._totalPages = response.meta.pagination.pageCount || 1;
            this._totalItems = response.meta.pagination.total || 0;
          }
          
          logger.log(`Products loaded: ${this._tkans.length}`);
        } 
        // Handle old format
        else if (response.items && Array.isArray(response.items)) {
          this._tkans = response.items.map(item => this._transformProductData(item));
        } 
        // Fallback to empty array
        else {
          logger.warn('Unknown response format, using empty array');
          this._tkans = [];
        }
      });
    } catch (error) {
      logger.error('Error loading products:', error);
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

  /**
   * Load next page of products
   */
  async loadNextPage() {
    if (this._currentPage < this._totalPages) {
      await this.fetchTkans({ page: this._currentPage + 1 });
    }
  }

  /**
   * Load previous page of products
   */
  async loadPreviousPage() {
    if (this._currentPage > 1) {
      await this.fetchTkans({ page: this._currentPage - 1 });
    }
  }

  /**
   * Set page size and reload products
   * @param {number} pageSize - Number of items per page
   */
  async setPageSize(pageSize) {
    this._pageSize = pageSize;
    await this.fetchTkans({ page: 1, pageSize });
  }

  // Трансформация данных товара из Strapi
  _transformProductData(productData) {
    if (!productData) return null;

    logger.log('🔄 Transforming product data:', productData);

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
      logger.log('📂 Extracted category:', category);
    } else if (attributes.category) {
      category = attributes.category;
      logger.log('📂 Direct category:', category);
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

    logger.log('✅ Transformed product with category:', transformedProduct.category);
    return transformedProduct;
  }

  // Обработка массива изображений из Strapi
  _processImageArray(imagesData) {
    if (!imagesData) return [];
    
    logger.log('🖼️ Processing image array:', imagesData);

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
      logger.log('🖼️ No image data provided');
      return '/placeholder-product.jpg';
    }

    logger.log('🖼️ Processing image data:', imageData);
    return buildImageUrl(imageData, '/placeholder-product.jpg');
  }

  // Загрузка категорий с сервера
  async fetchTypes() {
    const cacheKey = 'categories';
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      runInAction(() => {
        this._types = cached;
      });
      return;
    }

    try {
      const response = await catalogAPI.getCategories();
      logger.log('📦 RAW Categories Response:', response);

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
        logger.log('✅ Категории загружены:', this._types);
      });
      
      // Cache categories for 1 hour
      cache.set(cacheKey, this._types, CACHE_TTL.LONG);
    } catch (error) {
      logger.error('Ошибка загрузки категорий:', error);
      runInAction(() => {
        this._types = [];
      });
    }
  }

  // Загрузка каталога категорий с группировкой по разделам
  async fetchCatalogSections() {
    const cacheKey = 'catalogSections';
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      runInAction(() => {
        this._catalogSections = cached;
      });
      return;
    }

    try {
      const response = await catalogAPI.getCatalogSections();
      logger.log('📦 RAW Catalog Sections Response:', response);

      runInAction(() => {
        this._catalogSections = {
          clothing: response.clothing || [],
          home: response.home || []
        };
        logger.log('✅ Каталог категорий загружен:', this._catalogSections);
      });
      
      // Cache catalog sections for 1 hour
      cache.set(cacheKey, this._catalogSections, CACHE_TTL.LONG);
    } catch (error) {
      logger.error('Ошибка загрузки каталога категорий:', error);
      runInAction(() => {
        this._catalogSections = {
          clothing: [],
          home: []
        };
      });
    }
  }

  // Загрузка баннеров для слайдеров
  async fetchBanners() {
    const cacheKey = 'banners';
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      runInAction(() => {
        this._banners = cached;
        this._isLoadingBanners = false;
      });
      return;
    }

    runInAction(() => {
      this._isLoadingBanners = true;
    });

    try {
      logger.log('🔄 Загрузка баннеров...');
      const [clothingResponse, homeResponse] = await Promise.all([
        catalogAPI.getBanners('clothing'),
        catalogAPI.getBanners('home')
      ]);

      logger.log('📦 RAW Clothing Response:', clothingResponse);
      logger.log('📦 RAW Home Response:', homeResponse);

      const processBanners = (response, sectionName) => {
        logger.log(`🔄 Обработка баннеров для раздела: ${sectionName}`);
        logger.log(`📦 Response data:`, response);
        
        if (response.data && Array.isArray(response.data)) {
          logger.log(`✅ Найдено ${response.data.length} баннеров для ${sectionName}`);
          
          const processed = response.data.map((item, index) => {
            logger.log(`  Баннер ${index + 1}:`, item);
            const attributes = item.attributes || item;
            
            // Обрабатываем изображение - может быть в разных форматах
            let imageUrl = '/placeholder-product.jpg';
            if (attributes.image) {
              logger.log(`  Изображение баннера ${index + 1}:`, attributes.image);
              
              if (attributes.image.data) {
                // Формат: image: { data: { attributes: {...} } }
                imageUrl = this._getStrapiImageUrl(attributes.image.data);
              } else if (attributes.image.attributes) {
                // Формат: image: { attributes: {...} }
                imageUrl = this._getStrapiImageUrl(attributes.image);
              } else if (typeof attributes.image === 'string') {
                // Формат: image: "url"
                imageUrl = attributes.image;
              } else {
                // Пытаемся обработать как объект изображения
                imageUrl = this._getStrapiImageUrl(attributes.image);
              }
            } else {
              logger.warn(`  ⚠ Баннер ${index + 1} не имеет изображения`);
            }
            
            const banner = {
              id: item.id,
              image: imageUrl,
              section: attributes.section || 'clothing',
              order: attributes.order || 0
            };
            
            logger.log(`  ✅ Обработан баннер ${index + 1}:`, banner);
            return banner;
          }).sort((a, b) => a.order - b.order);
          
          logger.log(`✅ Обработано ${processed.length} баннеров для ${sectionName}`);
          return processed;
        }
        
        logger.warn(`⚠ Нет данных для раздела ${sectionName}`);
        return [];
      };

      runInAction(() => {
        this._banners = {
          clothing: processBanners(clothingResponse, 'clothing'),
          home: processBanners(homeResponse, 'home')
        };
        logger.log('✅ Баннеры загружены:', this._banners);
        logger.log(`📊 Статистика: clothing=${this._banners.clothing.length}, home=${this._banners.home.length}`);
        this._isLoadingBanners = false;
      });
      
      // Cache banners for 30 minutes
      cache.set(cacheKey, this._banners, CACHE_TTL.MEDIUM);
    } catch (error) {
      logger.error('❌ Ошибка загрузки баннеров:', error);
      logger.error('Stack:', error.stack);
      runInAction(() => {
        this._banners = {
          clothing: [],
          home: []
        };
        this._isLoadingBanners = false;
      });
    }
  }


  // Загрузка товара по ID
  async fetchTkanById(id) {
    const cacheKey = Cache.generateKey('product', { id });
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      runInAction(() => {
        this._selectedTkan = cached;
        this._isLoadingTkan = false;
      });
      return cached;
    }

    runInAction(() => {
      this._isLoadingTkan = true;
      this._errorTkan = null;
    });

    try {
      const response = await catalogAPI.getProduct(id);
      logger.log('📦 RAW Product Response:', response);

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
        logger.log('✅ Товар загружен:', this._selectedTkan);
      });
      
      // Cache product for 15 minutes
      if (this._selectedTkan) {
        cache.set(cacheKey, this._selectedTkan, CACHE_TTL.MEDIUM);
      }
      
      return this._selectedTkan;
    } catch (error) {
      logger.error('Ошибка загрузки товара:', error);
      runInAction(() => {
        this._errorTkan = error.message;
        this._selectedTkan = null;
      });
      return null;
    } finally {
      runInAction(() => {
        this._isLoadingTkan = false;
      });
    }
  }

  // Временный метод для тестирования
  testCategoryFiltering() {
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
        logger.log('✅ Test data loaded:', this._tkans);
      });
    } catch (error) {
      logger.error('Test error:', error);
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

  setTkans(tkans) {
    this._tkans = tkans;
  }

  setSelectedType(type) {
    this._selectedType = type;
  }

  setSelectedTkan(tkan) {
    this._selectedTkan = tkan;
  }

  // Геттеры
  get types() {
    return this._types;
  }

  get tkans() {
    return this._tkans;
  }

  get selectedType() {
    return this._selectedType;
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

  get catalogSections() {
    return this._catalogSections;
  }

  get banners() {
    return this._banners;
  }

  get isLoadingBanners() {
    return this._isLoadingBanners;
  }

  // Pagination getters
  get currentPage() {
    return this._currentPage;
  }

  get pageSize() {
    return this._pageSize;
  }

  get totalPages() {
    return this._totalPages;
  }

  get totalItems() {
    return this._totalItems;
  }

  get hasNextPage() {
    return this._currentPage < this._totalPages;
  }

  get hasPreviousPage() {
    return this._currentPage > 1;
  }
}