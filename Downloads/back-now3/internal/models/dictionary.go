package models

import (
	"time"
)

type Type struct {
	ID          uint      `gorm:"primaryKey"`
	Name        string    `gorm:"type:varchar(100);unique;not null"`
	EntityType  string    `gorm:"type:varchar(20);not null"` // 'place' или 'route'
	Description string    `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"default:now()"`
}

type Category struct {
	ID          uint      `gorm:"primaryKey"`
	Name        string    `gorm:"type:varchar(100);unique;not null"`
	Description string    `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"default:now()"`
}

type Area struct {
	ID          uint      `gorm:"primaryKey"`
	Name        string    `gorm:"type:varchar(100);unique;not null"`
	Description string    `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"default:now()"`
}
