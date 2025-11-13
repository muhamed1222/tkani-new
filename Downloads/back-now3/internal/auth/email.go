package auth

import (
	"fmt"
	"strconv"
	"tropa-nartov-backend/internal/config"

	"gopkg.in/gomail.v2"
)

// SendPasswordResetEmail отправляет email с кодом сброса пароля
func SendPasswordResetEmail(cfg *config.Config, email, code string) error {
	// Всегда пытаемся отправить email, если SMTP настроен
	// Создаем сообщение
	m := gomail.NewMessage()
	m.SetHeader("From", cfg.SMTPFrom)
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Код для сброса пароля - Tropa Nartov")

	// Тело письма с кодом
	body := fmt.Sprintf(`
		<h2>Код для сброса пароля</h2>
		<p>Вы запросили сброс пароля для вашего аккаунта.</p>
		<p><strong>Ваш код для сброса пароля:</strong></p>
		<p style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">%s</p>
		<p>Введите этот код в приложении для сброса пароля.</p>
		<p>Код действителен в течение 15 минут.</p>
		<p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
		<hr>
		<p style="color: #666; font-size: 12px;">Это письмо отправлено с адреса %s</p>
	`, code, cfg.SMTPFrom)

	m.SetBody("text/html", body)

	// Настройка SMTP - пробуем разные порты для Яндекс
	var port int
	var useSSL bool

	if cfg.SMTPPort != "" {
		if p, err := strconv.Atoi(cfg.SMTPPort); err == nil {
			port = p
		} else {
			port = 465 // По умолчанию
		}
	} else {
		port = 465 // По умолчанию
	}

	// Для порта 465 используем SSL, для 587 - STARTTLS
	useSSL = (port == 465)

	// Настройка диалера для Яндекс почты
	d := gomail.NewDialer(cfg.SMTPHost, port, cfg.SMTPUsername, cfg.SMTPPassword)
	if useSSL {
		d.SSL = true
	}

	// log.Printf("📧 Попытка отправки email на %s через %s:%d (SSL: %v)", email, cfg.SMTPHost, port, useSSL)

	// Отправляем письмо
	err := d.DialAndSend(m)
	if err != nil {
		// Если порт 465 не работает, пробуем 587
		if port == 465 && (err.Error() == "dial tcp :465: connect: connection refused" ||
			err.Error() == "x509: certificate signed by unknown authority" ||
			err.Error() == "dial tcp: lookup smtp.yandex.ru: no such host") {
			// log.Printf("⚠️  Порт 465 не работает, пробуем порт 587...")

			// Пробуем порт 587
			d587 := gomail.NewDialer(cfg.SMTPHost, 587, cfg.SMTPUsername, cfg.SMTPPassword)
			d587.SSL = false // STARTTLS

			// log.Printf("📧 Попытка отправки email на %s через %s:587 (STARTTLS)", email, cfg.SMTPHost)
			err = d587.DialAndSend(m)

			if err == nil {
				// log.Printf("✅ Email успешно отправлен через порт 587. Рекомендуется установить SMTP_PORT=587 в .env")
			}
		}

		if err != nil {
			// log.Printf("❌ Ошибка отправки email: %v", err)
			// log.Printf("🔐 Код для %s: %s", email, code)
			// log.Printf("💡 Проверьте:")
			// log.Printf("   - SMTP настройки в .env файле")
			// log.Printf("   - Используете ли вы пароль приложения (не обычный пароль)")
			// log.Printf("   - Интернет-соединение")
			// log.Printf("   - Попробуйте SMTP_PORT=587 в .env")

			if cfg.Debug || cfg.Environment == "development" {
				// В dev режиме не возвращаем ошибку, код сохранен в БД
				return nil
			}
			return fmt.Errorf("ошибка отправки email: %w", err)
		}
	}

	// log.Printf("✅ Email с кодом сброса пароля отправлен на %s с адреса %s", email, cfg.SMTPFrom)
	return nil
}
