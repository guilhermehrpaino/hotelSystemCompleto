import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const CadastrarQuarto: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastrar Quarto</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Funcionalidade em desenvolvimento
          </p>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Funcionalidade em Desenvolvimento
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Esta funcionalidade será implementada em breve.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastrarQuarto;
