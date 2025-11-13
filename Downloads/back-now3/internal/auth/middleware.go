package auth

import (
	"strings"
	"tropa-nartov-backend/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware проверяет JWT
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Требуется заголовок Authorization"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(401, gin.H{"error": "Недействительный формат заголовка Authorization"})
			c.Abort()
			return
		}

		// Получаем JWT секрет из конфигурации
		jwtSecret := cfg.JWTSecret
		if jwtSecret == "" {
			// Fallback для совместимости (не рекомендуется для production)
			jwtSecret = "tropa-nartov-super-secret-jwt-key-2024-change-in-production"
			if cfg.Debug {
				// log.Println("⚠️  Warning: JWT_SECRET_KEY not set in middleware, using default")
			}
		}

		token, err := jwt.Parse(parts[1], func(token *jwt.Token) (interface{}, error) {
			// Проверяем метод подписи
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		if err != nil {
			if cfg.Debug {
				// log.Printf("❌ Ошибка парсинга токена: %v\n", err)
			}
			c.JSON(401, gin.H{"error": "Недействительный или истёкший токен"})
			c.Abort()
			return
		}

		if !token.Valid {
			if cfg.Debug {
				// log.Println("❌ Токен невалиден")
			}
			c.JSON(401, gin.H{"error": "Недействительный или истёкший токен"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(401, gin.H{"error": "Недействительные данные токена"})
			c.Abort()
			return
		}

		// Используем поле "id"
		userID, exists := claims["id"]
		if !exists {
			c.JSON(401, gin.H{"error": "Токен не содержит ID пользователя"})
			c.Abort()
			return
		}

		// Преобразуем userID в uint
		userIDFloat, ok := userID.(float64)
		if !ok {
			c.JSON(401, gin.H{"error": "Неверный формат ID пользователя в токене"})
			c.Abort()
			return
		}

		c.Set("user_id", uint(userIDFloat))

		// Устанавливаем роль, если она есть в токене
		if role, exists := claims["role"]; exists {
			if roleStr, ok := role.(string); ok {
				c.Set("role", roleStr)
			} else {
				c.Set("role", "user")
			}
		} else {
			c.Set("role", "user")
		}

		if cfg.Debug {
			// log.Printf("✅ Успешная аутентификация: user_id=%d, role=%s\n", uint(userIDFloat), c.GetString("role"))
		}
		c.Next()
	}
}

// AdminMiddleware ограничивает доступ для админов
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(403, gin.H{"error": "Требуется доступ администратора"})
			c.Abort()
			return
		}
		c.Next()
	}
}
