package auth

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimitEntry хранит информацию о попытках доступа
type RateLimitEntry struct {
	Count     int
	ResetTime time.Time
}

// RateLimiter управляет ограничениями запросов
type RateLimiter struct {
	mu       sync.Mutex
	entries  map[string]*RateLimitEntry
	loginLimiter *RateLimitConfig
	forgotLimiter *RateLimitConfig
}

// RateLimitConfig настройки для rate limiting
type RateLimitConfig struct {
	MaxRequests int           // Максимальное количество запросов
	Window      time.Duration // Окно времени
}

// NewRateLimiter создает новый rate limiter
func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		entries: make(map[string]*RateLimitEntry),
		loginLimiter: &RateLimitConfig{
			MaxRequests: 5,              // 5 попыток
			Window:      time.Minute,    // в минуту
		},
		forgotLimiter: &RateLimitConfig{
			MaxRequests: 3,              // 3 запроса
			Window:      time.Hour,      // в час
		},
	}
}

// getClientIP получает IP адрес клиента
func getClientIP(c *gin.Context) string {
	// Проверяем заголовки прокси
	ip := c.GetHeader("X-Forwarded-For")
	if ip != "" {
		return ip
	}
	ip = c.GetHeader("X-Real-IP")
	if ip != "" {
		return ip
	}
	// Используем IP из контекста
	return c.ClientIP()
}

// checkRateLimit проверяет, не превышен ли лимит запросов
func (rl *RateLimiter) checkRateLimit(ip string, config *RateLimitConfig) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	entry, exists := rl.entries[ip]
	now := time.Now()

	if !exists || now.After(entry.ResetTime) {
		// Создаем новую запись или сбрасываем счетчик
		rl.entries[ip] = &RateLimitEntry{
			Count:     1,
			ResetTime: now.Add(config.Window),
		}
		return true
	}

	if entry.Count >= config.MaxRequests {
		return false
	}

	entry.Count++
	return true
}

// LoginRateLimit middleware для ограничения попыток входа
func (rl *RateLimiter) LoginRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := getClientIP(c)
		if !rl.checkRateLimit(ip, rl.loginLimiter) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Слишком много попыток входа. Попробуйте позже.",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// ForgotPasswordRateLimit middleware для ограничения запросов сброса пароля
func (rl *RateLimiter) ForgotPasswordRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := getClientIP(c)
		if !rl.checkRateLimit(ip, rl.forgotLimiter) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Слишком много запросов на сброс пароля. Попробуйте позже.",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// Cleanup удаляет устаревшие записи (для экономии памяти)
func (rl *RateLimiter) Cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, entry := range rl.entries {
		if now.After(entry.ResetTime) {
			delete(rl.entries, ip)
		}
	}
}

// StartCleanup запускает периодическую очистку устаревших записей
func (rl *RateLimiter) StartCleanup(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			rl.Cleanup()
		}
	}()
}

