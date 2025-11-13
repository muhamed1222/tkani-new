package routes

import (
	"strconv"
	"time"
	"tropa-nartov-backend/internal/auth"
	"tropa-nartov-backend/internal/config"
	"tropa-nartov-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupActivityRoutes настраивает маршруты для истории активности
func SetupActivityRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	activityGroup := r.Group("/user/activity")
	activityGroup.Use(auth.AuthMiddleware(cfg))
	{
		// GET /user/activity/places - получить историю посещенных мест
		activityGroup.GET("/places", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint := userID.(uint)

			var passedPlaces []models.PassedPlace
			if err := db.Preload("Place").Preload("Place.Images").
				Where("user_id = ?", userIDUint).
				Order("passed_at DESC").
				Find(&passedPlaces).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка получения истории мест"})
				return
			}

			// Формируем ответ с информацией о месте и дате посещения
			result := make([]gin.H, len(passedPlaces))
			for i, pp := range passedPlaces {
				result[i] = gin.H{
					"place_id":  pp.PlaceID,
					"place":     pp.Place,
					"passed_at": pp.PassedAt,
				}
			}

			c.JSON(200, result)
		})

		// GET /user/activity/routes - получить историю пройденных маршрутов
		activityGroup.GET("/routes", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint := userID.(uint)

			var passedRoutes []models.PassedRoute
			if err := db.Preload("Route").Preload("Route.Type").Preload("Route.Area").
				Where("user_id = ?", userIDUint).
				Order("passed_at DESC").
				Find(&passedRoutes).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка получения истории маршрутов"})
				return
			}

			// Формируем ответ с информацией о маршруте и дате прохождения
			result := make([]gin.H, len(passedRoutes))
			for i, pr := range passedRoutes {
				result[i] = gin.H{
					"route_id":  pr.RouteID,
					"route":     pr.Route,
					"passed_at": pr.PassedAt,
				}
			}

			c.JSON(200, result)
		})

		// POST /user/activity/places/:placeId - добавить место в историю
		activityGroup.POST("/places/:placeId", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint := userID.(uint)
			placeID, err := strconv.ParseUint(c.Param("placeId"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "Неверный ID места"})
				return
			}

			// Проверяем, существует ли место
			var place models.Place
			if err := db.Where("id = ? AND is_active = ?", placeID, true).First(&place).Error; err != nil {
				c.JSON(404, gin.H{"error": "Место не найдено"})
				return
			}

			// Проверяем, не добавлено ли уже в историю
			var existingPassed models.PassedPlace
			if err := db.Where("user_id = ? AND place_id = ?", userIDUint, placeID).First(&existingPassed).Error; err == nil {
				// Если уже есть, обновляем дату посещения
				existingPassed.PassedAt = time.Now()
				if err := db.Save(&existingPassed).Error; err != nil {
					c.JSON(500, gin.H{"error": "Ошибка обновления истории"})
					return
				}
				c.JSON(200, gin.H{
					"message":   "Дата посещения обновлена",
					"passed_at": existingPassed.PassedAt,
				})
				return
			}

			// Добавляем в историю
			passedPlace := models.PassedPlace{
				UserID:  userIDUint,
				PlaceID: uint(placeID),
			}

			if err := db.Create(&passedPlace).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка добавления в историю"})
				return
			}

			c.JSON(200, gin.H{
				"message":   "Место добавлено в историю",
				"passed_at": passedPlace.PassedAt,
			})
		})

		// POST /user/activity/routes/:routeId - добавить маршрут в историю
		activityGroup.POST("/routes/:routeId", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint := userID.(uint)
			routeID, err := strconv.ParseUint(c.Param("routeId"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "Неверный ID маршрута"})
				return
			}

			// Проверяем, существует ли маршрут
			var route models.Route
			if err := db.Where("id = ? AND is_active = ?", routeID, true).First(&route).Error; err != nil {
				c.JSON(404, gin.H{"error": "Маршрут не найден"})
				return
			}

			// Проверяем, не добавлен ли уже в историю
			var existingPassed models.PassedRoute
			if err := db.Where("user_id = ? AND route_id = ?", userIDUint, routeID).First(&existingPassed).Error; err == nil {
				// Если уже есть, обновляем дату прохождения
				existingPassed.PassedAt = time.Now()
				if err := db.Save(&existingPassed).Error; err != nil {
					c.JSON(500, gin.H{"error": "Ошибка обновления истории"})
					return
				}
				c.JSON(200, gin.H{
					"message":   "Дата прохождения обновлена",
					"passed_at": existingPassed.PassedAt,
				})
				return
			}

			// Добавляем в историю
			passedRoute := models.PassedRoute{
				UserID:  userIDUint,
				RouteID: uint(routeID),
			}

			if err := db.Create(&passedRoute).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка добавления в историю"})
				return
			}

			c.JSON(200, gin.H{
				"message":   "Маршрут добавлен в историю",
				"passed_at": passedRoute.PassedAt,
			})
		})

		// DELETE /user/activity/places/:placeId - удалить место из истории
		activityGroup.DELETE("/places/:placeId", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint := userID.(uint)
			placeID, err := strconv.ParseUint(c.Param("placeId"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "Неверный ID места"})
				return
			}

			// Удаляем из истории
			if err := db.Where("user_id = ? AND place_id = ?", userIDUint, placeID).
				Delete(&models.PassedPlace{}).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка удаления из истории"})
				return
			}

			c.JSON(200, gin.H{"message": "Место удалено из истории"})
		})

		// DELETE /user/activity/routes/:routeId - удалить маршрут из истории
		activityGroup.DELETE("/routes/:routeId", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint := userID.(uint)
			routeID, err := strconv.ParseUint(c.Param("routeId"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "Неверный ID маршрута"})
				return
			}

			// Удаляем из истории
			if err := db.Where("user_id = ? AND route_id = ?", userIDUint, routeID).
				Delete(&models.PassedRoute{}).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка удаления из истории"})
				return
			}

			c.JSON(200, gin.H{"message": "Маршрут удален из истории"})
		})

		// GET /user/activity - получить всю историю активности (места + маршруты)
		activityGroup.GET("", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			userIDUint := userID.(uint)

			// Получаем посещенные места
			var passedPlaces []models.PassedPlace
			if err := db.Preload("Place").Preload("Place.Images").
				Where("user_id = ?", userIDUint).
				Order("passed_at DESC").
				Find(&passedPlaces).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка получения истории мест"})
				return
			}

			// Получаем пройденные маршруты
			var passedRoutes []models.PassedRoute
			if err := db.Preload("Route").Preload("Route.Type").Preload("Route.Area").
				Where("user_id = ?", userIDUint).
				Order("passed_at DESC").
				Find(&passedRoutes).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка получения истории маршрутов"})
				return
			}

			// Формируем ответ
			places := make([]gin.H, len(passedPlaces))
			for i, pp := range passedPlaces {
				places[i] = gin.H{
					"place_id":  pp.PlaceID,
					"place":     pp.Place,
					"passed_at": pp.PassedAt,
				}
			}

			routes := make([]gin.H, len(passedRoutes))
			for i, pr := range passedRoutes {
				routes[i] = gin.H{
					"route_id":  pr.RouteID,
					"route":     pr.Route,
					"passed_at": pr.PassedAt,
				}
			}

			c.JSON(200, gin.H{
				"places": places,
				"routes": routes,
			})
		})
	}
}

