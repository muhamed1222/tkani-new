package db

import (
	"fmt"
	"log"
	"os"
	"tropa-nartov-backend/internal/models"

	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	// Сначала устанавливаем необходимые расширения
	err := db.Exec("CREATE EXTENSION IF NOT EXISTS postgis").Error
	if err != nil {
		// log.Printf("Warning: Failed to create PostGIS extension: %v", err)
	}

	err = db.Exec("CREATE EXTENSION IF NOT EXISTS cube").Error
	if err != nil {
		// log.Printf("Warning: Failed to create cube extension: %v", err)
	}

	err = db.Exec("CREATE EXTENSION IF NOT EXISTS earthdistance").Error
	if err != nil {
		// log.Printf("Warning: Failed to create earthdistance extension: %v", err)
	}

	// ВЫПОЛНЯЕМ AUTOMIGRATE ПЕРВЫМ - создаем все таблицы
	// log.Println("Creating database tables...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Route{},
		&models.Review{},
		&models.Type{},
		&models.Category{},
		&models.Area{},
		&models.ArticleCategory{},
		&models.Article{},
		&models.RouteStop{},
		&models.Image{},
		&models.FavoritePlace{},
		&models.FavoriteRoute{},
		&models.PassedPlace{},
		&models.PassedRoute{},
		&models.Tag{},
		&models.PlaceTag{},
		&models.RouteTag{},
		&models.PlaceCategory{},
		&models.RouteCategory{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto migrate tables: %w", err)
	}

	// Отдельно мигрируем Place с кастомной логикой
	// log.Println("Migrating places table with custom logic...")
	if err := migratePlacesTable(db); err != nil {
		return fmt.Errorf("failed to migrate places table: %w", err)
	}

	// log.Println("Database tables created successfully")

	// ТЕПЕРЬ добавляем колонки, если их нет
	// Добавляем avatar_url, если отсутствует
	if !db.Migrator().HasColumn(&models.User{}, "avatar_url") {
		// log.Println("Adding avatar_url column to users table...")
		if err := db.Exec(`ALTER TABLE "users" ADD COLUMN "avatar_url" VARCHAR(500)`).Error; err != nil {
			log.Printf("Warning: Failed to add avatar_url column: %v", err)
		}
	}

	if !db.Migrator().HasColumn(&models.User{}, "password_hash") {
		// log.Println("Adding password_hash column to users table...")

		// Добавляем колонку без NOT NULL сначала
		if err := db.Exec(`ALTER TABLE "users" ADD COLUMN "password_hash" text`).Error; err != nil {
			return err
		}

		// Заполняем существующие записи временным паролем
		// log.Println("Setting temporary passwords for existing users...")
		if err := db.Exec(`UPDATE "users" SET "password_hash" = ? WHERE "password_hash" IS NULL`, "temporary_password_need_reset").Error; err != nil {
			return err
		}

		// Теперь добавляем ограничение NOT NULL
		if err := db.Exec(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`).Error; err != nil {
			return err
		}
	}

	// УДАЛЯЕМ старую колонку password если она есть
	if db.Migrator().HasColumn(&models.User{}, "password") {
		// log.Println("Removing old password column...")
		if err := db.Exec(`ALTER TABLE "users" DROP COLUMN "password"`).Error; err != nil {
			log.Printf("Warning: Failed to drop old password column: %v", err)
		}
	}

	// Добавляем avatar_url колонку, если её нет
	if !db.Migrator().HasColumn(&models.User{}, "avatar_url") {
		// log.Println("Adding avatar_url column to users table...")
		if err := db.Exec(`ALTER TABLE "users" ADD COLUMN "avatar_url" VARCHAR(500)`).Error; err != nil {
			log.Printf("Warning: Failed to add avatar_url column: %v", err)
		}
	}

	// Добавляем GIST-индекс для гео-поиска (PostGIS вариант)
	err = db.Exec("CREATE INDEX IF NOT EXISTS idx_places_geo ON places USING GIST (ST_Point(longitude, latitude))").Error
	if err != nil {
		// log.Printf("Warning: Failed to create geo index: %v", err)
		// Пробуем альтернативный вариант с earthdistance
		err = db.Exec("CREATE INDEX IF NOT EXISTS idx_places_geo ON places USING GIST (ll_to_earth(latitude, longitude))").Error
		if err != nil {
			// log.Printf("Warning: Failed to create earthdistance index: %v", err)
		}
	}

	// Добавляем индексы для производительности
	err = db.Exec("CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC)").Error
	if err != nil {
		return err
	}

	// Добавляем индекс для images
	err = db.Exec("CREATE INDEX IF NOT EXISTS idx_images_place_id ON images(place_id)").Error
	if err != nil {
		return err
	}

	// Добавляем индекс для reviews по place_id
	err = db.Exec("CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id)").Error
	if err != nil {
		return err
	}

	// Выполняем SQL для триггеров (если файл существует)
	if _, err := os.Stat("internal/db/triggers.sql"); err == nil {
		triggersSQL, err := os.ReadFile("internal/db/triggers.sql")
		if err != nil {
			// log.Printf("Warning: Failed to read triggers.sql: %v", err)
		} else {
			err = db.Exec(string(triggersSQL)).Error
			if err != nil {
				// log.Printf("Warning: Failed to execute triggers: %v", err)
			}
		}
	} else {
		// log.Println("No triggers.sql file found, skipping triggers")
	}

	// log.Println("Database migration completed successfully")
	return nil
}

// migratePlacesTable выполняет кастомную миграцию для таблицы places
func migratePlacesTable(db *gorm.DB) error {
	// Создаем временную структуру без новых полей
	type PlaceTemp struct {
		ID           uint    `gorm:"primaryKey"`
		Name         string  `gorm:"type:varchar(200);not null"`
		Description  string  `gorm:"type:text;not null"`
		Overview     string  `gorm:"type:text"`
		History      string  `gorm:"type:text"`
		Address      string  `gorm:"type:varchar(500);not null"`
		Latitude     float64 `gorm:"type:decimal(10,8);not null"`
		Longitude    float64 `gorm:"type:decimal(11,8);not null"`
		OpeningHours string  `gorm:"type:varchar(100)"`
		Contacts     string  `gorm:"type:jsonb"`
		Rating       float32 `gorm:"type:decimal(2,1);default:0"`
		TypeID       uint    `gorm:"not null"`
		AreaID       uint    `gorm:"not null"`
		IsActive     bool    `gorm:"default:true"`
	}

	// Сначала мигрируем базовую структуру
	if err := db.AutoMigrate(&PlaceTemp{}); err != nil {
		return err
	}

	// Теперь добавляем новые колонки по одной с правильной логикой

	// 1. Добавляем type как nullable
	if !db.Migrator().HasColumn(&models.Place{}, "type") {
		log.Println("Adding type column to places table...")
		if err := db.Exec(`ALTER TABLE "places" ADD COLUMN "type" VARCHAR(100)`).Error; err != nil {
			return err
		}

		// Заполняем существующие записи значением по умолчанию
		// log.Println("Setting default values for type column...")
		if err := db.Exec(`UPDATE "places" SET "type" = 'достопримечательность' WHERE "type" IS NULL`).Error; err != nil {
			return err
		}

		// Теперь делаем колонку NOT NULL
		if err := db.Exec(`ALTER TABLE "places" ALTER COLUMN "type" SET NOT NULL`).Error; err != nil {
			return err
		}
	}

	// 2. Добавляем hours
	if !db.Migrator().HasColumn(&models.Place{}, "hours") {
		// log.Println("Adding hours column to places table...")
		if err := db.Exec(`ALTER TABLE "places" ADD COLUMN "hours" VARCHAR(200)`).Error; err != nil {
			return err
		}
	}

	// 3. Добавляем weekend
	if !db.Migrator().HasColumn(&models.Place{}, "weekend") {
		// log.Println("Adding weekend column to places table...")
		if err := db.Exec(`ALTER TABLE "places" ADD COLUMN "weekend" VARCHAR(100)`).Error; err != nil {
			return err
		}
	}

	// 4. Добавляем entry
	if !db.Migrator().HasColumn(&models.Place{}, "entry") {
		// log.Println("Adding entry column to places table...")
		if err := db.Exec(`ALTER TABLE "places" ADD COLUMN "entry" VARCHAR(100)`).Error; err != nil {
			return err
		}
	}

	// 5. Добавляем contacts_email
	if !db.Migrator().HasColumn(&models.Place{}, "contacts_email") {
		// log.Println("Adding contacts_email column to places table...")
		if err := db.Exec(`ALTER TABLE "places" ADD COLUMN "contacts_email" VARCHAR(200)`).Error; err != nil {
			return err
		}
	}

	// 6. Обновляем contacts если нужно (меняем тип с jsonb на varchar)
	if db.Migrator().HasColumn(&models.Place{}, "contacts") {
		// Проверяем тип колонки
		var columnType string
		db.Raw(`SELECT data_type FROM information_schema.columns 
		        WHERE table_name = 'places' AND column_name = 'contacts'`).Scan(&columnType)

		if columnType == "jsonb" {
			// log.Println("Converting contacts column from jsonb to varchar...")
			// Создаем временную колонку
			if err := db.Exec(`ALTER TABLE "places" ADD COLUMN "contacts_temp" VARCHAR(200)`).Error; err != nil {
				return err
			}

			// Копируем данные (извлекаем телефон из JSON)
			if err := db.Exec(`UPDATE "places" SET "contacts_temp" = COALESCE("contacts"->>'phone', '')`).Error; err != nil {
				return err
			}

			// Удаляем старую колонку
			if err := db.Exec(`ALTER TABLE "places" DROP COLUMN "contacts"`).Error; err != nil {
				return err
			}

			// Переименовываем временную колонку
			if err := db.Exec(`ALTER TABLE "places" RENAME COLUMN "contacts_temp" TO "contacts"`).Error; err != nil {
				return err
			}
		}
	} else {
		// log.Println("Adding contacts column to places table...")
		if err := db.Exec(`ALTER TABLE "places" ADD COLUMN "contacts" VARCHAR(200)`).Error; err != nil {
			return err
		}
	}

	return nil
}
