import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Password } from "../../components/input/Password";
import { LOGIN_ROUTE } from "../../utils/consts";
import { authAPI } from "../../http/api";

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
      <div className="absolute left-1/2 top-[40px] -translate-x-1/2 flex items-center gap-[6px] h-[34px]">
        <div className="bg-[#9b1e1c] rounded-[8px] w-[34px] h-[34px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="29" height="13" viewBox="0 0 29 13" fill="none">
            <g clipPath="url(#clip0_292_49994)">
              <path d="M28.9704 5.65286C28.7281 2.95474 26.7348 0.770795 23.9722 0.14546C21.8132 -0.343136 20.0217 0.461185 18.2886 1.63292C14.8295 3.97085 11.3621 6.29765 7.85354 8.56053C6.42444 9.48213 4.83136 9.09471 4.05261 7.75732C3.27108 6.41438 3.53011 5.17872 4.69629 4.19875C5.84746 3.23156 7.46222 3.51449 8.54391 4.80351C8.93634 5.27099 9.29487 5.76681 9.70175 6.29098C10.724 5.59894 11.6467 4.97472 12.6072 4.32492C12.1064 3.58453 11.7501 2.98421 11.3226 2.43891C9.56223 0.192152 6.62455 -0.589379 3.9898 0.460629C1.34894 1.51342 -0.20356 4.04922 0.0215605 6.94244C0.231673 9.64556 2.20829 11.8512 4.9492 12.5154C6.95306 13.0012 8.68565 12.4176 10.3276 11.3187C13.8495 8.96186 17.3625 6.59114 20.9144 4.27934C22.507 3.24268 24.0089 3.50893 24.921 4.83798C25.7587 6.05919 25.4741 7.65282 24.2601 8.5344C22.975 9.46768 21.4531 9.13306 20.3074 7.66839C19.9789 7.24816 19.6438 6.83238 19.3008 6.40104C18.2669 7.10753 17.3853 7.71007 16.4237 8.36709C16.9101 9.08359 17.2864 9.7395 17.7583 10.3165C19.5859 12.551 22.5003 13.2803 25.1228 12.1986C27.7409 11.1191 29.2333 8.57943 28.9704 5.65175V5.65286Z" fill="#F1F0EE"/>
              <path d="M12.7399 10.8312C13.1096 11.7545 14.0256 12.3415 15.02 12.3415L17.901 12.3253C17.7782 12.1352 17.7593 12.0808 17.6776 11.959C16.9105 10.8118 16.2674 9.85012 15.6065 8.86182C14.522 9.59554 13.6471 10.1875 12.7305 10.8079C12.7332 10.8156 12.7366 10.8234 12.7394 10.8307L12.7399 10.8312Z" fill="#F1F0EE"/>
              <path d="M16.2002 1.63086C15.8305 0.707587 14.9145 0.120605 13.9201 0.120605L11.0391 0.136725C11.1619 0.326827 11.1808 0.381301 11.2625 0.503033C12.0296 1.65032 12.6727 2.61194 13.3336 3.60025C14.4181 2.86652 15.293 2.27454 16.2096 1.65421C16.2068 1.64642 16.2035 1.63864 16.2007 1.63142L16.2002 1.63086Z" fill="#F1F0EE"/>
              <path d="M20.1376 3.07938C20.2503 3.07938 20.3416 2.98805 20.3416 2.87538C20.3416 2.76272 20.2503 2.67139 20.1376 2.67139C20.0249 2.67139 19.9336 2.76272 19.9336 2.87538C19.9336 2.98805 20.0249 3.07938 20.1376 3.07938Z" fill="#F1F0EE"/>
            </g>
            <defs>
              <clipPath id="clip0_292_49994">
                <rect width="29" height="12.6929" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        <img src="/CENTER TKANI.svg" alt="CENTER TKANI" className="h-[8.38px] w-[97px]" />
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
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  bgColor="#f1f0ee"
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
                  placeholder="Подтвердите новый пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  bgColor="#f1f0ee"
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

