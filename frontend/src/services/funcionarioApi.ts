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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interfaces para os dados de Funcionário
export interface FuncionarioRequest {
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  cargo: string; 
  salario: string; // Alterado para string
}

export interface FuncionarioResponse {
  id: number;
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  cargo: string; 
  salario: string; // Alterado para string
}

// Serviço de Funcionários
export const funcionarioService = {
  // Cadastrar novo funcionário
  cadastrarFuncionario: async (funcionario: FuncionarioRequest): Promise<FuncionarioResponse> => {
    const response: AxiosResponse<FuncionarioResponse> = await api.post('/funcionarios', funcionario);
    return response.data;
  },

  // Listar todos os funcionários
  listarFuncionarios: async (): Promise<FuncionarioResponse[]> => {
    const response: AxiosResponse<FuncionarioResponse[]> = await api.get('/funcionarios');
    return response.data;
  },

  // Buscar funcionário por ID
  buscarFuncionarioPorId: async (id: number): Promise<FuncionarioResponse> => {
    const response: AxiosResponse<FuncionarioResponse> = await api.get(`/funcionarios/${id}`);
    return response.data;
  },

  // Atualizar funcionário
  atualizarFuncionario: async (id: number, funcionario: Partial<FuncionarioRequest>): Promise<FuncionarioResponse> => {
    const response: AxiosResponse<FuncionarioResponse> = await api.put(`/funcionarios/${id}`, funcionario);
    return response.data;
  },

  // Deletar funcionário
  deletarFuncionario: async (id: number): Promise<void> => {
    await api.delete(`/funcionarios/${id}`);
  }
};

export default api;
