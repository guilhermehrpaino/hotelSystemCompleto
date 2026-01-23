import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative w-full ${sizeClasses[size]} transform transition-all`}>
          <div className={`relative rounded-lg shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border`}>
            
            {/* Header */}
            {title && (
              <div className={`px-6 py-4 border-b ${
                theme === 'dark' 
                  ? 'border-gray-700' 
                  : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' 
                    ? 'text-white' 
                    : 'text-gray-900'
                }`}>
                  {title}
                </h3>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${
              theme === 'dark' 
                ? 'border-gray-700' 
                : 'border-gray-200'
            } flex justify-end`}>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
