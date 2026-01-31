import React, { useState, useEffect } from 'react';
import { quartoService, QuartoResponse } from '../../services/quartoApi';
import { getTipoQuarto } from '../../utils/quartoUtils';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';
import CadastrarQuarto from './CadastrarQuarto';

const ListaQuartos: React.FC = () => {
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [quartosFiltrados, setQuartosFiltrados] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuarto, setSelectedQuarto] = useState<QuartoResponse | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showAtualizar, setShowAtualizar] = useState(false);
  const [filtro, setFiltro] = useState<'id' | 'numero-asc' | 'numero-desc' | 'diaria-asc' | 'diaria-desc'>('id');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [termoBusca, setTermoBusca] = useState<string>('');
  const quartosPorPagina = 12;
  
  // Estados para o modal de erro
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  
  // Estados para o modal de sucesso
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successDetails, setSuccessDetails] = useState('');

  // Carregar quartos ao montar o componente
  useEffect(() => {
    carregarQuartos();
  }, []);

  // Aplicar filtro sempre que os quartos ou o filtro mudarem
  useEffect(() => {
    aplicarFiltro();
  }, [quartos, filtro, termoBusca]);

  // Resetar página quando o filtro mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro, termoBusca]);

  const carregarQuartos = async () => {
    setIsLoading(true);
    try {
      const response = await quartoService.listarQuartos();
      setQuartos(response);
      setQuartosFiltrados(response);
    } catch (error: any) {
      console.error('Erro ao carregar quartos:', error);
      showErrorModal('Erro ao carregar quartos', 'Não foi possível carregar a lista de quartos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltro = () => {
    let filtrados = [...quartos];
    
    // Aplicar busca por termo
    if (termoBusca) {
      filtrados = filtrados.filter(quarto => {
        const numeroNumero = parseInt(quarto.numero);
        return quarto.numero.includes(termoBusca) ||
          getTipoQuarto(numeroNumero).toLowerCase().includes(termoBusca.toLowerCase()) ||
          quarto.status.toLowerCase().includes(termoBusca.toLowerCase());
      });
    }
    
    // Aplicar ordenação
    switch (filtro) {
      case 'numero-asc':
        filtrados.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
        break;
      case 'numero-desc':
        filtrados.sort((a, b) => parseInt(b.numero) - parseInt(a.numero));
        break;
      case 'diaria-asc':
        filtrados.sort((a, b) => a.diaria - b.diaria);
        break;
      case 'diaria-desc':
        filtrados.sort((a, b) => b.diaria - a.diaria);
        break;
      case 'id':
      default:
        filtrados.sort((a, b) => a.id - b.id);
        break;
    }
    
    setQuartosFiltrados(filtrados);
  };

  const handleEditar = (quarto: QuartoResponse) => {
    setSelectedQuarto(quarto);
    setShowAtualizar(true);
  };

  const handleExcluir = async (quarto: QuartoResponse) => {
    if (!window.confirm(`Tem certeza que deseja excluir o quarto ${quarto.numero}?`)) {
      return;
    }

    try {
      await quartoService.excluirQuarto(quarto.id);
      showSuccessModal('Sucesso!', 'Quarto excluído com sucesso.');
      await carregarQuartos();
    } catch (error: any) {
      console.error('Erro ao excluir quarto:', error);
      showErrorModal('Erro ao excluir quarto', 'Não foi possível excluir o quarto. Tente novamente.');
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

  const showErrorModal = (title: string, message: string) => {
    setErrorMessage(title);
    setErrorDetails(message);
    setIsErrorModalOpen(true);
  };

  const showSuccessModal = (title: string, message: string) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  const fecharModais = () => {
    setIsErrorModalOpen(false);
    setIsSuccessModalOpen(false);
    setShowCadastro(false);
    setShowAtualizar(false);
    setSelectedQuarto(null);
  };

  // Calcular estatísticas
  const stats = {
    total: quartos.length,
    disponiveis: quartos.filter(q => q.status === 'DISPONIVEL').length,
    ocupados: quartos.filter(q => q.status === 'OCUPADO').length,
    reservados: quartos.filter(q => q.status === 'RESERVADO').length,
    manutencao: quartos.filter(q => q.status === 'MANUTENCAO').length,
    sujos: 0, // Status SUJO não existe na interface QuartoResponse
    valorTotal: quartos.reduce((sum, q) => sum + q.diaria, 0)
  };

  // Paginação
  const totalPaginas = Math.ceil(quartosFiltrados.length / quartosPorPagina);
  const indiceInicio = (paginaAtual - 1) * quartosPorPagina;
  const indiceFim = indiceInicio + quartosPorPagina;
  const quartosPagina = quartosFiltrados.slice(indiceInicio, indiceFim);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Quartos</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visualize e gerencie todos os quartos do hotel.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total de Quartos</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Unidades no hotel</p>
            </div>
            <div className="bg-blue-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🏨</span>
            </div>
          </div>
        </div>
        
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
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Hóspedes no hotel</p>
            </div>
            <div className="bg-red-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🏨</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Diária Média</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.total > 0 ? (stats.valorTotal / stats.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Valor médio por quarto</p>
            </div>
            <div className="bg-purple-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">💰</span>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros e Busca</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Quarto
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
              Ordenar por
            </label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="id">ID (Padrão)</option>
              <option value="numero-asc">Número (Crescente)</option>
              <option value="numero-desc">Número (Decrescente)</option>
              <option value="diaria-asc">Diária (Menor)</option>
              <option value="diaria-desc">Diária (Maior)</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setTermoBusca('');
              setFiltro('id');
            }}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpar Filtros
          </button>
          
          <button
            onClick={() => setShowCadastro(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4m8 0l-8 8" />
            </svg>
            Novo Quarto
          </button>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Gestão de quartos</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quartosPagina.map((quarto) => (
              <div 
                key={quarto.id} 
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-lg">🏨</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        Quarto {quarto.numero}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: #{quarto.id}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quarto.status)}`}>
                    <span className="mr-1">{getStatusIcon(quarto.status)}</span>
                    {quarto.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {getTipoQuarto(parseInt(quarto.numero))}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {quarto.diaria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleEditar(quarto)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-1z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16l-4 4m0 0l-4 4m4-4v-8m-4 4v8" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleExcluir(quarto)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {quartosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Nenhum quarto encontrado com os filtros selecionados.
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indiceInicio + 1} a {Math.min(indiceFim, quartosFiltrados.length)} de {quartosFiltrados.length} quartos
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                  disabled={paginaAtual === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaAtual(pagina)}
                      className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                        paginaAtual === pagina
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={paginaAtual === totalPaginas}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {(showCadastro || showAtualizar) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showCadastro ? 'Cadastrar Quarto' : 'Editar Quarto'}
              </h3>
              <button
                onClick={fecharModais}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <CadastrarQuarto
              onSuccess={() => {
                fecharModais();
                carregarQuartos();
                showSuccessModal('Sucesso!', showCadastro ? 'Quarto cadastrado com sucesso.' : 'Quarto atualizado com sucesso.');
              }}
              modo={showCadastro ? 'cadastro' : 'atualizacao'}
              quartoParaAtualizar={selectedQuarto}
            />
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {isErrorModalOpen && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          title={errorMessage}
          message={errorDetails}
          onClose={() => setIsErrorModalOpen(false)}
        />
      )}

      {/* Modal de Sucesso */}
      {isSuccessModalOpen && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          title={successTitle}
          message={successMessage}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ListaQuartos;
