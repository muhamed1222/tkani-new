package models

import (
	"time"
)

type Route struct {
    ID          uint      `gorm:"primaryKey"`
    Name        string    `gorm:"type:varchar(200);not null"`
    Description string    `gorm:"type:text;not null"`
    Overview    string    `gorm:"type:text"`
    History     string    `gorm:"type:text"`
    Distance    float64   `gorm:"type:decimal(10,2);not null"`
    Duration    float64   `gorm:"type:decimal(10,2)"`
    TypeID      uint      `gorm:"not null"`
    Type        Type      `gorm:"foreignKey:TypeID"`
    AreaID      uint      `gorm:"not null"`
    Area        Area      `gorm:"foreignKey:AreaID"`
    Rating      float32   `gorm:"type:decimal(2,1);default:0"`
    Categories  []Category `gorm:"many2many:route_categories;foreignKey:ID;joinForeignKey:RouteID;References:ID;ReferencesForeignKey:CategoryID"`
    IsActive    bool      `gorm:"default:true"`
    CreatedAt   time.Time `gorm:"default:now()"`
    UpdatedAt   time.Time `gorm:"default:now()"`
    Reviews     []Review  `gorm:"foreignKey:RouteID"`
}
