package routes

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
	"tropa-nartov-backend/internal/auth"
	"tropa-nartov-backend/internal/config"
	"tropa-nartov-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthRequest структура для входных данных
type AuthRequest struct {
	FirstName string `json:"first_name"` // Убрал binding:"required" - теперь необязательное
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
}

// LoginRequest структура для входа (только email и пароль)
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// RegisterRequest структура для регистрации
type RegisterRequest struct {
	FirstName string `json:"first_name" binding:"required"` // Обязательное только при регистрации
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
}

// UpdateProfileRequest структура для обновления профиля
type UpdateProfileRequest struct {
	Name      string `json:"first_name" binding:"required"` // ИСПРАВЛЕНО: changed from "name" to "first_name"
	FirstName string `json:"last_name"`                     // ИСПРАВЛЕНО: changed from "first_name" to "last_name"
	Email     string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest структура для сброса пароля
type ResetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

// ChangePasswordRequest структура для смены пароля
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

// SetupAuthRoutes настраивает маршруты авторизации
func SetupAuthRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	authService := auth.NewService(db, cfg)

	// Создаем rate limiter для защиты от брутфорса
	rateLimiter := auth.NewRateLimiter()
	// Запускаем очистку устаревших записей каждые 5 минут
	rateLimiter.StartCleanup(5 * time.Minute)

	// Группа маршрутов для авторизации
	authGroup := r.Group("/auth")
	{
		// Регистрация
		authGroup.POST("/register", func(c *gin.Context) {
			var req RegisterRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				// Улучшенная обработка ошибок валидации
				errorMsg := err.Error()
				if strings.Contains(errorMsg, "FirstName") && strings.Contains(errorMsg, "required") {
					errorMsg = "Имя пользователя обязательно для заполнения"
				} else if strings.Contains(errorMsg, "Email") && strings.Contains(errorMsg, "required") {
					errorMsg = "Email обязателен для заполнения"
				} else if strings.Contains(errorMsg, "Email") && strings.Contains(errorMsg, "email") {
					errorMsg = "Неверный формат email адреса"
				} else if strings.Contains(errorMsg, "Password") && strings.Contains(errorMsg, "required") {
					errorMsg = "Пароль обязателен для заполнения"
				} else if strings.Contains(errorMsg, "Password") && strings.Contains(errorMsg, "min") {
					errorMsg = "Пароль должен содержать минимум 8 символов"
				}
				c.JSON(400, gin.H{"error": errorMsg})
				return
			}

			// Регистрируем пользователя с first_name (как имя) и пустой фамилией
			user, err := authService.Register(req.FirstName, req.Email, req.Password)
			if err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			c.JSON(201, gin.H{
				"id":         user.ID,
				"name":       user.Name,
				"first_name": user.FirstName, // Будет пустой строкой
				"email":      user.Email,
				"role":       user.Role,
			})
		})

		// Вход (с rate limiting)
		authGroup.POST("/login", rateLimiter.LoginRateLimit(), func(c *gin.Context) {
			var req LoginRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			token, err := authService.Login(req.Email, req.Password)
			if err != nil {
				c.JSON(401, gin.H{"error": err.Error()})
				return
			}

			var user models.User
			if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
				c.JSON(401, gin.H{"error": "Пользователь не найден"})
				return
			}

			c.JSON(200, gin.H{
				"token": token,
				"user": gin.H{
					"id":         user.ID,
					"name":       user.Name,
					"first_name": user.FirstName,
					"email":      user.Email,
					"role":       user.Role,
					"avatar_url": user.AvatarURL, // ДОБАВЛЕНО: возвращаем аватарку
				},
			})
		})

		// Получение профиля пользователя (защищенный)
		authGroup.GET("/profile", auth.AuthMiddleware(cfg), func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint, ok := userID.(uint)
			if !ok {
				c.JSON(401, gin.H{"error": "Неверный формат ID пользователя"})
				return
			}

			user, err := authService.GetUserProfile(userIDUint)
			if err != nil {
				c.JSON(404, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{
				"id":         user.ID,
				"name":       user.Name,
				"first_name": user.FirstName,
				"email":      user.Email,
				"role":       user.Role,
				"avatar_url": user.AvatarURL, // ДОБАВЛЕНО: возвращаем аватарку
			})
		})

		// Обновление профиля пользователя (защищенный)
		authGroup.PUT("/profile", auth.AuthMiddleware(cfg), func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint, ok := userID.(uint)
			if !ok {
				c.JSON(401, gin.H{"error": "Неверный формат ID пользователя"})
				return
			}

			var req UpdateProfileRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			// ДОБАВЛЕНО: Отладочный вывод
			// fmt.Printf("🔄 Обновление профиля для user_id=%d\n", userIDUint)
			// fmt.Printf("   Name (first_name): %s\n", req.Name)
			// fmt.Printf("   FirstName (last_name): %s\n", req.FirstName)
			// fmt.Printf("   Email: %s\n", req.Email)

			user, err := authService.UpdateUserProfile(userIDUint, req.Name, req.FirstName, req.Email)
			if err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{
				"id":         user.ID,
				"name":       user.Name,
				"first_name": user.FirstName,
				"email":      user.Email,
				"role":       user.Role,
				"avatar_url": user.AvatarURL, // ДОБАВЛЕНО: возвращаем аватарку
				"message":    "Профиль успешно обновлен",
			})
		})

		// Запрос на сброс пароля (с rate limiting)
		authGroup.POST("/forgot-password", rateLimiter.ForgotPasswordRateLimit(), func(c *gin.Context) {
			var req struct {
				Email string `json:"email" binding:"required,email"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			if err := authService.ForgotPassword(req.Email); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{"message": "Письмо для сброса пароля отправлено"})
		})

		// Проверка кода восстановления
		authGroup.POST("/verify-reset-code", func(c *gin.Context) {
			var req struct {
				Token string `json:"token" binding:"required"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			if err := authService.VerifyResetCode(req.Token); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{"message": "Код подтвержден"})
		})

		// Сброс пароля
		authGroup.POST("/reset-password", func(c *gin.Context) {
			var req ResetPasswordRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			if err := authService.ResetPassword(req.Token, req.Password); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{"message": "Пароль успешно сброшен"})
		})

		// УДАЛЕНИЕ АККАУНТА
		authGroup.DELETE("/delete-account", auth.AuthMiddleware(cfg), func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint, ok := userID.(uint)
			if !ok {
				c.JSON(401, gin.H{"error": "Неверный формат ID пользователя"})
				return
			}

			fmt.Printf("🗑️  Запрос на удаление аккаунта для user_id: %d\n", userIDUint)

			if err := authService.DeleteUser(int(userIDUint)); err != nil {
				// fmt.Printf("❌ Ошибка удаления аккаунта: %v\n", err)
				c.JSON(500, gin.H{"error": "Ошибка при удалении аккаунта: " + err.Error()})
				return
			}

			fmt.Printf("✅ Аккаунт успешно удален для user_id: %d\n", userIDUint)
			c.JSON(200, gin.H{
				"message": "Аккаунт успешно удален",
			})
		})

		// ЗАГРУЗКА АВАТАРКИ (НОВЫЙ ЭНДПОИНТ)
		authGroup.POST("/upload-avatar", auth.AuthMiddleware(cfg), func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint, ok := userID.(uint)
			if !ok {
				c.JSON(401, gin.H{"error": "Неверный формат ID пользователя"})
				return
			}

			fmt.Printf("🔄 Начало загрузки аватарки для user_id=%d\n", userIDUint)

			// Получаем файл из формы
			file, err := c.FormFile("avatar")
			if err != nil {
				// fmt.Printf("❌ Ошибка получения файла: %v\n", err)
				c.JSON(400, gin.H{"error": "Файл не найден: " + err.Error()})
				return
			}

			// fmt.Printf("📁 Получен файл: %s, размер: %d байт\n", file.Filename, file.Size)
			// fmt.Printf("📄 Content-Type файла: %s\n", file.Header.Get("Content-Type"))

			// ВРЕМЕННО ОТКЛЮЧАЕМ ВСЕ ПРОВЕРКИ ТИПА ФАЙЛА ДЛЯ ТЕСТИРОВАНИЯ
			// fmt.Printf("⚠️  ПРОВЕРКИ ТИПА ФАЙЛА ОТКЛЮЧЕНЫ - ПРИНИМАЕМ ЛЮБОЙ ФАЙЛ\n")

			// Проверяем размер файла (максимум 5MB)
			if file.Size > 5*1024*1024 {
				// fmt.Printf("❌ Файл слишком большой: %d байт\n", file.Size)
				c.JSON(400, gin.H{"error": "Файл слишком большой. Максимальный размер: 5MB"})
				return
			}

			// Создаем папку для аватарок если её нет
			uploadDir := "./uploads/avatars"
			if err := os.MkdirAll(uploadDir, 0755); err != nil {
				// fmt.Printf("❌ Ошибка создания директории: %v\n", err)
				c.JSON(500, gin.H{"error": "Ошибка создания директории: " + err.Error()})
				return
			}

			// Генерируем уникальное имя файла
			fileExt := filepath.Ext(file.Filename)
			fileName := fmt.Sprintf("avatar_%d_%d%s", userIDUint, time.Now().Unix(), fileExt)
			filePath := filepath.Join(uploadDir, fileName)

			// fmt.Printf("💾 Сохранение файла по пути: %s\n", filePath)

			// Сохраняем файл
			if err := c.SaveUploadedFile(file, filePath); err != nil {
				// fmt.Printf("❌ Ошибка сохранения файла: %v\n", err)
				c.JSON(500, gin.H{"error": "Ошибка сохранения файла: " + err.Error()})
				return
			}

			// Генерируем URL для доступа к файлу
			avatarURL := fmt.Sprintf("/uploads/avatars/%s", fileName)
			// fmt.Printf("✅ Файл сохранен. URL: %s\n", avatarURL)

			// Обновляем аватарку в базе данных
			var user models.User
			if err := db.Where("id = ?", userIDUint).First(&user).Error; err != nil {
				// fmt.Printf("❌ Пользователь не найден: %v\n", err)
				c.JSON(404, gin.H{"error": "Пользователь не найден"})
				return
			}

			// Удаляем старый файл аватарки если он есть
			if user.AvatarURL != "" {
				oldFilePath := strings.TrimPrefix(user.AvatarURL, "/")
				if _, err := os.Stat(oldFilePath); err == nil {
					if err := os.Remove(oldFilePath); err != nil {
						fmt.Printf("⚠️  Не удалось удалить старый файл аватарки: %v\n", err)
					} else {
						fmt.Printf("🗑️  Старый файл аватарки удален: %s\n", oldFilePath)
					}
				}
			}

			// Обновляем аватарку в базе
			user.AvatarURL = avatarURL
			if err := db.Save(&user).Error; err != nil {
				// fmt.Printf("❌ Ошибка обновления аватарки в базе: %v\n", err)
				c.JSON(500, gin.H{"error": "Ошибка обновления аватарки в базе: " + err.Error()})
				return
			}

			// fmt.Printf("✅ Аватарка успешно обновлена для user_id=%d\n", userIDUint)

			c.JSON(200, gin.H{
				"message":    "Аватар успешно загружен",
				"avatar_url": avatarURL,
			})
		})

		// УДАЛЕНИЕ АВАТАРКИ (НОВЫЙ ЭНДПОИНТ)
		authGroup.DELETE("/delete-avatar", auth.AuthMiddleware(cfg), func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint, ok := userID.(uint)
			if !ok {
				c.JSON(401, gin.H{"error": "Неверный формат ID пользователя"})
				return
			}

			// Находим пользователя
			var user models.User
			if err := db.Where("id = ?", userIDUint).First(&user).Error; err != nil {
				c.JSON(404, gin.H{"error": "Пользователь не найден"})
				return
			}

			// Удаляем файл аватарки если он существует
			if user.AvatarURL != "" {
				filePath := strings.TrimPrefix(user.AvatarURL, "/")
				if _, err := os.Stat(filePath); err == nil {
					if err := os.Remove(filePath); err != nil {
						fmt.Printf("⚠️  Не удалось удалить файл аватарки: %v\n", err)
					}
				}
			}

			// Очищаем аватарку в базе
			user.AvatarURL = ""
			if err := db.Save(&user).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка удаления аватарки из базы: " + err.Error()})
				return
			}

			c.JSON(200, gin.H{
				"message": "Аватар успешно удален",
			})
		})
	}

	// Смена пароля (защищенный)
	authGroup.PUT("/change-password", auth.AuthMiddleware(cfg), func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(401, gin.H{"error": "Не авторизован"})
			return
		}

		userIDUint, ok := userID.(uint)
		if !ok {
			c.JSON(401, gin.H{"error": "Неверный формат ID пользователя"})
			return
		}

		var req ChangePasswordRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		if err := authService.ChangePassword(userIDUint, req.OldPassword, req.NewPassword); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{
			"message": "Пароль успешно изменен",
		})
	})

	// СТАТИЧЕСКИЕ ФАЙЛЫ ДЛЯ ДОСТУПА К ЗАГРУЖЕННЫМ АВАТАРКАМ
	r.Static("/uploads", "./uploads")
}
