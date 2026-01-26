import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { quartoService, QuartoResponse } from '../../services/api';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

const AlterarStatusQuarto: React.FC = () => {
  const { theme } = useTheme();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [quartosFiltrados, setQuartosFiltrados] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuarto, setSelectedQuarto] = useState<QuartoResponse | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [showStatusSelection, setShowStatusSelection] = useState(false);
  const [filtro, setFiltro] = useState<'id' | 'numero-asc' | 'numero-desc' | 'diaria-asc' | 'diaria-desc'>('id');
  const [novoStatus, setNovoStatus] = useState('');
  
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
  }, [filtro, quartos]);

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
    
    switch (filtro) {
      case 'id':
        filtrados.sort((a, b) => a.id - b.id);
        break;
      case 'numero-asc':
        filtrados.sort((a, b) => String(a.numero).localeCompare(String(b.numero)));
        break;
      case 'numero-desc':
        filtrados.sort((a, b) => String(b.numero).localeCompare(String(a.numero)));
        break;
      case 'diaria-asc':
        filtrados.sort((a, b) => a.diaria - b.diaria);
        break;
      case 'diaria-desc':
        filtrados.sort((a, b) => b.diaria - a.diaria);
        break;
      default:
        filtrados.sort((a, b) => a.id - b.id);
        break;
    }
    
    setQuartosFiltrados(filtrados);
  };

  const handleQuartoClick = (quarto: QuartoResponse) => {
    setSelectedQuarto(quarto);
    setShowConfirmacao(true);
  };

  const handleConfirmarAlteracao = () => {
    setShowConfirmacao(false);
    setShowStatusSelection(true);
  };

  const handleCancelarAlteracao = () => {
    setShowConfirmacao(false);
    setSelectedQuarto(null);
  };

  const handleCancelarSelecao = () => {
    setShowStatusSelection(false);
    setSelectedQuarto(null);
    setNovoStatus('');
  };

  const handleAlterarStatus = async () => {
    if (!selectedQuarto || !novoStatus) {
      showErrorModal('Erro', 'Por favor, selecione um novo status.');
      return;
    }

    setIsLoading(true);
    try {
      await quartoService.atualizarStatusQuarto(selectedQuarto.id, novoStatus);
      
      showSuccessModal(
        'Status Alterado!',
        `O status do quarto ${selectedQuarto.numero} foi alterado com sucesso.`,
        `Status anterior: ${getStatusText(selectedQuarto.status)}\n | Novo status: ${getStatusText(novoStatus)}`
      );
      
      // Recarregar lista de quartos
      await carregarQuartos();
      
      // Fechar tela de seleção
      setShowStatusSelection(false);
      setSelectedQuarto(null);
      setNovoStatus('');
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      showErrorModal('Erro ao alterar status', 'Não foi possível alterar o status do quarto. Tente novamente.');
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
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
      default:
        return status;
    }
  };

  const getQuartoUrl = (numero: string) => {
    return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=200&fit=crop&crop=center';
  };

  const showErrorModal = (message: string, details?: string) => {
    setErrorMessage(message);
    setErrorDetails(details || '');
    setIsErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage('');
    setErrorDetails('');
  };

  const showSuccessModal = (title: string, message: string, details?: string) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessDetails(details || '');
    setIsSuccessModalOpen(true);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessTitle('');
    setSuccessMessage('');
    setSuccessDetails('');
  };

  // Se estiver na tela de confirmação
  if (showConfirmacao && selectedQuarto) {
    return (
      <div>
        <button
          onClick={handleCancelarAlteracao}
          className="mb-4 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para lista
        </button>
        
        <div className="max-w-2xl mx-auto p-6">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirmar Alteração</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Você tem certeza que deseja alterar o status deste quarto?
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={getQuartoUrl(selectedQuarto.numero)}
                  alt={`Quarto ${selectedQuarto.numero}`}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quarto {selectedQuarto.numero}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tipo: {selectedQuarto.tipo}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Diária: R$ {selectedQuarto.diaria.toFixed(2)}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedQuarto.status)}`}>
                      {getStatusText(selectedQuarto.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmarAlteracao}
                className="btn-primary"
              >
                Sim, alterar status
              </button>
              <button
                onClick={handleCancelarAlteracao}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se estiver na tela de seleção de status
  if (showStatusSelection && selectedQuarto) {
    return (
      <div>
        <button
          onClick={handleCancelarSelecao}
          className="mb-4 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para lista
        </button>
        
        <div className="max-w-2xl mx-auto p-6">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Selecionar Novo Status</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Escolha o novo status para o quarto {selectedQuarto.numero}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={getQuartoUrl(selectedQuarto.numero)}
                  alt={`Quarto ${selectedQuarto.numero}`}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quarto {selectedQuarto.numero}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tipo: {selectedQuarto.tipo}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Diária: R$ {selectedQuarto.diaria.toFixed(2)}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status atual:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedQuarto.status)}`}>
                      {getStatusText(selectedQuarto.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Novo Status:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['DISPONIVEL', 'OCUPADO', 'RESERVADO', 'MANUTENCAO'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setNovoStatus(status)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      novoStatus === status
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAlterarStatus}
                className="btn-primary"
                disabled={!novoStatus || isLoading}
              >
                {isLoading ? 'Alterando...' : 'Confirmar Alteração'}
              </button>
              <button
                onClick={handleCancelarSelecao}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alterar Status do Quarto</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Clique em um quarto para alterar seu status
          </p>
        </div>

        {/* Filtro */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ordenar por:
            </label>
            <select
              id="filtro"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as any)}
              className="input-field max-w-xs"
              disabled={isLoading}
            >
              <option value="id">ID</option>
              <option value="numero-asc">Número (crescente)</option>
              <option value="numero-desc">Número (decrescente)</option>
              <option value="diaria-asc">Diária (menor → maior)</option>
              <option value="diaria-desc">Diária (maior → menor)</option>
            </select>
          </div>
        </div>

        {/* Lista de quartos */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando quartos...</p>
          </div>
        ) : quartosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum quarto encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não há quartos cadastrados no sistema.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quartosFiltrados.map((quarto) => (
              <div
                key={quarto.id}
                className="card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                onClick={() => handleQuartoClick(quarto)}
              >
                <div className="relative">
                  <img
                    src={getQuartoUrl(quarto.numero)}
                    alt={`Quarto ${quarto.numero}`}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quarto.status)}`}>
                      {getStatusText(quarto.status)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Quarto {quarto.numero}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {quarto.tipo}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                    R$ {quarto.diaria.toFixed(2)}/noite
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="Erro"
        message={errorMessage}
        details={errorDetails}
      />

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title={successTitle}
        message={successMessage}
        details={successDetails}
      />
    </div>
  );
};

export default AlterarStatusQuarto;
