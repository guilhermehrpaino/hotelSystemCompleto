import React, { useState, useEffect } from 'react';
import { clienteService, ClienteResponse } from '../../services/api';
import { formatarDataBrasil } from '../../utils/dateUtils';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';
import CadastrarCliente from './CadastrarCliente';

const ListaClientes: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<ClienteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteResponse | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showAtualizar, setShowAtualizar] = useState(false);
  const [filtro, setFiltro] = useState<'id' | 'nome-asc' | 'nome-desc'>('id');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [termoBusca, setTermoBusca] = useState<string>('');
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
  }, [clientes, filtro, termoBusca]);

  // Resetar página quando o filtro mudar
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtro, termoBusca]);

  const carregarClientes = async () => {
    setIsLoading(true);
    try {
      const response = await clienteService.listarClientes();
      setClientes(response);
      setClientesFiltrados(response);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      showErrorModal('Erro ao carregar clientes', 'Não foi possível carregar a lista de clientes. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltro = () => {
    let filtrados = [...clientes];
    
    // Aplicar busca por termo
    if (termoBusca) {
      filtrados = filtrados.filter(cliente => 
        cliente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        cliente.cpf.includes(termoBusca) ||
        cliente.email.toLowerCase().includes(termoBusca.toLowerCase()) ||
        cliente.telefone.includes(termoBusca)
      );
    }
    
    // Aplicar ordenação
    switch (filtro) {
      case 'nome-asc':
        filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome-desc':
        filtrados.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'id':
      default:
        filtrados.sort((a, b) => a.id - b.id);
        break;
    }
    
    setClientesFiltrados(filtrados);
  };

  const formatarCPF = (cpf: string) => {
    if (!cpf) return '';
    
    // Remove todos os caracteres não numéricos
    const numeros = cpf.replace(/\D/g, '');
    
    // Formata para XXX.XXX.XXX-XX
    if (numeros.length === 11) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    }
    
    return cpf;
  };

  const formatarTelefone = (telefone: string) => {
    if (!telefone) return '';
    
    // Remove todos os caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    // Formata para (XX) XXXXX-XXXX ou (XX) XXXXX-XXXXX
    if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    } else if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    
    return telefone;
  };

  const handleEditar = (cliente: ClienteResponse) => {
    setSelectedCliente(cliente);
    setShowAtualizar(true);
  };

  const handleExcluir = async (cliente: ClienteResponse) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      return;
    }

    try {
      await clienteService.deletarCliente(cliente.id);
      showSuccessModal('Sucesso!', 'Cliente excluído com sucesso.');
      await carregarClientes();
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      showErrorModal('Erro ao excluir cliente', 'Não foi possível excluir o cliente. Tente novamente.');
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
    setSelectedCliente(null);
  };

  // Calcular estatísticas
  const stats = {
    total: clientes.length,
    hoje: clientes.filter(c => {
      const hoje = new Date().toISOString().split('T')[0];
      return c.createdAt && c.createdAt.startsWith(hoje);
    }).length,
    esteMes: clientes.filter(c => {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      return c.createdAt && new Date(c.createdAt) >= inicioMes;
    }).length,
    ativos: clientes.length
  };

  // Paginação
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicio = (paginaAtual - 1) * clientesPorPagina;
  const indiceFim = indiceInicio + clientesPorPagina;
  const clientesPagina = clientesFiltrados.slice(indiceInicio, indiceFim);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Clientes</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visualize e gerencie todos os clientes cadastrados no sistema.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total de Clientes</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Cadastrados no sistema</p>
            </div>
            <div className="bg-blue-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-300">Cadastrados Hoje</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.hoje}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Novos registros</p>
            </div>
            <div className="bg-green-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">📅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Este Mês</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.esteMes}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Novos clientes</p>
            </div>
            <div className="bg-purple-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">📊</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Ativos</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.ativos}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Base de clientes</p>
            </div>
            <div className="bg-orange-500 bg-opacity-20 rounded-full p-4">
              <span className="text-3xl">✅</span>
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
              Buscar Cliente
            </label>
            <div className="relative">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Nome, CPF, email ou telefone..."
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
              <option value="nome-asc">Nome (A-Z)</option>
              <option value="nome-desc">Nome (Z-A)</option>
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
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista de Clientes ({clientesFiltrados.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Base de clientes</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesPagina.map((cliente) => (
              <div 
                key={cliente.id} 
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {cliente.nome}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: #{cliente.id}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V9a3 3 0 00-3-3z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {formatarCPF(cliente.cpf)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 2.15H21V8a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15H6a2 2 0 01-2-2v-4a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {cliente.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.586a1 1 0 00.707.293l6.414 6.414a1 1 0 00.707.293L15.414 9.414a1 1 0 001.414 0L17 11.586V5a2 2 0 00-2-2H5a2 2 0 00-2 2h-1z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatarTelefone(cliente.telefone)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4l8-4m0 0l-8 4m8 4v-4m0 0l-8-4" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {cliente.createdAt ? formatarDataBrasil(cliente.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleEditar(cliente)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-1z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16l-4 4m0 0l-4 4m4-4v-8m-4 4v8" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleExcluir(cliente)}
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
          
          {clientesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Nenhum cliente encontrado com os filtros selecionados.
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indiceInicio + 1} a {Math.min(indiceFim, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
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
                {showCadastro ? 'Cadastrar Cliente' : 'Editar Cliente'}
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
            
            <CadastrarCliente
              onSuccess={() => {
                fecharModais();
                carregarClientes();
                showSuccessModal('Sucesso!', showCadastro ? 'Cliente cadastrado com sucesso.' : 'Cliente atualizado com sucesso.');
              }}
              modo={showCadastro ? 'cadastro' : 'atualizacao'}
              clienteParaAtualizar={selectedCliente || undefined}
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

export default ListaClientes;
