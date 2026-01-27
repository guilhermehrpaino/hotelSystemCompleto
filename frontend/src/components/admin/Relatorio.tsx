import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { quartoService, QuartoResponse } from '../../services/api';
import { clienteService, ClienteResponse } from '../../services/api';
import { FuncionarioRequest, FuncionarioResponse, funcionarioService } from '../../services/funcionarioApi';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

const Relatorio: React.FC = () => {
  const { theme } = useTheme();
  
  // Estados para filtros
  const [tipoRelatorio, setTipoRelatorio] = useState<'quartos' | 'clientes' | 'funcionarios' | 'ocupacao' | 'financeiro'>('quartos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusQuarto, setStatusQuarto] = useState('');
  const [cargoFuncionario, setCargoFuncionario] = useState('');
  const [salarioMinimo, setSalarioMinimo] = useState('');
  const [salarioMaximo, setSalarioMaximo] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [cargosDisponiveis, setCargosDisponiveis] = useState<string[]>([]);
  
  // Estados para controlar quando aplicar filtros
  const [aplicarFiltros, setAplicarFiltros] = useState(false);
  
  // Estados para dados
  const [dadosRelatorio, setDadosRelatorio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Estados para modais
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successDetails, setSuccessDetails] = useState('');

  // Carregar dados base para filtros
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Gerar relatório quando filtros mudam (exceto salário e busca de cliente que têm controle manual)
  useEffect(() => {
    if (tipoRelatorio && !aplicarFiltros) {
      gerarRelatorio();
    }
  }, [tipoRelatorio, dataInicio, dataFim, statusQuarto, cargoFuncionario]);

  // Aplicar filtros quando o estado for alterado manualmente
  useEffect(() => {
    if (aplicarFiltros) {
      gerarRelatorio();
      setAplicarFiltros(false);
    }
  }, [aplicarFiltros]);

  const carregarDadosIniciais = async () => {
    // Carrega dados necessários para os filtros
    try {
      // Carregar cargos disponíveis dos funcionários
      const funcionarios = await funcionarioService.listarFuncionarios();
      const cargosUnicos = Array.from(new Set(funcionarios.map(f => f.cargo))).sort();
      setCargosDisponiveis(cargosUnicos);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const gerarRelatorio = async () => {
    setIsLoading(true);
    try {
      let dados: any[] = [];
      
      switch (tipoRelatorio) {
        case 'quartos':
          dados = await gerarRelatorioQuartos();
          break;
        case 'clientes':
          dados = await gerarRelatorioClientes();
          break;
        case 'funcionarios':
          dados = await gerarRelatorioFuncionarios();
          break;
        case 'ocupacao':
          dados = await gerarRelatorioOcupacao();
          break;
        case 'financeiro':
          dados = await gerarRelatorioFinanceiro();
          break;
      }
      
      setDadosRelatorio(dados);
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      showErrorModal('Erro ao gerar relatório', 'Não foi possível gerar o relatório. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const gerarRelatorioQuartos = async (): Promise<any[]> => {
    const quartos = await quartoService.listarQuartos();
    
    let filtrados = quartos;
    
    if (statusQuarto) {
      filtrados = filtrados.filter(q => q.status === statusQuarto);
    }
    
    return filtrados.map(quarto => ({
      id: quarto.id,
      numero: quarto.numero,
      tipo: quarto.tipo,
      diaria: quarto.diaria,
      status: getStatusText(quarto.status),
      statusColor: getStatusColor(quarto.status),
    }));
  };

  const gerarRelatorioClientes = async (): Promise<any[]> => {
    const clientes = await clienteService.listarClientes();
    
    let filtrados = clientes;
    
    // Aplicar filtro por nome/email
    if (filtroCliente) {
      filtrados = filtrados.filter(cliente => 
        cliente.nome.toLowerCase().includes(filtroCliente.toLowerCase()) ||
        cliente.email.toLowerCase().includes(filtroCliente.toLowerCase())
      );
    }
    
    // Aplicar filtro por data de cadastro
    if (dataInicio) {
      const dataInicioObj = new Date(dataInicio);
      filtrados = filtrados.filter(cliente => 
        new Date(cliente.createdAt) >= dataInicioObj
      );
    }
    
    if (dataFim) {
      const dataFimObj = new Date(dataFim);
      dataFimObj.setHours(23, 59, 59, 999); // Incluir o dia final completo
      filtrados = filtrados.filter(cliente => 
        new Date(cliente.createdAt) <= dataFimObj
      );
    }
    
    return filtrados.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: formatarTelefone(cliente.telefone),
      endereco: cliente.endereco,
      dataCadastro: new Date(cliente.createdAt).toLocaleDateString('pt-BR'),
    }));
  };

  const gerarRelatorioFuncionarios = async (): Promise<any[]> => {
    const funcionarios = await funcionarioService.listarFuncionarios();
    
    let filtrados = funcionarios;
    
    // Aplicar filtro por cargo
    if (cargoFuncionario) {
      filtrados = filtrados.filter((f: FuncionarioResponse) => f.cargo === cargoFuncionario);
    }
    
    // Aplicar filtro por salário mínimo
    if (salarioMinimo) {
      const salarioMin = converterSalarioParaNumero(salarioMinimo);
      if (salarioMin > 0) {
        filtrados = filtrados.filter((f: FuncionarioResponse) => f.salario >= salarioMin);
      }
    }
    
    // Aplicar filtro por salário máximo
    if (salarioMaximo) {
      const salarioMax = converterSalarioParaNumero(salarioMaximo);
      if (salarioMax > 0) {
        filtrados = filtrados.filter((f: FuncionarioResponse) => f.salario <= salarioMax);
      }
    }
    
    return filtrados.map((funcionario: FuncionarioResponse) => ({
      id: funcionario.id,
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      telefone: formatarTelefone(funcionario.telefone),
      salario: formatarSalario(funcionario.salario),
      dataCadastro: 'Data não disponível', // FuncionarioResponse não tem createdAt
    }));
  };

  const gerarRelatorioOcupacao = async (): Promise<any[]> => {
    const quartos = await quartoService.listarQuartos();
    
    const ocupacao = quartos.reduce((acc, quarto) => {
      const status = getStatusText(quarto.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(ocupacao).map(([status, quantidade]) => ({
      status,
      quantidade,
      percentual: ((quantidade / quartos.length) * 100).toFixed(1),
    }));
  };

  const gerarRelatorioFinanceiro = async (): Promise<any[]> => {
    const quartos = await quartoService.listarQuartos();
    
    // Simulação de dados financeiros
    const ocupados = quartos.filter(q => q.status === 'OCUPADO').length;
    const diariaMedia = quartos.reduce((acc, q) => acc + q.diaria, 0) / quartos.length;
    
    return [
      {
        metrica: 'Quartos Ocupados',
        valor: ocupados,
        total: quartos.length,
        percentual: ((ocupados / quartos.length) * 100).toFixed(1),
      },
      {
        metrica: 'Diária Média',
        valor: formatarMoeda(diariaMedia),
        total: '-',
        percentual: '-',
      },
      {
        metrica: 'Receita Mensal Estimada',
        valor: formatarMoeda(diariaMedia * ocupados * 30),
        total: '-',
        percentual: '-',
      },
    ];
  };

  const exportarParaPDF = async () => {
    setIsExporting(true);
    try {
      // Simulação de exportação PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccessModal(
        'PDF Exportado!',
        'O relatório foi exportado com sucesso.',
        `Arquivo: relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      showErrorModal('Erro ao exportar PDF', 'Não foi possível exportar o relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'Disponível';
      case 'OCUPADO': return 'Ocupado';
      case 'RESERVADO': return 'Reservado';
      case 'MANUTENCAO': return 'Manutenção';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'OCUPADO': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'RESERVADO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'MANUTENCAO': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatarTelefone = (telefone: string) => {
    if (!telefone) return '-';
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return telefone;
  };

  const formatarSalario = (salario: number | null | undefined) => {
    if (!salario) return '-';
    return salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para formatar salário enquanto digita
  const formatarSalarioInput = (valor: string): string => {
    if (!valor) return '';
    
    // Remove tudo que não é número
    const numeros = valor.replace(/[^\d]/g, '');
    
    if (!numeros) return '';
    
    // Converte para número
    const numero = parseFloat(numeros) / 100;
    
    // Formata em BRL
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Função para converter salário formatado para número
  const converterSalarioParaNumero = (salarioFormatado: string): number => {
    if (!salarioFormatado) return 0;
    
    // Remove formatação BRL
    const numeros = salarioFormatado.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numeros) || 0;
  };

  // Handlers para campos de salário
  const handleSalarioMinimoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarSalarioInput(e.target.value);
    setSalarioMinimo(formatado);
  };

  const handleSalarioMaximoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarSalarioInput(e.target.value);
    setSalarioMaximo(formatado);
  };

  const handleSalarioMinimoBlur = () => {
    setAplicarFiltros(true);
  };

  const handleSalarioMaximoBlur = () => {
    setAplicarFiltros(true);
  };

  const handleSalarioMinimoKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setAplicarFiltros(true);
    }
  };

  const handleSalarioMaximoKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setAplicarFiltros(true);
    }
  };

  // Handlers para campo de busca de cliente
  const handleFiltroClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroCliente(e.target.value);
  };

  const handleFiltroClienteBlur = () => {
    setAplicarFiltros(true);
  };

  const handleFiltroClienteKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setAplicarFiltros(true);
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

  const renderTabelaRelatorio = () => {
    if (dadosRelatorio.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum dado encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Ajuste os filtros para gerar o relatório.
          </p>
        </div>
      );
    }

    const colunas = Object.keys(dadosRelatorio[0]).filter(key => key !== 'statusColor');

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {colunas.map((coluna) => (
                <th
                  key={coluna}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {coluna.charAt(0).toUpperCase() + coluna.slice(1).replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {dadosRelatorio.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {colunas.map((coluna) => (
                  <td key={coluna} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {coluna === 'status' && item.statusColor ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.statusColor}`}>
                        {item[coluna]}
                      </span>
                    ) : (
                      item[coluna]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gere relatórios detalhados do sistema
          </p>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value as any)}
              className="input-field"
              disabled={isLoading}
            >
              <option value="quartos">Quartos</option>
              <option value="clientes">Clientes</option>
              <option value="funcionarios">Funcionários</option>
              <option value="ocupacao">Ocupação</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="input-field"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="input-field"
              disabled={isLoading}
            />
          </div>

          {/* Filtros específicos por tipo de relatório */}
          {tipoRelatorio === 'quartos' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status do Quarto
              </label>
              <select
                value={statusQuarto}
                onChange={(e) => setStatusQuarto(e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                <option value="">Todos os status</option>
                <option value="DISPONIVEL">Disponível</option>
                <option value="OCUPADO">Ocupado</option>
                <option value="RESERVADO">Reservado</option>
                <option value="MANUTENCAO">Manutenção</option>
              </select>
            </div>
          )}
          
          {tipoRelatorio === 'clientes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar Cliente
              </label>
              <input
                type="text"
                value={filtroCliente}
                onChange={handleFiltroClienteChange}
                onBlur={handleFiltroClienteBlur}
                onKeyPress={handleFiltroClienteKeyPress}
                placeholder="Nome ou email do cliente"
                className="input-field"
                disabled={isLoading}
              />
            </div>
          )}
          
          {tipoRelatorio === 'funcionarios' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cargo
                </label>
                <select
                  value={cargoFuncionario}
                  onChange={(e) => setCargoFuncionario(e.target.value)}
                  className="input-field"
                  disabled={isLoading}
                >
                  <option value="">Todos os cargos</option>
                  {cargosDisponiveis.map(cargo => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salário Mínimo
                </label>
                <input
                  type="text"
                  value={salarioMinimo}
                  onChange={handleSalarioMinimoChange}
                  onBlur={handleSalarioMinimoBlur}
                  onKeyPress={handleSalarioMinimoKeyPress}
                  placeholder="R$ 0,00"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salário Máximo
                </label>
                <input
                  type="text"
                  value={salarioMaximo}
                  onChange={handleSalarioMaximoChange}
                  onBlur={handleSalarioMaximoBlur}
                  onKeyPress={handleSalarioMaximoKeyPress}
                  placeholder="R$ 0,00"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
          
          {(tipoRelatorio === 'ocupacao' || tipoRelatorio === 'financeiro') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtro Adicional
              </label>
              <input
                type="text"
                placeholder="Nenhum filtro adicional"
                className="input-field"
                disabled
              />
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={gerarRelatorio}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
          
          <button
            onClick={exportarParaPDF}
            className="btn-secondary"
            disabled={isExporting || dadosRelatorio.length === 0}
          >
            {isExporting ? 'Exportando...' : 'Exportar para PDF'}
          </button>
        </div>

        {/* Resultado do Relatório */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Gerando relatório...</p>
          </div>
        ) : (
          renderTabelaRelatorio()
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

export default Relatorio;
