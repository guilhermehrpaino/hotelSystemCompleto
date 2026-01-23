import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from './Modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  details
}) => {
  const { theme } = useTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        {/* Ícone de Sucesso */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Título */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Mensagem Principal */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>

        {/* Detalhes (opcional) */}
        {details && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {details}
            </p>
          </div>
        )}

        {/* Botão */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
