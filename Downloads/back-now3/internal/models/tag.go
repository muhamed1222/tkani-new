package models

import (
	"time"
)

type Tag struct {
	ID          uint      `gorm:"primaryKey"`
	Name        string    `gorm:"type:varchar(50);unique;not null"`
	Description string    `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"default:now()"`
}

type PlaceTag struct {
	PlaceID uint  `gorm:"primaryKey"`
	Place   Place `gorm:"foreignKey:PlaceID"`
	TagID   uint  `gorm:"primaryKey"`
	Tag     Tag   `gorm:"foreignKey:TagID"`
}

type RouteTag struct {
	RouteID uint  `gorm:"primaryKey"`
	Route   Route `gorm:"foreignKey:RouteID"`
	TagID   uint  `gorm:"primaryKey"`
	Tag     Tag   `gorm:"foreignKey:TagID"`
}
