import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Password } from "../../components/input/Password";
import { LOGIN_ROUTE } from "../../utils/consts";
import { authAPI } from "../../http/api";
import { AuthLogo } from "../../components/logo/AuthLogo";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Получаем email и code из location state
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Валидация
    if (!newPassword || !confirmPassword) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    if (newPassword.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(email, code, newPassword);
      setMessage("Пароль успешно изменен");
      // Через 2 секунды переходим на страницу входа
      setTimeout(() => {
        navigate(LOGIN_ROUTE);
      }, 2000);
    } catch (err) {
      setError(err.message || "Не удалось изменить пароль. Попробуйте снова.");
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
              Измените свой пароль
            </h1>
          </div>

          {/* Описание */}
          <p className="font-inter font-medium text-[14px] leading-[1.2] text-[#101010] m-0">
            Выберите новый пароль для своей учётной записи.
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
              {/* Поле Новый пароль */}
              <div className="flex flex-col gap-[8px]">
                <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]">
                  Пароль
                </label>
                <Password
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  bgColor="#e4e2df"
                  required
                  minLength={6}
                />
              </div>

              {/* Поле Подтвердите пароль */}
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center gap-[8px]">
                  <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888] whitespace-nowrap">
                    Подтвердите пароль
                  </label>
                  <div className="flex-1 h-px" />
                </div>
                <Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  bgColor="#e4e2df"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Кнопка Сменить пароль */}
            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="bg-[rgba(155,30,28,0.3)] h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#9b1e1c] transition-colors font-inter font-medium text-[16px] leading-[1.2] text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[rgba(155,30,28,0.3)]"
            >
              {isLoading ? "Смена пароля..." : "Сменить пароль"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

