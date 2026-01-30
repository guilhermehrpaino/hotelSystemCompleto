import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService, ReservaResponse } from '../../services/api';
import { quartoService, QuartoResponse } from '../../services/api';
import { clienteService, ClienteResponse } from '../../services/api';
import { pagamentoService } from '../../services/api';
import { formatarDataBrasil } from '../../utils/dateUtils';
import ErrorModal from '../common/ErrorModal';

interface DashboardStats {
  totalReservas: number;
  reservasAtivas: number;
  reservasFinalizadas: number;
  reservasCanceladas: number;
  totalQuartos: number;
  quartosDisponiveis: number;
  quartosOcupados: number;
  quartosManutencao: number;
  totalClientes: number;
  totalReceita: number;
  ocupacaoAtual: number;
}

interface RelatorioMensal {
  mes: string;
  reservas: number;
  receita: number;
  ocupacao: number;
}

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [relatorioMensal, setRelatorioMensal] = useState<RelatorioMensal[]>([]);
  const [reservasRecentes, setReservasRecentes] = useState<ReservaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodoRelatorio, setPeriodoRelatorio] = useState('6'); // últimos 6 meses
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarDadosDashboard();
  }, [periodoRelatorio]);

  const carregarDadosDashboard = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Iniciando carregamento do Dashboard Admin...');
      
      // Carregar todos os dados com tratamento de erro individual
      let reservasData: any[] = [];
      let quartosData: any[] = [];
      let clientesData: any[] = [];
      let pagamentosData: any[] = [];

      try {
        reservasData = await reservaService.listarReservas();
        console.log('✅ Reservas carregadas:', reservasData.length);
      } catch (error) {
        console.error('❌ Erro ao carregar reservas:', error);
      }

      try {
        quartosData = await quartoService.listarQuartos();
        console.log('✅ Quartos carregados:', quartosData.length);
      } catch (error) {
        console.error('❌ Erro ao carregar quartos:', error);
      }

      try {
        clientesData = await clienteService.listarClientes();
        console.log('✅ Clientes carregados:', clientesData.length);
      } catch (error) {
        console.error('❌ Erro ao carregar clientes:', error);
      }

      try {
        pagamentosData = await pagamentoService.listarPagamentos();
        console.log('✅ Pagamentos carregados:', pagamentosData.length);
      } catch (error) {
        console.error('❌ Erro ao carregar pagamentos:', error);
        // Se pagamentos falhar, usar array vazio para não quebrar o cálculo
        pagamentosData = [];
      }

      // Calcular estatísticas com valores padrão
      const totalReservas = reservasData.length || 0;
      const reservasAtivas = reservasData.filter((r: any) => r.status === 'ATIVA').length || 0;
      const reservasFinalizadas = reservasData.filter((r: any) => r.status === 'FINALIZADA').length || 0;
      const reservasCanceladas = reservasData.filter((r: any) => r.status === 'CANCELADA').length || 0;
      
      const totalQuartos = quartosData.length || 0;
      const quartosDisponiveis = quartosData.filter((q: any) => q.status === 'DISPONIVEL').length || 0;
      const quartosOcupados = quartosData.filter((q: any) => q.status === 'OCUPADO').length || 0;
      const quartosManutencao = quartosData.filter((q: any) => q.status === 'MANUTENCAO').length || 0;
      
      const totalClientes = clientesData.length || 0;
      
      // Calcular receita total com tratamento de erro
      const totalReceita = pagamentosData.reduce((acc: number, pgto: any) => {
        const valor = pgto.valor || pgto.valorTotal || 0;
        return acc + (typeof valor === 'number' ? valor : parseFloat(valor) || 0);
      }, 0);
      
      // Calcular taxa de ocupação atual
      const ocupacaoAtual = totalQuartos > 0 ? (quartosOcupados / totalQuartos) * 100 : 0;

      const statsData = {
        totalReservas,
        reservasAtivas,
        reservasFinalizadas,
        reservasCanceladas,
        totalQuartos,
        quartosDisponiveis,
        quartosOcupados,
        quartosManutencao,
        totalClientes,
        totalReceita,
        ocupacaoAtual
      };

      console.log('📊 Estatísticas calculadas:', statsData);
      setStats(statsData);

      // Gerar relatório mensal
      gerarRelatorioMensal(reservasData, pagamentosData, quartosData);

      // Reservas recentes (últimas 10)
      const recentes = reservasData
        .sort((a: any, b: any) => new Date(b.createdAt || b.checkIn).getTime() - new Date(a.createdAt || a.checkIn).getTime())
        .slice(0, 10);
      setReservasRecentes(recentes);

    } catch (error) {
      console.error('❌ Erro geral no carregamento do dashboard:', error);
      setErrorMessage('Não foi possível carregar os dados do dashboard. Tente novamente.');
      setShowError(true);
      
      // Definir valores padrão para não quebrar a interface
      setStats({
        totalReservas: 0,
        reservasAtivas: 0,
        reservasFinalizadas: 0,
        reservasCanceladas: 0,
        totalQuartos: 0,
        quartosDisponiveis: 0,
        quartosOcupados: 0,
        quartosManutencao: 0,
        totalClientes: 0,
        totalReceita: 0,
        ocupacaoAtual: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const gerarRelatorioMensal = (reservas: any[], pagamentos: any[], quartos: any[]) => {
    try {
      console.log('📈 Gerando relatório mensal...');
      const meses = [];
      const hoje = new Date();
      
      for (let i = parseInt(periodoRelatorio) - 1; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesNome = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        const reservasMes = reservas.filter((r: any) => {
          try {
            const dataReserva = new Date(r.createdAt || r.checkIn);
            return dataReserva.getMonth() === data.getMonth() && 
                   dataReserva.getFullYear() === data.getFullYear();
          } catch (error) {
            return false;
          }
        });

        const receitaMes = pagamentos
          .filter((pgto: any) => {
            try {
              const dataPgto = new Date(pgto.dataPagamento || pgto.createdAt);
              return dataPgto.getMonth() === data.getMonth() && 
                     dataPgto.getFullYear() === data.getFullYear();
            } catch (error) {
              return false;
            }
          })
          .reduce((acc: number, pgto: any) => {
            const valor = pgto.valor || pgto.valorTotal || 0;
            return acc + (typeof valor === 'number' ? valor : parseFloat(valor) || 0);
          }, 0);

        // Calcular ocupação média do mês
        const diasNoMes = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
        const ocupacaoDiaria = [];
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
          const dataDia = new Date(data.getFullYear(), data.getMonth(), dia);
          const quartosOcupadosDia = reservas.filter((r: any) => {
            try {
              const checkIn = new Date(r.checkIn);
              const checkOut = new Date(r.checkOut);
              return dataDia >= checkIn && dataDia < checkOut && r.status === 'ATIVA';
            } catch (error) {
              return false;
            }
          }).length;
          
          ocupacaoDiaria.push(quartosOcupadosDia);
        }
        
        const ocupacaoMedia = quartos.length > 0 
          ? (ocupacaoDiaria.reduce((acc, val) => acc + val, 0) / (diasNoMes * quartos.length)) * 100 
          : 0;

        meses.push({
          mes: mesNome,
          reservas: reservasMes.length,
          receita: receitaMes,
          ocupacao: Math.round(ocupacaoMedia * 10) / 10
        });
      }
      
      console.log('📊 Relatório mensal gerado:', meses);
      setRelatorioMensal(meses);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório mensal:', error);
      // Definir dados vazios para não quebrar a interface
      setRelatorioMensal([]);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FINALIZADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'RESERVADA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Não foi possível carregar os dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Administrativo</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Visão geral do sistema e relatórios
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReservas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🏨</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Ocupação</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ocupacaoAtual.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatarMoeda(stats.totalReceita)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClientes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Relatório Mensal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Relatório Mensal</h2>
            <select
              value={periodoRelatorio}
              onChange={(e) => setPeriodoRelatorio(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
              <option value="12">Últimos 12 meses</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Reservas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ocupação Média
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {relatorioMensal.map((mes, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {mes.mes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {mes.reservas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatarMoeda(mes.receita)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <div className="flex-1 mr-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${mes.ocupacao}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs font-medium">{mes.ocupacao}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservas Recentes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reservas Recentes</h2>
            <button
              onClick={() => navigate('/user/consultar-reservas')}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              Ver todas
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quarto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reservasRecentes.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{reserva.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {reserva.clienteNome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {reserva.quartoNumero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatarDataBrasil(reserva.checkIn)} - {formatarDataBrasil(reserva.checkOut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.status)}`}>
                        {reserva.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Erro */}
        {showError && (
          <ErrorModal
            isOpen={showError}
            title="Erro"
            message={errorMessage}
            onClose={() => setShowError(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;
