import React from 'react';

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

interface RecentActivitiesProps {
  atividades: AtividadeRecente[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ atividades }) => {
  const formatarTempo = (data: Date) => {
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 5) return 'Agora';
    if (diffMin < 60) return `${diffMin} min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    return `${diffDias} dia(s) atrás`;
  };

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case 'reserva': return '📅';
      case 'checkin': return '🏨';
      case 'checkout': return '🚪';
      case 'pagamento': return '💳';
      case 'limpeza': return '🧹';
      case 'manutencao': return '🔧';
      default: return '📋';
    }
  };

  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case 'reserva': return 'text-blue-600';
      case 'checkin': return 'text-green-600';
      case 'checkout': return 'text-orange-600';
      case 'pagamento': return 'text-emerald-600';
      case 'limpeza': return 'text-yellow-600';
      case 'manutencao': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
        Últimas Reservas
      </h3>
      <div className="space-y-4">
        {atividades.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              Nenhuma reserva encontrada com status "RESERVADA" ou "ATIVA"
            </div>
          </div>
        ) : (
          atividades.map((atividade) => (
            <div
              key={atividade.id}
              className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <span className="text-xl">{getTipoIcone(atividade.tipo)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {atividade.descricao}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Quarto: {atividade.quartoInfo || 'N/A'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${getTipoCor(atividade.tipo).replace('text-', 'bg-')}`}></span>
                  </div>
                  {atividade.checkIn && atividade.checkOut && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {atividade.checkIn} → {atividade.checkOut}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
