import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { reservaService, quartoService, clienteService } from '../../services/api';
import { formatarDataBrasil, getDataAtualInput } from '../../utils/dateUtils';
import { getTipoQuarto } from '../../utils/quartoUtils';

interface DashboardStats {
  totalQuartos: number;
  quartosDisponiveis: number;
  quartosOcupados: number;
  quartosManutencao: number;
  quartosLimpeza: number;
  reservasHoje: number;
  checkinsPendentes: number;
  checkoutsHoje: number;
  clientesAtivos: number;
  ocupacao: number;
}

interface ReservaHoje {
  id: number;
  clienteNome: string;
  quartoNumero: number;
  quartoTipo: string;
  status: string;
  checkIn: string;
  checkOut: string;
  numeroHospedes: number;
}

interface QuartoStatus {
  id: number;
  numero: number;
  tipo: string;
  status: string;
  diaria: number;
}

const DashboardUser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalQuartos: 0,
    quartosDisponiveis: 0,
    quartosOcupados: 0,
    quartosManutencao: 0,
    quartosLimpeza: 0,
    reservasHoje: 0,
    checkinsPendentes: 0,
    checkoutsHoje: 0,
    clientesAtivos: 0,
    ocupacao: 0
  });

  const [reservasHoje, setReservasHoje] = useState<ReservaHoje[]>([]);
  const [quartosStatus, setQuartosStatus] = useState<QuartoStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  const carregarDadosDashboard = async () => {
    setIsLoading(true);
    try {
      const [reservasData, quartosData, clientesData] = await Promise.all([
        reservaService.listarReservas(),
        quartoService.listarQuartos(),
        clienteService.listarClientes()
      ]);

      // Calcular estatísticas
      const hoje = getDataAtualInput();
      const reservasDoDia = reservasData.filter((r: any) => 
        (r.status === 'RESERVADA' && (r.checkIn === hoje || r.checkOut === hoje)) ||
        (r.status === 'ATIVA' && r.checkOut === hoje) || (r.status === 'ATIVA' && r.checkIn === hoje)
      );
      
      const checkinsPendentes = reservasData.filter((r: any) => 
        r.status === 'RESERVADA' && r.checkIn === hoje
      );
      
      const checkoutsHoje = reservasData.filter((r: any) => 
        r.status === 'ATIVA' && r.checkOut === hoje
      );

      const ocupacao = quartosData.length > 0 
        ? (quartosData.filter((q: any) => q.status === 'OCUPADO').length / quartosData.length) * 100 
        : 0;

      setStats({
        totalQuartos: quartosData.length,
        quartosDisponiveis: quartosData.filter((q: any) => q.status === 'DISPONIVEL').length,
        quartosOcupados: quartosData.filter((q: any) => q.status === 'OCUPADO').length,
        quartosManutencao: quartosData.filter((q: any) => q.status === 'MANUTENCAO').length,
        quartosLimpeza: quartosData.filter((q: any) => q.status === 'LIMPEZA').length,
        reservasHoje: reservasDoDia.length,
        checkinsPendentes: checkinsPendentes.length,
        checkoutsHoje: checkoutsHoje.length,
        clientesAtivos: clientesData.length,
        ocupacao: Math.round(ocupacao)
      });

      // Preparar reservas de hoje
      const reservasFormatadas: ReservaHoje[] = reservasDoDia.slice(0, 5).map((reserva: any) => {
        const quarto = quartosData.find((q: any) => q.id === reserva.quartoId);
        const cliente = clientesData.find((c: any) => c.id === reserva.clienteId);
        
        return {
          id: reserva.id,
          clienteNome: cliente?.nome || 'Não encontrado',
          quartoNumero: Number(quarto?.numero || 0),
          quartoTipo: quarto ? getTipoQuarto(Number(quarto.numero)) : 'Não definido',
          status: reserva.status,
          checkIn: reserva.checkIn,
          checkOut: reserva.checkOut,
          numeroHospedes: reserva.numeroHospedes
        };
      });
      setReservasHoje(reservasFormatadas);

      // Preparar status dos quartos
      const quartosFormatados: QuartoStatus[] = quartosData.slice(0, 6).map((quarto: any) => ({
        id: quarto.id,
        numero: Number(quarto.numero),
        tipo: getTipoQuarto(Number(quarto.numero)),
        status: quarto.status,
        diaria: quarto.diaria
      }));
      setQuartosStatus(quartosFormatados);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'OCUPADO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'RESERVADO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'MANUTENCAO': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'LIMPEZA': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DISPONIVEL': return 'Disponível';
      case 'OCUPADO': return 'Ocupado';
      case 'RESERVADO': return 'Reservado';
      case 'MANUTENCAO': return 'Manutenção';
      case 'LIMPEZA': return 'Limpeza';
      default: return status;
    }
  };

  const quickActions = [
    {
      title: 'Nova Reserva',
      description: 'Criar uma nova reserva',
      icon: '📅',
      path: '/user/criar-reserva',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Check-in',
      description: 'Realizar check-in de hóspedes',
      icon: '🔑',
      path: '/user/consultar-reservas',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Check-out',
      description: 'Realizar check-out de hóspedes',
      icon: '🚪',
      path: '/user/consultar-reservas',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Gestão de Reservas',
      description: 'Ver todas as reservas',
      icon: '📋',
      path: '/user/consultar-reservas',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bem-vindo ao Sistem de Gestão de Hotel! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Aqui está um resumo das atividades do hotel hoje.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.ocupacao}%</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.ocupacao}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-ins Pendentes</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.checkinsPendentes}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
              <span className="text-2xl">🔑</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-outs Hoje</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.checkoutsHoje}</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-3">
              <span className="text-2xl">🚪</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quartos Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.quartosDisponiveis}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">de {stats.totalQuartos} totais</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3">
              <span className="text-2xl">🏠</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-xl p-6 text-left transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-lg">{action.title}</h3>
              <p className="text-sm opacity-90 mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reservas de Hoje */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Movimentações de Hoje</h2>
            <button
              onClick={() => navigate('/user/consultar-reservas')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Ver todas
            </button>
          </div>
          
          {reservasHoje.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Nenhuma reserva para hoje.
            </p>
          ) : (
            <div className="space-y-3">
              {reservasHoje.map((reserva) => (
                <div key={reserva.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{reserva.clienteNome}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Quarto {reserva.quartoNumero} - {reserva.quartoTipo}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {reserva.numeroHospedes} hóspede(s) • {formatarDataBrasil(reserva.checkIn)} → {formatarDataBrasil(reserva.checkOut)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reserva.status)}`}>
                      {getStatusText(reserva.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status dos Quartos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Status dos Quartos</h2>
            <button
              onClick={() => navigate('/user/status-quartos')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Ver todos
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quartosStatus.map((quarto) => (
              <div key={quarto.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Quarto {quarto.numero}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{quarto.tipo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">R$ {quarto.diaria}/noite</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quarto.status)}`}>
                    {getStatusText(quarto.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;
