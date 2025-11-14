import { useState, useEffect } from "react";

export const Slider = ({ 
  slides = [], 
  title = "", 
  textPosition = "left", // "left" or "right"
  totalSlides = 4 
}) => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    setProgress(0);
    const duration = 5000;
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / duration) * 100, 100);
      setProgress(percent);

      if (percent >= 100) {
        clearInterval(interval);
        nextSlide();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="relative flex-1 h-[559px] flex flex-col justify-between p-[27px] rounded-[14px] overflow-hidden">
      {/* Градиентный оверлей */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(16,16,16,0.04)] to-[rgba(16,16,16,0.4)] rounded-[14px] pointer-events-none z-10"></div>
      
      {/* Слайды */}
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((src, index) => (
          <div key={index} className="min-w-full h-full flex-shrink-0">
            <img
              src={src}
              alt={`Слайд ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Текст поверх */}
      <div className={`relative z-20 w-full ${textPosition === "left" ? "text-left" : "text-right"}`}>
        <p className="text-white text-[60px] font-bold leading-[1.2] uppercase whitespace-pre-wrap">
          {title}
        </p>
      </div>

      {/* Пагинация */}
      <div className="relative z-20 flex gap-[10px] w-full">
        {Array.from({ length: totalSlides }).map((_, index) => {
          const isActive = index === current;
          const isCompleted = index < current;
          
          return (
            <div 
              key={index} 
              className={`h-[4px] rounded-[4px] ${isActive || isCompleted ? "bg-[#f1f0ee]" : "bg-[rgba(241,240,238,0.3)]"}`}
              style={{ 
                width: "152px",
                position: "relative"
              }}
            >
              {isActive && (
                <div 
                  className="absolute h-[4px] bg-[#f1f0ee] rounded-[7px] top-0 left-0 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
