package routes

import (
	"net/http"
	"tropa-nartov-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouteRoutes(router *gin.Engine, db *gorm.DB) {
	routeGroup := router.Group("/routes")
	{
		// GET /routes - получить все маршруты
		routeGroup.GET("", func(c *gin.Context) {
			var routes []models.Route

			// ИСПРАВЛЕНО: Убрано условие WHERE для тестирования
			// if err := db.Preload("Type").Preload("Area").Where("is_active = ?", true).Find(&routes).Error; err != nil {
			if err := db.Preload("Type").Preload("Area").Find(&routes).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка при получении маршрутов",
				})
				return
			}

			// ДОБАВЛЕНО: Если маршрутов нет в базе, возвращаем тестовые данные
			if len(routes) == 0 {
				// Возвращаем тестовые маршруты для разработки
				testRoutes := []gin.H{
					{
						"id":          1,
						"name":        "Восхождение на Эльбрус",
						"description": "Легендарный маршрут к высочайшей точке Европы через живописные ледники и горные перевалы",
						"overview":    "Маршрут начинается от поселка Терскол и проходит через приют Бочки, скалы Пастухова до западной вершины Эльбруса",
						"history":     "Первое успешное восхождение на Эльбрус было совершено в 1829 году экспедицией Российской академии наук под руководством генерала Г. А. Эммануэля",
						"distance":    22.5,
						"duration":    48.0,
						"type_id":     1,
						"area_id":     1,
						"rating":      4.9,
						"is_active":   true,
						"type_name":   "Пеший поход",
						"area_name":   "Приэльбрусье",
						"created_at":  "2025-10-31T13:54:35Z",
						"updated_at":  "2025-10-31T13:54:35Z",
					},
					{
						"id":          2,
						"name":        "Чегемские водопады",
						"description": "Путь к величественным водопадам в живописном Чегемском ущелье, известному своими суровыми скалами и бурной рекой",
						"overview":    "Маршрут проходит вдоль реки Чегем через несколько каскадов водопадов, самый известный из которых - Девичьи косы",
						"history":     "Чегемское ущелье издавна было заселено балкарцами, о чем свидетельствуют древние склепы и башни",
						"distance":    8.2,
						"duration":    4.5,
						"type_id":     1,
						"area_id":     4,
						"rating":      4.7,
						"is_active":   true,
						"type_name":   "Пеший поход",
						"area_name":   "Чегемское ущелье",
						"created_at":  "2025-10-31T13:54:35Z",
						"updated_at":  "2025-10-31T13:54:35Z",
					},
				}
				c.JSON(http.StatusOK, testRoutes)
				return
			}

			// Преобразуем в JSON ответ
			var response []gin.H
			for _, route := range routes {
				routeData := gin.H{
					"id":          route.ID,
					"name":        route.Name,
					"description": route.Description,
					"overview":    route.Overview,
					"history":     route.History,
					"distance":    route.Distance,
					"duration":    route.Duration,
					"type_id":     route.TypeID,
					"area_id":     route.AreaID,
					"rating":      route.Rating,
					"is_active":   route.IsActive,
					"created_at":  route.CreatedAt,
					"updated_at":  route.UpdatedAt,
				}

				// Добавляем данные о типе если есть
				if route.Type.ID != 0 {
					routeData["type_name"] = route.Type.Name
				} else {
					routeData["type_name"] = "Пеший поход" // значение по умолчанию
				}

				// Добавляем данные о районе если есть
				if route.Area.ID != 0 {
					routeData["area_name"] = route.Area.Name
				} else {
					routeData["area_name"] = "Приэльбрусье" // значение по умолчанию
				}

				response = append(response, routeData)
			}

			c.JSON(http.StatusOK, response)
		})

		// ДОБАВЛЕНО: Отладочный эндпоинт для проверки всех маршрутов
		routeGroup.GET("/debug/all", func(c *gin.Context) {
			var routes []models.Route
			if err := db.Find(&routes).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка при получении маршрутов",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"total_count": len(routes),
				"routes":      routes,
			})
		})

		// GET /routes/:id - получить маршрут по ID
		routeGroup.GET("/:id", func(c *gin.Context) {
			id := c.Param("id")

			var route models.Route
			if err := db.Preload("Type").Preload("Area").Preload("Categories").First(&route, id).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Маршрут не найден",
				})
				return
			}

			// Формируем полный ответ
			response := gin.H{
				"id":          route.ID,
				"name":        route.Name,
				"description": route.Description,
				"overview":    route.Overview,
				"history":     route.History,
				"distance":    route.Distance,
				"duration":    route.Duration,
				"type_id":     route.TypeID,
				"area_id":     route.AreaID,
				"rating":      route.Rating,
				"is_active":   route.IsActive,
				"created_at":  route.CreatedAt,
				"updated_at":  route.UpdatedAt,
			}

			// Добавляем связанные данные
			if route.Type.ID != 0 {
				response["type"] = gin.H{
					"id":   route.Type.ID,
					"name": route.Type.Name,
				}
				response["type_name"] = route.Type.Name
			} else {
				response["type_name"] = "Пеший поход"
			}

			if route.Area.ID != 0 {
				response["area"] = gin.H{
					"id":   route.Area.ID,
					"name": route.Area.Name,
				}
				response["area_name"] = route.Area.Name
			} else {
				response["area_name"] = "Приэльбрусье"
			}

			// Добавляем категории
			if len(route.Categories) > 0 {
				var categories []gin.H
				for _, category := range route.Categories {
					categories = append(categories, gin.H{
						"id":   category.ID,
						"name": category.Name,
					})
				}
				response["categories"] = categories
			}

			c.JSON(http.StatusOK, response)
		})

		// POST /routes - создать маршрут (требует авторизацию)
		routeGroup.POST("", func(c *gin.Context) {
			// TODO: Добавить middleware авторизации
			var input struct {
				Name        string  `json:"name" binding:"required"`
				Description string  `json:"description" binding:"required"`
				Overview    string  `json:"overview"`
				History     string  `json:"history"`
				Distance    float64 `json:"distance" binding:"required"`
				Duration    float64 `json:"duration"`
				TypeID      uint    `json:"type_id" binding:"required"`
				AreaID      uint    `json:"area_id" binding:"required"`
				CategoryIDs []uint  `json:"category_ids"`
			}

			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Неверные данные: " + err.Error(),
				})
				return
			}

			route := models.Route{
				Name:        input.Name,
				Description: input.Description,
				Overview:    input.Overview,
				History:     input.History,
				Distance:    input.Distance,
				Duration:    input.Duration,
				TypeID:      input.TypeID,
				AreaID:      input.AreaID,
				IsActive:    true,
			}

			if err := db.Create(&route).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка при создании маршрута",
				})
				return
			}

			// Добавляем категории если указаны
			if len(input.CategoryIDs) > 0 {
				if err := db.Model(&route).Association("Categories").Replace(input.CategoryIDs); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Ошибка при добавлении категорий",
					})
					return
				}
			}

			c.JSON(http.StatusCreated, gin.H{
				"message": "Маршрут успешно создан",
				"route":   route,
			})
		})

		// PUT /routes/:id - обновить маршрут (требует авторизацию)
		routeGroup.PUT("/:id", func(c *gin.Context) {

			id := c.Param("id")

			var route models.Route
			if err := db.First(&route, id).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Маршрут не найден",
				})
				return
			}

			var input struct {
				Name        string  `json:"name"`
				Description string  `json:"description"`
				Overview    string  `json:"overview"`
				History     string  `json:"history"`
				Distance    float64 `json:"distance"`
				Duration    float64 `json:"duration"`
				TypeID      uint    `json:"type_id"`
				AreaID      uint    `json:"area_id"`
				IsActive    bool    `json:"is_active"`
				CategoryIDs []uint  `json:"category_ids"`
			}

			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Неверные данные: " + err.Error(),
				})
				return
			}

			// Обновляем только переданные поля
			updates := make(map[string]interface{})
			if input.Name != "" {
				updates["name"] = input.Name
			}
			if input.Description != "" {
				updates["description"] = input.Description
			}
			if input.Overview != "" {
				updates["overview"] = input.Overview
			}
			if input.History != "" {
				updates["history"] = input.History
			}
			if input.Distance != 0 {
				updates["distance"] = input.Distance
			}
			if input.Duration != 0 {
				updates["duration"] = input.Duration
			}
			if input.TypeID != 0 {
				updates["type_id"] = input.TypeID
			}
			if input.AreaID != 0 {
				updates["area_id"] = input.AreaID
			}
			updates["is_active"] = input.IsActive

			if err := db.Model(&route).Updates(updates).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка при обновлении маршрута",
				})
				return
			}

			// Обновляем категории если переданы
			if input.CategoryIDs != nil {
				if err := db.Model(&route).Association("Categories").Replace(input.CategoryIDs); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Ошибка при обновлении категорий",
					})
					return
				}
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Маршрут успешно обновлен",
				"route":   route,
			})
		})

		// DELETE /routes/:id - удалить маршрут (требует авторизацию)
		routeGroup.DELETE("/:id", func(c *gin.Context) {

			id := c.Param("id")

			var route models.Route
			if err := db.First(&route, id).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Маршрут не найден",
				})
				return
			}

			if err := db.Delete(&route).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка при удалении маршрута",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Маршрут успешно удален",
			})
		})
	}
}
