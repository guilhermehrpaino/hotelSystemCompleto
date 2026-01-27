import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { quartoService, QuartoResponse } from '../../services/api';
import { clienteService, ClienteResponse } from '../../services/api';
import { FuncionarioRequest, FuncionarioResponse, funcionarioService } from '../../services/funcionarioApi';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

interface DashboardStats {
  totalQuartos: number;
  quartosDisponiveis: number;
  quartosOcupados: number;
  quartosReservados: number;
  quartosManutencao: number;
  taxaOcupacao: number;
  totalClientes: number;
  clientesNovosMes: number;
  totalFuncionarios: number;
  receitaMensalEstimada: number;
  diariaMedia: number;
}

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  
  // Estados para dados
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodoRelatorio, setPeriodoRelatorio] = useState<'7dias' | '30dias' | '90dias'>('30dias');
  
  // Estados para modais
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  // Carregar dados ao montar
  useEffect(() => {
    carregarDadosDashboard();
  }, [periodoRelatorio]);

  const carregarDadosDashboard = async () => {
    setIsLoading(true);
    try {
      // Carregar todos os dados em paralelo
      const [quartosData, clientesData, funcionariosData] = await Promise.all([
        quartoService.listarQuartos(),
        clienteService.listarClientes(),
        funcionarioService.listarFuncionarios()
      ]);

      setQuartos(quartosData);
      
      // Ordenar clientes por data de criação (mais recentes primeiro)
      const clientesOrdenados = clientesData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setClientes(clientesOrdenados);
      
      setFuncionarios(funcionariosData);

      // Calcular estatísticas
      const estatisticas = calcularEstatisticas(quartosData, clientesData, funcionariosData);
      setStats(estatisticas);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      showErrorModal('Erro ao carregar dashboard', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEstatisticas = (
    quartosData: QuartoResponse[],
    clientesData: ClienteResponse[],
    funcionariosData: FuncionarioResponse[]
  ): DashboardStats => {
    console.log('=== CALCULAR ESTATÍSTICAS ===');
    console.log('Quartos brutos:', quartosData);
    console.log('Clientes brutos:', clientesData);
    console.log('Funcionários brutos:', funcionariosData);
    
    const totalQuartos = quartosData.length;
    const quartosDisponiveis = quartosData.filter(q => q.status === 'DISPONIVEL').length;
    const quartosOcupados = quartosData.filter(q => q.status === 'OCUPADO').length;
    const quartosReservados = quartosData.filter(q => q.status === 'RESERVADO').length;
    const quartosManutencao = quartosData.filter(q => q.status === 'MANUTENCAO').length;
    
    console.log('Status dos quartos:', {
      totalQuartos,
      quartosDisponiveis,
      quartosOcupados,
      quartosReservados,
      quartosManutencao
    });
    
    const taxaOcupacao = totalQuartos > 0 ? (quartosOcupados / totalQuartos) * 100 : 0;
    
    const totalClientes = clientesData.length;
    const clientesNovosMes = calcularClientesNovosMes(clientesData);
    
    const totalFuncionarios = funcionariosData.length;
    
    const diariaMedia = quartosData.reduce((acc, q) => acc + q.diaria, 0) / totalQuartos;
    const receitaMensalEstimada = quartosOcupados * diariaMedia * 30;

    const resultado = {
      totalQuartos,
      quartosDisponiveis,
      quartosOcupados,
      quartosReservados,
      quartosManutencao,
      taxaOcupacao,
      totalClientes,
      clientesNovosMes,
      totalFuncionarios,
      receitaMensalEstimada,
      diariaMedia
    };
    
    console.log('Resultado final:', resultado);
    console.log('==========================');
    
    return resultado;
  };

  const calcularClientesNovosMes = (clientesData: ClienteResponse[]): number => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    
    return clientesData.filter(cliente => 
      new Date(cliente.createdAt) >= inicioMes
    ).length;
  };

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarPercentual = (valor: number): string => {
    return `${valor.toFixed(1)}%`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'DISPONIVEL': return 'text-green-600 dark:text-green-400';
      case 'OCUPADO': return 'text-red-600 dark:text-red-400';
      case 'RESERVADO': return 'text-yellow-600 dark:text-yellow-400';
      case 'MANUTENCAO': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'DISPONIVEL': return 'Disponíveis';
      case 'OCUPADO': return 'Ocupados';
      case 'RESERVADO': return 'Reservados';
      case 'MANUTENCAO': return 'Manutenção';
      default: return status;
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

  // Componente de Card de Estatística
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Componente de Gráfico de Donut (Anel) - Modelo Alternativo
  const PieChart: React.FC<{
    data: { label: string; value: number; color: string }[];
    title: string;
  }> = ({ data, title }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    
    console.log('=== PIE CHART RENDER ===');
    console.log('PieChart data:', data);
    console.log('PieChart total:', total);
    console.log('========================');
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">{title}</h3>
        
        {/* Gráfico de Pizza Tradicional */}
        <div className="flex justify-center mb-6">
          <div className="relative w-56 h-56">
            <svg className="w-56 h-56" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const startAngle = data.slice(0, index).reduce((acc, prev) => 
                  acc + (total > 0 ? (prev.value / total) * 360 : 0), 0
                );
                const endAngle = startAngle + (percentage * 3.6);
                
                // Adiciona pequena separação entre fatias
                const adjustedStartAngle = startAngle + 0.5;
                const adjustedEndAngle = endAngle - 0.5;
                
                const startAngleRad = (adjustedStartAngle - 90) * Math.PI / 180;
                const endAngleRad = (adjustedEndAngle - 90) * Math.PI / 180;
                
                const x1 = 50 + 40 * Math.cos(startAngleRad);
                const y1 = 50 + 40 * Math.sin(startAngleRad);
                const x2 = 50 + 40 * Math.cos(endAngleRad);
                const y2 = 50 + 40 * Math.sin(endAngleRad);
                
                const largeArcFlag = adjustedEndAngle - adjustedStartAngle > 180 ? 1 : 0;
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
        
        {/* Cards de Status */}
        <div className="grid grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div 
                className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm flex items-center justify-center"
                style={{ backgroundColor: item.color }}
              >
                <div className="w-4 h-4 bg-white rounded-full opacity-30"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {item.label}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.value} quartos
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente de Gráfico de Barras (Simplificado)
  const BarChart: React.FC<{
    data: { label: string; value: number; color: string }[];
    title: string;
  }> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum dado disponível
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Não foi possível carregar as informações do dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Dados para gráficos
  const statusQuartosData = [
    { label: 'Disponíveis', value: stats.quartosDisponiveis, color: '#10b981' },  // Verde mais forte
    { label: 'Ocupados', value: stats.quartosOcupados, color: '#dc2626' },        // Vermelho mais forte
    { label: 'Reservados', value: stats.quartosReservados, color: '#f59e0b' },     // Laranja (mais distante do vermelho)
    { label: 'Manutenção', value: stats.quartosManutencao, color: '#6366f1' }      // Azul (mais distante do verde)
  ];

  // Debug logs
  console.log('=== DASHBOARD DEBUG ===');
  console.log('Dashboard Stats:', stats);
  console.log('Status Quartos Data:', statusQuartosData);
  console.log('Status Quartos Data - valores:', statusQuartosData.map(item => ({ label: item.label, value: item.value })));
  console.log('Tem algum valor > 0?', statusQuartosData.some(item => item.value > 0));
  console.log('Clientes:', clientes);
  console.log('Quartos:', quartos);
  console.log('=======================');

  const cargosFuncionariosData = funcionarios.reduce((acc, funcionario) => {
    const existing = acc.find(item => item.label === funcionario.cargo);
    if (existing) {
      existing.value++;
    } else {
      acc.push({
        label: funcionario.cargo,
        value: 1,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }
    return acc;
  }, [] as { label: string; value: number; color: string }[]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Visão geral do hotel em tempo real
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={periodoRelatorio}
                onChange={(e) => setPeriodoRelatorio(e.target.value as any)}
                className="input-field"
              >
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="90dias">Últimos 90 dias</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Quartos"
            value={stats.totalQuartos}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            color="bg-blue-500"
          />
          
          <StatCard
            title="Taxa de Ocupação"
            value={formatarPercentual(stats.taxaOcupacao)}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="bg-green-500"
          />
          
          <StatCard
            title="Total de Clientes"
            value={stats.totalClientes}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="bg-purple-500"
            trend={{
              value: 12.5,
              isPositive: true
            }}
          />
          
          <StatCard
            title="Receita Mensal"
            value={formatarMoeda(stats.receitaMensalEstimada)}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-yellow-500"
            trend={{
              value: 8.2,
              isPositive: true
            }}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PieChart
            data={statusQuartosData}
            title="Status dos Quartos"
          />
          
          {cargosFuncionariosData.length > 0 ? (
            <BarChart
              data={cargosFuncionariosData}
              title="Funcionários por Cargo"
            />
          ) : (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Funcionários por Cargo
              </h3>
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nenhum funcionário cadastrado ainda
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabelas Resumidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimos Clientes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Últimos Clientes Cadastrados
            </h3>
            <div className="overflow-x-auto">
              {clientes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nenhum cliente cadastrado ainda
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {clientes.slice(0, 5).map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {cliente.nome}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {cliente.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quartos por Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição de Quartos
            </h3>
            <div className="space-y-4">
              {statusQuartosData.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      quartos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
    </div>
  );
};

export default Dashboard;
