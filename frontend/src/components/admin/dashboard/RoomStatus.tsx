import React from 'react';

interface RoomStatusProps {
  stats: {
    quartosDisponiveis: number;
    quartosOcupados: number;
    quartosManutencao: number;
    quartosSujo: number;
  } | null;
}

const RoomStatus: React.FC<RoomStatusProps> = ({ stats }) => {
  const roomStatusData = [
    {
      title: 'Disponíveis',
      value: stats?.quartosDisponiveis || 0,
      gradient: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-700/50'
    },
    {
      title: 'Ocupados',
      value: stats?.quartosOcupados || 0,
      gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-700/50'
    },
    {
      title: 'Manutenção',
      value: stats?.quartosManutencao || 0,
      gradient: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-700/50'
    },
    {
      title: 'Sujo',
      value: stats?.quartosSujo || 0,
      gradient: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-700/50'
    }
  ];

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
        Status dos Quartos
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roomStatusData.map((status, index) => (
          <div
            key={index}
            className={`text-center p-6 bg-gradient-to-br ${status.gradient} rounded-xl border ${status.borderColor} hover:shadow-lg transition-all duration-300`}
          >
            <div className={`text-3xl font-bold ${status.textColor} mb-2`}>
              {status.value}
            </div>
            <div className={`text-sm ${status.textColor} font-medium`}>
              {status.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomStatus;
