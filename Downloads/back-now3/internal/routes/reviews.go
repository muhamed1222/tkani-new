package routes

import (
	"strconv"
	"tropa-nartov-backend/internal/auth"
	"tropa-nartov-backend/internal/config"
	"tropa-nartov-backend/internal/models"
	"tropa-nartov-backend/internal/reviews"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateReviewRequest структура для создания отзыва
type CreateReviewRequest struct {
	PlaceID uint   `json:"place_id" binding:"required"`
	Text    string `json:"text" binding:"required"`
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
}

// SetupReviewRoutes настраивает маршруты для отзывов
func SetupReviewRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	reviewService := reviews.NewService(db)

	reviewsGroup := r.Group("/reviews")
	{
		// Получение отзывов для места
		reviewsGroup.GET("/place/:placeId", func(c *gin.Context) {
			placeID, err := strconv.ParseUint(c.Param("placeId"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "недействительный ID места"})
				return
			}

			reviews, err := reviewService.GetReviewsByPlaceID(uint(placeID))
			if err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, reviews)
		})

		// Создание отзыва (требует авторизации)
		reviewsGroup.POST("", auth.AuthMiddleware(cfg), func(c *gin.Context) {
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

			var req CreateReviewRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			review := &models.Review{
				UserID:   userIDUint,
				PlaceID:  &req.PlaceID,
				Text:     req.Text,
				Rating:   req.Rating,
				IsActive: true,
			}

			if err := reviewService.CreateReview(review); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			c.JSON(201, gin.H{
				"message": "Отзыв успешно создан",
				"review":  review,
			})
		})

		// Удаление отзыва (только свой отзыв)
		reviewsGroup.DELETE("/:id", auth.AuthMiddleware(cfg), func(c *gin.Context) {
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

			reviewID, err := strconv.ParseUint(c.Param("id"), 10, 32)
			if err != nil {
				c.JSON(400, gin.H{"error": "недействительный ID отзыва"})
				return
			}

			if err := reviewService.DeleteReview(uint(reviewID), userIDUint); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{"message": "Отзыв успешно удален"})
		})
	}
}
