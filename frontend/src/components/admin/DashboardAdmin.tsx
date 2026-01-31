import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService } from '../../services/api';
import { quartoService } from '../../services/api';
import { clienteService } from '../../services/api';
import { pagamentoService } from '../../services/api';
import { getTipoQuarto } from '../../utils/quartoUtils';
import ErrorModal from '../common/ErrorModal';
import KPICards from './dashboard/KPICards';
import ChartBar from './dashboard/ChartBar';
import RoomStatus from './dashboard/RoomStatus';
import RecentActivities from './dashboard/RecentActivities';
import Alerts from './dashboard/Alerts';

interface DashboardStats {
  totalReservas: number;
  reservasAtivas: number;
  reservasFinalizadas: number;
  reservasCanceladas: number;
  totalQuartos: number;
  quartosDisponiveis: number;
  quartosOcupados: number;
  quartosManutencao: number;
  quartosSujo: number;
  totalClientes: number;
  clientesNovosMes: number;
  totalReceita: number;
  receitaMes: number;
  receitaHoje: number;
  ocupacaoAtual: number;
  ocupacaoMedia: number;
  ticketMedio: number;
}

interface RelatorioMensal {
  mes: string;
  reservas: number;
  receita: number;
  ocupacao: number;
  hospedes: number;
}

interface AtividadeRecente {
  id: string;
  tipo: string;
  descricao: string;
  tempo: string;
  icone: string;
  cor: string;
  checkIn?: string;
  checkOut?: string;
  quartoInfo?: string;
}

interface Alerta {
  id: string;
  tipo: string;
  mensagem: string;
  severidade: 'baixa' | 'media' | 'alta';
  tempo: string;
}

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [relatorioMensal, setRelatorioMensal] = useState<RelatorioMensal[]>([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState<AtividadeRecente[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodoRelatorio, setPeriodoRelatorio] = useState('6');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarDadosDashboard();
  }, [periodoRelatorio]);

  const carregarDadosDashboard = async () => {
    setIsLoading(true);
    try {
      const [reservasData, quartosData, clientesData, pagamentosData] = await Promise.all([
        reservaService.listarReservas(),
        quartoService.listarQuartos(),
        clienteService.listarClientes(),
        pagamentoService.listarPagamentos()
      ]);

      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      
      const totalReservas = reservasData.length || 0;
      const reservasAtivas = reservasData.filter((r: any) => r.status === 'ATIVA').length || 0;
      const reservasFinalizadas = reservasData.filter((r: any) => r.status === 'FINALIZADA').length || 0;
      const reservasCanceladas = reservasData.filter((r: any) => r.status === 'CANCELADA').length || 0;
      
      const totalQuartos = quartosData.length || 0;
      const quartosDisponiveis = quartosData.filter((q: any) => q.status === 'DISPONIVEL').length || 0;
      const quartosOcupados = quartosData.filter((q: any) => q.status === 'OCUPADO').length || 0;
      const quartosManutencao = quartosData.filter((q: any) => q.status === 'MANUTENCAO').length || 0;
      const quartosSujo = quartosData.filter((q: any) => q.status === 'SUJO').length || 0;
      
      const totalClientes = clientesData.length || 0;
      const clientesNovosMes = clientesData.filter((c: any) => {
        const dataCliente = new Date(c.createdAt);
        return dataCliente.getMonth() === mesAtual && dataCliente.getFullYear() === anoAtual;
      }).length || 0;
      
      const totalReceita = pagamentosData.reduce((acc: number, pgto: any) => {
        const valor = pgto.valor || pgto.valorTotal || 0;
        return acc + (typeof valor === 'number' ? valor : parseFloat(valor) || 0);
      }, 0);
      
      const receitaMes = pagamentosData
        .filter((pgto: any) => {
          const dataPgto = new Date(pgto.dataPagamento || pgto.createdAt);
          return dataPgto.getMonth() === mesAtual && dataPgto.getFullYear() === anoAtual;
        })
        .reduce((acc: number, pgto: any) => {
          const valor = pgto.valor || pgto.valorTotal || 0;
          return acc + (typeof valor === 'number' ? valor : parseFloat(valor) || 0);
        }, 0);
      
      const receitaHoje = pagamentosData
        .filter((pgto: any) => {
          const dataPgto = new Date(pgto.dataPagamento || pgto.createdAt);
          return dataPgto.toDateString() === hoje.toDateString();
        })
        .reduce((acc: number, pgto: any) => {
          const valor = pgto.valor || pgto.valorTotal || 0;
          return acc + (typeof valor === 'number' ? valor : parseFloat(valor) || 0);
        }, 0);
      
      const quartosOcupadosHoje = reservasData.filter((r: any) => {
        const hoje = new Date();
        const checkIn = new Date(r.checkIn);
        const checkOut = new Date(r.checkOut);
        return hoje >= checkIn && hoje < checkOut && r.status === 'ATIVA';
      }).length;
      
      const ocupacaoAtual = totalQuartos > 0 ? (quartosOcupadosHoje / totalQuartos) * 100 : 0;
      const ticketMedio = totalReservas > 0 ? totalReceita / totalReservas : 0;
      
      const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
      let totalOcupacaoDiaria = 0;
      for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataDia = new Date(anoAtual, mesAtual, dia);
        const quartosOcupadosDia = reservasData.filter((r: any) => {
          const checkIn = new Date(r.checkIn);
          const checkOut = new Date(r.checkOut);
          return dataDia >= checkIn && dataDia < checkOut && r.status === 'ATIVA';
        }).length;
        totalOcupacaoDiaria += quartosOcupadosDia;
      }
      const ocupacaoMedia = totalQuartos > 0 ? (totalOcupacaoDiaria / (diasNoMes * totalQuartos)) * 100 : 0;

      setStats({
        totalReservas, reservasAtivas, reservasFinalizadas, reservasCanceladas,
        totalQuartos, quartosDisponiveis, quartosOcupados, quartosManutencao, quartosSujo,
        totalClientes, clientesNovosMes, totalReceita, receitaMes, receitaHoje,
        ocupacaoAtual, ocupacaoMedia, ticketMedio
      });

      gerarRelatorioMensal(reservasData, pagamentosData, quartosData);
      gerarAtividadesRecentes(reservasData, quartosData);
      gerarAlertas(reservasData, quartosData);

    } catch (error) {
      setErrorMessage('Não foi possível carregar os dados do dashboard. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const gerarRelatorioMensal = (reservas: any[], pagamentos: any[], quartos: any[]) => {
    try {
      const meses = [];
      const hoje = new Date();
      
      for (let i = parseInt(periodoRelatorio) - 1; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        const reservasMes = reservas.filter((r: any) => {
          const dataReserva = new Date(r.createdAt || r.checkIn);
          return dataReserva.getMonth() === data.getMonth() && 
                 dataReserva.getFullYear() === data.getFullYear();
        });

        const receitaMes = pagamentos
          .filter((pgto: any) => {
            const dataPgto = new Date(pgto.dataPagamento || pgto.createdAt);
            return dataPgto.getMonth() === data.getMonth() && 
                   dataPgto.getFullYear() === data.getFullYear();
          })
          .reduce((acc: number, pgto: any) => {
            const valor = pgto.valor || pgto.valorTotal || 0;
            return acc + (typeof valor === 'number' ? valor : parseFloat(valor) || 0);
          }, 0);

        const diasNoMes = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();
        let totalOcupacaoDiaria = 0;
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
          const dataDia = new Date(data.getFullYear(), data.getMonth(), dia);
          const quartosOcupadosDia = reservas.filter((r: any) => {
            const checkIn = new Date(r.checkIn);
            const checkOut = new Date(r.checkOut);
            return dataDia >= checkIn && dataDia < checkOut && r.status === 'ATIVA';
          }).length;
          totalOcupacaoDiaria += quartosOcupadosDia;
        }
        
        const ocupacaoMedia = quartos.length > 0 
          ? (totalOcupacaoDiaria / (diasNoMes * quartos.length)) * 100 
          : 0;

        const hospedesMes = reservasMes.reduce((total: number, reserva: any) => {
          const hospedes = reserva.numeroHospedes ?? reserva.hospedes ?? 1;
          return total + (typeof hospedes === 'number' ? hospedes : parseInt(hospedes) || 1);
        }, 0);

        meses.push({
          mes: mesNome,
          reservas: reservasMes.length,
          receita: receitaMes,
          ocupacao: Math.round(ocupacaoMedia * 10) / 10,
          hospedes: hospedesMes
        });
      }
      
      setRelatorioMensal(meses);
    } catch (error) {
      setRelatorioMensal([]);
    }
  };

  const gerarAtividadesRecentes = (reservas: any[], quartos: any[]) => {
    const atividades: AtividadeRecente[] = [];
    const agora = new Date();

    // Últimas reservas com status "RESERVADA" e "ATIVA"
    reservas
      .filter((r: any) => r.status === 'RESERVADA' || r.status === 'ATIVA')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .forEach((reserva: any) => {
        const dataReserva = new Date(reserva.createdAt);
        const diffMs = agora.getTime() - dataReserva.getTime();
        const diffMin = Math.floor(diffMs / (1000 * 60));
        const diffHoras = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHoras / 24);

        let tempo = '';
        if (diffMin < 5) tempo = 'Agora';
        else if (diffMin < 60) tempo = `${diffMin} min atrás`;
        else if (diffHoras < 24) tempo = `${diffHoras}h atrás`;
        else tempo = `${diffDias} dia(s) atrás`;

        // Tentar diferentes formas de obter o nome do cliente
        const clienteNome = reserva.cliente?.nome || 
                           reserva.nomeCliente || 
                           reserva.clienteNome || 
                           reserva.clienteNome || 
                           'Cliente';
        
        // Obter o número do quarto - CAMPO CORRETO: quartoNumero
        const numeroFinal = reserva.quartoNumero || 'N/A';
        
        console.log('DEBUG - Usando quartoNumero:', numeroFinal);
        
        // Obter o tipo do quarto usando o utilitário baseado no número
        let quartoTipo = 'Standard';
        if (numeroFinal !== 'N/A' && !isNaN(parseInt(numeroFinal))) {
          quartoTipo = getTipoQuarto(parseInt(numeroFinal));
        } else {
          // Fallback para tipos diretos do backend
          quartoTipo = reserva.quarto?.tipo || 
                        reserva.tipoQuarto || 
                        reserva.quartoTipo || 
                        'Standard';
        }
        
        // Formatar datas de check-in e check-out
        const checkIn = reserva.checkIn ? 
          new Date(reserva.checkIn).toLocaleDateString('pt-BR') : 
          'N/A';
        const checkOut = reserva.checkOut ? 
          new Date(reserva.checkOut).toLocaleDateString('pt-BR') : 
          'N/A';

        atividades.push({
          id: reserva.id || `reserva-${Date.now()}`,
          tipo: 'reserva',
          descricao: `${clienteNome} - ${reserva.status}`,
          tempo: tempo,
          icone: '📅',
          cor: 'text-blue-600',
          checkIn: checkIn,
          checkOut: checkOut,
          quartoInfo: `${numeroFinal} - ${quartoTipo}`
        });
      });

    setAtividadesRecentes(atividades);
  };

  const gerarAlertas = (reservas: any[], quartos: any[]) => {
    const novosAlertas: Alerta[] = [];
    const agora = new Date();

    const quartosSujo = quartos.filter((q: any) => q.status === 'SUJO').length;
    if (quartosSujo > 0) {
      novosAlertas.push({
        id: 'quartos-sujos',
        tipo: 'limpeza',
        mensagem: `${quartosSujo} quarto(s) precisam de limpeza`,
        severidade: 'media',
        tempo: 'Agora'
      });
    }

    const ocupacaoAtual = quartos.length > 0 ? (quartos.filter((q: any) => q.status === 'OCUPADO').length / quartos.length) * 100 : 0;
    if (ocupacaoAtual < 30) {
      novosAlertas.push({
        id: 'baixa-ocupacao',
        tipo: 'ocupacao',
        mensagem: `Taxa de ocupação baixa: ${ocupacaoAtual.toFixed(1)}%`,
        severidade: 'baixa',
        tempo: 'Hoje'
      });
    }

    const reservasHoje = reservas.filter((r: any) => {
      const checkIn = new Date(r.checkIn);
      return checkIn.toDateString() === agora.toDateString() && r.status === 'RESERVADA';
    }).length;
    
    if (reservasHoje > 0) {
      novosAlertas.push({
        id: 'checkins-hoje',
        tipo: 'checkin',
        mensagem: `${reservasHoje} check-in(s) agendado(s) para hoje`,
        severidade: 'baixa',
        tempo: 'Hoje'
      });
    }

    setAlertas(novosAlertas.slice(0, 4));
  };

  const formatarDataHora = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-indigo-400 animate-ping"></div>
          </div>
          <p className="mt-8 text-xl font-semibold text-gray-600 dark:text-gray-300">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const maxReservas = Math.max(...relatorioMensal.map(r => r.reservas), 10);
  const maxReceita = Math.max(...relatorioMensal.map(r => r.receita), 1000);
  const maxOcupacao = 100;
  const maxHospedes = Math.max(...relatorioMensal.map(r => r.hospedes || 0), 10);

  const reservasChartData = relatorioMensal.map(r => ({
    mes: r.mes,
    value: r.reservas
  }));

  const receitaChartData = relatorioMensal.map(r => ({
    mes: r.mes,
    value: r.receita
  }));

  const hospedesChartData = relatorioMensal.map(r => ({
    mes: r.mes,
    value: r.hospedes || 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="mb-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Visão geral do hotel • {formatarDataHora(new Date())}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={periodoRelatorio}
                onChange={(e) => setPeriodoRelatorio(e.target.value)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
              >
                <option value="3">Últimos 3 meses</option>
                <option value="6">Últimos 6 meses</option>
                <option value="12">Últimos 12 meses</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <KPICards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ChartBar
          title="Reservas Mensais"
          data={reservasChartData}
          color="text-blue-600"
          maxValue={maxReservas}
          gradientId="reservasGradient"
        />
        <ChartBar
          title="Receita Mensal"
          data={receitaChartData}
          color="text-emerald-600"
          maxValue={maxReceita}
          unit="BRL"
          gradientId="receitaGradient"
        />
        <ChartBar
          title="Quantidade de Hóspedes"
          data={hospedesChartData}
          color="text-purple-600"
          maxValue={maxHospedes}
          gradientId="hospedesGradient"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RoomStatus stats={stats} />
          <Alerts alertas={alertas} />
        </div>
        <div className="space-y-6">
          <RecentActivities atividades={atividadesRecentes} />
        </div>
      </div>

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Erro ao Carregar Dados"
        message={errorMessage}
      />
    </div>
  );
};

export default DashboardAdmin;
