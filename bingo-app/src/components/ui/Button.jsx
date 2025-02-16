const Button = ({ children, className = '', disabled, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded transition-all ${
        disabled ? 'bg-gray-300 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
