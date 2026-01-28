import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { reservaService } from '../services/api';
import { quartoService, clienteService } from '../services/api';

interface UserMenuItem {
  id: number;
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
}

interface AdminMenuItem {
  id: number;
  title: string;
  description: string;
  path: string;
}

interface DashboardStats {
  totalQuartos: number;
  quartosDisponiveis: number;
  quartosOcupados: number;
  reservasHoje: number;
  checkinsPendentes: number;
  clientesAtivos: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  // Estados para dados do dashboard do usuário
  const [stats, setStats] = useState({
    totalQuartos: 0,
    quartosDisponiveis: 0,
    quartosOcupados: 0,
    totalClientes: 0,
    totalReservas: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  const adminMenuItems: AdminMenuItem[] = [
    { id: 1, title: 'Cadastrar Cliente', description: 'Adicionar novos clientes ao sistema', path: '/admin/cadastrar-cliente' },
    { id: 2, title: 'Cadastrar Quarto', description: 'Cadastrar novos quartos no hotel', path: '/admin/cadastrar-quarto' },
    { id: 3, title: 'Cadastrar Funcionário', description: 'Adicionar usuários ao sistema', path: '/admin/cadastrar-funcionario' },
    { id: 4, title: 'Alterar Status Quarto', description: 'Gerenciar status dos quartos', path: '/admin/alterar-status' },
    { id: 5, title: 'Relatórios', description: 'Ver relatórios de ocupação e financeiro', path: '/admin/relatorios' },
  ];

  const userMenuItems: UserMenuItem[] = [
    { id: 1, title: 'Criar Reserva', description: 'Fazer novas reservas para clientes', path: '/user/criar-reserva', icon: '📅', color: 'bg-blue-500' },
    { id: 2, title: 'Consultar Reservas', description: 'Ver reservas existentes', path: '/user/consultar-reservas', icon: '🔍', color: 'bg-green-500' },
    { id: 3, title: 'Check-in', description: 'Registrar entrada de hóspedes', path: '/user/checkin', icon: '🏨', color: 'bg-purple-500' },
    { id: 4, title: 'Check-out', description: 'Registrar saída de hóspedes', path: '/user/checkout', icon: '🚪', color: 'bg-orange-500' },
    { id: 5, title: 'Status Quartos', description: 'Verificar disponibilidade', path: '/user/status-quartos', icon: '🛏️', color: 'bg-cyan-500' },
    { id: 6, title: 'Manutenção', description: 'Marcar quartos para manutenção', path: '/user/manutencao', icon: '🔧', color: 'bg-red-500' },
    { id: 7, title: 'Pagamentos', description: 'Registrar pagamentos', path: '/user/pagamento', icon: '💳', color: 'bg-yellow-500' },
    { id: 8, title: 'Consultar Cliente', description: 'Buscar informações de clientes', path: '/user/consultar-cliente', icon: '👥', color: 'bg-indigo-500' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  useEffect(() => {
    carregarDados();
    
    // Atualizar status automático a cada 5 minutos
    const interval = setInterval(() => {
      atualizarStatusAutomatico();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [quartosData, clientesData] = await Promise.all([
        quartoService.listarQuartos(),
        clienteService.listarClientes()
      ]);
      
      const quartosDisponiveis = quartosData.filter(q => q.status === 'DISPONIVEL').length;
      const quartosOcupados = quartosData.filter(q => q.status === 'OCUPADO').length;
      
      setStats({
        totalQuartos: quartosData.length,
        quartosDisponiveis,
        quartosOcupados,
        totalClientes: clientesData.length,
        totalReservas: 0 // Será implementado quando tiver a API de reservas
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarStatusAutomatico = async () => {
    try {
      setAtualizandoStatus(true);
      const resultado = await reservaService.atualizarStatusAutomatico();
      console.log('Status atualizado:', resultado);
      
      // Recarregar dados após atualização
      await carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status automático:', error);
    } finally {
      setAtualizandoStatus(false);
    }
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  // Componente de Card de Estatística
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trend}</p>
          )}
        </div>
        <div className={`text-3xl p-3 rounded-full ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (isAdmin) {
    // Dashboard Admin
    return (
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bem-vindo, Administrador!
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gerencie todo o sistema hoteleiro a partir deste painel.
          </p>
        </div>

        {/* Admin Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.path)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dashboard User
  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bem-vindo ao Sistema!
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Gerencie as operações diárias do hotel de forma rápida e eficiente.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Quartos Disponíveis"
          value={stats.quartosDisponiveis}
          icon="🛏️"
          color="text-green-500"
          trend={`de ${stats.totalQuartos} totais`}
        />
        <StatCard
          title="Quartos Ocupados"
          value={stats.quartosOcupados}
          icon="🏨"
          color="text-red-500"
          trend="no momento"
        />
        <StatCard
          title="Reservas Hoje"
          value={stats.totalReservas}
          icon="📅"
          color="text-blue-500"
          trend="para hoje"
        />
        <StatCard
          title="Check-ins Pendentes"
          value="0"
          icon="⏰"
          color="text-orange-500"
          trend="aguardando"
        />
        <StatCard
          title="Taxa de Ocupação"
          value={`${stats.totalQuartos > 0 ? Math.round((stats.quartosOcupados / stats.totalQuartos) * 100) : 0}%`}
          icon="📊"
          color="text-purple-500"
          trend="atual"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.totalClientes}
          icon="👥"
          color="text-indigo-500"
          trend="cadastrados"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/user/criar-reserva')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors duration-200 flex flex-col items-center"
          >
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm font-medium">Nova Reserva</span>
          </button>
          <button
            onClick={() => navigate('/user/checkin')}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors duration-200 flex flex-col items-center"
          >
            <span className="text-2xl mb-2">🏨</span>
            <span className="text-sm font-medium">Check-in</span>
          </button>
          <button
            onClick={() => navigate('/user/checkout')}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors duration-200 flex flex-col items-center"
          >
            <span className="text-2xl mb-2">🚪</span>
            <span className="text-sm font-medium">Check-out</span>
          </button>
          <button
            onClick={() => navigate('/user/status-quartos')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-lg transition-colors duration-200 flex flex-col items-center"
          >
            <span className="text-2xl mb-2">🛏️</span>
            <span className="text-sm font-medium">Status</span>
          </button>
        </div>
      </div>

      {/* All Functions Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Todas as Funções</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.path)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
