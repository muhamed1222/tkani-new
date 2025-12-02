// src/components/personal_account/Personal_account.jsx
import { useState, useContext, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import * as Avatar from "@radix-ui/react-avatar";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Context } from "../../main";
import { authAPI } from "../../http/api";
import { LOGIN_ROUTE } from "../../utils/consts";
import styles from "./Personal_account.module.css";
import api from "../../http/api"; 

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 3.375C5.25 3.375 2.0475 5.67 0.75 8.625C2.0475 11.58 5.25 13.875 9 13.875C12.75 13.875 15.9525 11.58 17.25 8.625C15.9525 5.67 12.75 3.375 9 3.375ZM9 12.375C7.0725 12.375 5.5 10.8025 5.5 8.875C5.5 6.9475 7.0725 5.375 9 5.375C10.9275 5.375 12.5 6.9475 12.5 8.875C12.5 10.8025 10.9275 12.375 9 12.375ZM9 6.75C8.205 6.75 7.5 7.305 7.5 8.0625C7.5 8.82 8.205 9.375 9 9.375C9.795 9.375 10.5 8.82 10.5 8.0625C10.5 7.305 9.795 6.75 9 6.75Z" fill="#888888"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M15.1882 15.7501C15.1143 15.7502 15.0412 15.7357 14.9729 15.7074C14.9047 15.6791 14.8427 15.6376 14.7906 15.5852L2.41558 3.21019C2.31455 3.10384 2.25905 2.96223 2.26093 2.81555C2.26281 2.66887 2.32191 2.52873 2.42564 2.42501C2.52936 2.32128 2.6695 2.26218 2.81618 2.2603C2.96286 2.25842 3.10447 2.31392 3.21082 2.41495L15.5858 14.79C15.6644 14.8686 15.718 14.9688 15.7396 15.0779C15.7613 15.187 15.7502 15.3 15.7076 15.4028C15.6651 15.5055 15.593 15.5934 15.5006 15.6552C15.4081 15.717 15.2994 15.75 15.1882 15.7501ZM8.98875 13.5001C7.53012 13.5001 6.12351 13.0683 4.80797 12.2169C3.61019 11.4434 2.53195 10.3357 1.68961 9.01765V9.01484C2.39062 8.01042 3.15844 7.16105 3.9832 6.4762C3.99066 6.46997 3.99675 6.46225 4.00107 6.45354C4.0054 6.44483 4.00787 6.43532 4.00834 6.4256C4.0088 6.41589 4.00724 6.40618 4.00376 6.3971C4.00028 6.38802 3.99496 6.37976 3.98812 6.37284L3.28781 5.67359C3.27537 5.66104 3.25865 5.65364 3.241 5.65286C3.22334 5.65207 3.20604 5.65797 3.19254 5.66937C2.31644 6.40765 1.50328 7.31327 0.763943 8.37358C0.636743 8.55615 0.566688 8.77242 0.562682 8.99489C0.558676 9.21736 0.620898 9.43601 0.741443 9.62304C1.66992 11.076 2.86488 12.2998 4.1966 13.1615C5.69601 14.1329 7.30969 14.6251 8.98875 14.6251C9.89506 14.6223 10.795 14.4729 11.6536 14.1828C11.6649 14.179 11.6751 14.1723 11.6831 14.1634C11.6911 14.1546 11.6968 14.1438 11.6995 14.1321C11.7022 14.1205 11.7019 14.1083 11.6986 14.0968C11.6953 14.0854 11.6891 14.0749 11.6807 14.0664L10.922 13.3078C10.9045 13.2907 10.8829 13.2785 10.8593 13.2724C10.8357 13.2662 10.8109 13.2663 10.7873 13.2726C10.1998 13.4239 9.59547 13.5003 8.98875 13.5001ZM17.2568 8.38835C16.3266 6.94976 15.1196 5.72773 13.7668 4.85409C12.2702 3.88659 10.6179 3.37507 8.98875 3.37507C8.09204 3.37666 7.202 3.52914 6.3559 3.82613C6.34462 3.83005 6.33453 3.83678 6.32658 3.84568C6.31863 3.85457 6.31307 3.86535 6.31043 3.87699C6.30779 3.88864 6.30816 3.90076 6.3115 3.91221C6.31484 3.92367 6.32105 3.93409 6.32953 3.94249L7.08715 4.70011C7.10478 4.71745 7.12668 4.72983 7.15063 4.736C7.17458 4.74217 7.19973 4.74192 7.22355 4.73527C7.79905 4.57959 8.39257 4.50051 8.98875 4.50007C10.4193 4.50007 11.8216 4.93706 13.1565 5.80085C14.3768 6.58835 15.4677 7.69507 16.3121 9.00007C16.3128 9.00087 16.3131 9.00186 16.3131 9.00288C16.3131 9.0039 16.3128 9.00489 16.3121 9.00569C15.6992 9.97071 14.9385 10.8335 14.0579 11.5626C14.0504 11.5688 14.0442 11.5765 14.0398 11.5853C14.0354 11.594 14.0329 11.6035 14.0324 11.6133C14.0319 11.6231 14.0335 11.6328 14.037 11.6419C14.0404 11.6511 14.0458 11.6594 14.0527 11.6663L14.7523 12.3656C14.7646 12.3781 14.7813 12.3855 14.7988 12.3863C14.8164 12.3872 14.8337 12.3814 14.8472 12.3701C15.7873 11.5786 16.601 10.6482 17.2603 9.61108C17.3768 9.42833 17.4385 9.21595 17.4378 8.9992C17.4372 8.78245 17.3744 8.57044 17.2568 8.38835Z" fill="#888888"/>
    <path d="M9.00071 5.625C8.74791 5.62486 8.4959 5.65317 8.24942 5.70938C8.23697 5.71196 8.22546 5.71787 8.2161 5.72648C8.20675 5.73509 8.1999 5.74608 8.19629 5.75827C8.19269 5.77046 8.19245 5.78341 8.19562 5.79572C8.19878 5.80804 8.20523 5.81926 8.21427 5.8282L12.1725 9.78539C12.1814 9.79443 12.1927 9.80087 12.205 9.80404C12.2173 9.8072 12.2302 9.80697 12.2424 9.80336C12.2546 9.79976 12.2656 9.79291 12.2742 9.78356C12.2828 9.7742 12.2888 9.76268 12.2913 9.75023C12.404 9.25595 12.4039 8.74263 12.291 8.2484C12.1781 7.75416 11.9553 7.29171 11.6392 6.89539C11.3231 6.49906 10.9217 6.17905 10.4649 5.95912C10.0081 5.73919 9.50768 5.62499 9.00071 5.625ZM5.82891 8.21461C5.81997 8.20557 5.80875 8.19913 5.79643 8.19596C5.78412 8.1928 5.77118 8.19303 5.75898 8.19664C5.74679 8.20024 5.7358 8.20709 5.72719 8.21645C5.71858 8.2258 5.71267 8.23732 5.71009 8.24977C5.58259 8.80676 5.5986 9.38701 5.75661 9.93613C5.91463 10.4853 6.20947 10.9853 6.61351 11.3893C7.01756 11.7933 7.51757 12.0882 8.06669 12.2462C8.61581 12.4042 9.19606 12.4202 9.75305 12.2927C9.7655 12.2901 9.77702 12.2842 9.78637 12.2756C9.79573 12.267 9.80258 12.256 9.80618 12.2438C9.80979 12.2316 9.81002 12.2187 9.80686 12.2064C9.80369 12.1941 9.79725 12.1828 9.78821 12.1739L5.82891 8.21461Z" fill="#888888"/>
  </svg>
);

// Диалог подтверждения удаления аккаунта
const DeleteAccountDialog = ({ open, onOpenChange, onConfirm, isDeleting }) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className={styles.dialogOverlay} />
      <AlertDialog.Content className={styles.dialogContent}>
        <AlertDialog.Title className={styles.dialogTitle}>
          Удаление аккаунта
        </AlertDialog.Title>
        <AlertDialog.Description className={styles.dialogDescription}>
          Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить. 
          Все ваши данные, включая заказы и историю, будут безвозвратно удалены.
        </AlertDialog.Description>
        <div className={styles.dialogActions}>
          <AlertDialog.Cancel asChild>
            <button className={styles.dialogCancelButton}>
              Отмена
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button 
              className={styles.dialogConfirmButton}
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Удаление..." : "Удалить аккаунт"}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export const Personal_account = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  
  // Все хуки должны быть объявлены на верхнем уровне, без условий
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPersonalDataChanged, setIsPersonalDataChanged] = useState(false);
  const [isContactDataChanged, setIsContactDataChanged] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [isSavingPersonalData, setIsSavingPersonalData] = useState(false);
  const [isSavingContactData, setIsSavingContactData] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [personalDataError, setPersonalDataError] = useState("");
  const [personalDataSuccess, setPersonalDataSuccess] = useState("");
  const [contactDataError, setContactDataError] = useState("");
  const [contactDataSuccess, setContactDataSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Состояния для работы с аватаром
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Состояния для удаления аккаунта
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  // Исходные значения для сравнения
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");

  // Функция для получения URL аватара
  const getAvatarUrl = () => {
    if (!user.user) {
      console.log('❌ getAvatarUrl - пользователь не загружен');
      return "https://i.pravatar.cc/100";
    }

    console.log('🔄 getAvatarUrl - данные пользователя:', user.user);
    
    // Strapi v4 формат: avatar как объект с data
    if (user.user.avatar) {
      // Формат 1: avatar имеет data и attributes (самый распространенный)
      if (user.user.avatar.data && user.user.avatar.data.attributes) {
        const url = `http://localhost:1339${user.user.avatar.data.attributes.url}`;
        console.log('✅ Аватар найден (формат 1):', url);
        return url;
      }
      
      // Формат 2: avatar имеет url напрямую
      if (user.user.avatar.url) {
        const url = `http://localhost:1339${user.user.avatar.url}`;
        console.log('✅ Аватар найден (формат 2):', url);
        return url;
      }
      
      // Формат 3: avatar - это ID файла
      if (typeof user.user.avatar === 'number') {
        const url = `http://localhost:1339/api/upload/files/${user.user.avatar}`;
        console.log('✅ Аватар найден (формат 3):', url);
        return url;
      }

      // Формат 4: avatar как массив
      if (Array.isArray(user.user.avatar) && user.user.avatar.length > 0) {
        const avatarData = user.user.avatar[0];
        if (avatarData.url) {
          const url = `http://localhost:1339${avatarData.url}`;
          console.log('✅ Аватар найден (формат 4 - массив):', url);
          return url;
        }
      }
    }
    
    // Проверяем альтернативные поля
    if (user.user.avatarUrl) {
      console.log('✅ Аватар найден (avatarUrl):', user.user.avatarUrl);
      return user.user.avatarUrl;
    }
    
    console.log('❌ Аватар не найден, используем fallback');
    return "https://i.pravatar.cc/100"; // fallback аватар
  };

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🔐 Personal_account - проверка авторизации...');
        
        // Если пользователь не загружен, проверяем авторизацию
        if (!user.user || Object.keys(user.user).length === 0) {
          console.log('🔄 Personal_account - пользователь не загружен, проверяем auth...');
          await user.checkAuth();
        }
        
        // Если после проверки пользователь все еще не авторизован, редирект
        if (!user.isAuth) {
          console.log('❌ Personal_account - пользователь не авторизован, редирект...');
          navigate(LOGIN_ROUTE);
          return;
        }
        
        console.log('✅ Personal_account - пользователь авторизован:', user.user);
        
      } catch (error) {
        console.error('❌ Personal_account - ошибка проверки авторизации:', error);
        navigate(LOGIN_ROUTE);
      } finally {
        setIsPageLoading(false);
      }
    };

    checkAuthentication();
  }, [user, navigate]);

  // Синхронизация данных из store - ОДИН useEffect
  useEffect(() => {
    if (user.user && user.isAuth) {
      console.log('🔄 Personal_account - синхронизация данных пользователя');
      const firstNameValue = user.user.firstName || user.user.first_name || "";
      const lastNameValue = user.user.lastName || user.user.last_name || "";
      const emailValue = user.user.email || "";
      const phoneValue = user.user.phone || user.user.phoneNumber || "";
      
      setFirstName(firstNameValue);
      setLastName(lastNameValue);
      setEmail(emailValue);
      setPhone(phoneValue);
      setOriginalFirstName(firstNameValue);
      setOriginalLastName(lastNameValue);
      setOriginalEmail(emailValue);
      setOriginalPhone(phoneValue);
    }
  }, [user.user, user.isAuth]);

  // Проверка изменений личных данных
  useEffect(() => {
    const hasChanged = firstName !== originalFirstName || lastName !== originalLastName;
    setIsPersonalDataChanged(hasChanged);
    if (hasChanged) {
      setPersonalDataError("");
      setPersonalDataSuccess("");
    }
  }, [firstName, lastName, originalFirstName, originalLastName]);

  // Проверка изменений контактных данных
  useEffect(() => {
    const hasChanged = email !== originalEmail || phone !== originalPhone;
    setIsContactDataChanged(hasChanged);
    if (hasChanged) {
      setContactDataError("");
      setContactDataSuccess("");
      setEmailError("");
      setEmailSuccess("");
    }
  }, [email, phone, originalEmail, originalPhone]);

  // Очистка ошибок при изменении полей
  useEffect(() => {
    if (firstName) setFirstNameError("");
  }, [firstName]);

  useEffect(() => {
    if (lastName) setLastNameError("");
  }, [lastName]);

  useEffect(() => {
    if (email) setEmailError("");
  }, [email]);

  useEffect(() => {
    if (phone) setPhoneError("");
  }, [phone]);

  useEffect(() => {
    if (newPassword) setNewPasswordError("");
    if (confirmPassword) setConfirmPasswordError("");
  }, [newPassword, confirmPassword]);

  // Валидация имени
  const validateFirstName = (value) => {
    if (!value.trim()) {
      return "Имя обязательно для заполнения";
    }
    if (value.trim().length < 2) {
      return "Имя должно содержать минимум 2 символа";
    }
    return "";
  };

  // Валидация фамилии
  const validateLastName = (value) => {
    if (!value.trim()) {
      return "Фамилия обязательна для заполнения";
    }
    if (value.trim().length < 2) {
      return "Фамилия должна содержать минимум 2 символа";
    }
    return "";
  };

  // Валидация email
  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Email обязателен для заполнения";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Введите корректный email адрес";
    }
    return "";
  };

  // Валидация телефона
  const validatePhone = (value) => {
    if (!value.trim()) {
      return ""; // Телефон не обязателен
    }
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return "Введите корректный номер телефона";
    }
    return "";
  };

  // Валидация пароля
  const validatePassword = (value) => {
    if (!value) {
      return "Пароль обязателен для заполнения";
    }
    if (value.length < 6) {
      return "Пароль должен содержать минимум 6 символов";
    }
    return "";
  };

  // Обработчик клика по аватару
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Обработчик выбора файла
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Разрешены только файлы JPG, JPEG и PNG");
      setTimeout(() => setAvatarError(""), 5000);
      return;
    }

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Размер файла не должен превышать 5MB");
      setTimeout(() => setAvatarError(""), 5000);
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError("");
    setAvatarSuccess("");

    try {
      const result = await user.uploadAvatar(file);
      if (result.success) {
        setAvatarSuccess(result.message || "Аватар успешно обновлен");
        setTimeout(() => setAvatarSuccess(""), 5000);
      } else {
        setAvatarError(result.error || "Ошибка загрузки аватара");
        setTimeout(() => setAvatarError(""), 5000);
      }
    } catch (error) {
      setAvatarError("Ошибка загрузки аватара");
      setTimeout(() => setAvatarError(""), 5000);
    } finally {
      setIsUploadingAvatar(false);
      // Очищаем input для возможности выбора того же файла снова
      event.target.value = "";
    }
  };

  const handleSavePersonalData = async (e) => {
    e.preventDefault();
    console.log('🔵 handleSavePersonalData - начало', { firstName, lastName });
    setPersonalDataError("");
    setPersonalDataSuccess("");

    // Валидация
    const firstNameValidation = validateFirstName(firstName);
    const lastNameValidation = validateLastName(lastName);

    if (firstNameValidation) {
      setFirstNameError(firstNameValidation);
      return;
    }
    setFirstNameError("");

    if (lastNameValidation) {
      setLastNameError(lastNameValidation);
      return;
    }
    setLastNameError("");

    setIsSavingPersonalData(true);

    try {
      console.log('🔵 handleSavePersonalData - вызов user.updateProfile с данными:', { firstName, lastName });
      
      const result = await user.updateProfile({ 
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      console.log('🟢 handleSavePersonalData - результат:', result);
      
      if (result.success) {
        setPersonalDataSuccess("Личные данные успешно обновлены");
        setIsPersonalDataChanged(false);
        setOriginalFirstName(firstName);
        setOriginalLastName(lastName);
        // Обновляем данные пользователя
        await user.checkAuth();
        setTimeout(() => setPersonalDataSuccess(""), 5000);
      } else {
        console.error('❌ handleSavePersonalData - ошибка:', result.error);
        setPersonalDataError(result.error || "Ошибка обновления данных");
        setTimeout(() => setPersonalDataError(""), 5000);
      }
    } catch (error) {
      console.error('🔴 handleSavePersonalData - исключение:', error);
      setPersonalDataError(error.message || "Ошибка обновления данных");
      setTimeout(() => setPersonalDataError(""), 5000);
    } finally {
      setIsSavingPersonalData(false);
    }
  };

  const handleSaveContactData = async (e) => {
    e.preventDefault();
    console.log('🔵 handleSaveContactData - начало', { email, phone });
    setContactDataError("");
    setContactDataSuccess("");
    setEmailError("");
    setEmailSuccess("");

    // Валидация
    const emailValidation = validateEmail(email);
    const phoneValidation = validatePhone(phone);

    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    setEmailError("");

    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }
    setPhoneError("");

    setIsSavingContactData(true);

    try {
      console.log('🔵 handleSaveContactData - вызов user.updateProfile с данными:', { email, phone });
      
      const result = await user.updateProfile({ 
        email: email.trim(),
        phone: phone.trim()
      });
      console.log('🟢 handleSaveContactData - результат:', result);
      
      if (result.success) {
        setContactDataSuccess("Контактные данные успешно обновлены");
        setIsContactDataChanged(false);
        setOriginalEmail(email);
        setOriginalPhone(phone);
        // Обновляем данные пользователя
        await user.checkAuth();
        setTimeout(() => setContactDataSuccess(""), 5000);
      } else {
        console.error('❌ handleSaveContactData - ошибка:', result.error);
        setContactDataError(result.error || "Ошибка обновления контактных данных");
        setTimeout(() => setContactDataError(""), 5000);
      }
    } catch (error) {
      console.error('🔴 handleSaveContactData - исключение:', error);
      setContactDataError(error.message || "Ошибка обновления контактных данных");
      setTimeout(() => setContactDataError(""), 5000);
    } finally {
      setIsSavingContactData(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    // Валидация
    if (!oldPassword) {
      setPasswordError("Введите старый пароль");
      return;
    }

    const newPasswordValidation = validatePassword(newPassword);
    if (newPasswordValidation) {
      setNewPasswordError(newPasswordValidation);
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Пароли не совпадают");
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await user.changePassword(oldPassword, newPassword);
      if (result.success) {
        setPasswordSuccess("Пароль успешно изменен");
        setIsPasswordChanged(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(""), 5000);
      } else {
        setPasswordError(result.error || "Ошибка смены пароля");
        setTimeout(() => setPasswordError(""), 5000);
      }
    } catch (error) {
      setPasswordError(error.message || "Ошибка смены пароля");
      setTimeout(() => setPasswordError(""), 5000);
    } finally {
      setIsChangingPassword(false);
    }
  };

const handleDeleteAccount = async () => {
  setIsDeletingAccount(true);
  setDeleteAccountError("");

  try {
    console.log('🗑️ Начало удаления аккаунта - используем прямой метод');
    
    const result = await user.deleteAccountDirect();
    
    console.log('🗑️ Результат удаления:', result);
    
    if (result.success) {
      console.log('✅ Аккаунт успешно удален');
      setIsDeleteDialogOpen(false);
      navigate(LOGIN_ROUTE);
    } else {
      throw new Error(result.error || 'Ошибка удаления аккаунта');
    }
  } catch (error) {
    console.error('❌ Ошибка удаления аккаунта:', error);
    setDeleteAccountError(error.message || 'Произошла ошибка при удалении аккаунта');
  } finally {
    setIsDeletingAccount(false);
  }
};

  // Открытие диалога удаления
  const openDeleteDialog = () => {
    setDeleteAccountError("");
    setIsDeleteDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await user.logout();
      navigate(LOGIN_ROUTE);
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  // Показываем загрузку пока страница не готова
  if (isPageLoading || user.isLoading) {
    return (
      <section className={styles.account_container}>
        <div className={styles.loading}>
          <p>Загрузка...</p>
        </div>
      </section>
    );
  }

  // Если пользователь не авторизован, не показываем содержимое
  if (!user.isAuth) {
    return null; // или редирект уже произошел
  }

  // Основной рендер компонента
  return (
    <section className={styles.account_container} aria-labelledby="account-heading">
      <h3 id="account-heading" className={styles.title}>Личный кабинет</h3>
      
      <div className={styles.content}>
        {/* Личные данные */}
        <section className={styles.section} aria-labelledby="personal-data-heading">
          <div className={styles.header}>
            <h5 id="personal-data-heading">Личные данные</h5>
            <button 
              type="button" 
              onClick={handleSavePersonalData}
              disabled={!isPersonalDataChanged || isSavingPersonalData}
              className={`${styles.saveButton} ${isPersonalDataChanged ? styles.saveButtonActive : ""}`}
              aria-label="Сохранить личные данные"
            >
              {isSavingPersonalData ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

          <div className={styles.photo_section}>
            <Avatar.Root 
              className={styles.avatar}
              onClick={handleAvatarClick}
              style={{ cursor: 'pointer' }}
            >
              <Avatar.Image
                className={styles.avatarImage}
                src={getAvatarUrl()}
                alt="Фото пользователя"
                onError={(e) => {
                  e.target.src = "https://i.pravatar.cc/100";
                }}
              />
              <Avatar.Fallback className={styles.avatarFallback} delayMs={600}>
                {user.user?.firstName?.[0] || user.user?.first_name?.[0] || user.user?.email?.[0] || "U"}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className={styles.photo_actions}>
              <button
                type="button"
                onClick={handleAvatarClick}
                className={styles.uploadPhotoButton}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? "Загрузка..." : "Загрузить фотографию"}
              </button>
              <p className={styles.photoHint}>
                Рекомендованный размер 160×160px в формате PNG или JPG
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png"
                style={{ display: 'none' }}
                aria-label="Выберите файл для загрузки аватара"
              />
            </div>
          </div>

          {/* Сообщения для аватара */}
          {avatarError && (
            <div className={styles.message} role="alert" aria-live="assertive">
              <p className={styles.errorMessage}>{avatarError}</p>
            </div>
          )}
          {avatarSuccess && (
            <div className={styles.message} role="status" aria-live="polite">
              <p className={styles.successMessage}>{avatarSuccess}</p>
            </div>
          )}
          
          {/* Сообщения для сохранения личных данных */}
          {personalDataError && (
            <div className={styles.message} role="alert" aria-live="assertive">
              <p className={styles.errorMessage}>{personalDataError}</p>
            </div>
          )}
          {personalDataSuccess && (
            <div className={styles.message} role="status" aria-live="polite">
              <p className={styles.successMessage}>{personalDataSuccess}</p>
            </div>
          )}
          <div className={styles.name_fields}>
            <div className={styles.field}>
              <label htmlFor="firstname">Имя</label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                className={`${styles.input} ${firstNameError ? styles.inputError : ""}`}
                aria-invalid={!!firstNameError}
                aria-describedby={firstNameError ? "firstname-error" : undefined}
                disabled={isSavingPersonalData}
              />
              {firstNameError && (
                <p id="firstname-error" className={styles.fieldError} role="alert">
                  {firstNameError}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="lastname">Фамилия</label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                className={`${styles.input} ${lastNameError ? styles.inputError : ""}`}
                aria-invalid={!!lastNameError}
                aria-describedby={lastNameError ? "lastname-error" : undefined}
                disabled={isSavingPersonalData}
              />
              {lastNameError && (
                <p id="lastname-error" className={styles.fieldError} role="alert">
                  {lastNameError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Контактные данные с почтой и телефоном на одной строке */}
        <section className={styles.section} aria-labelledby="contact-data-heading">
          <div className={styles.header}>
            <h5 id="contact-data-heading">Контактные данные</h5>
            <button 
              type="button" 
              onClick={handleSaveContactData}
              disabled={!isContactDataChanged || isSavingContactData}
              className={`${styles.saveButton} ${isContactDataChanged ? styles.saveButtonActive : ""}`}
              aria-label="Сохранить контактные данные"
            >
              {isSavingContactData ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

          {/* Сообщения об ошибках и успехе */}
          {contactDataError && (
            <div className={styles.message} role="alert" aria-live="assertive">
              <p className={styles.errorMessage}>{contactDataError}</p>
            </div>
          )}
          {contactDataSuccess && (
            <div className={styles.message} role="status" aria-live="polite">
              <p className={styles.successMessage}>{contactDataSuccess}</p>
            </div>
          )}

          <div className={styles.contact_fields}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className={`${styles.input} ${emailError ? styles.inputError : ""}`}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                disabled={isSavingContactData}
              />
              {emailError && (
                <p id="email-error" className={styles.fieldError} role="alert">
                  {emailError}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="phone">Телефон</label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
                placeholder="+7 (999) 999-99-99"
                className={`${styles.input} ${phoneError ? styles.inputError : ""}`}
                aria-invalid={!!phoneError}
                aria-describedby={phoneError ? "phone-error" : undefined}
                disabled={isSavingContactData}
              />
              {phoneError && (
                <p id="phone-error" className={styles.fieldError} role="alert">
                  {phoneError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Смена пароля */}
        <section className={styles.section} aria-labelledby="password-heading">
          <div className={styles.header}>
            <h5 id="password-heading">Смена пароля</h5>
            <button 
              type="button" 
              onClick={handleChangePassword}
              disabled={!isPasswordChanged || isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
              className={`${styles.saveButton} ${isPasswordChanged ? styles.saveButtonActive : ""}`}
              aria-label="Обновить пароль"
            >
              {isChangingPassword ? "Обновление..." : "Обновить пароль"}
            </button>
          </div>

          {/* Сообщения об ошибках и успехе */}
          {passwordError && (
            <div className={styles.message} role="alert" aria-live="assertive">
              <p className={styles.errorMessage}>{passwordError}</p>
            </div>
          )}
          {passwordSuccess && (
            <div className={styles.message} role="status" aria-live="polite">
              <p className={styles.successMessage}>{passwordSuccess}</p>
            </div>
          )}

          <div className={styles.password_fields}>
            <div className={styles.field}>
              <label htmlFor="oldPassword">Старый пароль</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setIsPasswordChanged(true);
                    setPasswordError("");
                  }}
                  className={styles.passwordInput}
                  disabled={isChangingPassword}
                  aria-label="Старый пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className={styles.eyeButton}
                  aria-label={showOldPassword ? "Скрыть пароль" : "Показать пароль"}
                  tabIndex={0}
                >
                  {showOldPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="newPassword">Новый пароль</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setIsPasswordChanged(true);
                  }}
                  className={`${styles.passwordInput} ${newPasswordError ? styles.inputError : ""}`}
                  aria-invalid={!!newPasswordError}
                  aria-describedby={newPasswordError ? "newpassword-error" : undefined}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={styles.eyeButton}
                  aria-label={showNewPassword ? "Скрыть пароль" : "Показать пароль"}
                  tabIndex={0}
                >
                  {showNewPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
              {newPasswordError && (
                <p id="newpassword-error" className={styles.fieldError} role="alert">
                  {newPasswordError}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setIsPasswordChanged(true);
                  }}
                  className={`${styles.passwordInput} ${confirmPasswordError ? styles.inputError : ""}`}
                  aria-invalid={!!confirmPasswordError}
                  aria-describedby={confirmPasswordError ? "confirmpassword-error" : undefined}
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.eyeButton}
                  aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
              {confirmPasswordError && (
                <p id="confirmpassword-error" className={styles.fieldError} role="alert">
                  {confirmPasswordError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Выход из аккаунта и удаление */}
        <section className={styles.section}>
          <div className={styles.logout_section}>
            <button
              type="button"
              onClick={openDeleteDialog}
              className={styles.deleteButton}
              aria-label="Удалить аккаунт"
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? "Удаление..." : "Удалить аккаунт"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutButton}
              aria-label="Выйти из аккаунта"
            >
              Выйти
            </button>
          </div>
          
          {/* Сообщение об ошибке удаления */}
          {deleteAccountError && (
            <div className={styles.message} role="alert" aria-live="assertive">
              <p className={styles.errorMessage}>{deleteAccountError}</p>
            </div>
          )}
        </section>
      </div>

      {/* Диалог подтверждения удаления аккаунта */}
      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </section>
  );
});