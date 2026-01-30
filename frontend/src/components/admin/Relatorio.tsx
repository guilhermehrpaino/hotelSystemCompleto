import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { quartoService, QuartoResponse, reservaService } from '../../services/api';
import { getTipoQuarto } from '../../utils/quartoUtils';
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
      tipo: getTipoQuarto(Number(quarto.numero)),
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
    const [quartos, reservas] = await Promise.all([
      quartoService.listarQuartos(),
      reservaService.listarReservas()
    ]);

    const ocupados = quartos.filter(q => q.status === 'OCUPADO').length;
    const diariaMedia = quartos.length > 0 ? quartos.reduce((acc, q) => acc + q.diaria, 0) / quartos.length : 0;

    const reservasAtivas = reservas.filter((r: any) => r.status === 'ATIVA').length;
    const reservasFinalizadas = reservas.filter((r: any) => r.status === 'FINALIZADA').length;
    const receitaTotal = reservas.reduce((acc: number, r: any) => acc + (r.valorTotal || 0), 0);
    const receitaMediaReserva = reservas.length > 0 ? receitaTotal / reservas.length : 0;
    const taxaOcupacao = quartos.length > 0 ? (ocupados / quartos.length) * 100 : 0;

    return [
      {
        metrica: 'Quartos Ocupados',
        valor: ocupados,
        total: quartos.length,
        percentual: taxaOcupacao.toFixed(1),
      },
      {
        metrica: 'Reservas Ativas',
        valor: reservasAtivas,
        total: reservas.length,
        percentual: reservas.length > 0 ? ((reservasAtivas / reservas.length) * 100).toFixed(1) : '0.0',
      },
      {
        metrica: 'Reservas Finalizadas',
        valor: reservasFinalizadas,
        total: reservas.length,
        percentual: reservas.length > 0 ? ((reservasFinalizadas / reservas.length) * 100).toFixed(1) : '0.0',
      },
      {
        metrica: 'Receita Total',
        valor: formatarMoeda(receitaTotal),
        total: '-',
        percentual: '-',
      },
      {
        metrica: 'Receita Média por Reserva',
        valor: formatarMoeda(receitaMediaReserva),
        total: '-',
        percentual: '-',
      },
      {
        metrica: 'Diária Média',
        valor: formatarMoeda(diariaMedia),
        total: '-',
        percentual: '-',
      }
    ];
  };

  const exportarParaPDF = async () => {
    setIsExporting(true);
    try {
      const colunas = dadosRelatorio.length > 0
        ? Object.keys(dadosRelatorio[0]).filter(key => key !== 'statusColor')
        : [];

      const tabelaHtml = colunas.length > 0
        ? `
          <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:12px;">
            <thead>
              <tr>
                ${colunas.map(col => `<th style="text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;">${col.charAt(0).toUpperCase() + col.slice(1)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${dadosRelatorio.map(item => `
                <tr>
                  ${colunas.map(col => `<td style="padding:8px; border-bottom:1px solid #f1f5f9;">${item[col]}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        : '<p>Sem dados para exportar.</p>';

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) {
        throw new Error('Pop-up bloqueado. Permita pop-ups para exportar o PDF.');
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório ${tipoRelatorio}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
              h1 { font-size: 20px; margin-bottom: 8px; }
              p { color: #6b7280; margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <h1>Relatório ${tipoRelatorio}</h1>
            <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}.</p>
            ${tabelaHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      showSuccessModal(
        'PDF Exportado!',
        'O relatório foi preparado para impressão/salvamento em PDF.',
        `Arquivo: relatorio_${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      showErrorModal('Erro ao exportar PDF', error.message || 'Não foi possível exportar o relatório.');
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
      <div className="overflow-x-auto rounded-xl border border-gray-200/60 dark:border-gray-700/60">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 backdrop-blur">
            <tr>
              {colunas.map((coluna) => (
                <th
                  key={coluna}
                  className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {coluna.charAt(0).toUpperCase() + coluna.slice(1).replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {dadosRelatorio.map((item, index) => (
              <tr
                key={index}
                className="odd:bg-white even:bg-gray-50/60 dark:odd:bg-gray-900 dark:even:bg-gray-800/40 hover:bg-indigo-50/60 dark:hover:bg-gray-800 transition-colors"
              >
                {colunas.map((coluna) => (
                  <td key={coluna} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {coluna === 'status' && item.statusColor ? (
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full ${item.statusColor}`}>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Relatórios
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Gere relatórios detalhados do sistema com filtros inteligentes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={gerarRelatorio}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
              <button
                onClick={exportarParaPDF}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isExporting || dadosRelatorio.length === 0}
              >
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Aplique filtros para refinar o relatório</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </div>

        {/* Resultado do Relatório */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Gerando relatório...</p>
            </div>
          ) : (
            renderTabelaRelatorio()
          )}
        </div>
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
