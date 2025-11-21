import { memo, useState, useRef, useEffect } from "react";

export const CodeInput = memo(({
  value = "",
  onChange,
  length = 6,
  className = "",
  required = false,
  disabled = false,
  bgColor = "#f1f0ee",
  onComplete,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  const [codes, setCodes] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Синхронизация с внешним value
    if (value && value.length === length) {
      const newCodes = value.split("").slice(0, length);
      setCodes(newCodes);
    } else if (!value) {
      setCodes(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (index, newValue) => {
    // Разрешаем только цифры
    if (newValue && !/^\d$/.test(newValue)) {
      return;
    }

    const newCodes = [...codes];
    newCodes[index] = newValue.slice(-1); // Берем только последний символ
    setCodes(newCodes);

    const codeString = newCodes.join("");
    onChange({ target: { value: codeString } });

    // Автоматический переход к следующему полю
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Вызываем onComplete когда все поля заполнены
    if (codeString.length === length && onComplete) {
      onComplete(codeString);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      const newCodes = pastedData.split("").concat(Array(length - pastedData.length).fill(""));
      setCodes(newCodes.slice(0, length));
      const codeString = newCodes.slice(0, length).join("");
      onChange({ target: { value: codeString } });
      if (codeString.length === length && onComplete) {
        onComplete(codeString);
      }
      // Фокус на последнее заполненное поле
      const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const bgClass = bgColor === "#e4e2df" ? "bg-[#e4e2df]" : bgColor === "#f1f0ee" ? "bg-[#f1f0ee]" : "bg-white";

  return (
    <div className={`w-full ${className}`}>
      <div className={`flex flex-col items-start rounded-[8px] transition-all ${bgClass} ${disabled ? "opacity-60" : ""}`}>
        <div className="h-[36px] rounded-[6px] shrink-0 w-full box-border flex items-center gap-[6px] overflow-clip pb-[10px] pt-[9px] px-[10px]">
          {codes.map((code, index) => (
            <div key={index} className="flex-1 relative">
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={disabled}
                required={required && index === 0}
                id={index === 0 ? id : undefined}
                aria-label={index === 0 ? ariaLabel : undefined}
                aria-describedby={index === 0 ? ariaDescribedBy : undefined}
                className={`w-full bg-transparent border-none outline-none text-[16px] font-inter font-medium text-[#888888] text-center caret-[#9B1E1C] leading-[1.2] ${disabled ? "cursor-not-allowed" : ""} focus:text-[#101010] transition-colors`}
                {...(index === 0 ? props : {})}
              />
              {index < length - 1 && (
                <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-px h-[20px] bg-[#E4E2DF]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CodeInput.displayName = "CodeInput";

