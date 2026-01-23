import React from 'react';
import Modal from './Modal';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  isOpen, 
  onClose, 
  title = 'Erro', 
  message, 
  details 
}) => {
  const { theme } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {/* Icon and Message */}
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            theme === 'dark' 
              ? 'bg-red-900 dark:bg-red-900' 
              : 'bg-red-100'
          }`}>
            <svg className={`w-6 h-6 ${
              theme === 'dark' 
                ? 'text-red-400' 
                : 'text-red-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className={`font-medium ${
              theme === 'dark' 
                ? 'text-white' 
                : 'text-gray-900'
            }`}>
              {message}
            </p>
          </div>
        </div>

        {/* Details (optional) */}
        {details && (
          <div className={`mt-3 p-3 rounded-md text-sm ${
            theme === 'dark' 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-50 text-gray-600'
          }`}>
            <div className="font-medium mb-1">Detalhes:</div>
            <div className="font-mono text-xs">{details}</div>
          </div>
        )}

        {/* Instructions */}
        <div className={`text-sm ${
          theme === 'dark' 
            ? 'text-gray-400' 
            : 'text-gray-600'
        }`}>
          Clique em "OK" para fechar esta mensagem.
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;
