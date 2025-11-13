package models

import (
	"time"
)

type Place struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	Name          string  `gorm:"type:varchar(200);not null" json:"name"`
	Type          string  `gorm:"type:varchar(100)" json:"type"`
	Description   string  `gorm:"type:text;not null" json:"description"`
	Overview      string  `gorm:"type:text" json:"overview"`
	History       string  `gorm:"type:text" json:"history"`
	Address       string  `gorm:"type:varchar(500);not null" json:"address"`
	Hours         string  `gorm:"type:varchar(200)" json:"hours"`
	Weekend       string  `gorm:"type:varchar(100)" json:"weekend"`
	Entry         string  `gorm:"type:varchar(100)" json:"entry"`
	Contacts      string  `gorm:"type:varchar(200)" json:"contacts"`
	ContactsEmail string  `gorm:"type:varchar(200)" json:"contacts_email"`
	Latitude      float64 `gorm:"type:decimal(10,8);not null" json:"latitude"`
	Longitude     float64 `gorm:"type:decimal(11,8);not null" json:"longitude"`
	Rating        float32 `gorm:"type:decimal(3,1);default:0" json:"rating"`

	// Связи
	Images  []Image  `gorm:"foreignKey:PlaceID" json:"images"`
	Reviews []Review `gorm:"foreignKey:PlaceID" json:"reviews"`

	// Старые поля для совместимости
	OpeningHours string `gorm:"type:varchar(100)" json:"opening_hours"`
	TypeID       uint   `gorm:"not null" json:"type_id"`
	AreaID       uint   `gorm:"not null" json:"area_id"`

	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `gorm:"default:now()" json:"created_at"`
	UpdatedAt time.Time `gorm:"default:now()" json:"updated_at"`
}
