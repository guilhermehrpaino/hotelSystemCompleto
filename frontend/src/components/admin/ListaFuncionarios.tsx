import React, { useState, useEffect } from 'react';
import { funcionarioService, FuncionarioResponse } from '../../services/funcionarioApi';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';
import CadastrarFuncionario from './CadastrarFuncionario';

const ListaFuncionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<FuncionarioResponse[]>([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<FuncionarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFuncionario, setSelectedFuncionario] = useState<FuncionarioResponse | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showAtualizar, setShowAtualizar] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessageModal, setSuccessMessageModal] = useState('');
  const [successDetails, setSuccessDetails] = useState('');

  // Estados para paginação e filtros
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(6); // 6 funcionários por página
  const [filtro, setFiltro] = useState('');
  const [cargosDisponiveis, setCargosDisponiveis] = useState<string[]>([]);
  const [termoBusca, setTermoBusca] = useState<string>('');
  
  // Carregar funcionários ao montar o componente
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  // Aplicar filtro e resetar página
  useEffect(() => {
    aplicarFiltro();
    setPaginaAtual(1);
  }, [filtro, funcionarios, termoBusca]);

  const carregarFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await funcionarioService.listarFuncionarios();
      setFuncionarios(response);
      setFilteredFuncionarios(response);
      
      // Extrair cargos únicos
      const cargos = Array.from(new Set(response.map(f => f.cargo).filter(Boolean)));
      setCargosDisponiveis(cargos);
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error);
      showErrorModal('Erro ao carregar funcionários', 'Não foi possível carregar a lista de funcionários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltro = () => {
    let filtrados = [...funcionarios];
    
    // Aplicar busca por termo
    if (termoBusca) {
      filtrados = filtrados.filter(funcionario => 
        funcionario.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        funcionario.cargo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        funcionario.email.toLowerCase().includes(termoBusca.toLowerCase()) ||
        funcionario.telefone.includes(termoBusca)
      );
    }
    
    // Aplicar filtro por cargo
    if (filtro) {
      filtrados = filtrados.filter(funcionario => 
        funcionario.cargo.toLowerCase().includes(filtro.toLowerCase())
      );
    }
    
    setFilteredFuncionarios(filtrados);
  };

  const handleEditar = (funcionario: FuncionarioResponse) => {
    setSelectedFuncionario(funcionario);
    setShowAtualizar(true);
  };

  const handleExcluir = async (funcionario: FuncionarioResponse) => {
    if (!window.confirm(`Tem certeza que deseja excluir o funcionário ${funcionario.nome}?`)) {
      return;
    }

    try {
      await funcionarioService.excluirFuncionario(funcionario.id);
      showSuccessModal('Sucesso!', 'Funcionário excluído com sucesso.');
      await carregarFuncionarios();
    } catch (error: any) {
      console.error('Erro ao excluir funcionário:', error);
      showErrorModal('Erro ao excluir funcionário', 'Não foi possível excluir o funcionário. Tente novamente.');
    }
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

  const showErrorModal = (title: string, message: string) => {
    setErrorMessage(title);
    setErrorDetails(message);
    setIsErrorModalOpen(true);
  };

  const showSuccessModal = (title: string, message: string) => {
    setSuccessTitle(title);
    setSuccessMessageModal(message);
    setIsSuccessModalOpen(true);
  };

  const fecharModais = () => {
    setIsErrorModalOpen(false);
    setIsSuccessModalOpen(false);
    setShowCadastro(false);
    setShowAtualizar(false);
    setSelectedFuncionario(null);
  };

  // Calcular estatísticas
  const stats = {
    total: funcionarios.length,
    hoje: 0, // FuncionarioResponse doesn't have createdAt field
    esteMes: 0, // FuncionarioResponse doesn't have createdAt field
    ativos: funcionarios.length
  };

  // Paginação
  const totalPaginas = Math.ceil(filteredFuncionarios.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const funcionariosPagina = filteredFuncionarios.slice(indiceInicio, indiceFim);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando funcionários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Funcionários</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visualize e gerencie todos os funcionários cadastrados no sistema.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total de Funcionários</p>
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
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Novos funcionários</p>
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
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Equipe completa</p>
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
              Buscar Funcionário
            </label>
            <div className="relative">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Nome, cargo, email ou telefone..."
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Cargo
            </label>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos os cargos</option>
              {cargosDisponiveis.map(cargo => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setFiltro('');
              setTermoBusca('');
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
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* Lista de Funcionários */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista de Funcionários ({filteredFuncionarios.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Equipe do hotel</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funcionariosPagina.map((funcionario) => (
              <div 
                key={funcionario.id} 
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {funcionario.nome}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: #{funcionario.id}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {funcionario.cargo}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V9a3 3 0 00-3-3z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatarCPF(funcionario.cpf)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 2.15H21V8a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15H6a2 2 0 01-2-2v-4a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 truncate">
                      {funcionario.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.586a1 1 0 00.707.293l6.414 6.414a1 1 0 00.707.293L15.414 9.414a1 1 0 001.414 0L17 11.586V5a2 2 0 00-2-2H5a2 2 0 00-2 2h-1z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatarTelefone(funcionario.telefone)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleEditar(funcionario)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-1z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16l-4 4m0 0l-4 4m4-4v-8m-4 4v8" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleExcluir(funcionario)}
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
          
          {filteredFuncionarios.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Nenhum funcionário encontrado com os filtros selecionados.
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {indiceInicio + 1} a {Math.min(indiceFim, filteredFuncionarios.length)} de {filteredFuncionarios.length} funcionários
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
                {showCadastro ? 'Cadastrar Funcionário' : 'Editar Funcionário'}
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
            
            <CadastrarFuncionario
              onSuccess={() => {
                fecharModais();
                carregarFuncionarios();
                showSuccessModal('Sucesso!', showCadastro ? 'Funcionário cadastrado com sucesso.' : 'Funcionário atualizado com sucesso.');
              }}
              modo={showCadastro ? 'cadastro' : 'atualizacao'}
              funcionarioParaAtualizar={selectedFuncionario}
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
          message={successMessageModal}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ListaFuncionarios;
