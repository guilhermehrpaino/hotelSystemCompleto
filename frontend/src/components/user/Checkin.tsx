import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quartoService, clienteService, reservaService } from '../../services/api';
import { QuartoResponse, ClienteResponse, ReservaResponse } from '../../services/api';
import { ehHoje, formatarDataBrasil, getDataAtualInput } from '../../utils/dateUtils';
import { getTipoQuarto } from '../../utils/quartoUtils';

interface CheckinData {
  reservaId: number;
  quartoId: number;
  clienteId: number;
  dataCheckin: string;
  observacoes: string;
}

const Checkin: React.FC = () => {
  const navigate = useNavigate();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CheckinData>({
    reservaId: 0,
    quartoId: 0,
    clienteId: 0,
    dataCheckin: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      console.log('Carregando dados para Check-in...');
      
      // Carregar todos os dados
      const [quartosData, clientesData, reservasData] = await Promise.all([
        quartoService.listarQuartos(),
        clienteService.listarClientes(),
        reservaService.listarReservas()
      ]);
      
      // Ordenar quartos por número
      const quartosOrdenados = quartosData.sort((a, b) => parseInt(a.numero.toString()) - parseInt(b.numero.toString()));
      setQuartos(quartosOrdenados);
      setClientes(clientesData);
      setReservas(reservasData);
      
      console.log('Dados carregados:', {
        quartos: quartosData.length,
        clientes: clientesData.length,
        reservas: reservasData.length
      });
      
      // Filtrar reservas que podem fazer check-in hoje
      const reservasHoje = reservasData.filter(reserva => {
        const quarto = quartosData.find(q => q.id === reserva.quartoId);
        return ehHoje(reserva.checkIn) && quarto?.status === 'RESERVADO';
      });
      
      console.log('Reservas para check-in hoje:', reservasHoje.length);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Não foi possível carregar os dados. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reservaId) {
      setErrorMessage('Selecione uma reserva para fazer check-in.');
      setShowError(true);
      return;
    }

    if (!formData.dataCheckin) {
      setErrorMessage('Preencha a data de check-in.');
      setShowError(true);
      return;
    }

    // Encontrar a reserva selecionada
    const reserva = reservas.find(r => r.id === formData.reservaId);
    if (!reserva) {
      setErrorMessage('Reserva não encontrada.');
      setShowError(true);
      return;
    }

    // Verificar se a data de check-in é hoje
    if (!ehHoje(formData.dataCheckin)) {
      setErrorMessage('Check-in só pode ser realizado no dia da reserva.');
      setShowError(true);
      return;
    }

    // Verificar status do quarto
    const quarto = quartos.find(q => q.id === reserva.quartoId);
    if (!quarto) {
      setErrorMessage('Quarto não encontrado.');
      setShowError(true);
      return;
    }

    if (quarto.status !== 'RESERVADO') {
      setErrorMessage(`Check-in não pode ser realizado. Status atual do quarto: ${quarto.status}`);
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      // Fazer check-in - backend deve atualizar status do quarto automaticamente
      const reservaAtualizada = await reservaService.fazerCheckIn(formData.reservaId);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/consultar-reservas');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao fazer check-in:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Erro ao fazer check-in';
        
        console.log('Erro da API:', { status, message });
        
        switch (status) {
          case 400:
            setErrorMessage(`Dados inválidos: ${message}`);
            break;
          case 404:
            setErrorMessage('Reserva não encontrada.');
            break;
          case 409:
            setErrorMessage('Check-in já realizado para esta reserva.');
            break;
          case 500:
            setErrorMessage('Erro interno do servidor. Tente novamente mais tarde.');
            break;
          default:
            setErrorMessage(`Erro ao fazer check-in: ${message}`);
        }
      } else if (error.request) {
        console.log('Erro de conexão');
        setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        console.log('Erro desconhecido');
        setErrorMessage('Não foi possível fazer check-in. Tente novamente.');
      }
      
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && quartos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Realizar Check-in</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Registre a entrada de hóspedes no sistema.
        </p>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Check-in Realizado com Sucesso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                O check-in foi registrado e você será redirecionado para a lista de quartos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Erro ao Realizar Check-in
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => setShowError(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reserva */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reserva para Check-in *
            </label>
            <select
              value={formData.reservaId}
              onChange={(e) => {
                const reservaId = parseInt(e.target.value);
                setFormData(prev => ({ ...prev, reservaId }));
                
                // Auto-preencher dados da reserva
                if (reservaId > 0) {
                  const reserva = reservas.find(r => r.id === reservaId);
                  if (reserva) {
                    setFormData(prev => ({ 
                      ...prev, 
                      reservaId,
                      quartoId: reserva.quartoId,
                      clienteId: reserva.clienteId
                    }));
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione uma reserva</option>
              {reservas
                .filter(reserva => {
                  const quarto = quartos.find(q => q.id === reserva.quartoId);
                  return ehHoje(reserva.checkIn) && quarto?.status === 'RESERVADO';
                })
                .map(reserva => {
                  const quarto = quartos.find(q => q.id === reserva.quartoId);
                  return (
                    <option key={reserva.id} value={reserva.id}>
                      {reserva.clienteNome} - Quarto {quarto?.numero} ({quarto?.numero ? getTipoQuarto(parseInt(quarto.numero.toString())) : ''}) ({formatarDataBrasil(reserva.checkIn)})
                    </option>
                  );
                })}
            </select>
            {reservas.filter(reserva => {
              const quarto = quartos.find(q => q.id === reserva.quartoId);
              return ehHoje(reserva.checkIn) && quarto?.status === 'RESERVADO';
            }).length === 0 && (
              <p className="text-sm text-yellow-500 mt-1">
                Nenhuma reserva disponível para check-in hoje.
              </p>
            )}
          </div>

          {/* Data de Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Check-in *
            </label>
            <input
              type="date"
              value={formData.dataCheckin}
              onChange={(e) => setFormData(prev => ({ ...prev, dataCheckin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Apenas check-ins no dia da reserva são permitidos.
            </p>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre o check-in (opcional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Resumo do Check-in */}
        {formData.reservaId > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Resumo do Check-in</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Quarto:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {(() => {
                    const quarto = quartos.find(q => q.id === formData.quartoId);
                    return quarto ? `${quarto.numero} - ${getTipoQuarto(parseInt(quarto.numero.toString()))}` : '';
                  })()}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {clientes.find(c => c.id === formData.clienteId)?.nome}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Data:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {formatarDataBrasil(formData.dataCheckin)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                  Aguardando confirmação
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || quartos.filter(q => q.status === 'RESERVADO').length === 0}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Realizar Check-in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkin;
