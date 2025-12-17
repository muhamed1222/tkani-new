import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { buildImageUrl } from "../../utils/apiConfig";
import { 
  searchProducts, 
  safeGetFromStorage, 
  safeSetToStorage, 
  sanitizeString,
  incrementSearchCount,
  getPopularQueries
} from "../../utils/searchUtils";

export const SearchInput = ({ 
  placeholder = "Поиск по сайту", 
  onSearch, 
  className = "", 
  products = [] 
}) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Дебаунс поискового запроса
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Популярные запросы на основе статистики поиска (обновляются динамически)
  const [popularQueries, setPopularQueries] = useState(() => {
    return getPopularQueries(4, ["Нитки", "Ткань", "Иглы швейные", "Атласная ткань"]);
  });

  // Обновляем популярные запросы при открытии dropdown
  useEffect(() => {
    if (showDropdown && !searchValue) {
      setPopularQueries(getPopularQueries(4, ["Нитки", "Ткань", "Иглы швейные", "Атласная ткань"]));
    }
  }, [showDropdown, searchValue]);
  
  // Недавние запросы из localStorage
  const [recentQueries, setRecentQueries] = useState(() => {
    return safeGetFromStorage("recentQueries", ["Ткань для штор", "Натуральные материалы"]);
  });

  // Результаты поиска с использованием улучшенной функции поиска
  const searchResults = useMemo(() => {
    if (!debouncedSearchValue || !Array.isArray(products) || products.length === 0) {
      return [];
    }

    setIsLoading(true);
    const results = searchProducts(products, debouncedSearchValue);
    
    // Имитация загрузки для лучшего UX (можно убрать если поиск мгновенный)
    setTimeout(() => setIsLoading(false), 100);
    
    return results;
  }, [debouncedSearchValue, products]);

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Показываем dropdown при фокусе
  useEffect(() => {
    if (isSearchFocused) {
      setShowDropdown(true);
    }
  }, [isSearchFocused]);

  // Вызываем onSearch при изменении debouncedSearchValue для обновления данных
  useEffect(() => {
    if (onSearch && debouncedSearchValue !== undefined) {
      onSearch(debouncedSearchValue.trim());
    }
  }, [debouncedSearchValue, onSearch]);

  // Сброс выбранного индекса при изменении результатов
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults.length, searchValue]);

  // Прокрутка к выбранному элементу
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleClear = useCallback(() => {
    setSearchValue("");
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (onSearch) onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  const handleSearch = useCallback((query, closeDropdown = true) => {
    if (!query || query.trim() === '') {
      if (onSearch) onSearch("");
      if (closeDropdown) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
      return;
    }

    const trimmedQuery = query.trim();
    
    // Увеличиваем счетчик статистики поиска
    incrementSearchCount(trimmedQuery);
    
    // Обновляем популярные запросы после увеличения статистики
    setPopularQueries(getPopularQueries(4, ["Нитки", "Ткань", "Иглы швейные", "Атласная ткань"]));
    
    if (onSearch) onSearch(trimmedQuery);
    
    // Сохраняем в недавние запросы
    if (!recentQueries.includes(trimmedQuery)) {
      const updated = [trimmedQuery, ...recentQueries.slice(0, 9)];
      setRecentQueries(updated);
      safeSetToStorage("recentQueries", updated, 10);
    }
    
    if (closeDropdown) {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  }, [onSearch, recentQueries]);

  const handleQueryClick = useCallback((query) => {
    setSearchValue(query);
    // onSearch будет вызван автоматически через debouncedSearchValue в useEffect
    // Не закрываем dropdown, чтобы показать результаты поиска
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults.length > 0) {
        // Выбираем элемент из результатов
        handleSearch(searchResults[selectedIndex].name || searchResults[selectedIndex].title);
      } else {
        // Обычный поиск
        handleSearch(searchValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchValue && searchResults.length > 0) {
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (!searchValue) {
        // Навигация по популярным/недавним запросам
        const totalQueries = popularQueries.length + recentQueries.length;
        setSelectedIndex(prev => prev < totalQueries - 1 ? prev + 1 : -1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (selectedIndex > -1) {
        setSelectedIndex(prev => prev - 1);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setIsSearchFocused(false);
      setSelectedIndex(-1);
    }
  }, [searchValue, searchResults, selectedIndex, handleSearch, popularQueries.length, recentQueries.length]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowDropdown(true);
    setSelectedIndex(-1);
  }, []);

  const handleRemoveRecentQuery = useCallback((e, query) => {
    e.stopPropagation();
    const updated = recentQueries.filter(q => q !== query);
    setRecentQueries(updated);
    safeSetToStorage("recentQueries", updated, 10);
  }, [recentQueries]);

  const handleResultClick = useCallback((product) => {
    // Переходим на страницу товара, если есть ID
    if (product.id) {
      navigate(`/tkan/${product.id}`);
      setShowDropdown(false);
      setSearchValue("");
      setIsSearchFocused(false);
    } else {
      // Если нет ID, выполняем поиск по названию
      const productName = product.name || product.title;
      if (productName) {
        handleSearch(productName, true);
      }
    }
  }, [handleSearch, navigate]);

  // Подсчет результатов для скроллбара
  const scrollbarHeight = useMemo(() => {
    if (!searchResults.length || isMobile) return 0;
    const maxVisible = 4;
    const itemHeight = 128; // высота одного элемента
    const totalHeight = Math.min(searchResults.length, maxVisible) * itemHeight;
    const containerHeight = 500;
    return Math.min((containerHeight / (searchResults.length * itemHeight)) * containerHeight, containerHeight - 4);
  }, [searchResults.length, isMobile]);

  return (
    <div className="relative" ref={searchRef}>
      <div 
        className={`flex items-center justify-between pl-[14px] pr-[4px] py-[4px] rounded-[40px] w-full md:w-[340px] transition-all ${
          isSearchHovered && !isSearchFocused && !searchValue 
            ? "bg-[#E4E2DF]" 
            : "bg-white"
        } ${className}`}
        onMouseEnter={() => !isSearchFocused && !searchValue && setIsSearchHovered(true)}
        onMouseLeave={() => setIsSearchHovered(false)}
      >
        <div className="flex items-center flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleInputChange}
            onFocus={() => {
              setIsSearchFocused(true);
              setShowDropdown(true);
            }}
            onBlur={(e) => {
              // Не закрываем сразу, чтобы клик по результатам работал
              // Проверяем, что клик не был на элементе внутри dropdown
              const relatedTarget = e.relatedTarget || document.activeElement;
              if (dropdownRef.current && dropdownRef.current.contains(relatedTarget)) {
                return; // Не закрываем, если фокус перешел на элемент внутри dropdown
              }
              setTimeout(() => {
                if (!dropdownRef.current?.contains(document.activeElement)) {
                  setIsSearchFocused(false);
                }
              }, 200);
            }}
            onKeyDown={handleKeyPress}
            className={`flex-1 bg-transparent border-none outline-none text-[16px] text-[#101010] placeholder-[#888888] leading-[1.2] ${
              searchValue ? "pl-[4px] caret-[#9B1E1C]" : ""
            }`}
            aria-label="Поиск по сайту"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
            role="combobox"
            inputMode="search"
            autoComplete="off"
          />
        </div>
        <button 
          onClick={searchValue ? handleClear : () => handleSearch(searchValue)}
          className="flex items-center justify-center w-[36px] h-[36px] bg-[#9B1E1C] rounded-[30px] hover:bg-[#860202] transition-colors focus:outline-none focus:ring-2 focus:ring-[#9B1E1C] focus:ring-offset-2"
          aria-label={searchValue ? "Очистить поиск" : "Выполнить поиск"}
          type="button"
        >
          {searchValue ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19.25 19.25L15.5 15.5M17.4167 10.0833C17.4167 14.1334 14.1334 17.4167 10.0833 17.4167C6.03325 17.4167 2.75 14.1334 2.75 10.0833C2.75 6.03325 6.03325 2.75 10.0833 2.75C14.1334 2.75 17.4167 6.03325 17.4167 10.0833Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Выпадающее меню */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-results"
          className={`absolute top-full mt-[10px] bg-white rounded-[20px] shadow-[0px_2px_10px_0px_rgba(165,165,165,0.2)] z-[100] ${
            isMobile 
              ? "left-1/2 transform -translate-x-1/2 w-[calc(100vw-32px)] max-w-[520px]" 
              : "right-0 w-[520px]"
          }`}
          role="listbox"
          aria-label="Результаты поиска"
        >
          {!searchValue ? (
            // Популярные и недавние запросы
            <div className="p-[20px] flex flex-col gap-[20px]">
              {/* Популярные запросы */}
              <div className="flex flex-col gap-[10px]">
                <h3 className="text-[#101010] text-[18px] font-medium leading-[1.2] tracking-[-0.4px]">
                  Популярные запросы
                </h3>
                <div className="flex flex-col gap-[10px]" role="group" aria-label="Популярные запросы">
                  {popularQueries.map((query, index) => (
                    <button
                      key={`popular-${index}`}
                      onClick={() => handleQueryClick(query)}
                      className={`flex items-center gap-[4px] text-left hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#9B1E1C] focus:ring-offset-2 rounded ${
                        selectedIndex === index ? 'bg-[#F1F0EE]' : ''
                      }`}
                      role="option"
                      aria-selected={selectedIndex === index}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M15 15L11.5355 11.5355M11.5355 11.5355C12.4404 10.6307 13 9.38071 13 8C13 5.23858 10.7614 3 8 3C5.23858 3 3 5.23858 3 8C3 10.7614 5.23858 13 8 13C9.38071 13 10.6307 12.4404 11.5355 11.5355Z" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[#4D4D4D] text-[17px] leading-[1.2]">{sanitizeString(query)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Недавние запросы */}
              {recentQueries.length > 0 && (
                <div className="flex flex-col gap-[10px]">
                  <h3 className="text-[#101010] text-[18px] font-medium leading-[1.2] tracking-[-0.4px]">
                    Недавние запросы
                  </h3>
                  <div className="flex flex-col gap-[10px]" role="group" aria-label="Недавние запросы">
                    {recentQueries.map((query, index) => {
                      const globalIndex = popularQueries.length + index;
                      return (
                        <div
                          key={`recent-${index}`}
                          className={`flex items-center justify-between gap-[4px] ${
                            selectedIndex === globalIndex ? 'bg-[#F1F0EE]' : ''
                          }`}
                        >
                          <button
                            onClick={() => handleQueryClick(query)}
                            className="flex items-center gap-[4px] text-left hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#9B1E1C] focus:ring-offset-2 rounded flex-1"
                            role="option"
                            aria-selected={selectedIndex === globalIndex}
                          >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path d="M8.99848 15.9996C5.13331 15.9996 2 12.8657 2 8.99979C2 5.13391 5.13334 2 8.9985 2C12.1322 2 14.7553 4.05996 15.6471 6.89985H13.8974" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 6.20312V9.00304L10.3997 10.403" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M15.9691 9.69998C15.9899 9.46959 16.0005 9.2361 16.0005 9M11.1016 15.9998C11.3406 15.9211 11.5742 15.8293 11.8014 15.7252M15.1541 12.4999C15.2891 12.2398 15.4095 11.9702 15.5141 11.6923M13.3358 14.7603C13.5769 14.5607 13.8052 14.3449 14.0191 14.1144" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-[#4D4D4D] text-[17px] leading-[1.2]">{sanitizeString(query)}</span>
                          </button>
                          <button
                            onClick={(e) => handleRemoveRecentQuery(e, query)}
                            className="p-1 hover:bg-[#F1F0EE] rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#9B1E1C]"
                            aria-label={`Удалить запрос "${query}"`}
                            type="button"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : isLoading ? (
            // Индикатор загрузки
            <div className="p-[20px] h-[240px] flex items-center justify-center">
              <div className="flex flex-col gap-[12px] items-center">
                <div className="w-8 h-8 border-4 border-[#9B1E1C] border-t-transparent rounded-full animate-spin" aria-label="Загрузка результатов поиска" role="status"></div>
                <p className="text-[#4D4D4D] text-[16px]">Поиск...</p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            // Результаты поиска
            <div className="max-h-[500px] overflow-y-auto" ref={resultsRef}>
              <div className="flex items-start justify-between gap-[20px] px-[8px] pt-[8px]">
                <div className="flex flex-col gap-[16px] flex-1">
                  <p className="text-[#888888] text-[16px] leading-[1.2] px-[12px]">
                    {searchResults.length} {searchResults.length === 1 ? "результат" : searchResults.length < 5 ? "результата" : "результатов"}
                  </p>
                  <div className="flex flex-col" role="list">
                    {searchResults.map((product, index) => {
                      const productName = product.name || product.title || 'Товар';
                      const productPrice = product.price || product.price_per_meter || '0';
                      const productOldPrice = product.oldPrice || null;
                      const imageData = product.images?.[0] || product.img || product.image;
                      const placeholderUrl = '/placeholder-product.svg';
                      const productImage = imageData ? buildImageUrl(imageData, placeholderUrl) : placeholderUrl;
                      
                      return (
                        <div
                          key={product.id || index}
                          id={`search-result-${index}`}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Предотвращаем blur на input
                            handleResultClick(product);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleResultClick(product);
                          }}
                          className={`flex gap-[12px] items-center px-[8px] py-[8px] rounded-[12px] cursor-pointer hover:bg-[#F1F0EE] transition-colors ${
                            selectedIndex === index ? 'bg-[#F1F0EE]' : ''
                          }`}
                          role="option"
                          aria-selected={selectedIndex === index}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleResultClick(product);
                            }
                          }}
                        >
                          <div className="w-[80px] h-[100px] rounded-[10px] overflow-hidden flex-shrink-0 bg-[#F1F0EE]">
                            <img
                              src={productImage}
                              alt={sanitizeString(productName)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                if (e.target.src !== placeholderUrl) {
                                  e.target.src = placeholderUrl;
                                }
                              }}
                            />
                          </div>
                          <div className="flex flex-col justify-between h-[100px] flex-1">
                            <p className="text-[#101010] text-[16px] font-semibold leading-[1.2]">
                              {sanitizeString(productName)}
                            </p>
                            <div className="flex items-center gap-[10px]">
                              <span className="text-[#101010] text-[16px] font-semibold leading-[1.2]">
                                {productPrice} ₽
                              </span>
                              {productOldPrice && (
                                <span className="text-[#888888] text-[14px] line-through">
                                  {productOldPrice} ₽
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Скроллбар */}
                {!isMobile && searchResults.length > 4 && (
                  <div className="flex-shrink-0">
                    <div className="w-[7px] h-[460px] bg-[#F1F0EE] rounded-[10px] relative">
                      <div
                        className="absolute top-[2px] left-[2px] w-[3px] bg-[#C2C2C2] rounded-[10px] transition-all"
                        style={{ height: `${scrollbarHeight}px` }}
                        aria-hidden="true"
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="pb-[8px]"></div>
            </div>
          ) : (
            // Нет результатов
            <div className="p-[20px] h-[240px] flex items-center justify-center">
              <div className="flex flex-col gap-[12px] items-center w-[276px]">
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M51.042 51.041L64.167 64.166" stroke="#F1F0EE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M58.333 32.083C58.333 17.5855 46.5805 5.83301 32.083 5.83301C17.5855 5.83301 5.83301 17.5855 5.83301 32.083C5.83301 46.5805 17.5855 58.333 32.083 58.333C46.5805 58.333 58.333 46.5805 58.333 32.083Z" stroke="#F1F0EE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21.875 32.083H42.2917" stroke="#F1F0EE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-[#4D4D4D] text-[20px] font-normal leading-[24px] tracking-[-0.48px] text-center whitespace-pre-wrap">
                  К сожалению, по вашему запросу ничего не найдено.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
