import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { quartoService, QuartoResponse } from '../../services/quartoApi';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';
import CadastrarQuarto from './CadastrarQuarto';

const ListaQuartos: React.FC = () => {
  const { theme } = useTheme();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [quartosFiltrados, setQuartosFiltrados] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuarto, setSelectedQuarto] = useState<QuartoResponse | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showAtualizar, setShowAtualizar] = useState(false);
  const [filtro, setFiltro] = useState<'id' | 'numero-asc' | 'numero-desc' | 'diaria-asc' | 'diaria-desc'>('id');
  const [paginaAtual, setPaginaAtual] = useState(1);
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
  }, [quartos, filtro]);

  // Resetar página quando o filtro mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro]);

  const aplicarFiltro = () => {
    let filtrados = [...quartos];
    
    switch (filtro) {
      case 'id':
        // Ordenar por ID (ordem crescente)
        filtrados.sort((a, b) => a.id - b.id);
        break;
      case 'numero-asc':
        // Ordenar por número (crescente)
        filtrados.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
        break;
      case 'numero-desc':
        // Ordenar por número (decrescente)
        filtrados.sort((a, b) => parseInt(b.numero) - parseInt(a.numero));
        break;
      case 'diaria-asc':
        // Ordenar por diária (menor para maior)
        filtrados.sort((a, b) => a.diaria - b.diaria);
        break;
      case 'diaria-desc':
        // Ordenar por diária (maior para menor)
        filtrados.sort((a, b) => b.diaria - a.diaria);
        break;
    }
    
    setQuartosFiltrados(filtrados);
  };

  // Calcular quartos da página atual
  const quartosDaPagina = quartosFiltrados.slice(
    (paginaAtual - 1) * quartosPorPagina,
    paginaAtual * quartosPorPagina
  );

  // Calcular número total de páginas
  const totalPaginas = Math.ceil(quartosFiltrados.length / quartosPorPagina);

  // Funções de navegação
  const irParaPagina = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const carregarQuartos = async () => {
    setIsLoading(true);
    try {
      const response = await quartoService.listarQuartos();
      setQuartos(response);
      setQuartosFiltrados(response);
    } catch (error: any) {
      console.error('Erro ao carregar quartos:', error);
      showErrorModal('Erro ao carregar quartos', 'Não foi possível carregar a lista de quartos do banco de dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
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

  const handleSelectQuarto = (quarto: QuartoResponse) => {
    setSelectedQuarto(quarto);
  };

  const handleCadastroClick = () => {
    setShowCadastro(true);
  };

  const handleAtualizarClick = () => {
    if (!selectedQuarto) {
      showErrorModal('Nenhum quarto selecionado', 'Por favor, selecione um quarto clicando no card antes de atualizar.');
      return;
    }
    setShowAtualizar(true);
  };

  const handleVoltar = () => {
    setShowCadastro(false);
    setShowAtualizar(false);
    setSelectedQuarto(null);
  };

  const handleQuartoCadastrado = () => {
    setShowCadastro(false);
    carregarQuartos();
    showSuccessModal('Quarto Cadastrado!', 'O quarto foi cadastrado com sucesso.');
  };

  const handleQuartoAtualizado = () => {
    setShowAtualizar(false);
    setSelectedQuarto(null);
    carregarQuartos();
    showSuccessModal('Quarto Atualizado!', 'O quarto foi atualizado com sucesso.');
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
    // Imagem única para todos os quartos
    return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=200&fit=crop&crop=center';
  };

  // Renderizar formulário de cadastro/atualização
  if (showCadastro) {
    return (
      <div>
        <button
          onClick={handleVoltar}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          ← Voltar para Lista
        </button>
        <CadastrarQuarto 
          onSuccess={handleQuartoCadastrado} 
          modo="cadastro" 
        />
      </div>
    );
  }

  if (showAtualizar && selectedQuarto) {
    return (
      <div>
        <button
          onClick={handleVoltar}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          ← Voltar para Lista
        </button>
        <CadastrarQuarto 
          onSuccess={handleQuartoAtualizado} 
          modo="atualizacao" 
          quartoParaAtualizar={selectedQuarto}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Quartos</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Visualize, cadastre e atualize os quartos do hotel
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCadastroClick}
              className="btn-primary"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Quarto
            </button>
            
            <button
              onClick={handleAtualizarClick}
              className="btn-secondary"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar Quarto
            </button>

            <button
              onClick={carregarQuartos}
              className="btn-secondary"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? 'Atualizando...' : 'Atualizar Lista'}
            </button>
          </div>

          {/* Filtro */}
          <div className="flex items-center space-x-3">
            <label htmlFor="filtro" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por:
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

        {/* Quarto Selecionado */}
        {selectedQuarto && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Quarto selecionado: {selectedQuarto.numero}
                </span>
              </div>
              <button
                onClick={() => setSelectedQuarto(null)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Lista de Quartos */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Carregando quartos...</p>
          </div>
        ) : quartosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum quarto encontrado</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comece cadastrando um novo quarto para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quartosDaPagina.map((quarto) => (
              <div
                key={quarto.id}
                onClick={() => handleSelectQuarto(quarto)}
                className={`
                  relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-2
                  ${selectedQuarto?.id === quarto.id 
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {/* Foto do Quarto */}
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={getQuartoUrl(quarto.numero)}
                      alt={`Quarto ${quarto.numero}`}
                      className="w-20 h-20 rounded-lg object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                    />
                    
                    {/* Número do Quarto */}
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white text-center">
                      Quarto {quarto.numero}
                    </h3>
                    
                    {/* Status */}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quarto.status)}`}>
                        {getStatusText(quarto.status)}
                      </span>
                    </div>
                    
                    {/* Informações */}
                    <div className="mt-3 w-full space-y-2">
                      <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">R$ {quarto.diaria.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Indicador de Seleção */}
                {selectedQuarto?.id === quarto.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginação - Aparece apenas quando há mais de 12 quartos */}
        {!isLoading && quartosFiltrados.length > quartosPorPagina && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {((paginaAtual - 1) * quartosPorPagina) + 1} a {Math.min(paginaAtual * quartosPorPagina, quartosFiltrados.length)} de {quartosFiltrados.length} quartos
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Botão Anterior */}
                <button
                  onClick={paginaAnterior}
                  disabled={paginaAtual === 1}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    paginaAtual === 1
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Números das Páginas */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => irParaPagina(pagina)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        pagina === paginaAtual
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>

                {/* Botão Próximo */}
                <button
                  onClick={proximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    paginaAtual === totalPaginas
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {!isLoading && quartos.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{quartosFiltrados.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Quartos</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="Erro na Operação"
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

export default ListaQuartos;
