import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService, quartoService } from '../../services/api';
import { ReservaResponse, QuartoResponse } from '../../services/api';

const ConsultarReservas: React.FC = () => {
  const navigate = useNavigate();
  
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar reservas primeiro
      const reservasData = await reservaService.listarReservas();
      setReservas(reservasData);
      
      // Carregar quartos separadamente para garantir dados atualizados
      console.log('Carregando quartos para Consultar Reservas...');
      const quartosData = await quartoService.listarQuartos();
      setQuartos(quartosData);
      
      console.log('Dados carregados:', {
        totalReservas: reservasData.length,
        totalQuartos: quartosData.length,
        quartos: quartosData.map(q => ({ id: q.id, numero: q.numero, status: q.status }))
      });

      // Enviar IDs dos quartos para o backend processar status automaticamente
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
    
    // Se reserva está ATIVA e quarto está OCUPADO → Check-out e Pagar
    const condicaoAtiva = statusReserva === 'ATIVA' && statusQuarto === 'OCUPADO';
    
    // Se reserva está RESERVADA → Cancelar
    const condicaoCancelar = statusReserva === 'RESERVADA';
    
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
        'statusReserva === "RESERVADA"': statusReserva === 'RESERVADA'
      }
    });

    // Se reserva está RESERVADA e hoje é dia de check-in
    if (condicaoCheckIn) {
      console.log('✅ ADICIONANDO AÇÃO: Check-in');
      acoes.push({
        label: 'Check-in',
        action: () => navigate('/user/checkin'),
        color: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
      });
    }

    // Se reserva está ATIVA (cliente já fez check-in)
    if (condicaoAtiva) {
      console.log('✅ ADICIONANDO AÇÕES: Check-out e Pagar');
      acoes.push({
        label: 'Check-out',
        action: () => navigate('/user/checkout'),
        color: 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
      });
      
      acoes.push({
        label: 'Pagar',
        action: () => navigate('/user/pagamento'),
        color: 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
      });
    }

    // Se reserva está RESERVADA (ainda não fez check-in)
    if (condicaoCancelar) {
      console.log('✅ ADICIONANDO AÇÃO: Cancelar');
      acoes.push({
        label: 'Cancelar',
        action: () => handleCancelarReserva(reserva.id),
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
    const statusMatch = filtroStatus === 'todos' || reserva.status === filtroStatus;
    const buscaMatch = termoBusca === '' || 
      reserva.clienteNome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      reserva.quartoNumero?.toLowerCase().includes(termoBusca.toLowerCase());
    
    return statusMatch && buscaMatch;
  });

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consultar Reservas</h1>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reservas.length}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reservas.filter(r => r.status === 'ATIVA').length}
              </p>
            </div>
            <div className="text-3xl">🏨</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reservadas</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {reservas.filter(r => r.status === 'RESERVADA').length}
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Finalizadas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reservas.filter(r => r.status === 'FINALIZADA').length}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Cliente, quarto ou tipo..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
              <option value="FINALIZADA">Finalizadas</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="RESERVADA">Reservadas</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroStatus('todos');
                setTermoBusca('');
              }}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
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
                  Hóspedes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status Reserva
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status Quarto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reservasFiltradas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    #{reserva.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {reserva.clienteNome || 'Cliente não encontrado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {reserva.quartoNumero || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatarData(reserva.checkIn)} - {formatarData(reserva.checkOut)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {reserva.numeroHospedes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatarMoeda(reserva.valorTotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusReservaColor(reserva.status || 'DESCONHECIDO')}`}>
                      <span className="mr-1">{getStatusReservaIcon(reserva.status || 'DESCONHECIDO')}</span>
                      {reserva.status || 'DESCONHECIDO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusQuartoColor(getStatusQuarto(reserva))}`}>
                      <span className="mr-1">{getStatusQuartoIcon(getStatusQuarto(reserva))}</span>
                      {getStatusQuarto(reserva)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {getAcoesDisponiveis(reserva).length > 0 ? (
                      getAcoesDisponiveis(reserva).map((acao, index) => (
                        <button
                          key={index}
                          onClick={acao.action}
                          className={`${acao.color} ${index < getAcoesDisponiveis(reserva).length - 1 ? 'mr-3' : ''}`}
                        >
                          {acao.label}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">
                        Nenhuma ação disponível
                      </span>
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
          onClick={() => navigate('/user')}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default ConsultarReservas;
