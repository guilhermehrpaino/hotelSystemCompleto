import api from './api';

export interface QuartoRequest {
  numero: string;
  diaria: number;
  status?: 'DISPONIVEL' | 'RESERVADO' | 'OCUPADO' | 'MANUTENCAO';
}

export interface QuartoResponse {
  id: number;
  numero: string;
  diaria: number;
  status: 'DISPONIVEL' | 'RESERVADO' | 'OCUPADO' | 'MANUTENCAO';
}

export const quartoService = {
  // Listar todos os quartos
  async listarQuartos(): Promise<QuartoResponse[]> {
    const response = await api.get('/quartos');
    return response.data;
  },

  // Buscar quarto por ID
  async buscarQuartoPorId(id: number): Promise<QuartoResponse> {
    const response = await api.get(`/quartos/${id}`);
    return response.data;
  },

  // Buscar quarto por número
  async buscarQuartoPorNumero(numero: string): Promise<QuartoResponse | null> {
    try {
      const response = await api.get(`/quartos/numero/${numero}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Cadastrar novo quarto
  async cadastrarQuarto(quartoData: QuartoRequest): Promise<QuartoResponse> {
    const response = await api.post('/quartos', quartoData);
    return response.data;
  },

  // Atualizar quarto
  async atualizarQuarto(id: number, quartoData: Partial<QuartoRequest>): Promise<QuartoResponse> {
    const response = await api.put(`/quartos/${id}`, quartoData);
    return response.data;
  },

  // Excluir quarto
  async excluirQuarto(id: number): Promise<void> {
    await api.delete(`/quartos/${id}`);
  }
};
