import { useState, useContext } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Registration.module.css";
import { Context } from "../../main";
import { SHOP_ROUTE, LOGIN_ROUTE } from "../../utils/consts";
import { TextInput } from "../../components/input/TextInput";
import { Email } from "../../components/input/Email";
import { Phone } from "../../components/input/Phone";
import { Password } from "../../components/input/Password";

export let Registration = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Валидация
    if (!firstName || !lastName || !email || !phone || !password) {
      setLocalError("Пожалуйста, заполните все поля");
      return;
    }

    if (password.length < 6) {
      setLocalError("Пароль должен содержать минимум 6 символов");
      return;
    }

    // Формируем данные для регистрации
    // API ожидает first_name и last_name (snake_case)
    const userData = {
      firstName, // будет преобразовано в first_name в api.js
      lastName,  // будет преобразовано в last_name в api.js
      email,
      password,
      // phone пока не поддерживается в API, можно добавить позже
    };

    const result = await user.register(userData);
    
    if (result.success) {
      navigate(SHOP_ROUTE);
    } else {
      setLocalError(result.error || "Ошибка регистрации");
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
              Регистрация
            </h1>
          </div>

          {/* Форма */}
          <form className="flex flex-col gap-[30px]" onSubmit={handleSubmit}>
            {/* Сообщения об ошибках */}
            {(localError || user.error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm m-0">
                  {localError || user.error}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-[16px]">
              {/* Имя и Фамилия */}
              <div className="flex gap-[24px] items-start w-full">
                <div className="flex flex-1 flex-col gap-[16px]">
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]">
                      Имя
                    </label>
                    <TextInput
                      placeholder=""
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      bgColor="#f1f0ee"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-[16px]">
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]">
                      Фамилия
                    </label>
                    <TextInput
                      placeholder=""
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      bgColor="#f1f0ee"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Электронная почта */}
              <div className="flex flex-col gap-[16px]">
                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]">
                    Электронная почта
                  </label>
                  <Email
                    placeholder="user@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bgColor="#f1f0ee"
                    required
                  />
                </div>
              </div>

              {/* Телефон */}
              <div className="flex flex-col gap-[16px]">
                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]">
                    Телефон
                  </label>
                  <Phone
                    placeholder="Номер телефона"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    bgColor="#f1f0ee"
                    required
                  />
                </div>
              </div>

              {/* Пароль */}
              <div className="flex flex-col gap-[16px]">
                <div className="flex flex-col gap-[8px]">
                  <label className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]">
                    Пароль
                  </label>
                  <Password
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bgColor="#f1f0ee"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Кнопка Создать аккаунт */}
            <button
              type="submit"
              disabled={user.isLoading}
              className="bg-[#9b1e1c] h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#860202] transition-colors font-inter font-medium text-[16px] leading-[1.2] text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#9b1e1c]"
            >
              {user.isLoading ? "Регистрация..." : "Создать аккаунт"}
            </button>
          </form>

          {/* Текст с условиями */}
          <p className="font-inter font-normal text-[12px] leading-[1.2] text-[#888888] m-0">
            Нажимая «Создать аккаунт» выше, вы подтверждаете, что будете получать обновления от команды Center Tkani и что вы прочитали, поняли и согласны с Условиями и положениями, Лицензионным соглашением и Политикой конфиденциальности.
          </p>

          {/* Разделительная линия */}
          <div className="border-t border-[rgba(16,16,16,0.15)] h-px w-full" />

          {/* Уже есть аккаунт? */}
          <div className="flex gap-[8px] items-center w-full">
            <p className="font-inter font-medium text-[14px] leading-[1.2] text-[#101010] whitespace-nowrap m-0">
              У вас уже есть аккаунт?
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
}); 