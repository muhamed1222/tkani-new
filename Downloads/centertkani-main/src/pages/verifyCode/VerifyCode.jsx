// src/pages/verifyCode/VerifyCode.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FORGOT_PASSWORD_ROUTE, RESET_PASSWORD_ROUTE } from "../../utils/consts";
import { authAPI } from "../../http/api";
import { AuthLogo } from "../../components/logo/AuthLogo";

export const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef([]);
  
  // Получаем email из location state
  const email = location.state?.email;

  // Редирект если нет email
  useEffect(() => {
    if (!email) {
      navigate(FORGOT_PASSWORD_ROUTE);
    }
  }, [email, navigate]);

  // Инициализация refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Фокусировка на первом инпуте при загрузке
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Таймер для повторной отправки
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Принимаем любые символы, преобразуем в верхний регистр
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (!upperValue) {
      // Если очистили поле
      const newCodeArray = code.split('');
      newCodeArray[index] = '';
      const updatedCode = newCodeArray.join('');
      setCode(updatedCode);
      return;
    }

    if (upperValue.length > 1) {
      // Если вставлено несколько символов
      const chars = upperValue.split('').slice(0, 6);
      let newCode = '';
      
      chars.forEach((char, i) => {
        newCode += char;
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = char;
        }
      });
      
      setCode(newCode);
      
      // Фокусируемся на следующем пустом поле
      const nextIndex = Math.min(chars.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      
      // Если код полный, автоматически отправляем
      if (newCode.length === 6) {
        handleCodeComplete(newCode);
      }
    } else {
      // Один символ
      const newCodeArray = code.split('');
      newCodeArray[index] = upperValue;
      const updatedCode = newCodeArray.join('');
      setCode(updatedCode);
      
      // Перемещаем фокус на следующий инпут
      if (upperValue && index < 5) {
        inputRefs.current[index + 1].focus();
      }
      
      // Если код полный, автоматически отправляем
      if (updatedCode.length === 6 && updatedCode.indexOf(' ') === -1) {
        handleCodeComplete(updatedCode);
      }
    }
    
    setError("");
    setResendMessage("");
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Если поле пустое и нажали Backspace, переходим к предыдущему полю
        e.preventDefault();
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    handleChange(0, pasteData);
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handleCodeComplete = async (completeCode) => {
    if (completeCode.length !== 6) {
      setError("Код должен состоять из 6 символов");
      return;
    }

    setIsLoading(true);
    setError("");
    setResendMessage("");

    try {
      // Переходим на страницу сброса пароля с кодом
      navigate(RESET_PASSWORD_ROUTE, { 
        state: { 
          email, 
          code: completeCode 
        } 
      });
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Произошла ошибка при проверке кода");
      // Очищаем все поля
      setCode("");
      inputRefs.current.forEach(ref => {
        if (ref) ref.value = '';
      });
      // Фокусируемся на первом поле
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    setResendMessage("");

    try {
      await authAPI.forgotPassword(email);
      setResendMessage("Код отправлен повторно на вашу электронную почту");
      setCode("");
      setResendCooldown(60); // 60 секунд до следующей отправки
      inputRefs.current.forEach(ref => {
        if (ref) ref.value = '';
      });
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message || "Не удалось отправить код повторно. Попробуйте позже.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="bg-[#f1f0ee] relative min-h-screen w-full flex items-center justify-center py-[40px] px-4">
      {/* Логотип вверху */}
      <div className="absolute left-1/2 top-[40px] -translate-x-1/2">
        <AuthLogo />
      </div>

      {/* Основная форма */}
      <div className="bg-white rounded-[16px] p-6 sm:p-8 w-full max-w-[472px] mt-[80px]">
        <div className="flex flex-col gap-6">
          {/* Заголовок */}
          <div className="flex flex-col">
            <h1 className="font-inter font-semibold text-2xl sm:text-[32px] leading-[1.2] text-[#101010] tracking-[-0.8px]">
              Подтвердите свой адрес электронной почты
            </h1>
          </div>

          {/* Описание */}
          <p className="font-inter font-medium text-[14px] leading-[1.2] text-[#101010] m-0">
            Если аккаунт существует с <span className="font-semibold">{email}</span>, 
            вы получили шестизначный код подтверждения. 
            Пожалуйста, введите его ниже, чтобы сбросить пароль.
          </p>

          {/* Сообщения об ошибках и успехе */}
          {error && (
            <div 
              role="alert"
              aria-live="assertive"
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm m-0">
                {error}
              </p>
            </div>
          )}
          
          {resendMessage && (
            <div 
              role="status"
              aria-live="polite"
              className="p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-green-600 text-sm m-0">
                {resendMessage}
              </p>
            </div>
          )}

          {/* Поля для ввода кода */}
          <div className="flex flex-col gap-4">
            <label 
              className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]"
            >
              Код подтверждения
            </label>
            <div 
              className="flex justify-between gap-2 sm:gap-3" 
              onPaste={handlePaste}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={handleFocus}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold uppercase bg-[#e4e2df] rounded-lg border-2 border-transparent focus:border-[#9b1e1c] focus:outline-none transition-colors"
                  disabled={isLoading || isResending}
                  aria-label={`Символ ${index + 1} из 6`}
                  autoComplete="off"
                  inputMode="text"
                />
              ))}
            </div>
            
            {isLoading && (
              <p 
                className="text-[#888888] text-[12px] font-inter font-normal m-0 mt-2 text-center"
                aria-live="polite"
              >
                Проверка кода...
              </p>
            )}
          </div>

          {/* Не получили код? */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-[8px] items-start sm:items-center w-full">
            <p className="font-inter font-medium text-[14px] leading-[1.2] text-[#101010] m-0">
              Не получили код?
            </p>
            <div className="hidden sm:block flex-1 h-px bg-transparent" />
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading || isResending || resendCooldown > 0}
              className="font-inter font-medium text-[14px] leading-[1.2] text-[#4d4d4d] underline hover:text-[#9b1e1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline whitespace-nowrap"
              aria-label={resendCooldown > 0 ? `Повторная отправка доступна через ${resendCooldown} секунд` : "Отправить код повторно"}
            >
              {resendCooldown > 0 
                ? `Отправить код снова (${resendCooldown}с)`
                : "Отправить код снова"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;