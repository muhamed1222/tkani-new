package models

import (
	"time"
)

type PassedPlace struct {
	UserID   uint      `gorm:"primaryKey"`
	User     User      `gorm:"foreignKey:UserID"`
	PlaceID  uint      `gorm:"primaryKey"`
	Place    Place     `gorm:"foreignKey:PlaceID"`
	PassedAt time.Time `gorm:"default:now()"`
}

type PassedRoute struct {
	UserID   uint      `gorm:"primaryKey"`
	User     User      `gorm:"foreignKey:UserID"`
	RouteID  uint      `gorm:"primaryKey"`
	Route    Route     `gorm:"foreignKey:RouteID"`
	PassedAt time.Time `gorm:"default:now()"`
}
