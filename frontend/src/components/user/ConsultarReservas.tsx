import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Reserva {
  id: number;
  cliente: string;
  quarto: string;
  tipo: string;
  dataCheckin: string;
  dataCheckout: string;
  status: string;
  valorTotal: number;
  hospedes: number;
}

const ConsultarReservas: React.FC = () => {
  const navigate = useNavigate();
  
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    setIsLoading(true);
    try {
      // Simulação de dados de reservas (você pode ajustar quando tiver a API de reservas)
      const reservasSimuladas: Reserva[] = [
        {
          id: 1,
          cliente: 'João Silva',
          quarto: '101',
          tipo: 'Standard',
          dataCheckin: '2024-01-15',
          dataCheckout: '2024-01-17',
          status: 'ATIVA',
          valorTotal: 400,
          hospedes: 2
        },
        {
          id: 2,
          cliente: 'Maria Santos',
          quarto: '205',
          tipo: 'Luxo',
          dataCheckin: '2024-01-16',
          dataCheckout: '2024-01-18',
          status: 'ATIVA',
          valorTotal: 800,
          hospedes: 1
        },
        {
          id: 3,
          cliente: 'Pedro Oliveira',
          quarto: '102',
          tipo: 'Standard',
          dataCheckin: '2024-01-10',
          dataCheckout: '2024-01-12',
          status: 'FINALIZADA',
          valorTotal: 400,
          hospedes: 3
        },
        {
          id: 4,
          cliente: 'Ana Costa',
          quarto: '301',
          tipo: 'Suíte',
          dataCheckin: '2024-01-20',
          dataCheckout: '2024-01-25',
          status: 'RESERVADA',
          valorTotal: 1500,
          hospedes: 2
        }
      ];
      
      setReservas(reservasSimuladas);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return '🏨';
      case 'FINALIZADA':
        return '✅';
      case 'CANCELADA':
        return '❌';
      case 'RESERVADA':
        return '📅';
      default:
        return '❓';
    }
  };

  const reservasFiltradas = reservas.filter(reserva => {
    const statusMatch = filtroStatus === 'todos' || reserva.status === filtroStatus;
    const buscaMatch = termoBusca === '' || 
      reserva.cliente.toLowerCase().includes(termoBusca.toLowerCase()) ||
      reserva.quarto.toLowerCase().includes(termoBusca.toLowerCase()) ||
      reserva.tipo.toLowerCase().includes(termoBusca.toLowerCase());
    
    return statusMatch && buscaMatch;
  });

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consultar Reservas</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visualize e gerencie todas as reservas do hotel.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reservas.length}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reservas.filter(r => r.status === 'ATIVA').length}
              </p>
            </div>
            <div className="text-3xl">🏨</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reservadas</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {reservas.filter(r => r.status === 'RESERVADA').length}
              </p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Finalizadas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reservas.filter(r => r.status === 'FINALIZADA').length}
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Cliente, quarto ou tipo..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="ATIVA">Ativas</option>
              <option value="FINALIZADA">Finalizadas</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="RESERVADA">Reservadas</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroStatus('todos');
                setTermoBusca('');
              }}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
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
                  Hóspedes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reservasFiltradas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    #{reserva.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {reserva.cliente}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {reserva.quarto} - {reserva.tipo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatarData(reserva.dataCheckin)} - {formatarData(reserva.dataCheckout)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {reserva.hospedes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatarMoeda(reserva.valorTotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.status)}`}>
                      <span className="mr-1">{getStatusIcon(reserva.status)}</span>
                      {reserva.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {reserva.status === 'ATIVA' && (
                      <>
                        <button
                          onClick={() => navigate('/user/checkout')}
                          className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 mr-3"
                        >
                          Check-out
                        </button>
                        <button
                          onClick={() => navigate('/user/pagamento')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Pagar
                        </button>
                      </>
                    )}
                    {reserva.status === 'RESERVADA' && (
                      <button
                        onClick={() => navigate('/user/checkin')}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Check-in
                      </button>
                    )}
                    {reserva.status === 'FINALIZADA' && (
                      <button
                        onClick={() => navigate('/user/pagamento')}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Ver Detalhes
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reservasFiltradas.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma reserva encontrada com os filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botão Voltar */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/user')}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default ConsultarReservas;
