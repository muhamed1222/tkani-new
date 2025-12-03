import { memo, useState } from "react";

export const Input = memo(({
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  className = "",
  required = false,
  disabled = false,
  bgColor = "#e4e2df", // Цвет фона по умолчанию
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const bgClass = bgColor === "#e4e2df" ? "bg-[#e4e2df]" : "bg-[#f1f0ee]";
  const hoverBgClass = bgColor === "#e4e2df" ? "bg-[#e4e2df]" : "bg-[#f1f0ee]";

  return (
    <div 
      className={`flex flex-col items-start rounded-[8px] transition-all ${
        isHovered && !isFocused && !value && !disabled
          ? hoverBgClass
          : bgClass
      } ${disabled ? "opacity-60" : ""}`}
      onMouseEnter={() => !isFocused && !value && !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-[36px] rounded-[6px] shrink-0 w-full box-border flex items-center overflow-clip pb-[10px] pt-[9px] px-[10px]">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={`w-full bg-transparent border-none outline-none text-[14px] font-inter font-medium text-[#888888] placeholder:text-[#888888] caret-[#9B1E1C] leading-[1.2] ${disabled ? "cursor-not-allowed" : ""} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = "Input";

