import styles from "./RatingBadge.module.css";

export const RatingBadge = () => {
  return (
    <div className={styles.rating_badge} aria-label="Рейтинг компании">
      <div className={styles.rating_content}>
        <span className={styles.rating_value} aria-label="Рейтинг 4.9 из 5">4,9</span>
        <div className={styles.stars} aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 0L7.5 4.5L12 4.5L8.25 7.5L9.75 12L6 9L2.25 12L3.75 7.5L0 4.5L4.5 4.5L6 0Z"
                fill="#FFB800"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};

