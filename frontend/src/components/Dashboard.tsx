import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  const adminMenuItems = [
    { id: 1, title: 'Cadastrar Cliente', description: 'Adicionar novos clientes ao sistema', path: '/admin/cadastrar-cliente' },
    { id: 2, title: 'Cadastrar Quarto', description: 'Cadastrar novos quartos no hotel', path: '/admin/cadastrar-quarto' },
    { id: 3, title: 'Cadastrar Funcionário', description: 'Adicionar usuários ao sistema', path: '/admin/cadastrar-funcionario' },
    { id: 4, title: 'Alterar Status Quarto', description: 'Gerenciar status dos quartos', path: '/admin/alterar-status' },
    { id: 5, title: 'Relatórios', description: 'Ver relatórios de ocupação e financeiro', path: '/admin/relatorios' },
  ];

  const userMenuItems = [
    { id: 1, title: 'Criar Reserva', description: 'Fazer novas reservas para clientes', path: '/user/criar-reserva' },
    { id: 2, title: 'Consultar Reservas', description: 'Ver reservas existentes', path: '/user/consultar-reservas' },
    { id: 3, title: 'Cancelar Reserva', description: 'Cancelar reservas pendentes', path: '/user/cancelar-reserva' },
    { id: 4, title: 'Realizar Check-in', description: 'Registrar entrada de hóspedes', path: '/user/checkin' },
    { id: 5, title: 'Realizar Check-out', description: 'Registrar saída de hóspedes', path: '/user/checkout' },
    { id: 6, title: 'Ver Status Quartos', description: 'Verificar disponibilidade', path: '/user/status-quartos' },
    { id: 7, title: 'Solicitar Manutenção', description: 'Marcar quartos para manutenção', path: '/user/manutencao' },
    { id: 8, title: 'Registrar Pagamento', description: 'Registrar pagamentos', path: '/user/pagamento' },
    { id: 9, title: 'Consultar Cliente', description: 'Buscar informações de clientes', path: '/user/consultar-cliente' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bem-vindo{isAdmin ? ', Administrador' : ''}!
        </h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {isAdmin 
            ? 'Gerencie todo o sistema hoteleiro a partir deste painel.'
            : 'Gerencie as operações diárias do hotel.'
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-lg p-3">
              <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quartos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">24</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-lg p-3">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponíveis</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">18</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0 018 0 9 9 0 011-8 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocupados</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">4</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-lg p-3">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Manutenção</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item.path)}
            className="card hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transform hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2M9 5a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 002-2M9 5a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
