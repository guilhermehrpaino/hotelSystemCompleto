import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService, ReservaResponse } from '../../services/api';
import { formatarDataBrasil } from '../../utils/dateUtils';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

const CancelarReserva: React.FC = () => {
  const navigate = useNavigate();
  
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<number>(0);
  const [motivoCancelamento, setMotivoCancelamento] = useState<string>('');
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState<number | null>(null);

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    setIsLoading(true);
    try {
      const reservasData = await reservaService.listarReservas();
      // Filtrar apenas reservas que podem ser canceladas (ATIVAS e RESERVADAS)
      const reservasCancelaveis = reservasData.filter(reserva => 
        reserva.status === 'ATIVA' || reserva.status === 'RESERVADA'
      );
      setReservas(reservasCancelaveis);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      setErrorMessage('Não foi possível carregar as reservas. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelecionarReserva = (reservaId: number) => {
    setReservaSelecionada(reservaId);
    setMotivoCancelamento('');
  };

  const handleConfirmarCancelamento = () => {
    if (!reservaSelecionada) {
      setErrorMessage('Selecione uma reserva para cancelar.');
      setShowError(true);
      return;
    }

    if (!motivoCancelamento.trim()) {
      setErrorMessage('Informe o motivo do cancelamento.');
      setShowError(true);
      return;
    }

    setShowConfirmacao(true);
  };

  const handleExecutarCancelamento = async () => {
    if (!reservaSelecionada) return;

    setIsLoadingAction(reservaSelecionada);
    try {
      await reservaService.cancelarReserva(reservaSelecionada, motivoCancelamento);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/consultar-reservas');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      setErrorMessage('Não foi possível cancelar a reserva. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoadingAction(null);
      setShowConfirmacao(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'RESERVADA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return '✅';
      case 'RESERVADA':
        return '📅';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cancelar Reserva</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Selecione uma reserva e informe o motivo do cancelamento
          </p>
        </div>

        {/* Lista de Reservas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reservas Disponíveis para Cancelamento</h2>
          
          {reservas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma reserva disponível para cancelamento no momento.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Apenas reservas ATIVAS ou RESERVADAS podem ser canceladas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservas.map((reserva) => (
                <div
                  key={reserva.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                    reservaSelecionada === reserva.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => handleSelecionarReserva(reserva.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Reserva #{reserva.id}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cliente: {reserva.clienteNome}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quarto: {reserva.quartoNumero}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Check-in: {formatarDataBrasil(reserva.checkIn)} - Check-out: {formatarDataBrasil(reserva.checkOut)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.status)}`}>
                            <span className="mr-1">{getStatusIcon(reserva.status)}</span>
                            {reserva.status}
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Valor: {reserva.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Cancelamento */}
        {reservaSelecionada > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Motivo do Cancelamento</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo do Cancelamento *
              </label>
              <textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Descreva o motivo do cancelamento..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate('/user/consultar-reservas')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmarCancelamento}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Cancelar Reserva
              </button>
            </div>
          </div>
        )}

        {/* Botão Voltar (quando não há reservas) */}
        {reservas.length === 0 && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/user/consultar-reservas')}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Voltar para Reservas
            </button>
          </div>
        )}

        {/* Modal de Confirmação */}
        {showConfirmacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirmar Cancelamento
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Tem certeza que deseja cancelar a Reserva #{reservaSelecionada}?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Esta ação não poderá ser desfeita.
              </p>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "{motivoCancelamento}"
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmacao(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Voltar
                </button>
                <button
                  onClick={handleExecutarCancelamento}
                  disabled={isLoadingAction === reservaSelecionada}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingAction === reservaSelecionada ? 'Processando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Sucesso */}
        {showSuccess && (
          <SuccessModal
            isOpen={showSuccess}
            title="Sucesso!"
            message="Reserva cancelada com sucesso!"
            onClose={() => setShowSuccess(false)}
          />
        )}

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

export default CancelarReserva;
