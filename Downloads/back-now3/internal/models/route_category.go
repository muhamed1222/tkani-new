package models

type RouteCategory struct {
	RouteID    uint     `gorm:"primaryKey"`
	CategoryID uint     `gorm:"primaryKey"`
	Route      Route    `gorm:"foreignKey:RouteID"`
	Category   Category `gorm:"foreignKey:CategoryID"`
}
