import { memo, useState } from "react";

export const TextInput = memo(({
  value = "",
  onChange,
  placeholder = "",
  className = "",
  required = false,
  disabled = false,
  bgColor = "#f1f0ee", // Цвет фона по умолчанию
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

  const bgClass = bgColor === "#e4e2df" ? "bg-[#e4e2df]" : bgColor === "#f1f0ee" ? "bg-[#f1f0ee]" : "bg-white";
  const hoverBgClass = bgColor === "#e4e2df" ? "bg-[#e4e2df]" : bgColor === "#f1f0ee" ? "bg-[#f1f0ee]" : "bg-[#E4E2DF]";

  return (
    <div className={`w-full relative ${className}`}>
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
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            className={`w-full bg-transparent border-none outline-none text-[14px] font-inter font-medium text-[#888888] placeholder:text-[#888888] caret-[#9B1E1C] leading-[1.2] ${disabled ? "cursor-not-allowed" : ""}`}
            {...props}
          />
        </div>
      </div>
    </div>
  );
});

TextInput.displayName = "TextInput";

