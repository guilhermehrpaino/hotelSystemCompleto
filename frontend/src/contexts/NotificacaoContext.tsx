import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService } from '../services/api';
import { quartoService } from '../services/api';

interface Notificacao {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensagem: string;
  data: Date;
  lida: boolean;
  acao?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificacaoContextType {
  notificacoes: Notificacao[];
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'data' | 'lida'>) => void;
  marcarComoLida: (id: string) => void;
  removerNotificacao: (id: string) => void;
  limparTodas: () => void;
  naoLidas: number;
}

const NotificacaoContext = createContext<NotificacaoContextType | undefined>(undefined);

export const useNotificacoes = () => {
  const context = useContext(NotificacaoContext);
  if (!context) {
    throw new Error('useNotificacoes deve ser usado dentro de um NotificacaoProvider');
  }
  return context;
};

interface NotificacaoProviderProps {
  children: ReactNode;
}

export const NotificacaoProvider: React.FC<NotificacaoProviderProps> = ({ children }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  // Carregar notificações do localStorage
  useEffect(() => {
    const salvas = localStorage.getItem('notificacoes');
    if (salvas) {
      try {
        const parseadas = JSON.parse(salvas).map((n: any) => ({
          ...n,
          data: new Date(n.data)
        }));
        setNotificacoes(parseadas);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    }
  }, []);

  // Salvar notificações no localStorage
  useEffect(() => {
    localStorage.setItem('notificacoes', JSON.stringify(notificacoes));
  }, [notificacoes]);

  const adicionarNotificacao = (notificacao: Omit<Notificacao, 'id' | 'data' | 'lida'>) => {
    const nova: Notificacao = {
      ...notificacao,
      id: Date.now().toString(),
      data: new Date(),
      lida: false
    };

    setNotificacoes(prev => [nova, ...prev]);

    // Auto-remover notificações de sucesso após 5 segundos
    if (notificacao.tipo === 'success') {
      setTimeout(() => {
        removerNotificacao(nova.id);
      }, 5000);
    }
  };

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
  };

  const removerNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const limparTodas = () => {
    setNotificacoes([]);
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <NotificacaoContext.Provider value={{
      notificacoes,
      adicionarNotificacao,
      marcarComoLida,
      removerNotificacao,
      limparTodas,
      naoLidas
    }}>
      {children}
    </NotificacaoContext.Provider>
  );
};

// Hook para notificações automáticas
export const useNotificacoesAutomaticas = () => {
  const { adicionarNotificacao } = useNotificacoes();
  const navigate = useNavigate();

  // Verificar check-ins do dia
  useEffect(() => {
    const verificarCheckIns = async () => {
      try {
        const hoje = new Date().toISOString().split('T')[0];
        const reservas = await reservaService.listarReservas();
        
        const checkinsHoje = reservas.filter((r: any) => 
          r.checkIn === hoje && r.status === 'RESERVADA'
        );

        if (checkinsHoje.length > 0) {
          adicionarNotificacao({
            tipo: 'info',
            titulo: 'Check-ins Pendentes',
            mensagem: `${checkinsHoje.length} check-ins pendentes para hoje`,
            acao: {
              label: 'Ver Check-ins',
              onClick: () => navigate('/user/checkin')
            }
          });
        }
      } catch (error) {
        console.error('Erro ao verificar check-ins:', error);
      }
    };

    // Apenas executar se o usuário for ADMIN ou USER
    const timer = setTimeout(() => {
      verificarCheckIns();
      const interval = setInterval(verificarCheckIns, 60000); // Verificar a cada minuto
      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer);
  }, [adicionarNotificacao, navigate]);

  // Verificar quartos sujos
  useEffect(() => {
    const verificarQuartosSujos = async () => {
      try {
        const quartos = await quartoService.listarQuartos();
        const sujos = quartos.filter((q: any) => q.status === 'SUJO');

        if (sujos.length > 0) {
          adicionarNotificacao({
            tipo: 'warning',
            titulo: 'Quartos para Limpeza',
            mensagem: `${sujos.length} quartos aguardando limpeza`,
            acao: {
              label: 'Ver Status',
              onClick: () => navigate('/user/status-quartos')
            }
          });
        }
      } catch (error) {
        console.error('Erro ao verificar quartos sujos:', error);
      }
    };

    // Apenas executar se o usuário for ADMIN ou USER
    const timer = setTimeout(() => {
      verificarQuartosSujos();
      const interval = setInterval(verificarQuartosSujos, 300000); // Verificar a cada 5 minutos
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(timer);
  }, [adicionarNotificacao, navigate]);
};
