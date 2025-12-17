import { useState, useEffect, useCallback } from "react";

export const Slider = ({ 
  slides = [], 
  title = "", 
  totalSlides = 4,
  textPosition = "left" // "left" or "right"
}) => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  // Используем totalSlides для переключения, если он больше 0, иначе slides.length
  const actualTotalSlides = totalSlides > 0 ? totalSlides : slides.length;

  const nextSlide = useCallback(() => {
    if (actualTotalSlides === 0) return;
    setCurrent((prev) => (prev + 1) % actualTotalSlides);
  }, [actualTotalSlides]);

  useEffect(() => {
    if (slides.length === 0 || actualTotalSlides === 0) return;
    
    setProgress(0);
    const duration = 5000; // 5 секунд на слайд
    const startTime = Date.now();
    let animationFrameId = null;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(percent);

      if (percent < 100) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        // После полного заполнения переключаемся на следующий слайд
        setTimeout(() => {
          nextSlide();
        }, 100);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [current, nextSlide, slides.length]);

  return (
    <div className="relative flex-1 flex flex-col justify-between p-[12px] md:p-[20px] lg:p-[28px] rounded-[14px] overflow-hidden h-full">
      {/* Градиентный оверлей */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(16,16,16,0.04)] to-[rgba(16,16,16,0.4)] rounded-[14px] pointer-events-none z-10"></div>
      
      {/* Слайды */}
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {Array.from({ length: actualTotalSlides }).map((_, index) => {
          // Используем изображение из slides, если оно есть, иначе используем первое доступное или placeholder
          const slideIndex = index % slides.length;
          const slideSrc = slides.length > 0 ? slides[slideIndex] : '/placeholder-product.jpg';
          
          return (
            <div key={index} className="min-w-full h-full flex-shrink-0">
              <img
                src={slideSrc}
                alt={`Слайд ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>

      {/* Текст поверх */}
      <div className={`relative z-20 w-full ${textPosition === "left" ? "text-left" : "text-right"}`}>
        {Array.isArray(title) ? (
          <p className="text-white text-[34px] md:text-[46px] lg:text-[64px] font-bold leading-[1.2] uppercase">
            {title.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-white text-[34px] md:text-[46px] lg:text-[64px] font-bold leading-[1.2] uppercase whitespace-pre-wrap">
            {title}
          </p>
        )}
      </div>

      {/* Пагинация */}
      <div className="relative z-20 flex gap-[8px] w-full">
        {Array.from({ length: actualTotalSlides }).map((_, index) => {
          const isActive = index === current;
          const isCompleted = index < current;
          
          // Определяем ширину прогресс-бара
          let progressWidth = 0;
          if (isCompleted) {
            progressWidth = 100;
          } else if (isActive) {
            progressWidth = progress;
          }
          
          return (
            <div 
              key={index} 
              className="relative flex-1"
              style={{ 
                height: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)"
              }}
            >
              {/* Прогресс-бар */}
              <div 
                className="absolute top-0 left-0 h-full rounded-[4px]"
                style={{ 
                  width: `${progressWidth}%`,
                  backgroundColor: "#f1f0ee",
                  transition: isActive ? "none" : "width 0.3s ease",
                  boxShadow: "0 0 4px rgba(241, 240, 238, 0.5)"
                }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};