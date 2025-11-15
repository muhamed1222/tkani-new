import { makeAutoObservable, runInAction } from "mobx";
import { catalogAPI } from "../http/api";

export default class TkanStore {
  constructor() {
    // Моковые данные для fallback
    this._types = [
      {id: 1, name: 'Для дома'},
      {id: 2, name: 'Для шитья'}
    ]

    this._brands = [
      {id: 1, name: 'Египет'},
      {id: 2, name: 'Азия'}
    ]

    this._tkans = [
      {id: 1, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_1.png'},
      {id: 2, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_2.png'},
      {id: 3, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_3.png'},
      {id: 4, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_4.png'}
    ]

    this._selectedType = {}
    this._selectedBrand = {}
    this._isLoading = false;
    this._error = null;
    this._selectedTkan = null;
    this._isLoadingTkan = false;
    this._errorTkan = null;

    makeAutoObservable(this);
  }

  // Загрузка товаров с сервера
  async fetchTkans(params = {}) {
    runInAction(() => {
      this._isLoading = true;
      this._error = null;
    });

    try {
      let response;
      try {
        response = await catalogAPI.getProducts(params);
      } catch (apiError) {
        if (import.meta.env.DEV) {
          console.warn('API недоступен, используем моковые данные:', apiError);
        }
        // Используем моковые данные при ошибке API
        response = this._getMockTkans();
      }

      runInAction(() => {
        // Новый формат: { items: [...], total, page, pages }
        if (response.items && Array.isArray(response.items)) {
          this._tkans = response.items.map(item => ({
            id: item.id,
            name: item.title,
            price: item.price,
            rating: 5, // Рейтинг пока не реализован в API
            img: item.image || '/placeholder-product.jpg',
            description: item.description,
            stock: item.stock,
            category_id: item.category_id
          }));
        } else if (Array.isArray(response)) {
          // Старый формат: массив
          this._tkans = response;
        } else if (response && response.tkans && Array.isArray(response.tkans)) {
          this._tkans = response.tkans;
        } else if (response && response.data && Array.isArray(response.data)) {
          this._tkans = response.data;
        }
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Ошибка загрузки товаров:', error);
      }
      runInAction(() => {
        this._error = error.message;
        // В случае ошибки используем моковые данные
        this._tkans = this._getMockTkans();
      });
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  // Загрузка категорий с сервера
  async fetchTypes() {
    try {
      let response;
      try {
        response = await catalogAPI.getCategories();
      } catch (apiError) {
        if (import.meta.env.DEV) {
          console.warn('API недоступен, используем моковые данные для категорий:', apiError);
        }
        return; // Используем существующие моковые данные
      }

      runInAction(() => {
        // Новый формат: { categories: [...] }
        if (response.categories && Array.isArray(response.categories)) {
          this._types = response.categories.map(cat => ({
            id: cat.id,
            name: cat.name
          }));
        } else if (Array.isArray(response)) {
          // Старый формат: массив
          this._types = response;
        } else if (response && response.types && Array.isArray(response.types)) {
          this._types = response.types;
        } else if (response && response.data && Array.isArray(response.data)) {
          this._types = response.data;
        }
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Ошибка загрузки категорий:', error);
      }
    }
  }

  // Загрузка брендов с сервера
  async fetchBrands() {
    try {
      const response = await catalogAPI.getBrands();
      runInAction(() => {
        // Новый формат: { brands: [...] }
        if (response.brands && Array.isArray(response.brands)) {
          this._brands = response.brands.map(brand => ({
            id: brand.id,
            name: brand.name
          }));
        } else if (Array.isArray(response)) {
          // Старый формат: массив
          this._brands = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this._brands = response.data;
        }
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Ошибка загрузки брендов:', error);
      }
      // В случае ошибки оставляем моковые данные
    }
  }

  // Загрузка товара по ID
  async fetchTkanById(id) {
    runInAction(() => {
      this._isLoadingTkan = true;
      this._errorTkan = null;
    });

    try {
      let response;
      try {
        response = await catalogAPI.getProduct(id);
      } catch (apiError) {
        if (import.meta.env.DEV) {
          console.warn('API недоступен, используем моковые данные:', apiError);
        }
        // Используем моковые данные при ошибке API
        const mockTkan = this._getMockTkans().find(t => t.id === parseInt(id));
        if (mockTkan) {
          runInAction(() => {
            this._selectedTkan = {
              ...mockTkan,
              article: 'KJ1006',
              discount: 20,
              discountPrice: 640,
              composition: '100% хлопок',
              width: '150см',
              density: '90гр',
              country: 'Россия',
              description: 'Ткань обладает высокой прочностью, гигроскопичностью, теплопроводностью и устойчивостью к износам, неаллергенна; высокой сминаемостью; переплетение полотняное; на ощупь мягкая; не просвечивает; усадка до 10%.\nТкань прекрасно подходит для пошива комфортной одежды для взрослых и детей, домашнего текстиля (постельного белья, легких занавесок).\nТкань натуральная дает усадку, поэтому перед раскроем рекомендуется постирать при температуре дальнейших стирок, но не выше 40С, немного отжать и дать просохнуть в развешенном состоянии, прогладить с изнаночной стороны через проутюжильник на минимальном режиме утюга (важно не пересушивать ткань).\nУход:\n- стирка до 40C в деликатном режиме, отжим на низких оборотах\n- противопоказано употребление отбеливателей\n- гладить рекомендуется с изнаночной стороны, сушить в расправленном, подвешенном состоянии.\n\nЦветопередача может отличаться от оригинального цвета ткани в зависимости от настроек вашего монитора и в зависимости от партии тон ткани может отличаться.',
              images: [
                '/image_wet_asphalt_1.png',
                '/image_wet_asphalt_2.png',
                '/image_wet_asphalt_3.png',
                '/image_wet_asphalt_4.png'
              ]
            };
          });
        }
        return;
      }

      runInAction(() => {
        // Новый формат: { product: {...} }
        if (response.product) {
          const product = response.product;
          this._selectedTkan = {
            id: product.id,
            name: product.title,
            price: product.price,
            discountPrice: product.discount_price || product.price * 0.8,
            discount: product.discount || 20,
            article: product.article || `KJ${product.id}`,
            rating: product.rating || 5,
            img: product.image || '/placeholder-product.jpg',
            description: product.description || '',
            stock: product.stock,
            category_id: product.category_id,
            composition: product.composition || '100% хлопок',
            width: product.width || '150см',
            density: product.density || '90гр',
            country: product.country || 'Россия',
            images: product.images || [product.image || '/placeholder-product.jpg']
          };
        } else if (response.id) {
          // Старый формат: объект товара напрямую
          this._selectedTkan = {
            id: response.id,
            name: response.title || response.name,
            price: response.price,
            discountPrice: response.discount_price || response.price * 0.8,
            discount: response.discount || 20,
            article: response.article || `KJ${response.id}`,
            rating: response.rating || 5,
            img: response.image || response.img || '/placeholder-product.jpg',
            description: response.description || '',
            stock: response.stock,
            category_id: response.category_id,
            composition: response.composition || '100% хлопок',
            width: response.width || '150см',
            density: response.density || '90гр',
            country: response.country || 'Россия',
            images: response.images || [response.image || response.img || '/placeholder-product.jpg']
          };
        }
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Ошибка загрузки товара:', error);
      }
      runInAction(() => {
        this._errorTkan = error.message;
      });
    } finally {
      runInAction(() => {
        this._isLoadingTkan = false;
      });
    }
  }

  // Моковые данные для fallback
  _getMockTkans() {
    return [
      {id: 1, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_1.png'},
      {id: 2, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_2.png'},
      {id: 3, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_3.png'},
      {id: 4, name: 'Двунитка Мокрый Асфальт', price: 800, rating: 5, img: '/image_wet_asphalt_4.png'}
    ];
  }

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

  setSelectedTkan(tkan) {
    this._selectedTkan = tkan;
  }
}
