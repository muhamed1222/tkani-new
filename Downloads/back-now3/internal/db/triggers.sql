-- Функция для обновления рейтинга в places
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_place_id INTEGER;
BEGIN
    -- Определяем ID места в зависимости от операции
    IF TG_OP = 'DELETE' THEN
        target_place_id := OLD.place_id;
    ELSE
        target_place_id := NEW.place_id;
    END IF;
    
    -- Обновляем рейтинг только если place_id не NULL
    IF target_place_id IS NOT NULL THEN
        UPDATE places
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE place_id = target_place_id AND is_active = true
        )
        WHERE id = target_place_id;
    END IF;
    
    -- Возвращаем правильное значение в зависимости от операции
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Триггер для places (убираем WHEN условие)
DROP TRIGGER IF EXISTS place_rating_trigger ON reviews;
CREATE TRIGGER place_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_place_rating();

-- Функция для обновления рейтинга в routes
CREATE OR REPLACE FUNCTION update_route_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_route_id INTEGER;
BEGIN
    -- Определяем ID маршрута в зависимости от операции
    IF TG_OP = 'DELETE' THEN
        target_route_id := OLD.route_id;
    ELSE
        target_route_id := NEW.route_id;
    END IF;
    
    -- Обновляем рейтинг только если route_id не NULL
    IF target_route_id IS NOT NULL THEN
        UPDATE routes
        SET rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE route_id = target_route_id AND is_active = true
        )
        WHERE id = target_route_id;
    END IF;
    
    -- Возвращаем правильное значение в зависимости от операции
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Триггер для routes (убираем WHEN условие)
DROP TRIGGER IF EXISTS route_rating_trigger ON reviews;
CREATE TRIGGER route_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_route_rating();