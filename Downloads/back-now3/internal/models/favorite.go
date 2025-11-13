package models

import (
	"time"
)

type FavoritePlace struct {
	UserID    uint      `gorm:"primaryKey"`
	User      User      `gorm:"foreignKey:UserID"`
	PlaceID   uint      `gorm:"primaryKey"`
	Place     Place     `gorm:"foreignKey:PlaceID"`
	CreatedAt time.Time `gorm:"default:now()"`
}

type FavoriteRoute struct {
	UserID    uint      `gorm:"primaryKey"`
	User      User      `gorm:"foreignKey:UserID"`
	RouteID   uint      `gorm:"primaryKey"`
	Route     Route     `gorm:"foreignKey:RouteID"`
	CreatedAt time.Time `gorm:"default:now()"`
}
