import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CodeInput } from "../../components/input/CodeInput";
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
  
  // Получаем email из location state
  const email = location.state?.email;

  // Редирект если нет email
  useEffect(() => {
    if (!email) {
      navigate(FORGOT_PASSWORD_ROUTE);
    }
  }, [email, navigate]);

  // Таймер для повторной отправки
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setError("");
    setResendMessage("");
  };

  const handleCodeComplete = async (completeCode) => {
    if (completeCode.length !== 6) {
      setError("Код должен состоять из 6 цифр");
      return;
    }

    setIsLoading(true);
    setError("");
    setResendMessage("");

    try {
      const response = await authAPI.verifyCode(email, completeCode);
      // После успешной проверки переходим на страницу сброса пароля
      // Сохраняем временный токен, если он пришел в ответе
      if (response.token) {
        // Можно сохранить токен для сброса пароля, если нужно
        // localStorage.setItem('resetToken', response.token);
      }
      navigate(RESET_PASSWORD_ROUTE, { state: { email, code: completeCode } });
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Произошла ошибка при проверке кода");
      setCode("");
      // Очищаем поля CodeInput через небольшой таймаут для корректного обновления
      setTimeout(() => {
        setCode("");
      }, 100);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    setResendMessage("");

    try {
      await authAPI.resendCode(email);
      setResendMessage("Код отправлен повторно на вашу электронную почту");
      setCode("");
      setResendCooldown(60); // 60 секунд до следующей отправки
    } catch (err) {
      setError(err.message || "Не удалось отправить код повторно. Попробуйте позже.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Пока идет редирект
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
            Если аккаунт существует с <span className="font-semibold">{email}</span>, вы получите шестизначный код подтверждения. Пожалуйста, введите его ниже, чтобы сбросить пароль.
          </p>

          {/* Форма */}
          <div className="flex flex-col gap-6 sm:gap-[30px]">
            {/* Сообщения об успехе */}
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

            <div className="flex flex-col gap-4">
              {/* Поле для кода */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="code-input"
                  className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]"
                >
                  Код подтверждения
                </label>
                <div>
                  <CodeInput
                    id="code-input"
                    value={code}
                    onChange={handleCodeChange}
                    onComplete={handleCodeComplete}
                    length={6}
                    bgColor="#e4e2df"
                    disabled={isLoading || isResending}
                    required
                    aria-label="Введите шестизначный код подтверждения"
                    aria-describedby={error ? "code-error" : isLoading ? "code-loading" : undefined}
                    aria-invalid={!!error}
                  />
                  {isLoading && (
                    <p 
                      id="code-loading"
                      className="text-[#888888] text-[12px] font-inter font-normal m-0 mt-2"
                      aria-live="polite"
                    >
                      Проверка кода...
                    </p>
                  )}
                  {error && !isLoading && (
                    <p 
                      id="code-error"
                      role="alert"
                      aria-live="assertive"
                      className="text-red-600 text-xs mt-1 m-0"
                    >
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </div>
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

