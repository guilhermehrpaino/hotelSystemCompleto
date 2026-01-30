import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quartoService, QuartoResponse } from '../../services/api';
import { getTipoQuarto } from '../../utils/quartoUtils';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

const ConfirmarLimpeza: React.FC = () => {
  const navigate = useNavigate();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    carregarQuartos();
  }, []);

  const carregarQuartos = async () => {
    try {
      const quartosData = await quartoService.listarQuartos();
      // Ordenar quartos por número
      const quartosOrdenados = quartosData.sort((a, b) => parseInt(a.numero.toString()) - parseInt(b.numero.toString()));
      setQuartos(quartosOrdenados);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
      setErrorMessage('Não foi possível carregar os quartos. Tente novamente.');
      setShowError(true);
    }
  };

  const handleConfirmarLimpeza = async (quartoId: number) => {
    setIsLoading(true);
    try {
      // Atualizar status do quarto para DISPONIVEL
      await quartoService.atualizarStatusQuarto(quartoId, 'DISPONIVEL');
      
      // Recarregar a lista de quartos
      await carregarQuartos();
      
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Erro ao confirmar limpeza:', error);
      setErrorMessage('Não foi possível confirmar a limpeza. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const quartosSujos = quartos.filter(quarto => quarto.status === 'SUJO');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Confirmar Limpeza
            </h2>
            <button
              onClick={() => navigate('/user/status-quartos')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Voltar
            </button>
          </div>

          {/* Estatísticas */}
          <div className="bg-cyan-50 dark:bg-cyan-900 rounded-lg p-4 mb-6 border border-cyan-200 dark:border-cyan-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                  Quartos para Limpar
                </p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {quartosSujos.length}
                </p>
              </div>
              <div className="text-4xl">🧹</div>
            </div>
          </div>

          {quartosSujos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum quarto para limpar
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todos os quartos estão limpos no momento.
              </p>
              <button
                onClick={() => navigate('/user/status-quartos')}
                className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200"
              >
                Ver Status dos Quartos
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Diária
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {quartosSujos.map((quarto) => (
                    <tr key={quarto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {quarto.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getTipoQuarto(parseInt(quarto.numero.toString()))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          R$ {quarto.diaria.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                          <span className="mr-1">🧹</span>
                          Sujo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleConfirmarLimpeza(quarto.id)}
                          disabled={isLoading}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Processando...' : 'Confirmar Limpeza'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showError && (
        <ErrorModal
          isOpen={showError}
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          isOpen={showSuccess}
          title="Sucesso!"
          message="Limpeza confirmada! O quarto está disponível novamente."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default ConfirmarLimpeza;
