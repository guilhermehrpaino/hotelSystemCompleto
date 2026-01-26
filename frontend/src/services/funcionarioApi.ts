import api from './api';

export interface FuncionarioRequest {
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  cargo: string;
  salario: number; // BigDecimal no backend, number no frontend
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
  salario: number; // BigDecimal do backend, number no frontend
}

export const funcionarioService = {
  // Listar todos os funcionários
  async listarFuncionarios(): Promise<FuncionarioResponse[]> {
    const response = await api.get('/funcionarios');
    return response.data;
  },

  // Filtrar funcionários por cargo
  async filtrarFuncionariosPorCargo(cargo: string): Promise<FuncionarioResponse[]> {
    const response = await api.get(`/funcionarios/cargo/${encodeURIComponent(cargo)}`);
    return response.data;
  },

  // Buscar funcionário por ID
  async buscarFuncionarioPorId(id: number): Promise<FuncionarioResponse> {
    const response = await api.get(`/funcionarios/${id}`);
    return response.data;
  },

  // Cadastrar novo funcionário
  async cadastrarFuncionario(funcionarioData: FuncionarioRequest): Promise<FuncionarioResponse> {
    const response = await api.post('/funcionarios', funcionarioData);
    return response.data;
  },

  // Atualizar funcionário
  async atualizarFuncionario(id: number, funcionarioData: Partial<FuncionarioRequest>): Promise<FuncionarioResponse> {
    const response = await api.put(`/funcionarios/${id}`, funcionarioData);
    return response.data;
  },

  // Excluir funcionário
  async excluirFuncionario(id: number): Promise<void> {
    await api.delete(`/funcionarios/${id}`);
  }
};
