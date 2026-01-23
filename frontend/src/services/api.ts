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

export default api;
