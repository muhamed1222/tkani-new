package route

import (
	"fmt"
	"math"
	"tropa-nartov-backend/internal/models"

	"gorm.io/gorm"
)

// Service управляет маршрутами
type Service struct {
	db *gorm.DB
}

// NewService создаёт новый сервис для маршрутов
func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// Create создаёт новый маршрут
func (s *Service) Create(route *models.Route) error {
	if err := s.db.Create(route).Error; err != nil {
		return fmt.Errorf("ошибка создания маршрута: %v", err)
	}
	return nil
}

// Update обновляет маршрут
func (s *Service) Update(id uint, route *models.Route) error {
	var existing models.Route
	if err := s.db.Where("id = ? AND is_active = ?", id, true).First(&existing).Error; err != nil {
		return fmt.Errorf("маршрут не найден")
	}

	route.ID = id
	if err := s.db.Save(route).Error; err != nil {
		return fmt.Errorf("ошибка обновления маршрута: %v", err)
	}
	return nil
}

// Delete выполняет soft delete маршрута
func (s *Service) Delete(id uint) error {
	var route models.Route
	if err := s.db.Where("id = ? AND is_active = ?", id, true).First(&route).Error; err != nil {
		return fmt.Errorf("маршрут не найден")
	}

	route.IsActive = false
	if err := s.db.Save(&route).Error; err != nil {
		return fmt.Errorf("ошибка удаления маршрута: %v", err)
	}
	return nil
}

// GetByID получает маршрут по ID с остановками и отзывами
func (s *Service) GetByID(id uint) (*models.Route, error) {
	var route models.Route
	if err := s.db.Preload("Reviews").Where("id = ? AND is_active = ?", id, true).First(&route).Error; err != nil {
		return nil, fmt.Errorf("маршрут не найден")
	}

	// Загружаем остановки (route_stops) с точками, упорядоченные по order_num
	var stops []models.RouteStop
	if err := s.db.Preload("Place").Where("route_id = ?", id).Order("order_num ASC").Find(&stops).Error; err != nil {
		return nil, fmt.Errorf("ошибка загрузки остановок: %v", err)
	}

	// Расчёт duration (сумма расстояний между остановками по Хаверсину)
	route.Duration = calculateDuration(stops)

	return &route, nil
}

// List возвращает список маршрутов с фильтрами (аналогично places)
func (s *Service) List(typeIDs, areaIDs, tagIDs []uint) ([]models.Route, error) {
	var routes []models.Route
	query := s.db.Where("is_active = ?", true)

	if len(typeIDs) > 0 {
		query = query.Where("type_id IN ?", typeIDs)
	}
	if len(areaIDs) > 0 {
		query = query.Where("area_id IN ?", areaIDs)
	}
	if len(tagIDs) > 0 {
		query = query.Joins("JOIN routes_tags ON routes_tags.route_id = routes.id").
			Where("routes_tags.tag_id IN ?", tagIDs).
			Group("routes.id")
	}

	if err := query.Find(&routes).Error; err != nil {
		return nil, fmt.Errorf("ошибка получения списка маршрутов: %v", err)
	}
	return routes, nil
}

// calculateDuration рассчитывает длительность по остановкам (пример: расстояние в км / средняя скорость 4 км/ч)
func calculateDuration(stops []models.RouteStop) float64 {
	if len(stops) < 2 {
		return 0
	}
	var totalDistance float64
	for i := 0; i < len(stops)-1; i++ {
		p1 := stops[i].Place
		p2 := stops[i+1].Place
		totalDistance += haversine(p1.Latitude, p1.Longitude, p2.Latitude, p2.Longitude)
	}
	// Предполагаем среднюю скорость 4 км/ч для пешего маршрута, возвращаем в часах
	return totalDistance / 4.0
}

// haversine рассчитывает расстояние между двумя точками в км
func haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371.0 // Радиус Земли в км
	dLat := deg2rad(lat2 - lat1)
	dLon := deg2rad(lon2 - lon1)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(deg2rad(lat1))*math.Cos(deg2rad(lat2))*math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func deg2rad(deg float64) float64 {
	return deg * (math.Pi / 180)
}
