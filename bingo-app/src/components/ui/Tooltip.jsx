import { useState } from 'react';

const Tooltip = ({ children, content, delay = 300 }) => {
  const [show, setShow] = useState(false);
  let timeout;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => {
      setShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setShow(false);
  };

  return (
    <div 
      className="relative" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-sm px-2 py-1 rounded mb-2 whitespace-nowrap">
          {content}
          <div className="absolute w-2 h-2 bg-black transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
