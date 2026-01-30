import React from 'react';

interface Alerta {
  id: string;
  tipo: string;
  mensagem: string;
  severidade: 'baixa' | 'media' | 'alta';
  tempo: string;
}

interface AlertsProps {
  alertas: Alerta[];
}

const Alerts: React.FC<AlertsProps> = ({ alertas }) => {
  const getSeveridadeCor = (severidade: string) => {
    switch (severidade) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50';
      case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/50';
    }
  };

  const getSeveridadeIcone = (severidade: string) => {
    switch (severidade) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baixa': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
        Alertas do Sistema
      </h3>
      <div className="space-y-3">
        {alertas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              Nenhum alerta no momento
            </div>
          </div>
        ) : (
          alertas.map((alerta) => (
            <div
              key={alerta.id}
              className={`p-4 rounded-xl border ${getSeveridadeCor(alerta.severidade)} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {getSeveridadeIcone(alerta.severidade)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">
                    {alerta.mensagem}
                  </p>
                  <p className="text-xs opacity-75">
                    {alerta.tempo}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
