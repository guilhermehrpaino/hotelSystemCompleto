import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatarDataBrasil } from '../../utils/dateUtils';
import { getTipoQuarto } from '../../utils/quartoUtils';
import { reservaService, quartoService } from '../../services/api';
import { ReservaResponse, QuartoResponse } from '../../services/api';

const ConsultarReservas: React.FC = () => {
  const navigate = useNavigate();
  
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<string>('todos');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [reservasData, quartosData] = await Promise.all([
        reservaService.listarReservas(),
        quartoService.listarQuartos()
      ]);
      
      // Carregar todas as reservas, incluindo FINALIZADAS
      setReservas(reservasData);
      setQuartos(quartosData);
      
      // Processar status automático dos quartos
      await processarStatusAutomaticoQuartos(quartosData);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Não foi possível carregar os dados. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar status manualmente
  const atualizarStatusManualmente = async () => {
    setAtualizandoStatus(true);
    try {
      console.log('Atualizando status manualmente...');
      await processarStatusAutomaticoQuartos(quartos);
      
      // Recarregar tudo para garantir atualização
      await carregarDados();
      
    } catch (error) {
      console.error('Erro ao atualizar status manualmente:', error);
    } finally {
      setAtualizandoStatus(false);
    }
  };

  // Função para enviar IDs dos quartos ao backend para processamento de status
  const processarStatusAutomaticoQuartos = async (quartosData: QuartoResponse[]) => {
    try {
      console.log('Enviando quartos para processamento de status automático...');
      
      // Extrair IDs dos quartos
      const quartosIds = quartosData.map(q => q.id);
      
      console.log('IDs dos quartos enviados:', quartosIds);
      
      // Chamar o backend para processar status específico dos quartos
      const resultado = await reservaService.processarStatusQuartos(quartosIds);
      
      console.log('Status processados pelo backend:', resultado);
      console.log('Quartos atualizados:', resultado.statusAtualizados);
      
      // Mostrar detalhes das atualizações
      resultado.statusAtualizados.forEach(atualizacao => {
        console.log(`Quarto ${atualizacao.quartoId}: ${atualizacao.statusAntigo} → ${atualizacao.statusNovo}`);
      });

      // Se houve atualizações, recarregar os dados
      if (resultado.statusAtualizados.length > 0) {
        console.log('Recarregando dados após atualizações de status...');
        
        // Recarregar apenas os quartos para atualizar os status
        const novosQuartos = await quartoService.listarQuartos();
        setQuartos(novosQuartos);
        
        console.log('Quartos recarregados:', novosQuartos.map(q => ({ id: q.id, numero: q.numero, status: q.status })));
      }
      
    } catch (error) {
      console.error('Erro ao processar status automático:', error);
    }
  };

  // Função para buscar status atualizado de um quarto específico
  const buscarStatusQuarto = async (quartoId: number): Promise<string> => {
    try {
      console.log(`Buscando status atualizado do quarto ${quartoId}...`);
      const quarto = await quartoService.buscarQuartoPorId(quartoId);
      console.log(`Status do quarto ${quartoId}:`, quarto.status);
      return quarto.status;
    } catch (error) {
      console.error(`Erro ao buscar status do quarto ${quartoId}:`, error);
      return 'DESCONHECIDO';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FINALIZADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
      case 'FINALIZADA':
        return '🏁';
      case 'CANCELADA':
        return '❌';
      case 'RESERVADA':
        return '📅';
      default:
        return '❓';
    }
  };

  const getStatusReservaColor = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FINALIZADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'RESERVADA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusReservaIcon = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return '✅';
      case 'FINALIZADA':
        return '🏁';
      case 'CANCELADA':
        return '❌';
      case 'RESERVADA':
        return '📅';
      default:
        return '❓';
    }
  };

  const getStatusQuarto = (reserva: ReservaResponse) => {
    console.log('--- PROCURANDO STATUS DO QUARTO ---');
    console.log('Reserva ID:', reserva.id);
    console.log('Quarto ID na Reserva:', reserva.quartoId);
    console.log('Lista de Quartos Disponíveis:', quartos.map(q => ({ id: q.id, numero: q.numero, status: q.status })));
    
    const quarto = quartos.find(q => q.id === reserva.quartoId);
    const status = quarto ? quarto.status : 'DESCONHECIDO';
    
    console.log('Quarto Encontrado:', !!quarto);
    if (quarto) {
      console.log('Dados do Quarto:', { id: quarto.id, numero: quarto.numero, status: quarto.status });
    }
    console.log('Status Final:', status);
    console.log('--- FIM DA BUSCA DO QUARTO ---');
    
    return status;
  };

  const getStatusQuartoColor = (status: string) => {
    switch (status) {
      case 'DISPONIVEL':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'OCUPADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'RESERVADO':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'MANUTENCAO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'SUJO':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusQuartoIcon = (status: string) => {
    switch (status) {
      case 'DISPONIVEL':
        return '✅';
      case 'OCUPADO':
        return '🏨';
      case 'RESERVADO':
        return '📅';
      case 'MANUTENCAO':
        return '🔧';
      case 'SUJO':
        return '🧹';
      default:
        return '❓';
    }
  };

  const getAcoesDisponiveis = (reserva: ReservaResponse) => {
    const statusReserva = reserva.status || 'DESCONHECIDO';
    const statusQuarto = getStatusQuarto(reserva);
    const hoje = new Date().toISOString().split('T')[0];
    const isHoje = reserva.checkIn === hoje;
    
    const acoes = [];

    console.log('=== ANÁLISE COMPLETA DA RESERVA ===');
    console.log('ID da Reserva:', reserva.id);
    console.log('Status da Reserva:', statusReserva);
    console.log('Status do Quarto:', statusQuarto);
    console.log('Check-in da Reserva:', reserva.checkIn);
    console.log('Data de Hoje:', hoje);
    console.log('É Hoje?', isHoje);
    console.log('ID do Quarto na Reserva:', reserva.quartoId);
    
    // Lógica baseada no status da reserva e do quarto
    
    // Se reserva está RESERVADA e hoje é dia de check-in → Check-in
    const condicaoCheckIn = statusReserva === 'RESERVADA' && isHoje && statusQuarto === 'RESERVADO';
    
    // Se reserva está ATIVA e quarto está OCUPADO → Check-out
    const condicaoAtiva = statusReserva === 'ATIVA' && statusQuarto === 'OCUPADO';
    
    // Se reserva está RESERVADA → Cancelar
    // Se reserva está ATIVA → Cancelar
    const condicaoCancelar = statusReserva === 'RESERVADA' || statusReserva === 'ATIVA';
    
    console.log('Condição Check-in:', {
      statusReserva,
      isHoje,
      statusQuarto,
      resultado: condicaoCheckIn,
      partes: {
        'statusReserva === "RESERVADA"': statusReserva === 'RESERVADA',
        'isHoje': isHoje,
        'statusQuarto === "RESERVADO"': statusQuarto === 'RESERVADO'
      }
    });
    
    console.log('Condição Ativa (Check-out):', {
      statusReserva,
      statusQuarto,
      resultado: condicaoAtiva,
      partes: {
        'statusReserva === "ATIVA"': statusReserva === 'ATIVA',
        'statusQuarto === "OCUPADO"': statusQuarto === 'OCUPADO'
      }
    });
    
    console.log('Condição Cancelar:', {
      statusReserva,
      resultado: condicaoCancelar,
      partes: {
        'statusReserva === "RESERVADA"': statusReserva === 'RESERVADA',
        'statusReserva === "ATIVA"': statusReserva === 'ATIVA'
      }
    });

    // Se reserva está RESERVADA e hoje é dia de check-in
    if (condicaoCheckIn) {
      console.log('✅ ADICIONANDO AÇÃO: Check-in');
      acoes.push({
        label: 'Check-in',
        action: () => navigate('/user/checkin', { state: { reservaId: reserva.id, quartoId: reserva.quartoId } }),
        color: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
      });
    }

    // Se reserva está ATIVA (cliente já fez check-in)
    if (condicaoAtiva) {
      console.log('✅ ADICIONANDO AÇÃO: Check-out');
      acoes.push({
        label: 'Check-out',
        action: () => navigate('/user/checkout', { state: { reservaId: reserva.id, quartoId: reserva.quartoId } }),
        color: 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
      });
    }

    // Se reserva está RESERVADA (ainda não fez check-in)
    if (condicaoCancelar) {
      console.log('✅ ADICIONANDO AÇÃO: Cancelar');
      acoes.push({
        label: 'Cancelar',
        action: () => navigate('/user/cancelar-reserva'),
        color: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
      });
    }

    console.log('Ações finais:', acoes.length, acoes.map(a => a.label));
    console.log('=== FIM DA ANÁLISE ===');

    return acoes;
  };

  const handleCancelarReserva = async (reservaId: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      await reservaService.cancelarReserva(reservaId);
      await carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      setErrorMessage('Não foi possível cancelar a reserva. Tente novamente.');
      setShowError(true);
    }
  };

  const reservasFiltradas = reservas.filter(reserva => {
    // Excluir reservas finalizadas e canceladas da tabela principal
    if (reserva.status === 'FINALIZADA' || reserva.status === 'CANCELADA') return false;
    
    const statusMatch = filtroStatus === 'todos' || reserva.status === filtroStatus;
    const buscaMatch = termoBusca === '' || 
      reserva.clienteNome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      reserva.quartoNumero?.toString().toLowerCase().includes(termoBusca.toLowerCase());
    
    // Filtro por período de check-in
    let dataMatch = true;
    if (dataInicio) {
      dataMatch = dataMatch && reserva.checkIn >= dataInicio;
    }
    if (dataFim) {
      dataMatch = dataMatch && reserva.checkIn <= dataFim;
    }
    
    // Filtro por disponibilidade de check-in/check-out
    let disponibilidadeMatch = true;
    const hoje = new Date().toISOString().split('T')[0];
    
    if (filtroDisponibilidade === 'checkin-hoje') {
      disponibilidadeMatch = reserva.checkIn === hoje && reserva.status === 'RESERVADA';
    } else if (filtroDisponibilidade === 'checkout-hoje') {
      disponibilidadeMatch = reserva.checkOut === hoje && reserva.status === 'ATIVA';
    } else if (filtroDisponibilidade === 'checkin-proximos') {
      const seteDias = new Date();
      seteDias.setDate(seteDias.getDate() + 7);
      const seteDiasStr = seteDias.toISOString().split('T')[0];
      disponibilidadeMatch = reserva.checkIn >= hoje && reserva.checkIn <= seteDiasStr && reserva.status === 'RESERVADA';
    } else if (filtroDisponibilidade === 'checkout-proximos') {
      const seteDias = new Date();
      seteDias.setDate(seteDias.getDate() + 7);
      const seteDiasStr = seteDias.toISOString().split('T')[0];
      disponibilidadeMatch = reserva.checkOut >= hoje && reserva.checkOut <= seteDiasStr && reserva.status === 'ATIVA';
    }
    
    return statusMatch && buscaMatch && dataMatch && disponibilidadeMatch;
  });

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data: string) => {
    return formatarDataBrasil(data);
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Reservas</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Visualize e gerencie todas as reservas do hotel.
            </p>
          </div>
          <button
            onClick={atualizarStatusManualmente}
            disabled={atualizandoStatus}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {atualizandoStatus ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Atualizando...
              </>
            ) : (
              <>
                🔄 Atualizar Status
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-300">Ativas</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {reservas.filter(r => r.status === 'ATIVA').length}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Hóspedes no hotel</p>
            </div>
            <div className="bg-green-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🏨</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-xl shadow-lg p-6 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Reservadas</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {reservas.filter(r => r.status === 'RESERVADA').length}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Check-ins pendentes</p>
            </div>
            <div className="bg-yellow-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">📅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Finalizadas</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {reservas.filter(r => r.status === 'FINALIZADA').length}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Concluídas</p>
            </div>
            <div className="bg-blue-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">✅</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/consultar-reservas-finalizadas')}
            className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Ver Detalhes
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Total</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {reservas.length}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Todas as reservas</p>
            </div>
            <div className="bg-purple-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-600 mb-8">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros de Busca</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar por Cliente ou Quarto
            </label>
            <div className="relative">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Nome do cliente ou número do quarto..."
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Início do período"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Fim do período"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="ATIVA">Ativas</option>
              <option value="RESERVADA">Reservadas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Disponibilidade
            </label>
            <select
              value={filtroDisponibilidade}
              onChange={(e) => setFiltroDisponibilidade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="todos">Todas</option>
              <option value="checkin-hoje">Check-in Hoje</option>
              <option value="checkout-hoje">Check-out Hoje</option>
              <option value="checkin-proximos">Check-in Próximos 7 dias</option>
              <option value="checkout-proximos">Check-out Próximos 7 dias</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setFiltroStatus('todos');
              setTermoBusca('');
              setDataInicio('');
              setDataFim('');
              setFiltroDisponibilidade('todos');
            }}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Reservas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista de Reservas ({reservasFiltradas.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Reservas ativas</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quarto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hóspedes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quarto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reservasFiltradas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    #{reserva.id}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {reserva.clienteNome || 'Cliente não encontrado'}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {reserva.quartoNumero || 'N/A'} - {reserva.quartoNumero ? getTipoQuarto(parseInt(reserva.quartoNumero.toString())) : ''}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatarData(reserva.checkIn)} - {formatarData(reserva.checkOut)}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {reserva.numeroHospedes}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatarMoeda(reserva.valorTotal)}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusReservaColor(reserva.status || 'DESCONHECIDO')}`}>
                      <span className="mr-1">{getStatusReservaIcon(reserva.status || 'DESCONHECIDO')}</span>
                      {reserva.status || 'DESCONHECIDO'}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusQuartoColor(getStatusQuarto(reserva))}`}>
                      <span className="mr-1">{getStatusQuartoIcon(getStatusQuarto(reserva))}</span>
                      {getStatusQuarto(reserva)}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">
                    {getAcoesDisponiveis(reserva).length > 0 ? (
                      getAcoesDisponiveis(reserva).map((acao, index) => (
                        <button
                          key={index}
                          onClick={acao.action}
                          className={`${acao.color} ${index < getAcoesDisponiveis(reserva).length - 1 ? 'mr-2' : ''} text-sm font-medium transition-colors duration-200`}
                        >
                          {acao.label}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Nenhuma ação</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reservasFiltradas.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma reserva encontrada com os filtros selecionados.
              </p>
            </div>
          )}
        </div>
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
                Erro ao Carregar Reservas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage}
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => {
                    setShowError(false);
                    carregarDados();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Tentar Novamente
                </button>
                <button
                  onClick={() => setShowError(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Voltar */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default ConsultarReservas;
