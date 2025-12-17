// src/components/workcard/WorkCard.jsx
import logger from '../../utils/logger';
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { WORK_ROUTE } from "../../utils/consts";
import { buildImageUrl } from "../../utils/apiConfig";
import styles from "./WorkCard.module.css";

export const WorkCard = ({ work }) => {
  const [imageError, setImageError] = useState(false);
  const defaultPlaceholder = "/placeholder-product.svg";
  
  // Используем первое изображение из массива images, или fallback на image для обратной совместимости
  const imageSrc = useMemo(() => {
    if (!work) {
      logger.log('🖼️ No work data, using placeholder');
      return defaultPlaceholder;
    }

    // Сначала пробуем массив images
    if (work.images && Array.isArray(work.images) && work.images.length > 0) {
      const firstImage = work.images[0];
      logger.log('🖼️ Using first image from images array:', firstImage);
      // Если это уже URL строка, используем её, иначе обрабатываем через buildImageUrl
      if (typeof firstImage === 'string') {
        return firstImage.startsWith('http') || firstImage.startsWith('/') 
          ? firstImage 
          : buildImageUrl(firstImage, defaultPlaceholder);
      }
      return buildImageUrl(firstImage, defaultPlaceholder);
    }
    
    // Пробуем поле image
    if (work.image) {
      logger.log('🖼️ Using image field:', work.image);
      if (typeof work.image === 'string') {
        return work.image.startsWith('http') || work.image.startsWith('/') 
          ? work.image 
          : buildImageUrl(work.image, defaultPlaceholder);
      }
      return buildImageUrl(work.image, defaultPlaceholder);
    }
    
    logger.log('🖼️ No images found, using placeholder');
    return defaultPlaceholder;
  }, [work?.images, work?.image, work?.id]);

  const handleImageError = (e) => {
    logger.log('❌ Image error, setting placeholder');
    if (e.target.src !== defaultPlaceholder) {
      e.target.src = defaultPlaceholder;
      setImageError(true);
    }
  };

  const handleImageLoad = (e) => {
    logger.log('✅ Image loaded successfully:', imageSrc);
    setImageError(false);
  };

  if (!work) {
    return null;
  }

  return (
    <div className={styles.workCard}>
      <div className={styles.cardContent}>
        <div className={styles.contentWrapper}>
          {/* Изображение */}
          <div className={styles.imageContainer}>
            <img 
              src={imageSrc} 
              alt={work.title || 'Работа'} 
              className={styles.workImage}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
          
          {/* Контент */}
          <div className={styles.textContent}>
            {/* Название */}
            <div className={styles.titleContainer}>
              <p className={styles.workTitle}>
                {work.title || "Платье из вискозного шифона \"Флаурэль\" для выстаки \"Гранд Текстиль\""}
              </p>
            </div>
            
            {/* Кнопка "Подробнее" */}
            <Link
              to={`${WORK_ROUTE}/${work.id}`}
              className={styles.detailsButton}
            >
              <span className={styles.buttonText}>
                Подробнее
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};