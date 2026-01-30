import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService, ReservaResponse } from '../../services/api';
import { formatarDataBrasil } from '../../utils/dateUtils';
import ErrorModal from '../common/ErrorModal';

const ConsultarReservasFinalizadas: React.FC = () => {
  const navigate = useNavigate();
  
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    setIsLoading(true);
    try {
      const reservasData = await reservaService.listarReservas();
      // Filtrar apenas reservas FINALIZADAS
      const reservasFinalizadas = reservasData.filter(reserva => reserva.status === 'FINALIZADA');
      setReservas(reservasFinalizadas);
    } catch (error) {
      console.error('Erro ao carregar reservas finalizadas:', error);
      setErrorMessage('Não foi possível carregar as reservas finalizadas. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINALIZADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FINALIZADA':
        return '🏁';
      default:
        return '❓';
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filtrarReservas = () => {
    return reservas.filter(reserva => {
      const matchTermo = termoBusca === '' || 
        reserva.clienteNome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        reserva.quartoNumero?.toString().toLowerCase().includes(termoBusca.toLowerCase()) ||
        reserva.id.toString().includes(termoBusca.toLowerCase());

      const matchDataInicio = dataInicio === '' || reserva.checkOut >= dataInicio;
      const matchDataFim = dataFim === '' || reserva.checkOut <= dataFim;

      return matchTermo && matchDataInicio && matchDataFim;
    });
  };

  const reservasFiltradas = filtrarReservas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando reservas finalizadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reservas Finalizadas</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Consulte todas as reservas que já foram concluídas
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar por cliente, quarto ou ID
              </label>
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Digite para buscar..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Checkout (início)
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Checkout (fim)
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Reservas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reservas Finalizadas ({reservasFiltradas.length})
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total: {reservas.length} reservas
              </div>
            </div>
          </div>

          {reservasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {reservas.length === 0 
                  ? 'Nenhuma reserva finalizada encontrada.'
                  : 'Nenhuma reserva encontrada com os filtros aplicados.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quarto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reservasFiltradas.map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{reserva.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">{reserva.clienteNome}</div>
                          {reserva.cliente?.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {reserva.cliente.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {reserva.quartoNumero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div>{formatarDataBrasil(reserva.checkIn)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            até {formatarDataBrasil(reserva.checkOut)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatarMoeda(reserva.valorTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.status)}`}>
                          <span className="mr-1">{getStatusIcon(reserva.status)}</span>
                          {reserva.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Botão Voltar */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/user/consultar-reservas')}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            Voltar para Consultar Reservas
          </button>
        </div>

        {/* Modal de Erro */}
        {showError && (
          <ErrorModal
            isOpen={showError}
            title="Erro"
            message={errorMessage}
            onClose={() => setShowError(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ConsultarReservasFinalizadas;
