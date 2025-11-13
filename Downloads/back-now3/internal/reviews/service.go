package reviews

import (
	"fmt"
	"tropa-nartov-backend/internal/models"

	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// CreateReview создает новый отзыв
func (s *Service) CreateReview(review *models.Review) error {
	if err := s.db.Create(review).Error; err != nil {
		return fmt.Errorf("ошибка создания отзыва: %v", err)
	}

	// Обновляем рейтинг места
	if err := s.updatePlaceRating(review.PlaceID); err != nil {
		return fmt.Errorf("ошибка обновления рейтинга: %v", err)
	}

	return nil
}

// GetReviewsByPlaceID возвращает отзывы для места
func (s *Service) GetReviewsByPlaceID(placeID uint) ([]models.Review, error) {
	var reviews []models.Review
	if err := s.db.Preload("User").
		Where("place_id = ? AND is_active = ?", placeID, true).
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		return nil, fmt.Errorf("ошибка получения отзывов: %v", err)
	}
	return reviews, nil
}

// updatePlaceRating обновляет средний рейтинг места
func (s *Service) updatePlaceRating(placeID *uint) error {
	if placeID == nil {
		return nil
	}

	var avgRating struct {
		Average float32
		Count   int
	}

	if err := s.db.Model(&models.Review{}).
		Select("AVG(rating) as average, COUNT(*) as count").
		Where("place_id = ? AND is_active = ?", *placeID, true).
		Scan(&avgRating).Error; err != nil {
		return err
	}

	// Обновляем рейтинг места
	if err := s.db.Model(&models.Place{}).
		Where("id = ?", *placeID).
		Update("rating", avgRating.Average).Error; err != nil {
		return err
	}

	return nil
}

// DeleteReview удаляет отзыв (soft delete)
func (s *Service) DeleteReview(reviewID uint, userID uint) error {
	var review models.Review
	if err := s.db.Where("id = ? AND user_id = ?", reviewID, userID).First(&review).Error; err != nil {
		return fmt.Errorf("отзыв не найден или нет прав для удаления")
	}

	review.IsActive = false
	if err := s.db.Save(&review).Error; err != nil {
		return fmt.Errorf("ошибка удаления отзыва: %v", err)
	}

	// Обновляем рейтинг места
	if err := s.updatePlaceRating(review.PlaceID); err != nil {
		return fmt.Errorf("ошибка обновления рейтинга: %v", err)
	}

	return nil
}
