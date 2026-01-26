import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { funcionarioService, FuncionarioResponse } from '../../services/funcionarioApi';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';
import CadastrarFuncionario from './CadastrarFuncionario';

const ListaFuncionarios: React.FC = () => {
  const { theme } = useTheme();
  
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
  
  // Carregar funcionários ao montar o componente
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  // Aplicar filtro e resetar página
  useEffect(() => {
    aplicarFiltro();
    setPaginaAtual(1);
  }, [filtro, funcionarios]);

  // Funções de navegação
  const irParaPagina = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const proximaPagina = () => {
    const totalPaginas = Math.ceil(filteredFuncionarios.length / itensPorPagina);
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const carregarFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await funcionarioService.listarFuncionarios();
      setFuncionarios(response);
      setFilteredFuncionarios(response);
      
      // Extrair cargos únicos para o filtro
      const cargos = Array.from(new Set(response.map(f => f.cargo).filter(Boolean)));
      setCargosDisponiveis(cargos);
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error);
      showErrorModal('Erro ao carregar funcionários', 'Não foi possível carregar a lista de funcionários do banco de dados. Tente novamente.');
    } finally {
      setLoading(false);
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

  const aplicarFiltro = async () => {
    setLoading(true);
    try {
      let filtrados: FuncionarioResponse[];
      
      if (filtro.startsWith('cargo-')) {
        // Filtro por cargo específico usando API
        const cargo = filtro.replace('cargo-', '');
        filtrados = await funcionarioService.filtrarFuncionariosPorCargo(cargo);
      } else {
        // Filtros locais (ID, nome, salário)
        filtrados = [...funcionarios];
        
        switch (filtro) {
          case 'id':
            filtrados.sort((a, b) => a.id - b.id);
            break;
          case 'nome-asc':
            filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
          case 'nome-desc':
            filtrados.sort((a, b) => b.nome.localeCompare(a.nome));
            break;
          case 'salario-asc':
            filtrados.sort((a, b) => a.salario - b.salario);
            break;
          case 'salario-desc':
            filtrados.sort((a, b) => b.salario - a.salario);
            break;
          default:
            // Sem filtro ou "todos"
            filtrados.sort((a, b) => a.id - b.id);
            break;
        }
      }
      
      setFilteredFuncionarios(filtrados);
    } catch (error: any) {
      console.error('Erro ao aplicar filtro:', error);
      showErrorModal('Erro ao aplicar filtro', 'Não foi possível filtrar os funcionários. Tente novamente.');
      // Em caso de erro, mostrar todos os funcionários
      setFilteredFuncionarios(funcionarios);
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarFuncionario = (funcionario: FuncionarioResponse) => {
    setSelectedFuncionario(funcionario);
  };

  const handleNovoFuncionario = () => {
    setShowCadastro(true);
    setShowAtualizar(false);
    setSelectedFuncionario(null);
  };

  const handleAtualizarFuncionario = () => {
    if (!selectedFuncionario) {
      showErrorModal('Nenhum Funcionário Selecionado', 'Por favor, selecione um funcionário para atualizar.');
      return;
    }
    setShowCadastro(true);
    setShowAtualizar(true);
  };

  const handleVoltar = () => {
    setShowCadastro(false);
    setShowAtualizar(false);
    setSelectedFuncionario(null);
    carregarFuncionarios();
  };

  const getFuncionarioIniciais = (nome: string) => {
    // Pegar as duas primeiras letras do nome
    const nomes = nome.trim().split(' ');
    if (nomes.length >= 2) {
      return (nomes[0][0] + nomes[1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const getFuncionarioEmoji = (cargo: string) => {
    // Emoji baseado no cargo do funcionário
    const cargoEmojis: { [key: string]: string } = {
      'Gerente': '👔',
      'Recepcionista': '👋',
      'Camareira': '🧹',
      'Cozinheiro': '👨‍🍳',
      'Garçom': '🍽️',
      'Segurança': '👮',
      'Manutenção': '🔧',
      'Administrativo': '💼'
    };
    
    return cargoEmojis[cargo] || '👤';
  };

  const formatarSalario = (salario: number) => {
    return salario.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatarTelefone = (telefone: string) => {
    // Formatar telefone: (XX) XXXXX-XXXX
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return telefone;
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
        <CadastrarFuncionario 
          onSuccess={handleVoltar}
          modo={showAtualizar ? 'atualizacao' : 'cadastro'}
          funcionarioParaAtualizar={selectedFuncionario}
        />
      </div>
    );
  }

  // Calcular paginação
  const totalPaginas = Math.ceil(filteredFuncionarios.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const funcionariosDaPagina = filteredFuncionarios.slice(indiceInicial, indiceFinal);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Funcionários
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gerencie os funcionários do hotel
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleNovoFuncionario}
            className="btn-primary"
          >
            Novo Funcionário
          </button>
          <button
            onClick={handleAtualizarFuncionario}
            className="btn-secondary"
          >
            Atualizar Funcionário
          </button>
          <button
            onClick={carregarFuncionarios}
            className="btn-secondary"
            disabled={loading}
          >
            Atualizar Lista
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar:
          </label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Todos</option>
            <option value="id">ID</option>
            <option value="nome-asc">Nome (A-Z)</option>
            <option value="nome-desc">Nome (Z-A)</option>
            <option value="salario-asc">Salário (menor→maior)</option>
            <option value="salario-desc">Salário (maior→menor)</option>
            <optgroup label="Por Cargo">
              {cargosDisponiveis.map(cargo => (
                <option key={`cargo-${cargo}`} value={`cargo-${cargo}`}>{cargo}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Lista de funcionários */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando funcionários...</p>
          </div>
        ) : funcionariosDaPagina.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum funcionário encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Cadastre um novo funcionário para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funcionariosDaPagina.map((funcionario: FuncionarioResponse) => (
              <div
                key={funcionario.id}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedFuncionario?.id === funcionario.id
                    ? 'ring-2 ring-primary-500'
                    : ''
                }`}
                onClick={() => handleSelecionarFuncionario(funcionario)}
              >
                <div className="relative">
                  <div className="w-full h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        {getFuncionarioIniciais(funcionario.nome)}
                      </div>
                      <div className="text-2xl">
                        {getFuncionarioEmoji(funcionario.cargo)}
                      </div>
                    </div>
                  </div>
                  {selectedFuncionario?.id === funcionario.id && (
                    <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-primary-600 rounded-full p-1 shadow-md">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {funcionario.nome}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {funcionario.cargo}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      📞 {formatarTelefone(funcionario.telefone)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💰 {formatarSalario(funcionario.salario)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {indiceInicial + 1} a {Math.min(indiceFinal, filteredFuncionarios.length)} de {filteredFuncionarios.length} funcionários
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={paginaAnterior}
                disabled={paginaAtual === 1}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <button
                onClick={proximaPagina}
                disabled={paginaAtual === totalPaginas}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
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
        message={successMessageModal || ''}
        details={successDetails}
      />
    </div>
  );
};

export default ListaFuncionarios;
