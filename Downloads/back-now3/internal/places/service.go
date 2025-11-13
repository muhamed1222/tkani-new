package places

import (
	"fmt"
	"tropa-nartov-backend/internal/models"

	"gorm.io/gorm"
)

// Service управляет точками
type Service struct {
	db *gorm.DB
}

// NewService создаёт новый сервис для точек
func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// Create создаёт новую точку
func (s *Service) Create(place *models.Place) error {
	if err := s.db.Create(place).Error; err != nil {
		return fmt.Errorf("ошибка создания точки: %v", err)
	}
	return nil
}

// Update обновляет точку
func (s *Service) Update(id uint, place *models.Place) error {
	var existing models.Place
	if err := s.db.Where("id = ? AND is_active = ?", id, true).First(&existing).Error; err != nil {
		return fmt.Errorf("точка не найдена")
	}

	place.ID = id
	if err := s.db.Save(place).Error; err != nil {
		return fmt.Errorf("ошибка обновления точки: %v", err)
	}
	return nil
}

// Delete выполняет soft delete точки
func (s *Service) Delete(id uint) error {
	var place models.Place
	if err := s.db.Where("id = ? AND is_active = ?", id, true).First(&place).Error; err != nil {
		return fmt.Errorf("точка не найдена")
	}

	place.IsActive = false
	if err := s.db.Save(&place).Error; err != nil {
		return fmt.Errorf("ошибка удаления точки: %v", err)
	}
	return nil
}

// GetByID получает точку по ID с отзывами
func (s *Service) GetByID(id uint) (*models.Place, error) {
	var place models.Place
	if err := s.db.Preload("Images").Preload("Reviews").Preload("Reviews.User").
		Where("id = ? AND is_active = ?", id, true).First(&place).Error; err != nil {
		return nil, fmt.Errorf("точка не найдена")
	}
	return &place, nil
}

// List возвращает список точек с фильтрами (поддержка нескольких значений)
// List возвращает список точек с фильтрами (поддержка нескольких значений)
func (s *Service) List(categoryIDs, typeIDs, areaIDs, tagIDs []uint) ([]models.Place, error) {
	var places []models.Place

	query := s.db.Preload("Images").Preload("Reviews").Preload("Reviews.User").
		Where("is_active = ?", true)

	// Фильтр по типам (используем новое поле Type вместо TypeID)
	if len(typeIDs) > 0 {
		// Если нужно фильтровать по TypeID, используем это
		query = query.Where("type_id IN ?", typeIDs)
	}

	// Фильтр по районам
	if len(areaIDs) > 0 {
		query = query.Where("area_id IN ?", areaIDs)
	}

	// Фильтр по категориям (через связь many-to-many)
	if len(categoryIDs) > 0 {
		query = query.Joins("JOIN place_categories ON place_categories.place_id = places.id").
			Where("place_categories.category_id IN ?", categoryIDs)
	}

	// Фильтр по тегам (если используется)
	if len(tagIDs) > 0 {
		query = query.Joins("JOIN place_tags ON place_tags.place_id = places.id").
			Where("place_tags.tag_id IN ?", tagIDs)
	}

	// Выполняем запрос
	if err := query.Find(&places).Error; err != nil {
		// fmt.Printf("Database error: %v\n", err)
		return nil, fmt.Errorf("ошибка получения списка точек: %v", err)
	}

	// fmt.Printf("Found %d places in database:\n", len(places))
	// for i, place := range places {
	// fmt.Printf("Place %d: ID=%d, Name='%s', Type='%s', AreaID=%d, Rating=%.1f\n",
	// i, place.ID, place.Name, place.Type, place.AreaID, place.Rating)
	// }
	// fmt.Println("===========================")

	return places, nil
}
