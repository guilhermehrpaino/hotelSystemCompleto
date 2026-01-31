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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'numero-asc' | 'numero-desc'>('numero-asc');
  const itemsPerPage = 16;

  useEffect(() => {
    carregarQuartos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroStatus, filtroTipo, termoBusca, sortBy]);

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
    const statusMatch = filtroStatus === 'todos' || 
      (filtroStatus === 'FUNCIONAL' ? ['DISPONIVEL', 'OCUPADO', 'RESERVADO'].includes(quarto.status) : quarto.status === filtroStatus);
    const tipoPadronizado = getTipoQuarto(parseInt(quarto.numero.toString()));
    const tipoMatch = filtroTipo === 'todos' || tipoPadronizado.toLowerCase().includes(filtroTipo.toLowerCase());
    const buscaMatch = termoBusca === '' || 
      quarto.numero.toString().toLowerCase().includes(termoBusca.toLowerCase()) ||
      tipoPadronizado.toLowerCase().includes(termoBusca.toLowerCase());
    
    return statusMatch && tipoMatch && buscaMatch;
  }).sort((a, b) => {
    if (sortBy === 'numero-asc') {
      return parseInt(a.numero.toString()) - parseInt(b.numero.toString());
    } else {
      return parseInt(b.numero.toString()) - parseInt(a.numero.toString());
    }
  });

  const tiposDisponiveis = Array.from(new Set(quartos.map(q => getTipoQuarto(parseInt(q.numero.toString()))).filter(Boolean)));

  // Pagination logic
  const totalPages = Math.ceil(quartosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuartos = quartosFiltrados.slice(startIndex, endIndex);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-300">Disponíveis</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.disponiveis}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Prontos para uso</p>
            </div>
            <div className="bg-green-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-300">Ocupados</p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.ocupados}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Com hóspedes</p>
            </div>
            <div className="bg-red-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🏨</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 rounded-xl shadow-lg p-6 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Reservados</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.reservados}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Aguardando check-in</p>
            </div>
            <div className="bg-yellow-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">📅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Manutenção</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.manutencao}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Em reparo</p>
            </div>
            <div className="bg-gray-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🔧</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800 rounded-xl shadow-lg p-6 border border-cyan-200 dark:border-cyan-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">Para Limpar</p>
              <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.sujos}</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Precisam de limpeza</p>
            </div>
            <div className="bg-cyan-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🧹</span>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Número do quarto ou tipo..."
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
              <option value="FUNCIONAL">Funcional</option>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ordenar
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'numero-asc' | 'numero-desc')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="numero-asc">Número (Crescente)</option>
              <option value="numero-desc">Número (Decrescente)</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroStatus('todos');
                setFiltroTipo('todos');
                setTermoBusca('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Quartos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista de Quartos ({quartosFiltrados.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Status em tempo real</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentQuartos.map((quarto) => (
              <div 
                key={quarto.id} 
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Quarto {quarto.numero}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getTipoQuarto(parseInt(quarto.numero.toString()))}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quarto.status)}`}>
                    <span className="mr-1">{getStatusIcon(quarto.status)}</span>
                    {getStatusText(quarto.status)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Diária:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatarMoeda(quarto.diaria)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {quarto.status === 'SUJO' && (
                    <button
                      onClick={() => handleConfirmarLimpeza(quarto.id, quarto.numero.toString())}
                      disabled={isLoadingAction === quarto.id}
                      className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      {isLoadingAction === quarto.id ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Confirmar Limpeza'
                      )}
                    </button>
                  )}
                  
                  {quarto.status === 'MANUTENCAO' && (
                    <button
                      onClick={() => handleConfirmarManutencao(quarto.id, quarto.numero.toString())}
                      disabled={isLoadingAction === quarto.id}
                      className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      {isLoadingAction === quarto.id ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        'Confirmar Manutenção'
                      )}
                    </button>
                  )}
                  
                  {quarto.status !== 'SUJO' && quarto.status !== 'MANUTENCAO' && (
                    <>
                      <button
                        onClick={() => navigate('/user/solicitar-manutencao', { state: { quartoId: quarto.id, quartoNumero: quarto.numero } })}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        Manutenção
                      </button>
                      
                      <button
                        onClick={() => navigate('/user/solicitar-limpeza', { state: { quartoId: quarto.id, quartoNumero: quarto.numero } })}
                        className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        Limpeza
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {quartosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Nenhum quarto encontrado com os filtros selecionados.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1} a {Math.min(endIndex, quartosFiltrados.length)} de {quartosFiltrados.length} quartos
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
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

export default StatusQuartos;
