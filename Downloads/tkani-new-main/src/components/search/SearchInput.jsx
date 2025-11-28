import { useState, useEffect, useRef } from "react";

export const SearchInput = ({ placeholder = "Поиск по сайту", onSearch, className = "", products = [] }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Популярные запросы
  const popularQueries = ["Нитки", "Ткань", "Иглы швейные", "Атласная ткань"];
  
  // Недавние запросы
  const [recentQueries, setRecentQueries] = useState(() => {
    const saved = localStorage.getItem("recentQueries");
    return saved ? JSON.parse(saved) : ["Ткань для штор", "Натуральные материалы"];
  });

  // Результаты поиска
  const searchResults = searchValue
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

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
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (isSearchFocused) {
      setShowDropdown(true);
    }
  }, [isSearchFocused]);

  const handleClear = () => {
    setSearchValue("");
    setShowDropdown(false);
    if (onSearch) onSearch("");
  };

  const handleSearch = (query) => {
    if (onSearch) onSearch(query);
    if (query && !recentQueries.includes(query)) {
      const updated = [query, ...recentQueries.slice(0, 4)];
      setRecentQueries(updated);
      localStorage.setItem("recentQueries", JSON.stringify(updated));
    }
    setShowDropdown(false);
  };

  const handleQueryClick = (query) => {
    setSearchValue(query);
    handleSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchValue);
    }
  };

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    setShowDropdown(true);
  };

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
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleInputChange}
            onFocus={() => {
              setIsSearchFocused(true);
              setShowDropdown(true);
            }}
            onKeyPress={handleKeyPress}
            className={`flex-1 bg-transparent border-none outline-none text-[16px] text-[#101010] placeholder-[#888888] leading-[1.2] ${
              searchValue ? "pl-[4px] caret-[#9B1E1C]" : ""
            }`}
          />
        </div>
        <button 
          onClick={searchValue ? handleClear : () => handleSearch(searchValue)}
          className="flex items-center justify-center w-[36px] h-[36px] bg-[#9B1E1C] rounded-[30px] hover:bg-[#860202] transition-colors"
        >
          {searchValue ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.25 19.25L15.5 15.5M17.4167 10.0833C17.4167 14.1334 14.1334 17.4167 10.0833 17.4167C6.03325 17.4167 2.75 14.1334 2.75 10.0833C2.75 6.03325 6.03325 2.75 10.0833 2.75C14.1334 2.75 17.4167 6.03325 17.4167 10.0833Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Выпадающее меню */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute top-full mt-[10px] bg-white rounded-[20px] shadow-[0px_2px_10px_0px_rgba(165,165,165,0.2)] z-[100] ${
            isMobile 
              ? "left-1/2 transform -translate-x-1/2 w-[calc(100vw-32px)]" 
              : "right-0 w-[520px]"
          }`}
        >
          {!searchValue ? (
            // Популярные и недавние запросы
            <div className="p-[20px] flex flex-col gap-[20px]">
              {/* Популярные запросы */}
              <div className="flex flex-col gap-[10px]">
                <h3 className="text-[#101010] text-[18px] font-medium leading-[1.2] tracking-[-0.4px]">
                  Популярные запросы
                </h3>
                <div className="flex flex-col gap-[10px]">
                  {popularQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleQueryClick(query)}
                      className="flex items-center gap-[4px] text-left hover:opacity-70 transition-opacity"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 15L11.5355 11.5355M11.5355 11.5355C12.4404 10.6307 13 9.38071 13 8C13 5.23858 10.7614 3 8 3C5.23858 3 3 5.23858 3 8C3 10.7614 5.23858 13 8 13C9.38071 13 10.6307 12.4404 11.5355 11.5355Z" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[#4D4D4D] text-[17px] leading-[1.2]">{query}</span>
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
                  <div className="flex flex-col gap-[10px]">
                    {recentQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleQueryClick(query)}
                        className="flex items-center gap-[4px] text-left hover:opacity-70 transition-opacity"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.99848 15.9996C5.13331 15.9996 2 12.8657 2 8.99979C2 5.13391 5.13334 2 8.9985 2C12.1322 2 14.7553 4.05996 15.6471 6.89985H13.8974" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 6.20312V9.00304L10.3997 10.403" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15.9691 9.69998C15.9899 9.46959 16.0005 9.2361 16.0005 9M11.1016 15.9998C11.3406 15.9211 11.5742 15.8293 11.8014 15.7252M15.1541 12.4999C15.2891 12.2398 15.4095 11.9702 15.5141 11.6923M13.3358 14.7603C13.5769 14.5607 13.8052 14.3449 14.0191 14.1144" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[#4D4D4D] text-[17px] leading-[1.2]">{query}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : searchResults.length > 0 ? (
            // Результаты поиска
            <div className="p-[20px] max-h-[500px] overflow-y-auto">
              <div className="flex items-start justify-between gap-[20px]">
                <div className="flex flex-col gap-[16px] flex-1">
                  <p className="text-[#888888] text-[16px] leading-[1.2]">
                    {searchResults.length} {searchResults.length === 1 ? "результат" : searchResults.length < 5 ? "результата" : "результатов"}
                  </p>
                  <div className="flex flex-col">
                    {searchResults.map((product, index) => (
                      <div
                        key={product.id || index}
                        className="flex gap-[12px] items-center py-[14px] border-b border-[#F1F0EE] last:border-b-0"
                      >
                        <div className="w-[80px] h-[100px] rounded-[10px] overflow-hidden flex-shrink-0">
                          <img
                            src={product.img || "/placeholder.jpg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-between h-[100px] flex-1">
                          <p className="text-[#101010] text-[16px] font-semibold leading-[1.2]">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-[10px]">
                            <span className="text-[#101010] text-[16px] font-semibold leading-[1.2]">
                              {product.price} ₽
                            </span>
                            {product.oldPrice && (
                              <span className="text-[#888888] text-[14px] line-through">
                                {product.oldPrice} ₽
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Скроллбар */}
                {!isMobile && (
                  <div className="flex-shrink-0">
                    <div className="w-[7px] h-[460px] bg-[#F1F0EE] rounded-[10px] relative">
                      <div
                        className="absolute top-[2px] left-[2px] w-[3px] bg-[#C2C2C2] rounded-[10px]"
                        style={{ height: `${(460 / searchResults.length) * Math.min(searchResults.length, 4)}px` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Нет результатов
            <div className="p-[20px] h-[240px] flex items-center justify-center">
              <div className="flex flex-col gap-[12px] items-center w-[276px]">
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M51.042 51.041L64.167 64.166" stroke="#F1F0EE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M58.333 32.083C58.333 17.5855 46.5805 5.83301 32.083 5.83301C17.5855 5.83301 5.83301 17.5855 5.83301 32.083C5.83301 46.5805 17.5855 58.333 32.083 58.333C46.5805 58.333 58.333 46.5805 58.333 32.083Z" stroke="#F1F0EE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21.875 32.083H42.2917" stroke="#F1F0EE" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-[#4D4D4D] text-[20px] font-normal leading-[24px] tracking-[-0.48px] text-center whitespace-pre-wrap" style={{ fontFamily: 'Inter' }}>
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