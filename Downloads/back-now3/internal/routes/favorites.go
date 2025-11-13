package routes

import (
	"strconv"
	"tropa-nartov-backend/internal/auth"
	"tropa-nartov-backend/internal/config"
	"tropa-nartov-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupFavoriteRoutes настраивает маршруты для избранного
func SetupFavoriteRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	favoritesGroup := r.Group("/favorites")
	favoritesGroup.Use(auth.AuthMiddleware(cfg))
	{
		// Получить избранные места пользователя
		favoritesGroup.GET("/places", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			var favoritePlaces []models.FavoritePlace
			if err := db.Preload("Place").Preload("Place.Images").
				Where("user_id = ?", userID).
				Find(&favoritePlaces).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка получения избранных мест"})
				return
			}

			// Преобразуем в список мест
			places := make([]models.Place, len(favoritePlaces))
			for i, fp := range favoritePlaces {
				places[i] = fp.Place
			}

			c.JSON(200, places)
		})

		// Добавить место в избранное
		favoritesGroup.POST("/places/:placeId", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

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

			// Проверяем, не добавлено ли уже в избранное
			var existingFavorite models.FavoritePlace
			if err := db.Where("user_id = ? AND place_id = ?", userID, placeID).First(&existingFavorite).Error; err == nil {
				c.JSON(400, gin.H{"error": "Место уже в избранном"})
				return
			}

			// Добавляем в избранное
			favorite := models.FavoritePlace{
				UserID:  userID.(uint),
				PlaceID: uint(placeID),
			}

			if err := db.Create(&favorite).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка добавления в избранное"})
				return
			}

			c.JSON(200, gin.H{"message": "Место добавлено в избранное"})
		})

		// Удалить место из избранного
		favoritesGroup.DELETE("/places/:placeId", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			placeID, err := strconv.ParseUint(c.Param("placeId"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "Неверный ID места"})
				return
			}

			// Удаляем из избранного
			if err := db.Where("user_id = ? AND place_id = ?", userID, placeID).
				Delete(&models.FavoritePlace{}).Error; err != nil {
				c.JSON(500, gin.H{"error": "Ошибка удаления из избранного"})
				return
			}

			c.JSON(200, gin.H{"message": "Место удалено из избранного"})
		})

		// Проверить, находится ли место в избранном
		favoritesGroup.GET("/places/:placeId/status", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				c.JSON(401, gin.H{"error": "Не авторизован"})
				return
			}

			placeID, err := strconv.ParseUint(c.Param("placeId"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "Неверный ID места"})
				return
			}

			var favorite models.FavoritePlace
			if err := db.Where("user_id = ? AND place_id = ?", userID, placeID).First(&favorite).Error; err != nil {
				c.JSON(200, gin.H{"is_favorite": false})
				return
			}

			c.JSON(200, gin.H{"is_favorite": true})
		})
	}
}
