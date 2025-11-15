import { useState } from "react";
import styles from "./UIKit.module.css";
import * as Avatar from "@radix-ui/react-avatar";
import { Card } from "@radix-ui/themes";
import { OrderCard } from "../../components/orderCard/OrderCard";

export const UIKit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [isTextInputHovered, setIsTextInputHovered] = useState(false);
  const [textInputError, setTextInputError] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isEmailHovered, setIsEmailHovered] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);
  const [textareaValue, setTextareaValue] = useState("");
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isTextareaHovered, setIsTextareaHovered] = useState(false);
  const [radioSelected, setRadioSelected] = useState("option1");
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [paginationPage, setPaginationPage] = useState(1);
  const [productQuantity, setProductQuantity] = useState(1.0);
  
  // Цена за метр
  const pricePerMeter = 800;
  
  // Итоговая цена (с учетом скидки от 5 метров - 50%)
  const quantity = typeof productQuantity === 'number' ? productQuantity : 0.5;
  const totalPrice = quantity >= 5 
    ? (pricePerMeter * quantity * 0.5).toFixed(2)
    : (pricePerMeter * quantity).toFixed(2);
  
  const handleDecrease = () => {
    const currentValue = typeof productQuantity === 'number' ? productQuantity : 0.5;
    if (currentValue > 0.5) {
      const newValue = Math.max(0.5, currentValue - 0.1);
      setProductQuantity(Math.round(newValue * 10) / 10);
    }
  };
  
  const handleIncrease = () => {
    const currentValue = typeof productQuantity === 'number' ? productQuantity : 0.5;
    const newValue = currentValue + 0.1;
    setProductQuantity(Math.round(newValue * 10) / 10);
  };

  return (
    <div className="min-h-screen bg-[#F1F0EE] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок страницы */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-accentDark mb-4">UI Kit</h1>
          <p className="text-lg text-dark/70">
            Библиотека компонентов дизайн-системы "Центр Ткани"
          </p>
        </div>

        {/* Цветовая палитра */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Цветовая палитра</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Бордовый */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#9B1E1C] rounded-lg"></div>
              <div>
                <p className="font-semibold text-[#101010]">Бордовый</p>
                <p className="text-sm text-[#888888]">#9B1E1C</p>
              </div>
            </div>

            {/* Бордовый при наведении */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#860202] rounded-lg"></div>
              <div>
                <p className="font-semibold text-[#101010]">Бордовый при наведении</p>
                <p className="text-sm text-[#888888]">#860202</p>
              </div>
            </div>

            {/* Черный */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#101010] rounded-lg"></div>
              <div>
                <p className="font-semibold text-[#101010]">Черный</p>
                <p className="text-sm text-[#888888]">#101010</p>
              </div>
            </div>

            {/* Темно серый */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#4D4D4D] rounded-lg"></div>
              <div>
                <p className="font-semibold text-[#101010]">Темно серый</p>
                <p className="text-sm text-[#888888]">#4D4D4D</p>
              </div>
            </div>

            {/* Серый */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#888888] rounded-lg"></div>
              <div>
                <p className="font-semibold text-[#101010]">Серый</p>
                <p className="text-sm text-[#888888]">#888888</p>
              </div>
            </div>

            {/* Светло серый */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#C2C2C2] rounded-lg border border-[#E4E2DF]"></div>
              <div>
                <p className="font-semibold text-[#101010]">Светло серый</p>
                <p className="text-sm text-[#888888]">#C2C2C2</p>
              </div>
            </div>

            {/* Бежевый */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#E4E2DF] rounded-lg border border-[#C2C2C2]"></div>
              <div>
                <p className="font-semibold text-[#101010]">Бежевый</p>
                <p className="text-sm text-[#888888]">#E4E2DF</p>
              </div>
            </div>

            {/* Бежевый (фон) */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#F1F0EE] rounded-lg border border-[#E4E2DF]"></div>
              <div>
                <p className="font-semibold text-[#101010]">Бежевый (фон)</p>
                <p className="text-sm text-[#888888]">#F1F0EE</p>
              </div>
            </div>

            {/* Белый */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#FFFFFF] rounded-lg border border-[#E4E2DF]"></div>
              <div>
                <p className="font-semibold text-[#101010]">Белый</p>
                <p className="text-sm text-[#888888]">#FFFFFF</p>
              </div>
            </div>

            {/* Light (дополнительный) */}
            <div className="space-y-3">
              <div className="w-full h-[100px] bg-[#FAF5F0] rounded-lg border border-[#E4E2DF]"></div>
              <div>
                <p className="font-semibold text-[#101010]">Light</p>
                <p className="text-sm text-[#888888]">#FAF5F0</p>
              </div>
            </div>
          </div>
        </section>

        {/* Типография */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Типография</h2>
          <div className="bg-white p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Headline */}
              <div className="space-y-4">
                <div className="bg-[#F1F0EE] px-4 py-2 rounded-lg inline-block mb-4">
                  <span className="text-[#101010] text-[14px] font-medium">Headline</span>
                </div>
                <div className="space-y-3">
                  <p className="font-bold text-[60px] text-[#101010] leading-[1.2]">H1 60px</p>
                  <p className="font-bold text-[46px] text-[#101010] leading-[1.2]">H1 tablet 46px</p>
                  <p className="font-bold text-[34px] text-[#101010] leading-[1.2]">H1 mobile 34px</p>
                  <p className="font-bold text-[18px] text-[#101010] leading-[1.2]">H2 18px</p>
                  <p className="font-bold text-[16px] text-[#101010] leading-[1.2]">H3 16px</p>
                  <p className="font-bold text-[14px] text-[#101010] leading-[1.2]">H4 14px</p>
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-4">
                <div className="bg-[#F1F0EE] px-4 py-2 rounded-lg inline-block mb-4">
                  <span className="text-[#101010] text-[14px] font-medium">Subtitle</span>
                </div>
                <div className="space-y-3">
                  <p className="font-medium text-[38px] text-[#101010] leading-[1.2]">ST 38px</p>
                  <p className="font-medium text-[32px] text-[#101010] leading-[1.2]">ST 32px</p>
                  <p className="font-medium text-[26px] text-[#101010] leading-[1.2]">ST 26px</p>
                  <p className="font-medium text-[22px] text-[#101010] leading-[1.2]">ST 22px</p>
                  <p className="font-medium text-[20px] text-[#101010] leading-[1.2]">ST 20px</p>
                  <p className="font-medium text-[18px] text-[#101010] leading-[1.2]">ST 18px</p>
                  <p className="font-medium text-[16px] text-[#101010] leading-[1.2]">ST 16px</p>
                  <p className="font-medium text-[14px] text-[#101010] leading-[1.2]">ST 14px</p>
                  <p className="font-medium text-[12px] text-[#101010] leading-[1.2]">ST 12px</p>
                </div>
              </div>

              {/* Text medium */}
              <div className="space-y-4">
                <div className="bg-[#F1F0EE] px-4 py-2 rounded-lg inline-block mb-4">
                  <span className="text-[#101010] text-[14px] font-medium">Text medium</span>
                </div>
                <div className="space-y-3">
                  <p className="font-medium text-[24px] text-[#101010] leading-[1.2] tracking-[-0.72px]">Text medium 24px</p>
                  <p className="font-medium text-[20px] text-[#101010] leading-[1.2]">Text medium 20px</p>
                  <p className="font-medium text-[18px] text-[#101010] leading-[1.2]">Text medium 18px</p>
                  <p className="font-medium text-[17px] text-[#101010] leading-[1.2]">Text medium 17px</p>
                  <p className="font-medium text-[16px] text-[#101010] leading-[1.2]">Text medium 16px</p>
                  <p className="font-medium text-[14px] text-[#101010] leading-[1.2]">Text medium 14px</p>
                  <p className="font-medium text-[12px] text-[#101010] leading-[1.2]">Text medium 12px</p>
                </div>
              </div>

              {/* Text regular */}
              <div className="space-y-4">
                <div className="bg-[#F1F0EE] px-4 py-2 rounded-lg inline-block mb-4">
                  <span className="text-[#101010] text-[14px] font-medium">Text regular</span>
                </div>
                <div className="space-y-3">
                  <p className="font-normal text-[20px] text-[#101010] leading-[1.2] tracking-[-0.48px]">Text regular 20px</p>
                  <p className="font-normal text-[17px] text-[#101010] leading-[1.2]">Text regular 17px</p>
                  <p className="font-normal text-[16px] text-[#101010] leading-[1.2]">Text regular 16px</p>
                  <p className="font-normal text-[14px] text-[#101010] leading-[1.2]">Text regular 14px</p>
                  <p className="font-normal text-[12px] text-[#101010] leading-[1.2]">Text regular 12px</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Кнопки */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Кнопки</h2>
          <div className="bg-white p-8 rounded-2xl">
            <div className="space-y-6">
              {/* Primary кнопки */}
              <div>
                <h3 className="text-xl font-semibold text-[#101010] mb-4">Primary</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <button className="bg-[#9B1E1C] text-white h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#860202] transition-colors font-medium text-[15.25px] leading-[24px] whitespace-nowrap">
                    Primary Button
                  </button>
                  <button className="bg-[#9B1E1C] text-white h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#860202] transition-colors font-medium text-[15.25px] leading-[24px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#9B1E1C]" disabled>
                    Disabled
                  </button>
                  <button className="bg-[#9B1E1C] text-white h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#860202] transition-colors font-medium text-[15.25px] leading-[24px] whitespace-nowrap">
                    Small
                  </button>
                  <button className="bg-[#9B1E1C] text-white h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#860202] transition-colors font-medium text-[15.25px] leading-[24px] whitespace-nowrap">
                    Large
                  </button>
                </div>
              </div>

              {/* Кнопка "Каталог" */}
              <div>
                <h3 className="text-xl font-semibold text-[#101010] mb-4">Каталог</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <button className="bg-[#9B1E1C] text-white flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#860202] transition-colors font-medium text-[16px] leading-[24px] whitespace-nowrap">
                    Каталог
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 3L9 7L5 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="bg-[#860202] text-white flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] transition-colors font-medium text-[16px] leading-[24px] whitespace-nowrap">
                    Каталог
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                      <path d="M5 3L9 7L5 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="mr-4">По умолчанию</span>
                  <span>При наведении</span>
                </div>
              </div>

              {/* Secondary кнопки */}
              <div>
                <h3 className="text-xl font-semibold text-[#101010] mb-4">Secondary</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <button className="bg-transparent text-[#4D4D4D] py-[5px] px-[8px] rounded-[8px] hover:bg-[#E4E2DF] transition-colors font-medium text-[14px] leading-[22px] whitespace-nowrap">
                    Secondary Button
                  </button>
                  <button className="bg-transparent text-[#4D4D4D] py-[5px] px-[8px] rounded-[8px] hover:bg-[#E4E2DF] transition-colors font-medium text-[14px] leading-[22px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent whitespace-nowrap" disabled>
                    Disabled
                  </button>
                </div>
              </div>

              {/* Tertiary кнопки */}
              <div>
                <h3 className="text-xl font-semibold text-accentDark mb-4">Tertiary</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gray-200 text-accentDark px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    Tertiary Button
                  </button>
                  <button className="text-accent underline hover:text-accent/80 transition-colors font-medium">
                    Link Button
                  </button>
                </div>
              </div>

              {/* Icon кнопки */}
              <div>
                <h3 className="text-xl font-semibold text-accentDark mb-4">Icon Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-accent text-white p-3 rounded-full hover:bg-accent/90 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button className="bg-white text-accentDark p-3 rounded-full border border-dark/20 hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Radio Button */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Radio Button</h2>
          <div className="bg-white p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="radio-demo"
                      value="option1"
                      checked={radioSelected === "option1"}
                      onChange={(e) => setRadioSelected(e.target.value)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                      radioSelected === "option1"
                        ? "border-[#9B1E1C] bg-[#9B1E1C]"
                        : "border-[#E4E2DF] bg-white group-hover:border-[#9B1E1C]"
                    }`}>
                      {radioSelected === "option1" && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-[#101010] text-[14px] font-medium">Выбрано</span>
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="radio-demo"
                      value="option2"
                      checked={radioSelected === "option2"}
                      onChange={(e) => setRadioSelected(e.target.value)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                      radioSelected === "option2"
                        ? "border-[#9B1E1C] bg-[#9B1E1C]"
                        : "border-[#E4E2DF] bg-white group-hover:border-[#9B1E1C]"
                    }`}>
                      {radioSelected === "option2" && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-[#101010] text-[14px] font-medium">При наведении</span>
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="radio-demo"
                      value="option3"
                      checked={radioSelected === "option3"}
                      onChange={(e) => setRadioSelected(e.target.value)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                      radioSelected === "option3"
                        ? "border-[#9B1E1C] bg-[#9B1E1C]"
                        : "border-[#E4E2DF] bg-white group-hover:border-[#9B1E1C]"
                    }`}>
                      {radioSelected === "option3" && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-[#101010] text-[14px] font-medium">По умолчанию</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Checkbox */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Checkbox</h2>
          <div className="bg-white p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="flex flex-col gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-all ${
                    checkboxChecked
                      ? "bg-[#9B1E1C] border-[#9B1E1C]"
                      : "bg-white border-2 border-[#E4E2DF] group-hover:bg-[#E4E2DF]"
                  }`}>
                    {checkboxChecked && (
                      <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 3.5L3.5 6L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-[#101010] text-[14px] font-medium">Выбрано</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="hidden"
                  />
                  <div className="w-5 h-5 rounded-[4px] flex items-center justify-center bg-[#E4E2DF] border-2 border-[#E4E2DF] transition-all">
                  </div>
                  <span className="text-[#101010] text-[14px] font-medium">При наведении</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="hidden"
                  />
                  <div className="w-5 h-5 rounded-[4px] flex items-center justify-center bg-white border-2 border-[#E4E2DF] transition-all group-hover:bg-[#E4E2DF]">
                  </div>
                  <span className="text-[#101010] text-[14px] font-medium">По умолчанию</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Pagination */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Pagination</h2>
          <div className="bg-white p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                {/* Кнопка "Назад" */}
                <button
                  className={`bg-white h-10 flex items-center justify-center gap-[6px] px-[13px] py-[9px] rounded-[10px] transition-all ${
                    paginationPage === 1 ? "cursor-not-allowed opacity-60" : "hover:bg-[#E4E2DF]"
                  }`}
                  onClick={() => paginationPage > 1 && setPaginationPage(paginationPage - 1)}
                  disabled={paginationPage === 1}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L5 7L9 11" stroke={paginationPage === 1 ? "#C2C2C2" : "#4D4D4D"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`text-[16px] font-medium leading-[1.2] ${paginationPage === 1 ? "text-[#C2C2C2]" : "text-[#4D4D4D]"}`}>
                    Назад
                  </span>
                </button>

                {/* Кнопки с номерами страниц */}
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[16px] font-medium transition-all ${
                      paginationPage === page
                        ? "bg-[#9B1E1C] text-white"
                        : "bg-white text-[#101010] hover:bg-[#E4E2DF]"
                    }`}
                    onClick={() => setPaginationPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {/* Кнопка "Вперед" */}
                <button
                  className={`bg-white h-10 flex items-center justify-center gap-[6px] px-[13px] py-[9px] rounded-[10px] transition-all ${
                    paginationPage === 4 ? "cursor-not-allowed opacity-60" : "hover:bg-[#E4E2DF]"
                  }`}
                  onClick={() => paginationPage < 4 && setPaginationPage(paginationPage + 1)}
                  disabled={paginationPage === 4}
                >
                  <span className={`text-[16px] font-medium leading-[1.2] ${paginationPage === 4 ? "text-[#C2C2C2]" : "text-[#4D4D4D]"}`}>
                    Вперед
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L9 7L5 11" stroke={paginationPage === 4 ? "#C2C2C2" : "#4D4D4D"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Arrow Button */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Arrow Button</h2>
          <div className="bg-white p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-white hover:bg-[#860202] transition-all group"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:hidden">
                    <path d="M1 1L7 7L1 13" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden group-hover:block">
                    <path d="M1 1L7 7L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-[#9B1E1C] hover:bg-[#860202] transition-all"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L1 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-white opacity-50 cursor-not-allowed"
                  disabled
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L1 13" stroke="#C2C2C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#888888] text-[12px]">По умолчанию</span>
                <span className="text-[#888888] text-[12px]">•</span>
                <span className="text-[#888888] text-[12px]">При наведении</span>
                <span className="text-[#888888] text-[12px]">•</span>
                <span className="text-[#888888] text-[12px]">Неактивная</span>
              </div>
            </div>
          </div>
        </section>

        {/* Поля ввода */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Поля ввода</h2>
          <div className="p-8">
            <div className="space-y-6 max-w-2xl">
              {/* Текстовое поле - UI Kit */}
              <div>
                <label className="block text-[#101010] font-medium mb-4 text-[16px]">
                  Текстовое поле
                </label>
                <div className="w-[363px] relative">
                  <div 
                    className={`flex flex-col items-start rounded-[8px] transition-all ${
                      textInputError 
                        ? "border border-[#ff2626] bg-white" 
                        : ""
                    } ${
                      isTextInputHovered && !isTextInputFocused && !textInputValue && !textInputError
                        ? "bg-[#E4E2DF]"
                        : "bg-white"
                    }`}
                    onMouseEnter={() => !isTextInputFocused && !textInputValue && !textInputError && setIsTextInputHovered(true)}
                    onMouseLeave={() => setIsTextInputHovered(false)}
                  >
                    <div className="h-[36px] rounded-[6px] shrink-0 w-full box-border flex items-center overflow-clip pb-[10px] pt-[9px] px-[10px]">
                      <input
                        type="text"
                        value={textInputValue}
                        onChange={(e) => {
                          setTextInputValue(e.target.value);
                          setTextInputError(false);
                        }}
                        onFocus={() => {
                          setIsTextInputFocused(true);
                          setTextInputError(false);
                        }}
                        onBlur={() => setIsTextInputFocused(false)}
                        className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-[#101010] placeholder-transparent caret-[#9B1E1C] leading-[1.2]"
                        placeholder=""
                      />
                    </div>
                  </div>
                  {textInputError && (
                    <div className="absolute bottom-[-18px] left-0 text-[#ff2626] text-[12px] font-medium">
                      Ошибка
                    </div>
                  )}
                </div>
                <div className="mt-8 flex gap-2">
                  <button
                    onClick={() => setTextInputError(!textInputError)}
                    className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                  >
                    {textInputError ? "Убрать ошибку" : "Показать ошибку"}
                  </button>
                </div>
                <p className="text-[#888888] text-[12px] mt-2">
                  Попробуйте: наведите курсор, кликните для фокуса, введите текст
                </p>
              </div>

              {/* Email input */}
              <div>
                <label className="block text-[#101010] font-medium mb-4 text-[16px]">
                  Email
                </label>
                <div className="w-[363px] relative">
                  <div 
                    className={`flex flex-col items-start rounded-[8px] transition-all ${
                      isEmailHovered && !isEmailFocused && !emailValue
                        ? "bg-[#E4E2DF]"
                        : "bg-white"
                    }`}
                    onMouseEnter={() => !isEmailFocused && !emailValue && setIsEmailHovered(true)}
                    onMouseLeave={() => setIsEmailHovered(false)}
                  >
                    <div className="h-[36px] rounded-[6px] shrink-0 w-full box-border flex items-center overflow-clip pb-[10px] pt-[9px] px-[10px]">
                      <input
                        type="email"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-[#101010] placeholder-transparent caret-[#9B1E1C] leading-[1.2]"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password input */}
              <div>
                <label className="block text-[#101010] font-medium mb-4 text-[16px]">
                  Пароль
                </label>
                <div className="w-[363px] relative">
                  <div 
                    className={`flex flex-col items-start rounded-[8px] transition-all ${
                      isPasswordHovered && !isPasswordFocused && !passwordValue
                        ? "bg-[#E4E2DF]"
                        : "bg-white"
                    }`}
                    onMouseEnter={() => !isPasswordFocused && !passwordValue && setIsPasswordHovered(true)}
                    onMouseLeave={() => setIsPasswordHovered(false)}
                  >
                    <div className="h-[36px] rounded-[6px] shrink-0 w-full box-border flex items-center overflow-clip pb-[10px] pt-[9px] px-[10px]">
                      <input
                        type="password"
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-[#101010] placeholder-transparent caret-[#9B1E1C] leading-[1.2]"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search input - UI Kit */}
              <div>
                <label className="block text-[#101010] font-medium mb-4 text-[16px]">
                  Поле поиска
                </label>
                <div 
                  className={`flex items-center justify-between pl-[14px] pr-[4px] py-[4px] rounded-[40px] w-[340px] transition-all ${
                    isSearchHovered && !isSearchFocused && !searchValue 
                      ? "bg-[#E4E2DF]" 
                      : "bg-white"
                  }`}
                  onMouseEnter={() => !isSearchFocused && !searchValue && setIsSearchHovered(true)}
                  onMouseLeave={() => setIsSearchHovered(false)}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="text"
                      placeholder="Поиск по сайту"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#101010] placeholder-[#888888] caret-[#9B1E1C]"
                    />
                  </div>
                  <button 
                    onClick={() => setSearchValue("")}
                    className="flex items-center justify-center w-9 h-9 bg-[#9B1E1C] rounded-[30px] hover:bg-[#860202] transition-colors"
                  >
                    {searchValue || isSearchFocused ? (
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
                <p className="text-[#888888] text-[12px] mt-2">
                  Попробуйте: наведите курсор, кликните для фокуса, введите текст
                </p>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-[#101010] font-medium mb-4 text-[16px]">
                  Текстовая область
                </label>
                <div className="w-[363px] relative">
                  <div 
                    className={`flex flex-col items-start rounded-[8px] transition-all ${
                      isTextareaHovered && !isTextareaFocused && !textareaValue
                        ? "bg-[#E4E2DF]"
                        : "bg-white"
                    }`}
                    onMouseEnter={() => !isTextareaFocused && !textareaValue && setIsTextareaHovered(true)}
                    onMouseLeave={() => setIsTextareaHovered(false)}
                  >
                    <div className="min-h-[100px] rounded-[6px] shrink-0 w-full box-border flex items-start overflow-clip pb-[10px] pt-[9px] px-[10px]">
                      <textarea
                        value={textareaValue}
                        onChange={(e) => setTextareaValue(e.target.value)}
                        onFocus={() => setIsTextareaFocused(true)}
                        onBlur={() => setIsTextareaFocused(false)}
                        rows={4}
                        className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-[#101010] placeholder-transparent caret-[#9B1E1C] leading-[1.2] resize-none"
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Disabled input */}
              <div>
                <label className="block text-[#101010] font-medium mb-4 text-[16px]">
                  Отключенное поле
                </label>
                <div className="w-[363px] relative">
                  <div className="flex flex-col items-start rounded-[8px] bg-[#E4E2DF] opacity-60">
                    <div className="h-[36px] rounded-[6px] shrink-0 w-full box-border flex items-center overflow-clip pb-[10px] pt-[9px] px-[10px]">
                      <input
                        type="text"
                        value="Недоступно"
                        disabled
                        className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-[#101010] cursor-not-allowed leading-[1.2]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Карточки */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Карточки</h2>
          <div className="flex flex-wrap gap-6">
            {/* Карточка товара - интерактивная */}
            <div className="group bg-white border-[1.2px] border-[rgba(16,16,16,0.1)] rounded-[20px] w-[336px] overflow-hidden">
              <div className="flex flex-col items-center p-[10px]">
                <div className="h-[380px] overflow-hidden relative rounded-[10px] w-full">
                  <img 
                    src="/image_wet_asphalt_1.png" 
                    alt="Двунитка Мокрый Асфальт" 
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[433px] w-[338px] object-cover"
                  />
                </div>
                {/* Контент по умолчанию */}
                <div className="flex flex-col gap-[20px] items-center pt-[14px] px-[10px] w-full group-hover:hidden">
                  <div className="flex flex-col gap-[5px] items-start justify-end w-full">
                    <p className="text-[#101010] text-[16px] font-semibold leading-[1.2] whitespace-pre-wrap">
                      Двунитка Мокрый Асфальт
                    </p>
                    <div className="flex gap-[10px] items-center justify-center">
                      <p className="text-[#9B1E1C] text-[16px] font-bold leading-[1.2]">
                        800 ₽ /м
                      </p>
                    </div>
                  </div>
                </div>
                {/* Контент при наведении */}
                <div className="hidden flex-col gap-[2px] items-center pt-[14px] px-[10px] w-full group-hover:flex">
                  <div className="flex flex-col gap-[14px] items-start w-full">
                    <div className="flex flex-col gap-[5px] items-start justify-end w-full">
                      <p className="text-[#101010] text-[16px] font-semibold leading-[1.2] whitespace-pre-wrap">
                        Двунитка Мокрый Асфальт
                      </p>
                      <div className="flex gap-[10px] items-center justify-center">
                        <p className="text-[#9B1E1C] text-[16px] font-bold leading-[1.2]">
                          800 ₽ /м
                        </p>
                      </div>
                    </div>
                    <p className="text-[#888888] text-[14px] font-normal leading-[1.2] whitespace-pre-wrap w-full">
                      *Скидка от 5 метров
                    </p>
                  </div>
                  <div className="flex flex-col gap-[10px] items-start justify-center px-0 py-[10px] w-full">
                    <div className="flex flex-col gap-[12px] items-start w-full">
                      <div className="flex items-end justify-between w-full">
                        <div className="flex flex-col gap-[10px] items-start">
                          <div className="bg-[#E4E2DF] border border-[#E4E2DF] rounded-[8px] w-full">
                            <div className="flex items-center justify-between overflow-hidden rounded-[inherit] w-full">
                              <button
                                onClick={handleDecrease}
                                disabled={typeof productQuantity === 'number' ? productQuantity <= 0.5 : false}
                                className={`bg-white border-r-[1.2px] border-[rgba(16,16,16,0.15)] flex gap-[10px] h-[46px] items-center justify-center px-[14px] py-[8px] w-[50px] transition-opacity ${
                                  (typeof productQuantity === 'number' && productQuantity <= 0.5) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"
                                }`}
                              >
                                <p className="text-[#888888] text-[18px] font-bold leading-[1.2]">-</p>
                              </button>
                              <input
                                type="number"
                                step="0.1"
                                value={productQuantity === '' ? '' : productQuantity}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  if (inputValue === '' || inputValue === '.') {
                                    setProductQuantity('');
                                    return;
                                  }
                                  const value = parseFloat(inputValue);
                                  if (!isNaN(value) && value >= 0) {
                                    setProductQuantity(value);
                                  }
                                }}
                                onBlur={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (isNaN(value) || value < 0.5 || e.target.value === '') {
                                    setProductQuantity(0.5);
                                  } else {
                                    setProductQuantity(value);
                                  }
                                }}
                                className="bg-[#E4E2DE] h-[46px] px-[14px] py-[8px] w-[64px] text-[#101010] text-[18px] font-bold leading-[1.2] text-center border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={handleIncrease}
                                className="bg-white border border-[#E4E2DF] flex gap-[10px] h-[46px] items-center justify-center px-[14px] py-[8px] w-[50px] hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <p className="text-[#888888] text-[18px] font-bold leading-[1.2]">+</p>
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-[#101010] text-[18px] font-bold leading-[1.2]">
                          {totalPrice} ₽
                        </p>
                      </div>
                      <button className="bg-[#9B1E1C] flex gap-[10px] items-center justify-center px-[14px] py-[8px] rounded-[8px] w-full">
                        <p className="text-white text-[16.8px] font-medium leading-[24px]">В корзину</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Аватары */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Аватары</h2>
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="flex flex-wrap items-center gap-6">
              <Avatar.Root className="inline-flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <Avatar.Image
                  className="h-full w-full object-cover"
                  src="https://i.pravatar.cc/100"
                  alt="User avatar"
                />
                <Avatar.Fallback className="text-gray-700 text-sm font-medium">
                  JD
                </Avatar.Fallback>
              </Avatar.Root>

              <Avatar.Root className="inline-flex h-16 w-16 select-none items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <Avatar.Image
                  className="h-full w-full object-cover"
                  src="https://i.pravatar.cc/101"
                  alt="User avatar"
                />
                <Avatar.Fallback className="text-gray-700 font-medium">
                  AB
                </Avatar.Fallback>
              </Avatar.Root>

              <Avatar.Root className="inline-flex h-20 w-20 select-none items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <Avatar.Image
                  className="h-full w-full object-cover"
                  src="https://i.pravatar.cc/102"
                  alt="User avatar"
                />
                <Avatar.Fallback className="text-gray-700 text-lg font-medium">
                  CD
                </Avatar.Fallback>
              </Avatar.Root>

              <Avatar.Root className="inline-flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full bg-accent">
                <Avatar.Fallback className="text-white text-sm font-medium">
                  EF
                </Avatar.Fallback>
              </Avatar.Root>
            </div>
          </div>
        </section>

        {/* Бейджи и теги */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Бейджи и теги</h2>
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium">
                  Новинка
                </span>
                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  В наличии
                </span>
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Скидка -50%
                </span>
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Хит продаж
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="border-2 border-accent text-accent px-4 py-2 rounded-full text-sm font-medium">
                  Хлопок
                </span>
                <span className="border-2 border-accentDark text-accentDark px-4 py-2 rounded-full text-sm font-medium">
                  Лен
                </span>
                <span className="border-2 border-dark text-dark px-4 py-2 rounded-full text-sm font-medium">
                  Футер
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Алерты */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Уведомления</h2>
          <div className="space-y-4">
            {/* Success */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h5 className="font-semibold text-green-800 mb-1">Успешно!</h5>
                  <p className="text-green-700 text-sm">Товар успешно добавлен в корзину</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h5 className="font-semibold text-blue-800 mb-1">Информация</h5>
                  <p className="text-blue-700 text-sm">Доставка осуществляется в течение 2-4 дней</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h5 className="font-semibold text-yellow-800 mb-1">Внимание!</h5>
                  <p className="text-yellow-700 text-sm">Осталось всего 3 единицы товара</p>
                </div>
              </div>
            </div>

            {/* Error */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h5 className="font-semibold text-red-800 mb-1">Ошибка!</h5>
                  <p className="text-red-700 text-sm">Не удалось обработать запрос. Попробуйте позже</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Текстовые ссылки */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Текстовые ссылки</h2>
          <div className="bg-white p-8 rounded-2xl">
            <div className="space-y-8">
              {/* Вариант 1 */}
              <div className="flex items-center gap-8">
                <div className="w-[120px] text-[12px] text-[#161616] opacity-50">вариант 1</div>
                <div className="flex-1 h-[27px] flex items-center">
                  <a 
                    href="#" 
                    className="text-[14px] font-medium text-[#686868] hover:text-[#161616] transition-colors"
                  >
                    Что нового
                  </a>
                </div>
              </div>

              {/* Вариант 2 */}
              <div className="flex items-center gap-8">
                <div className="w-[120px] text-[12px] text-[#161616] opacity-50">вариант 2</div>
                <div className="flex-1">
                  <a 
                    href="#" 
                    className="text-[14px] font-normal text-[#686868] hover:text-[#161616] hover:font-semibold transition-all"
                  >
                    Что нового
                  </a>
                </div>
              </div>

              {/* Вариант 3 */}
              <div className="flex items-center gap-8">
                <div className="w-[120px] text-[12px] text-[#161616] opacity-50">вариант 3</div>
                <div className="flex-1">
                  <a 
                    href="#" 
                    className="text-[18px] font-semibold text-[#161616] hover:bg-[#E4E2DF] hover:px-4 hover:py-2 rounded-lg transition-all inline-block"
                  >
                    Что нового
                  </a>
                </div>
              </div>

              {/* Вариант 4 */}
              <div className="flex items-center gap-8">
                <div className="w-[120px] text-[12px] text-[#161616] opacity-50">вариант 4</div>
                <div className="flex-1">
                  <a 
                    href="#" 
                    className="text-[14px] font-normal text-[#161616] underline decoration-[#161616] decoration-1 underline-offset-2 hover:font-semibold hover:decoration-2 transition-all"
                  >
                    Что нового
                  </a>
                </div>
              </div>

              {/* Вариант 5 */}
              <div className="flex items-center gap-8">
                <div className="w-[120px] text-[12px] text-[#161616] opacity-50">вариант 5</div>
                <div className="flex-1">
                  <a 
                    href="#" 
                    className="text-[14px] font-normal text-[#161616] underline decoration-[#161616] decoration-1 underline-offset-2 hover:font-semibold hover:decoration-2 transition-all"
                  >
                    Что нового
                  </a>
                </div>
              </div>

              {/* Вариант 6 */}
              <div className="flex items-center gap-8">
                <div className="w-[120px] text-[12px] text-[#161616] opacity-50">вариант 6</div>
                <div className="flex-1">
                  <a 
                    href="#" 
                    className="text-[18px] font-semibold text-[#161616] underline decoration-[#161616] decoration-2 underline-offset-2 transition-all"
                  >
                    Что нового
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Иконки */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Иконки</h2>
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
              <div className="flex flex-col items-center gap-2">
                <img src="/Bag Icon.svg" alt="Корзина" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Корзина</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/User Icon.svg" alt="Пользователь" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Профиль</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/Loupe.svg" alt="Поиск" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Поиск</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/Logo Icon.svg" alt="Логотип" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Лого</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/location-01.svg" alt="Локация" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Адрес</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/call-01.svg" alt="Телефон" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Телефон</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/mail-01.svg" alt="Email" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Email</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <img src="/clock-01.svg" alt="Время" className="w-8 h-8" />
                <span className="text-xs text-dark/70">Время</span>
              </div>
            </div>
          </div>
        </section>

        {/* Карточки заказов */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#101010] mb-6">Карточки заказов</h2>
          <div className="bg-white p-8 rounded-2xl">
            <p className="text-[#888888] text-[16px] mb-8">
              Различные состояния карточки заказа с разными статусами и действиями
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {/* Оформлен */}
              <div>
                <h3 className="text-xl font-semibold text-[#101010] mb-4">Оформлен (placed)</h3>
                <OrderCard
                  order={{
                    id: 1,
                    date: "2025-09-02",
                    created_at: "2025-09-02",
                    status: "placed",
                    items_count: 3,
                    total: 1600,
                    total_price: 1600,
                    delivery_method: "Самовывоз",
                    payment_method: "Наличными при получении",
                    delivery_date: "11 сентября, 11:00 - 13:00",
                    items: [
                      { id: 1, name: "Ткань 1", image: "/textile-blue.jpg", product: { name: "Ткань 1", image: "/textile-blue.jpg" } },
                      { id: 2, name: "Ткань 2", image: "/textile-brown.jpg", product: { name: "Ткань 2", image: "/textile-brown.jpg" } },
                      { id: 3, name: "Ткань 3", image: "/textile-yellow.jpg", product: { name: "Ткань 3", image: "/textile-yellow.jpg" } }
                    ]
                  }}
                  onCancelOrder={async (id) => {
                    console.log("Отмена заказа:", id);
                    return Promise.resolve();
                  }}
                />
              </div>

              {/* В обработке */}
              <div>
                <h3 className="text-xl font-semibold text-[#101010] mb-4">В обработке (processing)</h3>
                <OrderCard
                  order={{
                    id: 2,
                    date: "2025-09-01",
                    created_at: "2025-09-01",
                    status: "processing",
                    items_count: 2,
                    total: 1200,
                    total_price: 1200,
                    delivery_method: "Почта России",
                    payment_method: "Банковской картой на сайте",
                    delivery_date: "10 сентября, 14:00 - 16:00",
                    items: [
                      { id: 4, name: "Ткань 4", image: "/textile-green.jpg", product: { name: "Ткань 4", image: "/textile-green.jpg" } },
                      { id: 5, name: "Ткань 5", image: "/textile-blue.jpg", product: { name: "Ткань 5", image: "/textile-blue.jpg" } }
                    ]
                  }}
                  onCancelOrder={async (id) => {
                    console.log("Отмена заказа:", id);
                    return Promise.resolve();
                  }}
                />
              </div>

              {/* Доставляется */}
              <div>
                <h3 className="text-xl font-semibold text-[#101010] mb-4">Доставляется (delivering)</h3>
                <OrderCard
                  order={{
                    id: 3,
                    date: "2025-08-30",
                    created_at: "2025-08-30",
                    status: "delivering",
                    items_count: 1,
                    total: 800,
                    total_price: 800,
                    delivery_method: "Курьером",
                    payment_method: "Банковской картой на сайте",
                    delivery_date: "5 сентября, 10:00 - 12:00",
                    items: [
                      { id: 6, name: "Ткань 6", image: "/textile-yellow.jpg", product: { name: "Ткань 6", image: "/textile-yellow.jpg" } }
                    ]
                  }}
                />
              </div>

              {/* Доставлен */}
              <div>
                <h3 className="text-xl font-semibold text-[#101010] mb-4">Доставлен (delivered)</h3>
                <OrderCard
                  order={{
                    id: 4,
                    date: "2025-08-25",
                    created_at: "2025-08-25",
                    status: "delivered",
                    items_count: 4,
                    total: 2400,
                    total_price: 2400,
                    delivery_method: "Самовывоз",
                    payment_method: "Наличными при получении",
                    delivery_date: "28 августа, 15:00 - 17:00",
                    items: [
                      { id: 7, name: "Ткань 7", image: "/textile-green.jpg", product: { name: "Ткань 7", image: "/textile-green.jpg" } },
                      { id: 8, name: "Ткань 8", image: "/textile-brown.jpg", product: { name: "Ткань 8", image: "/textile-brown.jpg" } },
                      { id: 9, name: "Ткань 9", image: "/textile-blue.jpg", product: { name: "Ткань 9", image: "/textile-blue.jpg" } }
                    ]
                  }}
                />
              </div>
            </div>

            {/* Заказ с ошибкой */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#101010] mb-4">Заказ с ошибкой при отмене</h3>
              <div className="max-w-[486px]">
                <OrderCard
                  order={{
                    id: 5,
                    date: "2025-09-03",
                    created_at: "2025-09-03",
                    status: "placed",
                    items_count: 1,
                    total: 500,
                    total_price: 500,
                    delivery_method: "Самовывоз",
                    payment_method: "Наличными при получении",
                    items: [
                      { id: 10, name: "Ткань 10", image: "/textile-yellow.jpg", product: { name: "Ткань 10", image: "/textile-yellow.jpg" } }
                    ]
                  }}
                  onCancelOrder={async (id) => {
                    throw new Error("Не удалось отменить заказ. Попробуйте позже.");
                  }}
                />
              </div>
            </div>

            {/* Заказ без даты доставки */}
            <div>
              <h3 className="text-xl font-semibold text-[#101010] mb-4">Заказ без даты доставки</h3>
              <div className="max-w-[486px]">
                <OrderCard
                  order={{
                    id: 6,
                    date: "2025-09-04",
                    created_at: "2025-09-04",
                    status: "placed",
                    items_count: 2,
                    total: 900,
                    total_price: 900,
                    delivery_method: "Самовывоз",
                    payment_method: "Наличными при получении",
                    items: [
                      { id: 11, name: "Ткань 11", image: "/textile-green.jpg", product: { name: "Ткань 11", image: "/textile-green.jpg" } },
                      { id: 12, name: "Ткань 12", image: "/textile-blue.jpg", product: { name: "Ткань 12", image: "/textile-blue.jpg" } }
                    ]
                  }}
                  onCancelOrder={async (id) => {
                    console.log("Отмена заказа:", id);
                    return Promise.resolve();
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Модальное окно пример */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-accentDark mb-6">Модальное окно</h2>
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Открыть модальное окно
            </button>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative ${styles.animateFadeIn}`}>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-dark/50 hover:text-dark transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="text-2xl font-bold text-accentDark mb-4">Заголовок модального окна</h3>
                  <p className="text-dark/70 mb-6">
                    Это пример модального окна. Здесь может быть любой контент: формы, изображения, текст и т.д.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors font-medium"
                    >
                      Подтвердить
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-200 text-accentDark px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-dark/10">
          <p className="text-dark/60">
            UI Kit для проекта "Центр Ткани" • 2025
          </p>
        </div>
      </div>

    </div>
  );
};

