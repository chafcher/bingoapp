export default function Card({ children, className, onClick }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
