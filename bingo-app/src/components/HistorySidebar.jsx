export default function HistorySidebar({ isOpen, onClose, activeGridSize, onGridSizeChange }) {
  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4">History</h2>
        <div className="flex flex-col gap-2">
          {[5, 6, 7, 8].map((size) => (
            <button
              key={size}
              onClick={() => {
                onGridSizeChange(size);
                onClose();
              }}
              className={`p-2 rounded-lg ${
                size === activeGridSize ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
