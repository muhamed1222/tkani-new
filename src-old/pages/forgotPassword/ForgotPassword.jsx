import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Email } from "../../components/input/Email";
import { LOGIN_ROUTE, VERIFY_CODE_ROUTE } from "../../utils/consts";
import { authAPI } from "../../http/api";
import { AuthLogo } from "../../components/logo/AuthLogo";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Пожалуйста, введите адрес электронной почты");
      return;
    }

    setIsLoading(true);
    
    try {
      await authAPI.forgotPassword(email);
      setMessage("Код отправлен на вашу электронную почту");
      // Переходим на страницу подтверждения кода через 1 секунду
      setTimeout(() => {
        navigate(VERIFY_CODE_ROUTE, { state: { email } });
      }, 1000);
    } catch (err) {
      setError(err.message || "Не удалось отправить код. Проверьте email и попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f1f0ee] relative min-h-screen w-full">
      {/* Логотип вверху */}
      <div className="absolute left-1/2 top-[40px] -translate-x-1/2">
        <AuthLogo />
      </div>

      {/* Основная форма */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[16px] p-[32px] w-[472px]">
        <div className="flex flex-col gap-[24px]">
          {/* Заголовок */}
          <div className="flex flex-col">
            <h1 className="font-inter font-semibold text-[32px] leading-[1.2] text-[#101010] tracking-[-0.8px]">
              Забыли свой пароль?
            </h1>
          </div>

          {/* Описание */}
          <p className="font-inter font-medium text-[14px] leading-[1.2] text-[#101010] m-0">
            Введите свой адрес электронной почты ниже, и мы отправим вам код для входа в систему и сброса пароля.
          </p>

          {/* Форма */}
          <form className="flex flex-col gap-[30px]" onSubmit={handleSubmit}>
            {/* Сообщения об ошибках и успехе */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm m-0">
                  {error}
                </p>
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm m-0">
                  {message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-[16px]">
              {/* Электронная почта */}
              <div className="flex flex-col gap-[8px]">
                <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]">
                  Электронная почта
                </label>
                <Email
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bgColor="#e4e2df"
                  required
                />
              </div>
            </div>

            {/* Кнопка Отправить код */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#9b1e1c] h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#860202] transition-colors font-inter font-medium text-[16px] leading-[1.2] text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#9b1e1c]"
            >
              {isLoading ? "Отправка..." : "Отправить код"}
            </button>
          </form>

          {/* Разделительная линия */}
          <div className="border-t border-[rgba(16,16,16,0.15)] h-px w-full" />

          {/* Помните свой пароль? */}
          <div className="flex gap-[8px] items-center w-full">
            <p className="font-inter font-medium text-[14px] leading-[1.2] text-[#101010] whitespace-nowrap m-0">
              Помните свой пароль?
            </p>
            <div className="flex-1 h-px" />
            <Link to={LOGIN_ROUTE}>
              <button
                type="button"
                className="bg-white border border-[rgba(16,16,16,0.15)] h-[40px] min-h-[40px] px-[17px] py-0 rounded-[8px] hover:bg-[#E4E2DF] transition-colors font-inter font-medium text-[14px] leading-[1.2] text-[#101010]"
              >
                Войти
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

