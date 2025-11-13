package db

import (
	"fmt"
	"tropa-nartov-backend/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Connect подключается к PostgreSQL
func Connect(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	// log.Println("Database connected successfully")
	return db, nil
}
