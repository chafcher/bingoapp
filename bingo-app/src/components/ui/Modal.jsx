import React from 'react';

const Modal = ({ isOpen, onClose, title, actions, children, showCloseButton = true }) => {


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-darkBlue rounded-lg p-6 shadow-lg max-w-[90vw] max-h-[90vh] overflow-auto">

        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white"
          >
            X
          </button>
        )}

        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        {children}
        {actions && actions.length > 0 && (
          <div className="flex justify-end gap-2 mt-4">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 rounded ${
                  action.variant === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Modal;
