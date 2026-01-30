import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Configuração da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Instância do Axios com configurações padrão
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interfaces TypeScript para os dados
export interface ClienteRequest {
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
}

export interface ClienteResponse {
  id: number;
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  createdAt: string;
  updatedAt: string;
}

// Serviço de Clientes
export const clienteService = {
  // Cadastrar novo cliente
  async cadastrarCliente(clienteData: ClienteRequest): Promise<ClienteResponse> {
    try {
      const response: AxiosResponse<ClienteResponse> = await api.post('/clientes', clienteData);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      throw error;
    }
  },

  // Listar todos os clientes
  async listarClientes(): Promise<ClienteResponse[]> {
    try {
      const response: AxiosResponse<ClienteResponse[]> = await api.get('/clientes');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  },

  // Buscar cliente por ID
  async buscarClientePorId(id: number): Promise<ClienteResponse> {
    try {
      const response: AxiosResponse<ClienteResponse> = await api.get(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  },

  // Atualizar cliente
  async atualizarCliente(id: number, clienteData: Partial<ClienteRequest>): Promise<ClienteResponse> {
    try {
      const response: AxiosResponse<ClienteResponse> = await api.put(`/clientes/${id}`, clienteData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  // Deletar cliente
  async deletarCliente(id: number): Promise<void> {
    try {
      await api.delete(`/clientes/${id}`);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  },
};

// Interfaces para Quartos
export interface QuartoRequest {
  numero: string;
  tipo: string;
  diaria: number;
  status: string;
}

export interface QuartoResponse {
  id: number;
  numero: string;
  tipo: string;
  diaria: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaces para Reservas
export interface ReservaRequest {
  clienteId: number;
  clienteNome: string;
  quartoId: number;
  quartoNumero: string;
  checkIn: string;
  checkOut: string;
  numeroHospedes: number;
  valorTotal: number;
  observacoes?: string;
}

export interface ReservaResponse {
  id: number;
  clienteId: number;
  clienteNome: string;
  quartoId: number;
  quartoNumero: string;
  checkIn: string;
  checkOut: string;
  numeroHospedes: number;
  valorTotal: number;
  observacoes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    id: number;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
  };
  quarto?: {
    id: number;
    numero: string;
    tipo: string;
    diaria: number;
  };
}

// Serviço de Quartos
export const quartoService = {
  // Listar todos os quartos
  async listarQuartos(): Promise<QuartoResponse[]> {
    try {
      const response: AxiosResponse<QuartoResponse[]> = await api.get('/quartos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar quartos:', error);
      throw error;
    }
  },

  // Buscar quarto por ID
  async buscarQuartoPorId(id: number): Promise<QuartoResponse> {
    try {
      const response: AxiosResponse<QuartoResponse> = await api.get(`/quartos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar quarto:', error);
      throw error;
    }
  },

  // Atualizar status do quarto
  async atualizarStatusQuarto(id: number, status: string): Promise<QuartoResponse> {
    try {
      console.log(`🔄 Iniciando atualização do quarto ${id} para status: ${status}`);
      
      // Envia requisição PUT para o endpoint de checkout
      // O backend deve receber apenas o campo status para atualizar
      const response: AxiosResponse<QuartoResponse> = await api.put(`/quartos/${id}/checkout`, {
        status: status
      });
      
      console.log(`✅ Status do quarto ${id} atualizado para: ${response.data.status}`);
      console.log('📊 Resposta completa do backend:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erro ao atualizar status do quarto ${id}:`, error);
      
      // Log detalhado do erro
      if (error.response) {
        console.error('📄 Status da resposta:', error.response.status);
        console.error('📄 Dados da resposta:', error.response.data);
        console.error('📄 Headers da resposta:', error.response.headers);
      } else if (error.request) {
        console.error('📡 Request feito sem resposta:', error.request);
      } else {
        console.error('⚙️ Erro na configuração:', error.message);
      }
      
      throw error;
    }
  },

  // Atualizar observação do quarto
  async atualizarObservacaoQuarto(id: number, observacao: string): Promise<QuartoResponse> {
    try {
      console.log(`🔄 Iniciando atualização de observação do quarto ${id}`);
      console.log(`📝 Observação: ${observacao}`);
      
      // Envia requisição PUT para o endpoint de observação
      const response: AxiosResponse<QuartoResponse> = await api.put(`/quartos/${id}/observacao`, {
        observacoes: observacao
      });
      
      console.log(`✅ Observação do quarto ${id} atualizada`);
      console.log('📊 Resposta completa do backend:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erro ao atualizar observação do quarto ${id}:`, error);
      
      // Log detalhado do erro
      if (error.response) {
        console.error('📄 Status da resposta:', error.response.status);
        console.error('📄 Dados da resposta:', error.response.data);
        console.error('📄 Headers da resposta:', error.response.headers);
      } else if (error.request) {
        console.error('📡 Request feito sem resposta:', error.request);
      } else {
        console.error('⚙️ Erro na configuração:', error.message);
      }
      
      throw error;
    }
  },
};

// Serviço de Reservas
export const reservaService = {
  // Criar nova reserva
  async criarReserva(reservaData: ReservaRequest): Promise<ReservaResponse> {
    try {
      const response: AxiosResponse<ReservaResponse> = await api.post('/reservas', reservaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      throw error;
    }
  },

  // Listar todas as reservas
  async listarReservas(): Promise<ReservaResponse[]> {
    try {
      const response: AxiosResponse<ReservaResponse[]> = await api.get('/reservas');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar reservas:', error);
      throw error;
    }
  },

  // Buscar reserva por ID
  async buscarReservaPorId(id: number): Promise<ReservaResponse> {
    try {
      const response: AxiosResponse<ReservaResponse> = await api.get(`/reservas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      throw error;
    }
  },

  // Atualizar reserva
  async atualizarReserva(id: number, reservaData: Partial<ReservaRequest>): Promise<ReservaResponse> {
    try {
      const response: AxiosResponse<ReservaResponse> = await api.put(`/reservas/${id}`, reservaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      throw error;
    }
  },

  // Cancelar reserva (usando DELETE com corpo da requisição)
  async cancelarReserva(id: number, motivo?: string): Promise<ReservaResponse> {
    try {
      console.log(`🗑️ Iniciando cancelamento da reserva ${id} (DELETE)`);
      if (motivo) {
        console.log(`📝 Motivo do cancelamento: ${motivo}`);
      }
      
      // Prepara os dados para enviar no corpo da requisição DELETE
      const data = motivo ? { motivoCancelamento: motivo } : {};
      
      // Envia requisição DELETE com corpo da requisição
      const response: AxiosResponse<ReservaResponse> = await api.delete(`/reservas/${id}`, { data });
      
      console.log(`✅ Reserva ${id} cancelada com sucesso`);
      console.log('📊 Resposta completa do backend:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Erro ao cancelar reserva ${id}:`, error);
      
      // Log detalhado do erro
      if (error.response) {
        console.error('📄 Status da resposta:', error.response.status);
        console.error('📄 Dados da resposta:', error.response.data);
        console.error('📄 Headers da resposta:', error.response.headers);
      } else if (error.request) {
        console.error('📡 Request feito sem resposta:', error.request);
      } else {
        console.error('⚙️ Erro na configuração:', error.message);
      }
      
      throw error;
    }
  },

  // Deletar reserva
  async deletarReserva(id: number): Promise<void> {
    try {
      await api.delete(`/reservas/${id}`);
    } catch (error) {
      console.error('Erro ao deletar reserva:', error);
      throw error;
    }
  },

  // Listar reservas por cliente
  async listarReservasPorCliente(clienteId: number): Promise<ReservaResponse[]> {
    try {
      const response: AxiosResponse<ReservaResponse[]> = await api.get(`/reservas/cliente/${clienteId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar reservas do cliente:', error);
      throw error;
    }
  },

  // Listar reservas por quarto
  async listarReservasPorQuarto(quartoId: number): Promise<ReservaResponse[]> {
    try {
      const response: AxiosResponse<ReservaResponse[]> = await api.get(`/reservas/quarto/${quartoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar reservas do quarto:', error);
      throw error;
    }
  },

  // Verificar disponibilidade de quarto
  async verificarDisponibilidade(quartoId: number, checkIn: string, checkOut: string): Promise<boolean> {
    try {
      const response: AxiosResponse<{ disponivel: boolean }> = await api.get(`/reservas/disponibilidade`, {
        params: {
          quartoId,
          checkIn,
          checkOut
        }
      });
      
      return response.data.disponivel;
    } catch (error: any) {
      console.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  },

  // Verificar se cliente já tem reserva ativa
  async verificarReservaCliente(clienteId: number): Promise<{ temReserva: boolean; mensagem?: string }> {
    try {
      const response: AxiosResponse<{ temReserva: boolean; mensagem?: string }> = await api.get(`/reservas/cliente/verificar`, {
        params: {
          clienteId
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao verificar reserva do cliente:', error);
      throw error;
    }
  },

  // Fazer Check-in
  async fazerCheckIn(reservaId: number): Promise<ReservaResponse> {
    try {
      // Tenta com PUT (mais comum em Spring Boot)
      const response: AxiosResponse<ReservaResponse> = await api.put(`/reservas/${reservaId}`, {
        status: 'ATIVA'
      });
      
      // Depois atualiza o status do quarto para OCUPADO usando endpoint específico de checkin
      await api.put(`/quartos/${response.data.quartoId}/checkin`, {
        status: 'OCUPADO'
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer check-in:', error);
      throw error;
    }
  },

  // Fazer Check-out
  async fazerCheckOut(reservaId: number): Promise<ReservaResponse> {
    try {
      // Envia PUT para atualizar status da reserva para FINALIZADA
      const response: AxiosResponse<ReservaResponse> = await api.put(`/reservas/${reservaId}`, {
        status: 'FINALIZADA'
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer check-out:', error);
      throw error;
    }
  },

  // Atualizar status automático (backend job)
  async atualizarStatusAutomatico(): Promise<{ quartosAtualizados: number; reservasAtualizadas: number }> {
    try {
      const response: AxiosResponse<{ quartosAtualizados: number; reservasAtualizadas: number }> = await api.post('/reservas/atualizar-status');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar status automático:', error);
      throw error;
    }
  },

  // Processar status de quartos específicos
  async processarStatusQuartos(quartosIds: number[]): Promise<{ quartosProcessados: number; statusAtualizados: { quartoId: number; statusAntigo: string; statusNovo: string }[] }> {
    try {
      const response: AxiosResponse<{ quartosProcessados: number; statusAtualizados: { quartoId: number; statusAntigo: string; statusNovo: string }[] }> = await api.post('/reservas/processar-status-quartos', {
        quartosIds
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao processar status dos quartos:', error);
      throw error;
    }
  }
};

// Serviço de Pagamentos
export const pagamentoService = {
  // Listar todos os pagamentos
  async listarPagamentos(): Promise<any[]> {
    try {
      const response: AxiosResponse<any[]> = await api.get('/pagamentos');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar pagamentos:', error);
      throw error;
    }
  },

  // Registrar novo pagamento
  async registrarPagamento(pagamentoData: {
    clienteId: number;
    tipo: string;
    valor: number;
    dataPagamento: string;
    metodo: string;
    status: string;
    observacoes: string;
    createdAt: string;
  }): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.post('/pagamentos', pagamentoData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  },

  // Atualizar pagamento
  async atualizarPagamento(id: number, pagamentoData: any): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.put(`/pagamentos/${id}`, pagamentoData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar pagamento:', error);
      throw error;
    }
  },

  // Excluir pagamento
  async excluirPagamento(id: number): Promise<void> {
    try {
      await api.delete(`/pagamentos/${id}`);
    } catch (error: any) {
      console.error('Erro ao excluir pagamento:', error);
      throw error;
    }
  },

  // Buscar pagamento por ID
  async buscarPagamentoPorId(id: number): Promise<any> {
    try {
      const response: AxiosResponse<any> = await api.get(`/pagamentos/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar pagamento:', error);
      throw error;
    }
  },

  // Buscar pagamentos por cliente
  async buscarPagamentosPorCliente(clienteId: number): Promise<any[]> {
    try {
      const response: AxiosResponse<any[]> = await api.get(`/pagamentos/cliente/${clienteId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar pagamentos do cliente:', error);
      throw error;
    }
  }
};

export default api;
