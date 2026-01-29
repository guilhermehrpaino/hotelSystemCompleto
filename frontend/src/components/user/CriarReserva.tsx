import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quartoService, clienteService, reservaService } from '../../services/api';
import { QuartoResponse, ClienteResponse, ReservaRequest } from '../../services/api';

const CriarReserva: React.FC = () => {
  const navigate = useNavigate();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ReservaRequest>({
    clienteId: 0,
    clienteNome: '',
    quartoId: 0,
    quartoNumero: '',
    checkIn: '',
    checkOut: '',
    numeroHospedes: 1,
    valorTotal: 0,
    observacoes: ''
  });

  const [quartosDisponiveis, setQuartosDisponiveis] = useState<QuartoResponse[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificandoDisponibilidade, setVerificandoDisponibilidade] = useState(false);
  const [disponibilidadeVerificada, setDisponibilidadeVerificada] = useState<boolean | null>(null);
  const [verificandoReservaCliente, setVerificandoReservaCliente] = useState(false);
  const [reservaClienteVerificada, setReservaClienteVerificada] = useState<{ temReserva: boolean; mensagem?: string } | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    // Filtrar quartos disponíveis
    const disponiveis = quartos.filter(q => q.status === 'DISPONIVEL');
    setQuartosDisponiveis(disponiveis);
  }, [quartos]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [quartosData, clientesData] = await Promise.all([
        quartoService.listarQuartos(),
        clienteService.listarClientes()
      ]);
      
      setQuartos(quartosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Não foi possível carregar os dados. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularValorTotal = () => {
    if (!formData.checkIn || !formData.checkOut || !formData.quartoId) {
      return;
    }

    const quarto = quartos.find(q => q.id === formData.quartoId);
    if (!quarto) return;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const dias = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dias > 0) {
      const valorTotal = dias * quarto.diaria;
      setFormData(prev => ({ ...prev, valorTotal }));
    }
  };

  useEffect(() => {
    calcularValorTotal();
  }, [formData.checkIn, formData.checkOut, formData.quartoId]);

  // Verificar disponibilidade em tempo real quando mudar datas ou quarto
  useEffect(() => {
    const verificarDisponibilidadeEmTempoReal = async () => {
      if (formData.quartoId && formData.checkIn && formData.checkOut) {
        setVerificandoDisponibilidade(true);
        setDisponibilidadeVerificada(null);
        
        console.log('Verificando disponibilidade:', {
          quartoId: formData.quartoId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut
        });
        
        try {
          const disponivel = await reservaService.verificarDisponibilidade(
            formData.quartoId,
            formData.checkIn,
            formData.checkOut
          );
          
          console.log('Resultado disponibilidade:', disponivel);
          setDisponibilidadeVerificada(disponivel);
        } catch (error) {
          console.error('Erro ao verificar disponibilidade:', error);
          // Se der erro na verificação, permitir a reserva (fallback)
          setDisponibilidadeVerificada(true);
        } finally {
          setVerificandoDisponibilidade(false);
        }
      } else {
        setDisponibilidadeVerificada(null);
      }
    };

    // Debounce para não fazer muitas requisições
    const timeoutId = setTimeout(verificarDisponibilidadeEmTempoReal, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.quartoId, formData.checkIn, formData.checkOut]);

  // Verificar se cliente já tem reserva ativa
  useEffect(() => {
    const verificarReservaClienteEmTempoReal = async () => {
      if (formData.clienteId) {
        setVerificandoReservaCliente(true);
        setReservaClienteVerificada(null);
        
        try {
          const resultado = await reservaService.verificarReservaCliente(formData.clienteId);
          
          setReservaClienteVerificada(resultado);
        } catch (error) {
          console.error('Erro ao verificar reserva do cliente:', error);
          setReservaClienteVerificada({ temReserva: true, mensagem: 'Erro ao verificar reservas do cliente' });
        } finally {
          setVerificandoReservaCliente(false);
        }
      } else {
        setReservaClienteVerificada(null);
      }
    };

    // Debounce para não fazer muitas requisições
    const timeoutId = setTimeout(verificarReservaClienteEmTempoReal, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Tentando criar reserva:', formData);
    
    if (!formData.clienteId || !formData.quartoId || !formData.checkIn || !formData.checkOut) {
      console.log('Campos obrigatórios faltando');
      setErrorMessage('Preencha todos os campos obrigatórios.');
      setShowError(true);
      return;
    }

    // Corrigir problema de fuso horário - criar datas sem considerar timezone
    const checkIn = new Date(formData.checkIn + 'T00:00:00');
    const checkOut = new Date(formData.checkOut + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera horas para comparar apenas datas
    
    console.log('Verificando datas (CORRIGIDO):', {
      checkIn: checkIn,
      checkOut: checkOut,
      hoje: hoje,
      checkInMenorHoje: checkIn < hoje,
      checkOutMenorIgualCheckIn: checkOut <= checkIn,
      checkInFormatado: checkIn.toDateString(),
      hojeFormatado: hoje.toDateString(),
      mesmoDia: checkIn.toDateString() === hoje.toDateString()
    });
    
    // Permitir check-in hoje ou no futuro
    if (checkIn < hoje && checkIn.toDateString() !== hoje.toDateString()) {
      console.log('Check-in é anterior a hoje');
      setErrorMessage('A data de check-in não pode ser anterior à data atual.');
      setShowError(true);
      return;
    }
    
    if (checkOut <= checkIn) {
      console.log('Check-out não é posterior ao check-in');
      setErrorMessage('A data de check-out deve ser posterior à data de check-in.');
      setShowError(true);
      return;
    }

    if (formData.numeroHospedes <= 0) {
      console.log('Número de hóspedes inválido');
      setErrorMessage('O número de hóspedes deve ser maior que zero.');
      setShowError(true);
      return;
    }

    if (formData.valorTotal <= 0) {
      console.log('Valor total inválido');
      setErrorMessage('O valor total deve ser maior que zero.');
      setShowError(true);
      return;
    }

    console.log('Disponibilidade verificada:', disponibilidadeVerificada);

    // Verificar se a disponibilidade foi confirmada
    if (disponibilidadeVerificada === false) {
      console.log('Quarto não disponível');
      setErrorMessage('O quarto não está disponível para o período selecionado.');
      setShowError(true);
      return;
    }

    if (disponibilidadeVerificada === null) {
      console.log('Disponibilidade não verificada ainda');
      setErrorMessage('Aguarde a verificação de disponibilidade ou selecione datas e quarto válidos.');
      setShowError(true);
      return;
    }

    console.log('Reserva do cliente verificada:', reservaClienteVerificada);

    // Verificar se cliente já tem reserva ativa
    if (reservaClienteVerificada?.temReserva) {
      console.log('Cliente já tem reserva ativa');
      const mensagem = reservaClienteVerificada.mensagem || 'Este cliente já possui uma reserva ativa. Para fazer uma nova reserva, cancele a anterior primeiro.';
      setErrorMessage(mensagem);
      setShowError(true);
      return;
    }

    console.log('Todos os checks passaram, criando reserva...');
    setIsLoading(true);
    try {
      // Criar a reserva usando o serviço real
      const reservaCriada = await reservaService.criarReserva(formData);
      console.log('Reserva criada com sucesso:', reservaCriada);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/consultar-reservas');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao criar reserva:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Erro ao criar reserva';
        
        console.log('Erro da API:', { status, message });
        
        switch (status) {
          case 400:
            setErrorMessage(`Dados inválidos: ${message}`);
            break;
          case 409:
            setErrorMessage('Conflito de datas: O quarto já está reservado para este período.');
            break;
          case 500:
            setErrorMessage('Erro interno do servidor. Tente novamente mais tarde.');
            break;
          default:
            setErrorMessage(`Erro ao criar reserva: ${message}`);
        }
      } else if (error.request) {
        console.log('Erro de conexão');
        setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        console.log('Erro desconhecido');
        setErrorMessage('Não foi possível criar a reserva. Tente novamente.');
      }
      
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Criar Nova Reserva</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Preencha os dados para criar uma nova reserva no sistema.
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
                Reserva Criada com Sucesso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                A reserva foi registrada e você será redirecionado para a lista de reservas.
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
                Erro ao Criar Reserva
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
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente *
            </label>
            <select
              value={formData.clienteId}
              onChange={(e) => {
                const clienteId = parseInt(e.target.value);
                const cliente = clientes.find(c => c.id === clienteId);
                setFormData(prev => ({ 
                  ...prev, 
                  clienteId, 
                  clienteNome: cliente?.nome || '' 
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.cpf}
                </option>
              ))}
            </select>
          </div>

          {/* Quarto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quarto *
            </label>
            <select
              value={formData.quartoId}
              onChange={(e) => {
                const quartoId = parseInt(e.target.value);
                const quarto = quartos.find(q => q.id === quartoId);
                setFormData(prev => ({ 
                  ...prev, 
                  quartoId, 
                  quartoNumero: quarto?.numero || '' 
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione um quarto</option>
              {quartosDisponiveis.map(quarto => (
                <option key={quarto.id} value={quarto.id}>
                  {quarto.numero} - {quarto.tipo} ({formatarMoeda(quarto.diaria)}/noite)
                </option>
              ))}
            </select>
            {quartosDisponiveis.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                Nenhum quarto disponível no momento.
              </p>
            )}
          </div>

          {/* Data Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Check-in *
            </label>
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Data Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Check-out *
            </label>
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
              min={formData.checkIn || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {/* Indicador de Disponibilidade */}
            {verificandoDisponibilidade && (
              <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Verificando disponibilidade...
              </div>
            )}
            
            {disponibilidadeVerificada === true && (
              <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quarto disponível para o período selecionado
              </div>
            )}
            
            {disponibilidadeVerificada === false && (
              <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quarto não disponível para o período selecionado
              </div>
            )}

            {/* Indicador de Reserva do Cliente */}
            {verificandoReservaCliente && (
              <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Verificando reservas do cliente...
              </div>
            )}
            
            {reservaClienteVerificada?.temReserva === false && (
              <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cliente não possui reservas ativas
              </div>
            )}
            
            {reservaClienteVerificada?.temReserva === true && (
              <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {reservaClienteVerificada.mensagem || 'Cliente já possui reserva ativa'}
              </div>
            )}
          </div>

          {/* Número de Hóspedes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Hóspedes *
            </label>
            <input
              type="number"
              value={formData.numeroHospedes}
              onChange={(e) => setFormData(prev => ({ ...prev, numeroHospedes: parseInt(e.target.value) }))}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
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
            placeholder="Informações adicionais sobre a reserva..."
          />
        </div>

        {/* Botões */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/user')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || quartosDisponiveis.length === 0 || disponibilidadeVerificada === false || verificandoDisponibilidade || verificandoReservaCliente || reservaClienteVerificada?.temReserva}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando...' : 
             verificandoDisponibilidade || verificandoReservaCliente ? 'Verificando...' :
             disponibilidadeVerificada === false || reservaClienteVerificada?.temReserva ? 'Indisponível' : 
             'Criar Reserva'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarReserva;
