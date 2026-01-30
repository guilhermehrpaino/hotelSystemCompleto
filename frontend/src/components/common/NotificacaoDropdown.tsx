import React, { useState } from 'react';
import { useNotificacoes } from '../../contexts/NotificacaoContext';

const NotificacaoDropdown: React.FC = () => {
  const { notificacoes, marcarComoLida, removerNotificacao, limparTodas, naoLidas } = useNotificacoes();
  const [isOpen, setIsOpen] = useState(false);

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getCorBorda = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'info':
      default:
        return 'border-blue-500';
    }
  };

  const getCorFundo = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatarData = (data: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `${minutos} min`;
    if (horas < 24) return `${horas} h`;
    return `${dias} d`;
  };

  const handleNotificacaoClick = (id: string, acao?: () => void) => {
    marcarComoLida(id);
    if (acao) {
      acao();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        title="Notificações"
      >
        <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge de notificações não lidas */}
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notificações
              </h3>
              <div className="flex items-center space-x-2">
                {naoLidas > 0 && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {naoLidas} não lida{naoLidas > 1 ? 's' : ''}
                  </span>
                )}
                {notificacoes.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      limparTodas();
                    }}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-64 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma notificação
                  </p>
                </div>
              ) : (
                notificacoes.map((notificacao) => (
                  <div
                    key={notificacao.id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
                      notificacao.lida 
                        ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' 
                        : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                    onClick={() => handleNotificacaoClick(notificacao.id, notificacao.acao?.onClick)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getCorFundo(notificacao.tipo)} border ${getCorBorda(notificacao.tipo)}`}>
                        <span className="text-sm">{getIcone(notificacao.tipo)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 dark:text-white ${
                            !notificacao.lida ? 'font-semibold' : ''
                          }`}>
                            {notificacao.titulo}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatarData(notificacao.data)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notificacao.mensagem}
                        </p>
                        {notificacao.acao && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificacaoClick(notificacao.id, notificacao.acao?.onClick);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
                          >
                            {notificacao.acao.label}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removerNotificacao(notificacao.id);
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacaoDropdown;
