import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quartoService, clienteService, reservaService } from '../../services/api';
import { QuartoResponse, ClienteResponse, ReservaResponse } from '../../services/api';
import { getTipoQuarto } from '../../utils/quartoUtils';
import { 
  converterParaBrasilia, 
  formatarDataInput, 
  formatarDataBrasil, 
  getDataAtualBrasilia, 
  getDataAtualInput,
  calcularDiferencaDias,
  adicionarDias,
  ehHoje,
  ehPosteriorHoje
} from '../../utils/dateUtils';

interface CheckoutData {
  quartoId: number;
  clienteId: number;
  dataCheckout: string;
  hospedes: number;
  diarias: number;
  valorTotal: number;
  observacoes: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutData>({
    quartoId: 0,
    clienteId: 0,
    dataCheckout: getDataAtualInput(),
    hospedes: 1,
    diarias: 1,
    valorTotal: 0,
    observacoes: ''
  });

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    calcularValorTotal();
  }, [formData.quartoId, formData.diarias, formData.hospedes]);

  // Auto-preencher cliente quando o quarto é selecionado
  useEffect(() => {
    if (formData.quartoId) {
      const clienteHospedado = getClienteHospedado(formData.quartoId);
      const reservaAtiva = getReservaAtiva(formData.quartoId);
      
      if (clienteHospedado && reservaAtiva) {
        // Usar a data de check-out prevista da reserva
        const dataCheckout = reservaAtiva.checkOut;
        
        setFormData(prev => ({
          ...prev,
          clienteId: clienteHospedado.id,
          hospedes: reservaAtiva.numeroHospedes, // Usa o número de hóspedes da reserva
          dataCheckout: dataCheckout // Usa data prevista da reserva
        }));
      }
    } else {
      // Resetar data quando não há quarto selecionado (data atual em Brasília)
      setFormData(prev => ({
        ...prev,
        clienteId: 0,
        hospedes: 1,
        dataCheckout: getDataAtualInput()
      }));
    }
  }, [formData.quartoId]);

  // Calcular diárias automaticamente quando a data de check-out mudar
  useEffect(() => {
    if (formData.quartoId && formData.dataCheckout) {
      const reservaAtiva = getReservaAtiva(formData.quartoId);
      if (reservaAtiva) {
        // Calcular diferença em dias usando função global
        const diarias = calcularDiferencaDias(reservaAtiva.checkIn, formData.dataCheckout);
        
        // Mínimo 1 diária
        setFormData(prev => ({ ...prev, diarias: Math.max(1, diarias) }));
      }
    }
  }, [formData.quartoId, formData.dataCheckout]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar todos os dados
      const [quartosData, clientesData, reservasData] = await Promise.all([
        quartoService.listarQuartos(),
        clienteService.listarClientes(),
        reservaService.listarReservas()
      ]);
      
      // Ordenar quartos por número antes de filtrar
      const quartosOrdenados = quartosData.sort((a, b) => parseInt(a.numero.toString()) - parseInt(b.numero.toString()));
      
      // Filtrar apenas quartos OCUPADOS
      const quartosOcupados = quartosOrdenados.filter(quarto => quarto.status === 'OCUPADO');
      
      setQuartos(quartosOcupados);
      setClientes(clientesData);
      setReservas(reservasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Não foi possível carregar os dados. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar o cliente hospedado no quarto
  const getClienteHospedado = (quartoId: number): ClienteResponse | null => {
    const reserva = reservas.find(r => r.quartoId === quartoId && r.status === 'ATIVA');
    if (!reserva) return null;
    
    return clientes.find(c => c.id === reserva.clienteId) || null;
  };

  // Função para buscar a reserva ativa do quarto
  const getReservaAtiva = (quartoId: number): ReservaResponse | null => {
    return reservas.find(r => r.quartoId === quartoId && r.status === 'ATIVA') || null;
  };

  const calcularValorTotal = () => {
    if (!formData.quartoId) return;

    const quarto = quartos.find(q => q.id === formData.quartoId);
    if (!quarto) return;

    const valorTotal = formData.diarias * quarto.diaria;
    setFormData(prev => ({ ...prev, valorTotal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quartoId || !formData.clienteId || !formData.dataCheckout) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      setShowError(true);
      return;
    }

    const quarto = quartos.find(q => q.id === formData.quartoId);
    if (!quarto) {
      setErrorMessage('Quarto não encontrado.');
      setShowError(true);
      return;
    }

    if (quarto.status !== 'OCUPADO') {
      setErrorMessage('Check-out só pode ser realizado em quartos ocupados.');
      setShowError(true);
      return;
    }

    // Buscar a reserva ativa para enviar os dados
    const reservaAtiva = getReservaAtiva(formData.quartoId);
    if (!reservaAtiva) {
      setErrorMessage('Reserva ativa não encontrada para este quarto.');
      setShowError(true);
      return;
    }

    // Validar data de check-out
    if (calcularDiferencaDias(reservaAtiva.checkIn, formData.dataCheckout) <= 0) {
      setErrorMessage(`Data de check-out (${formData.dataCheckout}) deve ser posterior ao check-in (${formatarDataBrasil(reservaAtiva.checkIn)}).`);
      setShowError(true);
      return;
    }

    // Validar se data de check-out não é anterior à data prevista
    if (formData.dataCheckout < reservaAtiva.checkOut) {
      setErrorMessage(`Data de check-out (${formData.dataCheckout}) não pode ser anterior à data prevista (${formatarDataBrasil(reservaAtiva.checkOut)}).`);
      setShowError(true);
      return;
    }

    // Validar data futura
    if (ehPosteriorHoje(formData.dataCheckout)) {
      setErrorMessage('Data de check-out não pode ser futura.');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      // Preparar dados para enviar para a API
      const checkoutData = {
        reservaId: reservaAtiva.id,
        quartoId: formData.quartoId,
        clienteId: formData.clienteId,
        dataCheckout: formData.dataCheckout,
        diarias: formData.diarias,
        valorTotal: formData.valorTotal,
        observacoes: formData.observacoes
      };

      console.log('🔄 Iniciando processo de check-out...');
      console.log('📋 Dados do checkout:', checkoutData);
      console.log('🏨 ID da reserva:', reservaAtiva.id);
      console.log('🏠 ID do quarto:', formData.quartoId);

      // Fazer check-out (atualizar status da reserva para FINALIZADA)
      console.log('⬆️ Enviando PUT para /reservas/' + reservaAtiva.id);
      const reservaResponse = await reservaService.fazerCheckOut(reservaAtiva.id);
      console.log('✅ Reserva atualizada:', reservaResponse);
      
      // Atualizar status do quarto para DISPONIVEL
      console.log('🏠 Enviando PUT para /quartos/' + formData.quartoId + '/status');
      const quartoResponse = await quartoService.atualizarStatusQuarto(formData.quartoId, 'DISPONIVEL');
      console.log('✅ Quarto atualizado:', quartoResponse);
      
      // Redirecionar para tela de pagamento com os dados
      navigate('/user/pagamento', { 
        state: { 
          checkoutData: {
            reservaId: reservaAtiva.id,
            quartoId: formData.quartoId,
            clienteId: formData.clienteId,
            clienteNome: getClienteHospedado(formData.quartoId)?.nome,
            quartoNumero: quartos.find(q => q.id === formData.quartoId)?.numero,
            dataCheckout: formData.dataCheckout,
            diarias: formData.diarias,
            valorTotal: formData.valorTotal
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao realizar check-out:', error);
      setErrorMessage('Não foi possível realizar o check-out. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Realizar Check-out</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Registre a saída de hóspedes e finalize a estadia.
        </p>
      </div>

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
                Erro ao Realizar Check-out
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
          {/* Quarto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quarto *
            </label>
            <select
              value={formData.quartoId}
              onChange={(e) => setFormData(prev => ({ ...prev, quartoId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione um quarto</option>
              {quartos
                .filter(q => q.status === 'OCUPADO')
                .map(quarto => (
                  <option key={quarto.id} value={quarto.id}>
                    {quarto.numero} - {getTipoQuarto(parseInt(quarto.numero.toString()))} ({formatarMoeda(quarto.diaria)}/noite)
                  </option>
                ))}
            </select>
            {quartos.filter(q => q.status === 'OCUPADO').length === 0 && (
              <p className="text-sm text-yellow-500 mt-1">
                Nenhum quarto ocupado disponível para check-out.
              </p>
            )}
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente *
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {formData.quartoId ? (
                (() => {
                  const clienteHospedado = getClienteHospedado(formData.quartoId);
                  return clienteHospedado 
                    ? `${clienteHospedado.nome} - ${clienteHospedado.cpf}`
                    : 'Cliente não encontrado';
                })()
              ) : (
                'Selecione um quarto para ver o cliente'
              )}
            </div>
          </div>

          {/* Data Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Check-out *
            </label>
            <input
              type="date"
              value={formData.dataCheckout}
              onChange={(e) => setFormData(prev => ({ ...prev, dataCheckout: e.target.value }))}
              min={(() => {
                if (formData.quartoId) {
                  const reservaAtiva = getReservaAtiva(formData.quartoId);
                  if (reservaAtiva) {
                    // Data mínima = data de check-out prevista da reserva
                    return reservaAtiva.checkOut;
                  }
                }
                // Data atual em Brasília
                return getDataAtualInput();
              })()}
              max={getDataAtualInput()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {formData.quartoId && (() => {
              const reservaAtiva = getReservaAtiva(formData.quartoId);
              if (reservaAtiva) {
                if (calcularDiferencaDias(reservaAtiva.checkIn, formData.dataCheckout) <= 0) {
                  return (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ Data de check-out deve ser posterior ao check-in ({formatarDataBrasil(reservaAtiva.checkIn)})
                    </p>
                  );
                }
              }
              return null;
            })()}
          </div>

          {/* Número de Hóspedes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Hóspedes *
            </label>
            <input
              type="number"
              value={formData.hospedes}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              required
            />
          </div>

          {/* Diárias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diárias *
            </label>
            <input
              type="number"
              value={formData.diarias}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Calculado automaticamente: {(() => {
                if (formData.quartoId) {
                  const reservaAtiva = getReservaAtiva(formData.quartoId);
                  if (reservaAtiva) {
                    return `${formatarDataBrasil(reservaAtiva.checkIn)} → ${formatarDataBrasil(reservaAtiva.checkOut)} (previsto)`;
                  }
                }
                return 'Selecione quarto';
              })()}
            </p>
          </div>

          {/* Valor Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Total
            </label>
            <input
              type="text"
              value={formatarMoeda(formData.valorTotal)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Observações */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Informações adicionais sobre o check-out..."
          />
        </div>

        {/* Resumo da Reserva */}
        {formData.quartoId && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 Resumo da Reserva Ativa
            </h3>
            {(() => {
              const reservaAtiva = getReservaAtiva(formData.quartoId);
              const clienteHospedado = getClienteHospedado(formData.quartoId);
              const quarto = quartos.find(q => q.id === formData.quartoId);
              
              if (!reservaAtiva || !clienteHospedado || !quarto) {
                return <p className="text-blue-700 dark:text-blue-300">Reserva não encontrada</p>;
              }
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Cliente:</span>
                    <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                      {clienteHospedado.nome}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Quarto:</span>
                    <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                      {quarto.numero} - {getTipoQuarto(parseInt(quarto.numero.toString()))}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Check-in:</span>
                    <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                      {formatarDataBrasil(reservaAtiva.checkIn)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Check-out Previsto:</span>
                    <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                      {formatarDataBrasil(reservaAtiva.checkOut)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Diárias:</span>
                    <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                      {formData.diarias} ({formData.diarias === 1 ? 'dia' : 'dias'})
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Hóspedes:</span>
                    <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                      {formData.hospedes}
                    </span>
                  </div>
                </div>
              );
            })()}
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
            disabled={isLoading || quartos.filter(q => q.status === 'OCUPADO').length === 0}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Confirmar Check-out'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
