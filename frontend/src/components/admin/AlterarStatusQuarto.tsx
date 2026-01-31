import React, { useState, useEffect } from 'react';
import { quartoService, QuartoResponse } from '../../services/api';
import { getTipoQuarto } from '../../utils/quartoUtils';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

const AlterarStatusQuarto: React.FC = () => {
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [quartosFiltrados, setQuartosFiltrados] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuarto, setSelectedQuarto] = useState<QuartoResponse | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [showStatusSelection, setShowStatusSelection] = useState(false);
  const [filtro, setFiltro] = useState<'id' | 'numero-asc' | 'numero-desc' | 'diaria-asc' | 'diaria-desc'>('id');
  const [novoStatus, setNovoStatus] = useState('');
  const [termoBusca, setTermoBusca] = useState<string>('');
  
  // Estados para modais
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successDetails, setSuccessDetails] = useState('');

  // Carregar quartos ao montar o componente
  useEffect(() => {
    carregarQuartos();
  }, []);

  // Aplicar filtro
  useEffect(() => {
    aplicarFiltro();
  }, [filtro, quartos, termoBusca]);

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
      default:
        return '❓';
    }
  };

  const getStatusOptions = () => {
    const options = [
      { value: 'DISPONIVEL', label: 'Disponível', icon: '✅', color: 'green' },
      { value: 'OCUPADO', label: 'Ocupado', icon: '🏨', color: 'red' },
      { value: 'RESERVADO', label: 'Reservado', icon: '📅', color: 'yellow' },
      { value: 'MANUTENCAO', label: 'Manutenção', icon: '🔧', color: 'gray' }
    ];
    
    // Remover o status atual das opções
    if (selectedQuarto) {
      return options.filter(option => option.value !== selectedQuarto.status);
    }
    
    return options;
  };

  const handleSelecionarQuarto = (quarto: QuartoResponse) => {
    setSelectedQuarto(quarto);
    setShowStatusSelection(true);
    setNovoStatus('');
  };

  const handleConfirmarMudanca = () => {
    if (!selectedQuarto || !novoStatus) {
      showErrorModal('Erro', 'Selecione um novo status para o quarto.');
      return;
    }
    
    setShowStatusSelection(false);
    setShowConfirmacao(true);
  };

  const handleExecutarMudanca = async () => {
    if (!selectedQuarto || !novoStatus) return;

    try {
      await quartoService.atualizarStatusQuarto(selectedQuarto.id, novoStatus);
      showSuccessModal('Sucesso!', `Status do quarto ${selectedQuarto.numero} alterado para ${novoStatus} com sucesso.`);
      await carregarQuartos();
      setShowConfirmacao(false);
      setSelectedQuarto(null);
      setNovoStatus('');
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      showErrorModal('Erro ao alterar status', 'Não foi possível alterar o status do quarto. Tente novamente.');
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
    setShowStatusSelection(false);
    setShowConfirmacao(false);
    setSelectedQuarto(null);
    setNovoStatus('');
  };

  // Calcular estatísticas
  const stats = {
    total: quartos.length,
    disponiveis: quartos.filter(q => q.status === 'DISPONIVEL').length,
    ocupados: quartos.filter(q => q.status === 'OCUPADO').length,
    reservados: quartos.filter(q => q.status === 'RESERVADO').length,
    manutencao: quartos.filter(q => q.status === 'MANUTENCAO').length,
    sujos: 0, // Status SUJO não existe na interface QuartoResponse
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alterar Status de Quartos</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Selecione um quarto e altere seu status de forma rápida e fácil.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Em manutenção</p>
            </div>
            <div className="bg-gray-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🔧</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Todos os quartos</p>
            </div>
            <div className="bg-blue-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">🏨</span>
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
        
        <div className="flex justify-end mt-4">
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
        </div>
      </div>

      {/* Lista de Quartos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selecione um Quarto ({quartosFiltrados.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Clique para alterar status</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quartosFiltrados.map((quarto) => (
              <div 
                key={quarto.id} 
                onClick={() => handleSelecionarQuarto(quarto)}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer"
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
                
                <div className="flex justify-end mt-4">
                  <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Alterar Status</span>
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
        </div>
      </div>

      {/* Modal de Seleção de Status */}
      {showStatusSelection && selectedQuarto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Alterar Status - Quarto {selectedQuarto.numero}
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
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Status atual:
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuarto.status)}`}>
                <span className="mr-1">{getStatusIcon(selectedQuarto.status)}</span>
                {selectedQuarto.status}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Novo Status:
              </label>
              <div className="space-y-2">
                {getStatusOptions().map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setNovoStatus(option.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      novoStatus === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </span>
                    </div>
                    {novoStatus === option.value && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={fecharModais}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarMudanca}
                disabled={!novoStatus}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmacao && selectedQuarto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmar Alteração de Status
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Tem certeza que deseja alterar o status do quarto {selectedQuarto.numero}?
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">De:</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuarto.status)}`}>
                  <span className="mr-1">{getStatusIcon(selectedQuarto.status)}</span>
                  {selectedQuarto.status}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Para:</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(novoStatus)}`}>
                  <span className="mr-1">{getStatusIcon(novoStatus)}</span>
                  {novoStatus}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={fecharModais}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecutarMudanca}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Confirmar Alteração
              </button>
            </div>
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

export default AlterarStatusQuarto;
