import React from 'react';

interface KPICardsProps {
  stats: {
    totalReservas: number;
    receitaMes: number;
    ocupacaoAtual: number;
    clientesNovosMes: number;
  } | null;
}

const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const kpiData = [
    {
      title: 'Total de Reservas',
      value: stats?.totalReservas || 0,
      icon: '📊',
      gradient: 'from-blue-500 to-blue-600',
      percentage: '+12%',
      percentageColor: 'bg-green-400/30'
    },
    {
      title: 'Receita Mensal',
      value: formatarMoeda(stats?.receitaMes || 0),
      icon: '💰',
      gradient: 'from-emerald-500 to-emerald-600',
      percentage: '+8%',
      percentageColor: 'bg-green-400/30'
    },
    {
      title: 'Ocupação Atual',
      value: `${stats?.ocupacaoAtual.toFixed(1) || 0}%`,
      icon: '🏨',
      gradient: 'from-purple-500 to-purple-600',
      percentage: '-2%',
      percentageColor: 'bg-red-400/30'
    },
    {
      title: 'Novos Clientes',
      value: stats?.clientesNovosMes || 0,
      icon: '👥',
      gradient: 'from-orange-500 to-orange-600',
      percentage: '+15%',
      percentageColor: 'bg-green-400/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className={`group relative bg-gradient-to-br ${kpi.gradient} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">{kpi.icon}</span>
              </div>
              <div className={`${kpi.percentageColor} backdrop-blur-sm px-3 py-1 rounded-full`}>
                <span className="text-sm font-medium">{kpi.percentage}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-2">{kpi.value}</h3>
            <p className="text-white/80">{kpi.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
