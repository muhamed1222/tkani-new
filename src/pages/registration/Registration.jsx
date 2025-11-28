import { useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, Link } from "react-router-dom";
import { Context } from "../../main";
import { SHOP_ROUTE, LOGIN_ROUTE, PRIVACY_POLICY_ROUTE, TERMS_OF_SERVICE_ROUTE } from "../../utils/consts";
import { TextInput } from "../../components/input/TextInput";
import { Email } from "../../components/input/Email";
import { Phone } from "../../components/input/Phone";
import { Password } from "../../components/input/Password";
import { AuthLogo } from "../../components/logo/AuthLogo";

export let Registration = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Валидация имени
  const validateFirstName = (name) => {
    if (!name) {
      return "Пожалуйста, введите имя";
    }
    if (name.trim().length < 2) {
      return "Имя должно содержать минимум 2 символа";
    }
    return "";
  };

  // Валидация фамилии
  const validateLastName = (name) => {
    if (!name) {
      return "Пожалуйста, введите фамилию";
    }
    if (name.trim().length < 2) {
      return "Фамилия должна содержать минимум 2 символа";
    }
    return "";
  };

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Пожалуйста, введите email";
    }
    if (!emailRegex.test(email)) {
      return "Введите корректный email адрес";
    }
    return "";
  };

  // Валидация телефона
  const validatePhone = (phone) => {
    if (!phone) {
      return "Пожалуйста, введите номер телефона";
    }
    // Удаляем все нецифровые символы для проверки
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return "Введите корректный номер телефона";
    }
    return "";
  };

  // Валидация пароля
  const validatePassword = (password) => {
    if (!password) {
      return "Пожалуйста, введите пароль";
    }
    if (password.length < 6) {
      return "Пароль должен содержать минимум 6 символов";
    }
    return "";
  };

  // Очистка ошибок при изменении полей
  useEffect(() => {
    if (firstName) {
      setFirstNameError("");
      setLocalError("");
    }
  }, [firstName]);

  useEffect(() => {
    if (lastName) {
      setLastNameError("");
      setLocalError("");
    }
  }, [lastName]);

  useEffect(() => {
    if (email) {
      setEmailError("");
      setLocalError("");
    }
  }, [email]);

  useEffect(() => {
    if (phone) {
      setPhoneError("");
      setLocalError("");
    }
  }, [phone]);

  useEffect(() => {
    if (password) {
      setPasswordError("");
      setLocalError("");
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 handleSubmit начат');
    setLocalError("");
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");

    // Валидация всех полей
    const firstNameValidationError = validateFirstName(firstName);
    const lastNameValidationError = validateLastName(lastName);
    const emailValidationError = validateEmail(email);
    const phoneValidationError = validatePhone(phone);
    const passwordValidationError = validatePassword(password);

    if (firstNameValidationError) {
      setFirstNameError(firstNameValidationError);
      return;
    }

    if (lastNameValidationError) {
      setLastNameError(lastNameValidationError);
      return;
    }

    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password,
      phone: phone.trim(),
    };

    console.log('🎯 ДАННЫЕ ДЛЯ РЕГИСТРАЦИИ:', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      passwordLength: userData.password.length,
      hasPassword: !!userData.password
    });

    // Проверка email
    if (!userData.email.includes('@')) {
      console.error('❌ Email не содержит @');
      setLocalError("Некорректный email адрес");
      return;
    }

    const result = await user.register(userData);
    console.log('🟢 Результат регистрации:', result);
    
    if (result.success) {
      navigate(SHOP_ROUTE);
    } else {
      setLocalError(result.error || "Ошибка регистрации");
    }
  };

  const errorMessage = localError || user.error;
  const errorId = errorMessage ? "registration-error" : undefined;

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
              Регистрация
            </h1>
          </div>

          {/* Форма */}
          <form className="flex flex-col gap-6 sm:gap-[30px]" onSubmit={handleSubmit} noValidate>
            {/* Сообщения об ошибках */}
            {errorMessage && (
              <div 
                id={errorId}
                role="alert"
                aria-live="assertive"
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm m-0">
                  {errorMessage}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Имя и Фамилия */}
              <div className="flex flex-col sm:flex-row gap-[10px] items-start w-full">
                <div className="flex flex-1 flex-col gap-2 w-full">
                  <label 
                    htmlFor="firstName"
                    className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]"
                  >
                    Имя
                  </label>
                  <div>
                    <TextInput
                      id="firstName"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      bgColor="#e4e2df"
                      required
                      autoComplete="given-name"
                      aria-invalid={!!firstNameError}
                      aria-describedby={firstNameError ? "firstName-error" : undefined}
                    />
                    {firstNameError && (
                      <p 
                        id="firstName-error"
                        role="alert"
                        className="text-red-600 text-xs mt-1 m-0"
                      >
                        {firstNameError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 w-full">
                  <label 
                    htmlFor="lastName"
                    className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]"
                  >
                    Фамилия
                  </label>
                  <div>
                    <TextInput
                      id="lastName"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      bgColor="#e4e2df"
                      required
                      autoComplete="family-name"
                      aria-invalid={!!lastNameError}
                      aria-describedby={lastNameError ? "lastName-error" : undefined}
                    />
                    {lastNameError && (
                      <p 
                        id="lastName-error"
                        role="alert"
                        className="text-red-600 text-xs mt-1 m-0"
                      >
                        {lastNameError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Электронная почта */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="email"
                  className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]"
                >
                  Электронная почта
                </label>
                <div>
                  <Email
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bgColor="#e4e2df"
                    required
                    autoComplete="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  {emailError && (
                    <p 
                      id="email-error"
                      role="alert"
                      className="text-red-600 text-xs mt-1 m-0"
                    >
                      {emailError}
                    </p>
                  )}
                </div>
              </div>

              {/* Телефон */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="phone"
                  className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]"
                >
                  Телефон
                </label>
                <div>
                  <Phone
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    bgColor="#e4e2df"
                    required
                    autoComplete="tel"
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                  />
                  {phoneError && (
                    <p 
                      id="phone-error"
                      role="alert"
                      className="text-red-600 text-xs mt-1 m-0"
                    >
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* Пароль */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="password"
                  className="font-inter font-medium text-[14px] leading-[1.2] text-[#888888]"
                >
                  Пароль
                </label>
                <div>
                  <Password
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bgColor="#e4e2df"
                    required
                    autoComplete="new-password"
                    minLength={6}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                  />
                  {passwordError && (
                    <p 
                      id="password-error"
                      role="alert"
                      className="text-red-600 text-xs mt-1 m-0"
                    >
                      {passwordError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Текст с условиями */}
            <p className="font-inter font-normal text-[12px] leading-[1.2] text-[#888888] m-0">
              Нажимая «Создать аккаунт» выше, вы подтверждаете, что будете получать обновления от команды Center Tkani и что вы прочитали, поняли и согласны с{" "}
              <Link 
                to={TERMS_OF_SERVICE_ROUTE} 
                className="text-[#9b1e1c] underline hover:text-[#860202] transition-colors"
                target="_blank"
              >
                Условиями пользования
              </Link>
              {" "}и{" "}
              <Link 
                to={PRIVACY_POLICY_ROUTE} 
                className="text-[#9b1e1c] underline hover:text-[#860202] transition-colors"
                target="_blank"
              >
                Политикой конфиденциальности
              </Link>
              .
            </p>

            {/* Кнопка Создать аккаунт */}
            <button
              type="submit"
              disabled={user.isLoading}
              aria-label={user.isLoading ? "Выполняется регистрация..." : "Создать аккаунт"}
              aria-describedby={errorId}
              className="bg-[#9b1e1c] h-[40px] min-h-[40px] px-[14px] py-0 rounded-[8px] hover:bg-[#860202] transition-colors font-inter font-medium text-[16px] leading-[1.2] text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#9b1e1c]"
            >
              {user.isLoading ? "Регистрация..." : "Создать аккаунт"}
            </button>
          </form>

          {/* Разделительная линия */}
          <div className="border-t border-[rgba(16,16,16,0.15)] h-px w-full" />

          {/* Уже есть аккаунт? */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-center w-full">
            <p className="font-inter font-medium text-[14px] leading-[1.2] text-[#101010] whitespace-nowrap m-0">
              У вас уже есть аккаунт?
            </p>
            <div className="hidden sm:block flex-1 h-px" />
            <Link to={LOGIN_ROUTE} className="w-full sm:w-auto">
              <button
                type="button"
                className="bg-white border border-[rgba(16,16,16,0.15)] h-[40px] min-h-[40px] px-[17px] py-0 rounded-[8px] hover:bg-[#E4E2DF] transition-colors font-inter font-medium text-[14px] leading-[1.2] text-[#101010] w-full sm:w-auto"
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