package models

import (
	"time"
)

type RouteStop struct {
	ID        uint      `gorm:"primaryKey"`
	RouteID   uint      `gorm:"not null"`
	Route     Route     `gorm:"foreignKey:RouteID"`
	PlaceID   uint      `gorm:"not null"`
	Place     Place     `gorm:"foreignKey:PlaceID"`
	OrderNum  int       `gorm:"not null"`
	CreatedAt time.Time `gorm:"default:now()"`
}
