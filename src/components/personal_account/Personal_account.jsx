import { useState, useContext, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import * as Avatar from "@radix-ui/react-avatar";
import { Context } from "../../main";
import styles from "./Personal_account.module.css";

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3.75C5.25 3.75 2.0475 6.045 0.75 9C2.0475 11.955 5.25 14.25 9 14.25C12.75 14.25 15.9525 11.955 17.25 9C15.9525 6.045 12.75 3.75 9 3.75ZM9 12.75C7.0725 12.75 5.5 11.1775 5.5 9.25C5.5 7.3225 7.0725 5.75 9 5.75C10.9275 5.75 12.5 7.3225 12.5 9.25C12.5 11.1775 10.9275 12.75 9 12.75ZM9 7C7.62 7 6.5 8.12 6.5 9.5C6.5 10.88 7.62 12 9 12C10.38 12 11.5 10.88 11.5 9.5C11.5 8.12 10.38 7 9 7Z" fill="#888888"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3.75C5.25 3.75 2.0475 6.045 0.75 9C2.0475 11.955 5.25 14.25 9 14.25C12.75 14.25 15.9525 11.955 17.25 9C15.9525 6.045 12.75 3.75 9 3.75ZM9 12.75C7.0725 12.75 5.5 11.1775 5.5 9.25C5.5 7.3225 7.0725 5.75 9 5.75C10.9275 5.75 12.5 7.3225 12.5 9.25C12.5 11.1775 10.9275 12.75 9 12.75ZM9 7C7.62 7 6.5 8.12 6.5 9.5C6.5 10.88 7.62 12 9 12C10.38 12 11.5 10.88 11.5 9.5C11.5 8.12 10.38 7 9 7Z" fill="#888888"/>
    <path d="M1.5 1.5L16.5 16.5M0.75 9C2.0475 6.045 5.25 3.75 9 3.75C10.1775 3.75 11.295 4.005 12.315 4.4475M17.25 9C15.9525 11.955 12.75 14.25 9 14.25C7.8225 14.25 6.705 13.995 5.685 13.5525M6.375 6.375C5.835 6.915 5.5 7.665 5.5 8.5C5.5 10.4275 7.0725 12 9 12C9.835 12 10.585 11.665 11.125 11.125M12.5 9.5C12.5 10.88 11.38 12 10 12" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Personal_account = observer(() => {
  const { user } = useContext(Context);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPersonalDataChanged, setIsPersonalDataChanged] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const fileInputRef = useRef(null);

  // Синхронизация данных из store
  useEffect(() => {
    if (user.user) {
      setFirstName(user.user.firstName || user.user.first_name || "");
      setLastName(user.user.lastName || user.user.last_name || "");
      setEmail(user.user.email || "");
    }
  }, [user.user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Реализовать загрузку аватара через API
      console.log("File selected:", file);
    }
  };

  const handleSavePersonalData = async (e) => {
    e.preventDefault();
    setIsPersonalDataChanged(false);
    // TODO: Реализовать обновление данных через API
    try {
      // await user.updateProfile({ firstName, lastName });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setIsEmailChanged(false);
    // TODO: Реализовать обновление email через API
    try {
      // await user.updateEmail(email);
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    
    if (newPassword.length < 6) {
      alert("Пароль должен содержать минимум 6 символов");
      return;
    }
    
    setIsPasswordChanged(false);
    // TODO: Реализовать смену пароля через API
    try {
      // await user.changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <div className={styles.account_container}>
      <h3 className={styles.title}>Личный кабинет</h3>
      
      <div className={styles.content}>
        {/* Личные данные */}
        <div className={styles.section}>
          <div className={styles.header}>
            <h5>Личные данные</h5>
            <button 
              type="button" 
              onClick={handleSavePersonalData}
              className={`${styles.saveButton} ${isPersonalDataChanged ? styles.saveButtonActive : ""}`}
            >
              Сохранить
            </button>
          </div>
          <div className={styles.photo_section}>
            <Avatar.Root className={styles.avatar}>
              <Avatar.Image
                className={styles.avatarImage}
                src={user.user?.avatar || "https://i.pravatar.cc/100"}
                alt="Фото пользователя"
              />
              <Avatar.Fallback className={styles.avatarFallback} delayMs={600}>
                {user.user?.firstName?.[0] || user.user?.first_name?.[0] || user.user?.email?.[0] || "U"}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className={styles.photo_actions}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={styles.uploadButton}
              >
                Загрузить фотографию
              </button>
              <p className={styles.photoHint}>Рекомендованный размер 160х160px in PNG or JPG format</p>
            </div>
          </div>
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
                  setIsPersonalDataChanged(true);
                }}
                className={styles.input}
              />
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
                  setIsPersonalDataChanged(true);
                }}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Почта */}
        <div className={styles.section}>
          <div className={styles.header}>
            <h5>Почта</h5>
            <button 
              type="button" 
              onClick={handleSaveEmail}
              className={`${styles.saveButton} ${isEmailChanged ? styles.saveButtonActive : ""}`}
            >
              Сохранить
            </button>
          </div>
          <div className={styles.email_field}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsEmailChanged(true);
              }}
              className={styles.input}
            />
          </div>
        </div>

        {/* Смена пароля */}
        <div className={styles.section}>
          <div className={styles.header}>
            <h5>Смена пароля</h5>
            <button 
              type="button" 
              onClick={handleChangePassword}
              className={`${styles.saveButton} ${isPasswordChanged ? styles.saveButtonActive : ""}`}
            >
              Обновить пароль
            </button>
          </div>
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
                  }}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className={styles.eyeButton}
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
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={styles.eyeButton}
                >
                  {showNewPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
              <div className={`${styles.passwordInputWrapper} ${styles.passwordInputWrapperDisabled}`}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setIsPasswordChanged(true);
                  }}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.eyeButton}
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});