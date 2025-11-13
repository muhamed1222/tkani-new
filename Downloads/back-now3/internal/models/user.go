package models

import (
	"time"
)

type User struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	Name              string    `gorm:"type:varchar(100);not null" json:"name"`
	FirstName         string    `gorm:"type:varchar(100)" json:"first_name"`
	Email             string    `gorm:"type:varchar(255);unique;not null" json:"email"`
	PasswordHash      string    `gorm:"type:varchar(255);not null" json:"-"`
	Role              string    `gorm:"type:varchar(20);default:'user'" json:"role"`
	AvatarURL         string    `gorm:"type:varchar(500)" json:"avatar_url"` // УБЕДИТЕСЬ ЧТО ЭТО ЕСТЬ
	ResetToken        string    `gorm:"type:varchar(255)" json:"-"`
	ResetTokenExpires time.Time `gorm:"type:timestamp" json:"-"`
	IsActive          bool      `gorm:"default:true" json:"is_active"`
	CreatedAt         time.Time `gorm:"default:now()" json:"created_at"`
	UpdatedAt         time.Time `gorm:"default:now()" json:"updated_at"`
}

// TableName указывает имя таблицы
func (User) TableName() string {
	return "users"
}
