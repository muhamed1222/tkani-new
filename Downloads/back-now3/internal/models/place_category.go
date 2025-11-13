package models

type PlaceCategory struct {
	PlaceID    uint     `gorm:"primaryKey"`
	CategoryID uint     `gorm:"primaryKey"`
	Place      Place    `gorm:"foreignKey:PlaceID"`
	Category   Category `gorm:"foreignKey:CategoryID"`
}
