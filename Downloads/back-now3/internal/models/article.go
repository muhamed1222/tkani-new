package models

import (
	"time"
)

type ArticleCategory struct {
	ID          uint      `gorm:"primaryKey"`
	Name        string    `gorm:"type:varchar(100);unique;not null"`
	Description string    `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"default:now()"`
}

type Article struct {
	ID         uint      `gorm:"primaryKey"`
	Title      string    `gorm:"type:varchar(200);not null"`
	Content    string    `gorm:"type:text;not null"`
	CategoryID uint      `gorm:"not null"`
	CreatedAt  time.Time `gorm:"default:now()"`
	UpdatedAt  time.Time `gorm:"default:now()"`
}
