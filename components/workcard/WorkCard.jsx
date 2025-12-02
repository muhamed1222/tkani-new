// src/components/workcard/WorkCard.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { WORK_ROUTE } from "../../utils/consts";
import styles from "./WorkCard.module.css";

export const WorkCard = ({ work }) => {
  const [imageError, setImageError] = useState(false);
  const defaultPlaceholder = "https://via.placeholder.com/800x600/F1F0EE/888888?text=Work+Image";
  const [imageSrc, setImageSrc] = useState(work?.image || defaultPlaceholder);

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(defaultPlaceholder);
      e.target.onerror = null;
    }
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', imageSrc);
  };

  return (
    <div className={styles.workCard}>
      <div className={styles.cardContent}>
        <div className={styles.contentWrapper}>
          {/* Изображение */}
          <div className={styles.imageContainer}>
            <img 
              src={imageSrc} 
              alt={work.title} 
              className={styles.workImage}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {/* Элемент с точками в левом нижнем углу */}
            <div className={styles.dotsIndicator}>
              <div className={styles.dotLarge}></div>
              <div className={styles.dotSmall}></div>
              <div className={styles.dotSmall}></div>
              <div className={styles.dotSmall}></div>
            </div>
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