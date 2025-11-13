package models

import "time"

type Image struct {
	ID        uint      `gorm:"primaryKey"`
	URL       string    `gorm:"type:varchar(500);not null"`
	PlaceID   uint      `gorm:"not null"`
	Place     Place     `gorm:"foreignKey:PlaceID"`
	IsActive  bool      `gorm:"default:true"`
	CreatedAt time.Time `gorm:"default:now()"`
	UpdatedAt time.Time `gorm:"default:now()"`
}
