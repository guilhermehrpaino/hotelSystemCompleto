import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quartoService, QuartoResponse } from '../../services/api';
import { getTipoQuarto } from '../../utils/quartoUtils';

const StatusQuartos: React.FC = () => {
  const navigate = useNavigate();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [isLoadingAction, setIsLoadingAction] = useState<number | null>(null);
  const [confirmacaoAction, setConfirmacaoAction] = useState<{type: string; quartoId: number; quartoNumero: string} | null>(null);

  useEffect(() => {
    carregarQuartos();
  }, []);

  const carregarQuartos = async () => {
    setIsLoading(true);
    try {
      const quartosData = await quartoService.listarQuartos();
      // Ordenar quartos por número
      const quartosOrdenados = quartosData.sort((a, b) => parseInt(a.numero.toString()) - parseInt(b.numero.toString()));
      setQuartos(quartosOrdenados);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DISPONIVEL':
        return 'Disponível';
      case 'OCUPADO':
        return 'Ocupado';
      case 'RESERVADO':
        return 'Reservado';
      case 'MANUTENCAO':
        return 'Manutenção';
      case 'SUJO':
        return 'Sujo';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
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

  const quartosFiltrados = quartos.filter(quarto => {
    const statusMatch = filtroStatus === 'todos' || quarto.status === filtroStatus;
    const tipoPadronizado = getTipoQuarto(parseInt(quarto.numero.toString()));
    const tipoMatch = filtroTipo === 'todos' || tipoPadronizado.toLowerCase().includes(filtroTipo.toLowerCase());
    const buscaMatch = termoBusca === '' || 
      quarto.numero.toString().toLowerCase().includes(termoBusca.toLowerCase()) ||
      tipoPadronizado.toLowerCase().includes(termoBusca.toLowerCase());
    
    return statusMatch && tipoMatch && buscaMatch;
  });

  const tiposDisponiveis = Array.from(new Set(quartos.map(q => getTipoQuarto(parseInt(q.numero.toString()))).filter(Boolean)));

  const stats = {
    total: quartos.length,
    disponiveis: quartos.filter(q => q.status === 'DISPONIVEL').length,
    ocupados: quartos.filter(q => q.status === 'OCUPADO').length,
    reservados: quartos.filter(q => q.status === 'RESERVADO').length,
    manutencao: quartos.filter(q => q.status === 'MANUTENCAO').length,
    sujos: quartos.filter(q => q.status === 'SUJO').length
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleConfirmarLimpeza = async (quartoId: number, quartoNumero: string) => {
    setConfirmacaoAction({ type: 'limpeza', quartoId, quartoNumero });
  };

  const handleConfirmarManutencao = async (quartoId: number, quartoNumero: string) => {
    setConfirmacaoAction({ type: 'manutencao', quartoId, quartoNumero });
  };

  const executarConfirmacaoLimpeza = async () => {
    if (!confirmacaoAction) return;
    
    setIsLoadingAction(confirmacaoAction.quartoId);
    try {
      // Primeiro atualiza o status do quarto para DISPONIVEL
      await quartoService.atualizarStatusQuarto(confirmacaoAction.quartoId, 'DISPONIVEL');
      
      // Depois salva a observação de confirmação
      await quartoService.atualizarObservacaoQuarto(confirmacaoAction.quartoId, 'Limpeza confirmada e quarto disponível');
      
      // Recarregar a lista de quartos
      await carregarQuartos();
      setConfirmacaoAction(null);
    } catch (error) {
      console.error('Erro ao confirmar limpeza:', error);
    } finally {
      setIsLoadingAction(null);
    }
  };

  const executarConfirmacaoManutencao = async () => {
    if (!confirmacaoAction) return;
    
    setIsLoadingAction(confirmacaoAction.quartoId);
    try {
      // Primeiro atualiza o status do quarto para DISPONIVEL
      await quartoService.atualizarStatusQuarto(confirmacaoAction.quartoId, 'DISPONIVEL');
      
      // Depois salva a observação de confirmação
      await quartoService.atualizarObservacaoQuarto(confirmacaoAction.quartoId, 'Manutenção concluída e quarto disponível');
      
      // Recarregar a lista de quartos
      await carregarQuartos();
      setConfirmacaoAction(null);
    } catch (error) {
      console.error('Erro ao confirmar manutenção:', error);
    } finally {
      setIsLoadingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando quartos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Status dos Quartos</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visualize e gerencie o status de todos os quartos do hotel.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="text-3xl">🏨</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.disponiveis}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupados</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.ocupados}</p>
            </div>
            <div className="text-3xl">🏨</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reservados</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.reservados}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manutenção</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.manutencao}</p>
            </div>
            <div className="text-3xl">🔧</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sujo</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.sujos}</p>
            </div>
            <div className="text-3xl">🧹</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Número ou tipo do quarto..."
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
              <option value="DISPONIVEL">Disponível</option>
              <option value="OCUPADO">Ocupado</option>
              <option value="RESERVADO">Reservado</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="SUJO">Sujo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="todos">Todos</option>
              {tiposDisponiveis.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroStatus('todos');
                setFiltroTipo('todos');
                setTermoBusca('');
              }}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Quartos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quarto
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
              {quartosFiltrados.map((quarto) => (
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
                      {formatarMoeda(quarto.diaria)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quarto.status)}`}>
                      <span className="mr-1">{getStatusIcon(quarto.status)}</span>
                      {getStatusText(quarto.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {quarto.status === 'SUJO' ? (
                      <button
                        onClick={() => handleConfirmarLimpeza(quarto.id, quarto.numero)}
                        disabled={isLoadingAction === quarto.id}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingAction === quarto.id ? 'Processando...' : 'Confirmar Limpeza'}
                      </button>
                    ) : quarto.status === 'MANUTENCAO' ? (
                      <button
                        onClick={() => handleConfirmarManutencao(quarto.id, quarto.numero)}
                        disabled={isLoadingAction === quarto.id}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingAction === quarto.id ? 'Processando...' : 'Confirmar Manutenção'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/user/limpeza?quartoId=${quarto.id}`)}
                          className="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300 mr-3"
                        >
                          Limpeza
                        </button>
                        <button
                          onClick={() => navigate(`/user/manutencao?quartoId=${quarto.id}`)}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          Manutenção
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {quartosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum quarto encontrado com os filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          Voltar ao Dashboard
        </button>
      </div>

      {/* Modal de Confirmação */}
      {confirmacaoAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar {confirmacaoAction.type === 'limpeza' ? 'Limpeza' : 'Manutenção'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tem certeza que deseja confirmar a {confirmacaoAction.type === 'limpeza' ? 'limpeza' : 'manutenção'} do quarto {confirmacaoAction.quartoNumero}? 
              O status será alterado para DISPONÍVEL.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmacaoAction(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmacaoAction.type === 'limpeza' ? executarConfirmacaoLimpeza : executarConfirmacaoManutencao}
                disabled={isLoadingAction === confirmacaoAction.quartoId}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingAction === confirmacaoAction.quartoId ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusQuartos;
