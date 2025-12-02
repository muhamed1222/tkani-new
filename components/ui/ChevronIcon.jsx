export const ChevronIcon = ({ className = "", isOpen = false }) => {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={{
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease'
      }}
    >
      <path 
        d="M6 4L10 8L6 12" 
        stroke="#C2C2C2" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

