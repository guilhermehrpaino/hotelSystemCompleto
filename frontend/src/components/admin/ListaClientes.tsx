import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { clienteService, ClienteResponse } from '../../services/api';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';
import CadastrarCliente from './CadastrarCliente';

const ListaClientes: React.FC = () => {
  const { theme } = useTheme();
  
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<ClienteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteResponse | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showAtualizar, setShowAtualizar] = useState(false);
  const [filtro, setFiltro] = useState<'id' | 'nome-asc' | 'nome-desc'>('id');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 12;
  
  // Estados para o modal de erro
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  
  // Estados para o modal de sucesso
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successDetails, setSuccessDetails] = useState('');

  // Carregar clientes ao montar o componente
  useEffect(() => {
    carregarClientes();
  }, []);

  // Aplicar filtro sempre que os clientes ou o filtro mudarem
  useEffect(() => {
    aplicarFiltro();
  }, [clientes, filtro]);

  // Resetar página quando o filtro mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro]);

  const aplicarFiltro = () => {
    let filtrados = [...clientes];
    
    switch (filtro) {
      case 'id':
        // Ordenar por ID (ordem crescente)
        filtrados.sort((a, b) => a.id - b.id);
        break;
      case 'nome-asc':
        // Ordenar por nome (A-Z)
        filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome-desc':
        // Ordenar por nome (Z-A)
        filtrados.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
    }
    
    setClientesFiltrados(filtrados);
  };

  // Calcular clientes da página atual
  const clientesDaPagina = clientesFiltrados.slice(
    (paginaAtual - 1) * clientesPorPagina,
    paginaAtual * clientesPorPagina
  );

  // Calcular número total de páginas
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

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

  const carregarClientes = async () => {
    setIsLoading(true);
    try {
      const response = await clienteService.listarClientes();
      setClientes(response);
      setClientesFiltrados(response); // Inicializa também a lista filtrada
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      showErrorModal('Erro ao carregar clientes', 'Não foi possível carregar a lista de clientes. Tente novamente.');
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

  const handleSelectCliente = (cliente: ClienteResponse) => {
    setSelectedCliente(cliente);
  };

  const handleCadastroClick = () => {
    setShowCadastro(true);
  };

  const handleAtualizarClick = () => {
    if (!selectedCliente) {
      showErrorModal('Nenhum cliente selecionado', 'Por favor, selecione um cliente clicando no card antes de atualizar.');
      return;
    }
    setShowAtualizar(true);
  };

  const handleVoltar = () => {
    setShowCadastro(false);
    setShowAtualizar(false);
    setSelectedCliente(null);
    carregarClientes(); // Recarregar lista ao voltar
  };

  const handleClienteAtualizado = () => {
    showSuccessModal('Cliente Atualizado!', 'Os dados do cliente foram atualizados com sucesso.');
    handleVoltar();
  };

  const handleClienteCadastrado = () => {
    showSuccessModal('Cliente Cadastrado!', 'O novo cliente foi cadastrado com sucesso.');
    handleVoltar();
  };

  // Gerar URL da foto genérica
  const getFotoUrl = (nome: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=4f46e5&color=fff&size=128&bold=true`;
  };

  // Se estiver na tela de cadastro ou atualização, renderiza o componente correspondente
  if (showCadastro) {
    return (
      <div>
        <button
          onClick={handleVoltar}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          ← Voltar para Lista
        </button>
        <CadastrarCliente 
          onSuccess={handleClienteCadastrado} 
          modo="cadastro" 
        />
      </div>
    );
  }

  if (showAtualizar && selectedCliente) {
    return (
      <div>
        <button
          onClick={handleVoltar}
          className="mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          ← Voltar para Lista
        </button>
        <CadastrarCliente 
          onSuccess={handleClienteAtualizado} 
          modo="atualizacao" 
          clienteParaAtualizar={selectedCliente}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Clientes</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Visualize, cadastre e atualize os clientes do hotel
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
              Novo Cliente
            </button>
            
            <button
              onClick={handleAtualizarClick}
              className="btn-secondary"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar Cliente
            </button>

            <button
              onClick={carregarClientes}
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
              onChange={(e) => setFiltro(e.target.value as 'id' | 'nome-asc' | 'nome-desc')}
              className="input-field max-w-xs"
              disabled={isLoading}
            >
              <option value="id">ID</option>
              <option value="nome-asc">A - Z</option>
              <option value="nome-desc">Z - A</option>
            </select>
          </div>
        </div>

        {/* Cliente Selecionado */}
        {selectedCliente && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Cliente selecionado: {selectedCliente.nome}
                </span>
              </div>
              <button
                onClick={() => setSelectedCliente(null)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Lista de Clientes */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Carregando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comece cadastrando um novo cliente para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientesDaPagina.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => handleSelectCliente(cliente)}
                className={`
                  relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-2
                  ${selectedCliente?.id === cliente.id 
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {/* Foto do Cliente */}
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={getFotoUrl(cliente.nome)}
                      alt={cliente.nome}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                    />
                    
                    {/* Nome */}
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white text-center">
                      {cliente.nome}
                    </h3>
                    
                    {/* Informações */}
                    <div className="mt-3 w-full space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{cliente.email}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{cliente.telefone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Indicador de Seleção */}
                {selectedCliente?.id === cliente.id && (
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

        {/* Paginação - Aparece apenas quando há mais de 12 clientes */}
        {!isLoading && clientesFiltrados.length > clientesPorPagina && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {((paginaAtual - 1) * clientesPorPagina) + 1} a {Math.min(paginaAtual * clientesPorPagina, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
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
        {!isLoading && clientes.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{clientesFiltrados.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Clientes</div>
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

export default ListaClientes;
