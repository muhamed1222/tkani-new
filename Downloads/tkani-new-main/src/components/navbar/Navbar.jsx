import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useRef, useContext } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import { Context } from "../../main";
import { observer } from "mobx-react-lite";
import { ACCOUNT_ROUTE, LOGIN_ROUTE, SHOP_ROUTE, ABOUTUS_ROUTE, BASKET_ROUTE} from "../../utils/consts";
import { Typebar } from "../typebar/Typebar";
import { SearchInput } from "../search/SearchInput";

export const NavBar = observer(() => {
    const {user, tkans} = useContext(Context)
    const location = useLocation();
    
    const {brands} = useContext(Context)
    const [isOpen, setIsOpen] = useState(false); // Каталог
    const [mobileNav, setMobileNav] = useState(false); // Мобильное меню
    const [showSearch, setShowSearch] = useState(false); // Мобильный поиск
    const timeoutRef = useRef(null);
  
    const handleMouseEnter = () => {
      if (window.innerWidth >= 1024) { // Только для десктопа
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
      }
    };
  
    const handleMouseLeave = () => {
      if (window.innerWidth >= 1024) { // Только для десктопа
        timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
      }
    };

    const handleCatalogClick = () => {
      if (window.innerWidth < 1024) { // Только для мобильных и планшетов
        setIsOpen(!isOpen);
      }
    };

    // Функция для получения URL аватара
    const getAvatarUrl = () => {
      if (!user.user) {
        return "https://i.pravatar.cc/100";
      }

      // Strapi v4 формат: avatar как объект с data
      if (user.user.avatar) {
        if (user.user.avatar.data && user.user.avatar.data.attributes) {
          return `http://localhost:1339${user.user.avatar.data.attributes.url}`;
        }
        if (user.user.avatar.url) {
          return `http://localhost:1339${user.user.avatar.url}`;
        }
        if (typeof user.user.avatar === 'number') {
          return `http://localhost:1339/api/upload/files/${user.user.avatar}`;
        }
        if (Array.isArray(user.user.avatar) && user.user.avatar.length > 0) {
          const avatarData = user.user.avatar[0];
          if (avatarData.url) {
            return `http://localhost:1339${avatarData.url}`;
          }
        }
      }
      
      if (user.user.avatarUrl) {
        return user.user.avatarUrl;
      }
      
      return "https://i.pravatar.cc/100";
    };

    // Обработка клика на якорные ссылки AboutUs
    const handleAboutUsLinkClick = (e, hash) => {
      if (location.pathname === ABOUTUS_ROUTE) {
        e.preventDefault();
        window.location.hash = hash;
        window.dispatchEvent(new CustomEvent('scrollToHash', { detail: { hash: hash.replace('#', '') } }));
        return false;
      }
      return true;
    };

    // Обработчик поиска
    const handleSearch = (query) => {
      console.log("Search query:", query);
    };

    // Закрытие поиска
    const handleCloseSearch = () => {
      setShowSearch(false);
    };

  return (
    <header className="w-full bg-[#F1F0EE] text-dark font-inter sticky top-0 z-50 shadow-sm">
      {/* Верхняя панель (desktop only) */}
      <section className="hidden md:flex items-center py-[5px] text-sm bg-[#F1F0EE] border-b border-[#e4e2de] relative">
        <div className="max-w-[1440px] w-full mx-auto flex items-center relative px-[20px] md:px-[50px]">
          <a href="#" className="text-[#888888] text-[14px] font-medium hover:text-accentDark transition-colors">
            Мы на WB
          </a>

          <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-4 whitespace-nowrap">
            <NavLink to={ABOUTUS_ROUTE} className="text-[#888888] text-[14px] font-medium hover:text-accentDark transition-colors py-[5px] whitespace-nowrap">
              О нас
            </NavLink>
            <Link 
              to={`${ABOUTUS_ROUTE}#pay`} 
              onClick={(e) => handleAboutUsLinkClick(e, '#pay')}
              className="text-[#888888] text-[14px] font-medium hover:text-accentDark transition-colors py-[5px] whitespace-nowrap"
            >
              Оплата и доставка
            </Link>
            <Link 
              to={`${ABOUTUS_ROUTE}#questions`} 
              onClick={(e) => handleAboutUsLinkClick(e, '#questions')}
              className="text-[#888888] text-[14px] font-medium hover:text-accentDark transition-colors py-[5px] whitespace-nowrap"
            >
              Часто задаваемые вопросы
            </Link>
            <Link 
              to={`${ABOUTUS_ROUTE}#contacts`} 
              onClick={(e) => handleAboutUsLinkClick(e, '#contacts')}
              className="text-[#888888] text-[14px] font-medium hover:text-accentDark transition-colors py-[5px] whitespace-nowrap"
            >
              Контакты
            </Link>
          </nav>

          <a href="#" className="ml-auto text-[#888888] text-[14px] font-medium hover:text-accentDark transition-colors">
            Мы на OZON
          </a>
        </div>
      </section>

      {/* Основная панель навигации */}
      <section className="flex items-center h-[80px] bg-[#F1F0EE] relative">
        <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between px-[20px] md:px-[50px]">
          {/* Левая часть - Навигация */}
          <div className="flex items-center gap-[10px]">
            {/* Кнопка Каталог */}
            <div className="relative inline-block">
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleCatalogClick}
                className="flex items-center gap-[6px] px-[12px] py-[8px] bg-[#9B1E1C] text-white rounded-[8px] text-[16px] font-medium leading-[1.2] hover:bg-[rgba(36,26,11,0.05)] hover:text-black transition-colors whitespace-nowrap group"
              >
                Каталог
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="transform group-hover:rotate-90 transition-transform group-hover:stroke-black"
                >
                  <path 
                    d="M5 3L9 7L5 11" 
                    stroke="white" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="group-hover:stroke-black transition-colors"
                  />
                </svg>
              </button>

              {isOpen && (
                <div
                  className="absolute left-0 mt-2 transition-all duration-300 ease-in-out z-50 animate-fadeIn"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Typebar/>
                </div>
              )}
            </div>

            {/* Работы из наших тканей */}
            <Link 
              to="/our_works" 
              className="hidden md:flex items-center px-[10px] py-[8px] text-[#101010] text-[16px] font-medium leading-[1.2] rounded-[8px] transition-colors whitespace-nowrap hover:bg-white"
            >
              Работы из наших тканей
            </Link>

            {/* Скидки и акции */}
            <Link 
              to="/discounts" 
              className="hidden md:flex items-center px-[10px] py-[8px] text-[#101010] text-[16px] font-medium leading-[1.2] rounded-[8px] transition-colors whitespace-nowrap hover:bg-white"
            >
              Скидки и акции
            </Link>
          </div>

          {/* Центр — Логотип */}
          <NavLink to={SHOP_ROUTE} className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-[7px]">
              <div className="flex items-center justify-center w-[42px] h-[42px] bg-[#F1F0EE] rounded-[10px]">
                <img src="/Logo Icon.svg" alt="Логотип" className="w-[36px] h-[16px]" />
              </div>
              <img
                src="/CENTER TKANI.svg"
                alt="CENTER TKANI"
                className="h-[10px] w-[120px]"
              />
            </div>
          </NavLink>

          {/* Правая часть - Поиск и иконки */}
          <div className="flex items-center gap-[16px]">
            {/* Поиск — desktop */}
            <div className="hidden md:flex">
              <SearchInput 
                placeholder="Поиск по сайту"
                products={tkans?.tkans || []}
                onSearch={handleSearch}
              />
            </div>

            {/* Иконка поиска — мобильная */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`md:hidden transition-colors ${
                showSearch ? "text-accent" : "text-[#101010]"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Корзина */}
            <NavLink to={BASKET_ROUTE} className="group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.49951 6V6.75H5.51238C4.55284 6.75 3.74813 7.47444 3.64768 8.42872L2.38453 20.4287C2.26799 21.5358 3.13603 22.5 4.24922 22.5H19.75C20.8631 22.5 21.7312 21.5358 21.6147 20.4287L20.3515 8.42872C20.251 7.47444 19.4463 6.75 18.4868 6.75H16.4995V6C16.4995 3.51472 14.4848 1.5 11.9995 1.5C9.51423 1.5 7.49951 3.51472 7.49951 6ZM11.9995 3C10.3427 3 8.99951 4.34315 8.99951 6V6.75H14.9995V6C14.9995 4.34315 13.6564 3 11.9995 3ZM8.99951 11.25C8.99951 12.9069 10.3427 14.25 11.9995 14.25C13.6564 14.25 14.9995 12.9069 14.9995 11.25V10.5C14.9995 10.0858 15.3353 9.75 15.7495 9.75C16.1637 9.75 16.4995 10.0858 16.4995 10.5V11.25C16.4995 13.7353 14.4848 15.75 11.9995 15.75C9.51423 15.75 7.49951 13.7353 7.49951 11.25V10.5C7.49951 10.0858 7.8353 9.75 8.24951 9.75C8.66373 9.75 8.99951 10.0858 8.99951 10.5V11.25Z" fill="#101010" className="group-hover:fill-[#9B1E1C] transition-colors"/>
              </svg>
            </NavLink>

            {/* Профиль / Аватар */}
            {user.isAuth ? 
              <NavLink to={ACCOUNT_ROUTE} className="hidden md:block">
                <Avatar.Root className="inline-flex h-6 w-6 select-none items-center justify-center overflow-hidden rounded-full bg-gray-200 align-middle cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                  <Avatar.Image
                    className="h-full w-full object-cover"
                    src={getAvatarUrl()}
                    alt="User avatar"
                    onError={(e) => {
                      e.target.src = "https://i.pravatar.cc/100";
                    }}
                  />
                  <Avatar.Fallback
                    className="text-gray-700 text-sm font-medium"
                    delayMs={600}
                  >
                    {user.user?.firstName?.[0] || user.user?.email?.[0] || "U"}
                  </Avatar.Fallback>
                </Avatar.Root>
              </NavLink>
              :
              <Link to={LOGIN_ROUTE} className="hidden md:block group">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.49984 6C7.49984 3.51472 9.51456 1.5 11.9998 1.5C14.4851 1.5 16.4998 3.51472 16.4998 6C16.4998 8.48528 14.4851 10.5 11.9998 10.5C9.51456 10.5 7.49984 8.48528 7.49984 6Z" fill="#101010" className="group-hover:fill-[#9B1E1C] transition-colors"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.75109 20.1053C3.82843 15.6156 7.49183 12 11.9998 12C16.508 12 20.1714 15.6157 20.2486 20.1056C20.2537 20.4034 20.0822 20.676 19.8115 20.8002C17.4326 21.8918 14.7864 22.5 12.0002 22.5C9.2137 22.5 6.56728 21.8917 4.18816 20.7999C3.91749 20.6757 3.74596 20.4031 3.75109 20.1053Z" fill="#101010" className="group-hover:fill-[#9B1E1C] transition-colors"/>
                </svg>
              </Link>
            }

            {/* Бургер меню — мобильная версия */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#101010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="#101010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ====== Поиск под хедером (mobile & tablet) - появляется только после клика на лупу ====== */}
      {showSearch && (
        <div
          className="md:hidden bg-[#F1F0EE] border-b border-dark/10 py-3 overflow-visible"
          style={{ zIndex: 60 }}
        >
          <div className="flex flex-col px-4 relative">
            {/* Заголовок и кнопка закрытия */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#101010] text-[18px] font-medium">Поиск</h3>
              <button 
                onClick={handleCloseSearch}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#101010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {/* Поле поиска */}
            <div className="relative z-[70]">
              <SearchInput 
                placeholder="Поиск по сайту"
                products={tkans?.tkans || []}
                onSearch={(query) => {
                  handleSearch(query);
                  // Можно автоматически закрыть поиск после выбора результата
                  // handleCloseSearch();
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ====== Мобильное меню (полноэкранное) ====== */}
      <div
        className={`fixed inset-0 bg-[#F1F0EE] z-40 transform transition-transform duration-300 ${
          mobileNav ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Шапка мобильного меню */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#e4e2de]">
          {/* Логотип по центру */}
          <NavLink 
            to={SHOP_ROUTE} 
            onClick={() => setMobileNav(false)}
            className="flex items-center gap-2"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-[#F1F0EE] rounded-lg">
              <img src="/Logo Icon.svg" alt="Логотип" className="w-6 h-3" />
            </div>
            <img
              src="/CENTER TKANI.svg"
              alt="CENTER TKANI"
              className="h-3 w-20"
            />
          </NavLink>

          {/* Правая часть - поиск, корзина и крестик */}
          <div className="flex items-center gap-3">
            {/* Поиск */}
            <button
              onClick={() => {
                setShowSearch(true);
                setMobileNav(false);
              }}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#101010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Корзина */}
            <NavLink 
              to={BASKET_ROUTE} 
              onClick={() => setMobileNav(false)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.49951 6V6.75H5.51238C4.55284 6.75 3.74813 7.47444 3.64768 8.42872L2.38453 20.4287C2.26799 21.5358 3.13603 22.5 4.24922 22.5H19.75C20.8631 22.5 21.7312 21.5358 21.6147 20.4287L20.3515 8.42872C20.251 7.47444 19.4463 6.75 18.4868 6.75H16.4995V6C16.4995 3.51472 14.4848 1.5 11.9995 1.5C9.51423 1.5 7.49951 3.51472 7.49951 6ZM11.9995 3C10.3427 3 8.99951 4.34315 8.99951 6V6.75H14.9995V6C14.9995 4.34315 13.6564 3 11.9995 3ZM8.99951 11.25C8.99951 12.9069 10.3427 14.25 11.9995 14.25C13.6564 14.25 14.9995 12.9069 14.9995 11.25V10.5C14.9995 10.0858 15.3353 9.75 15.7495 9.75C16.1637 9.75 16.4995 10.0858 16.4995 10.5V11.25C16.4995 13.7353 14.4848 15.75 11.9995 15.75C9.51423 15.75 7.49951 13.7353 7.49951 11.25V10.5C7.49951 10.0858 7.8353 9.75 8.24951 9.75C8.66373 9.75 8.99951 10.0858 8.99951 10.5V11.25Z" fill="#101010"/>
              </svg>
            </NavLink>

            {/* Крестик справа */}
            <button 
              onClick={() => setMobileNav(false)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#101010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Основное содержимое меню */}
        <div className="px-6 py-6 h-[calc(100vh-80px)] overflow-y-auto">
          {/* Кнопка Каталог сверху с выпадающим списком */}
          <div className="mb-6">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between px-4 py-3 bg-[#9B1E1C] text-white rounded-lg text-[16px] font-medium leading-[1.2] hover:bg-[#860202] transition-colors w-full"
            >
              <span>Каталог</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
              >
                <path 
                  d="M5 3L9 7L5 11" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Выпадающий список категорий */}
            {isOpen && (
              <div className="mt-2 bg-white rounded-lg border border-[#e4e2de] shadow-lg max-h-60 overflow-y-auto">
                <Typebar onItemClick={() => {
                  setIsOpen(false);
                  setMobileNav(false);
                }} />
              </div>
            )}
          </div>

          {/* Кнопки под каталогом и над "О нас" */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Работы из наших тканей */}
            <Link 
              to="/our_works" 
              onClick={() => setMobileNav(false)}
              className="hover:text-[#9B1E1C] transition-colors"
              style={{ 
                display: 'flex',
                padding: '6px 0',
                alignItems: 'flex-start',
                fontFamily: 'Inter', 
                fontSize: '16px', 
                fontStyle: 'normal', 
                fontWeight: '500', 
                lineHeight: '120%',
                color: '#101010'
              }}
            >
              Работы из наших тканей
            </Link>
            
            {/* Скидки и акции */}
            <Link 
              to="/discounts" 
              onClick={() => setMobileNav(false)}
              className="hover:text-[#9B1E1C] transition-colors"
              style={{ 
                display: 'flex',
                padding: '6px 0',
                alignItems: 'flex-start',
                fontFamily: 'Inter', 
                fontSize: '16px', 
                fontStyle: 'normal', 
                fontWeight: '500', 
                lineHeight: '120%',
                color: '#101010'
              }}
            >
              Скидки и акции
            </Link>
            
            {/* Разделительная полоска под скидками и акциями */}
            <div 
              style={{ 
                height: '1px',
                alignSelf: 'stretch',
                backgroundColor: '#e4e2de'
              }}
            />
          </div>

          {/* Навигационные ссылки */}
          <nav className="space-y-6 mb-8">
            <NavLink 
              to={ABOUTUS_ROUTE} 
              onClick={() => setMobileNav(false)}
              className="block text-[18px] font-medium text-[#888] hover:text-[#9B1E1C] transition-colors"
            >
              О нас
            </NavLink>
            
            <Link 
              to={`${ABOUTUS_ROUTE}#pay`} 
              onClick={(e) => {
                handleAboutUsLinkClick(e, '#pay');
                setMobileNav(false);
              }}
              className="block text-[18px] font-medium text-[#888] hover:text-[#9B1E1C] transition-colors"
            >
              Оплата и доставка
            </Link>
            
            <Link 
              to={`${ABOUTUS_ROUTE}#questions`} 
              onClick={(e) => {
                handleAboutUsLinkClick(e, '#questions');
                setMobileNav(false);
              }}
              className="block text-[18px] font-medium text-[#888] hover:text-[#9B1E1C] transition-colors"
            >
              Часто задаваемые вопросы
            </Link>

            <Link 
              to={`${ABOUTUS_ROUTE}#contacts`} 
              onClick={(e) => {
                handleAboutUsLinkClick(e, '#contacts');
                setMobileNav(false);
              }}
              className="block text-[18px] font-medium text-[#888] hover:text-[#9B1E1C] transition-colors"
            >
              Контакты
            </Link>
          </nav>

          {/* Маркетплейсы и аватарка - на одной строке */}
          <div className="border-t border-[#e4e2de] pt-6 mt-auto">
            <div className="flex justify-between items-center">
              {/* Аватарка - прижата к левому краю */}
              <div>
                {user.isAuth ? (
                  <NavLink 
                    to={ACCOUNT_ROUTE} 
                    onClick={() => setMobileNav(false)}
                    className="p-2 hover:bg-white rounded-lg transition-colors inline-block"
                  >
                    <Avatar.Root className="inline-flex h-10 w-10 select-none items-center justify-center overflow-hidden rounded-full bg-gray-200 align-middle">
                      <Avatar.Image
                        className="h-full w-full object-cover"
                        src={getAvatarUrl()}
                        alt="User avatar"
                        onError={(e) => {
                          e.target.src = "https://i.pravatar.cc/100";
                        }}
                      />
                      <Avatar.Fallback
                        className="text-gray-700 text-sm font-medium"
                        delayMs={600}
                      >
                        {user.user?.firstName?.[0] || user.user?.email?.[0] || "U"}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </NavLink>
                ) : (
                  <Link 
                    to={LOGIN_ROUTE} 
                    onClick={() => setMobileNav(false)}
                    className="p-2 hover:bg-white rounded-lg transition-colors inline-block"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.49984 6C7.49984 3.51472 9.51456 1.5 11.9998 1.5C14.4851 1.5 16.4998 3.51472 16.4998 6C16.4998 8.48528 14.4851 10.5 11.9998 10.5C9.51456 10.5 7.49984 8.48528 7.49984 6Z" fill="#101010"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.75109 20.1053C3.82843 15.6156 7.49183 12 11.9998 12C16.508 12 20.1714 15.6157 20.2486 20.1056C20.2537 20.4034 20.0822 20.676 19.8115 20.8002C17.4326 21.8918 14.7864 22.5 12.0002 22.5C9.2137 22.5 6.56728 21.8917 4.18816 20.7999C3.91749 20.6757 3.74596 20.4031 3.75109 20.1053Z" fill="#101010"/>
                      </svg>
                    </div>
                  </Link>
                )}
              </div>

              {/* Маркетплейсы - прижаты к правому краю */}
              <div className="text-right space-y-2">
                <a 
                  href="#" 
                  className="block text-[16px] font-medium text-[#888] hover:text-[#9B1E1C] transition-colors"
                >
                  Мы на WB
                </a>
                
                <a 
                  href="#" 
                  className="block text-[16px] font-medium text-[#888] hover:text-[#9B1E1C] transition-colors"
                >
                  Мы на OZON
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});