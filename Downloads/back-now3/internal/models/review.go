package models

import (
	"time"
)

type Review struct {
    ID        uint      `gorm:"primaryKey"`
    UserID    uint      `gorm:"not null"`
    User      User      `gorm:"foreignKey:UserID"`
    PlaceID   *uint
    Place     *Place    `gorm:"foreignKey:PlaceID"`
    RouteID   *uint
    Route     *Route    `gorm:"foreignKey:RouteID"`
    Text      string    `gorm:"type:text;not null"`
    Rating    int       `gorm:"not null"`
    Likes     int       `gorm:"default:0"`
    IsActive  bool      `gorm:"default:true"`
    CreatedAt time.Time `gorm:"default:now()"`
    UpdatedAt time.Time `gorm:"default:now()"`
}
