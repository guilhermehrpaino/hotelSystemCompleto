export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface Customer {
  id: number;
  nome: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
}

export interface Room {
  id: number;
  numero: string;
  capacidade: number;
  diaria: number;
  status: 'DISPONIVEL' | 'RESERVADO' | 'OCUPADO' | 'MANUTENCAO';
}

export interface Booking {
  id: number;
  quarto: Room;
  hospede: Customer;
  dataEntrada: string;
  dataSaida: string;
  valorTotal: number;
  status: 'ATIVA' | 'CANCELADA' | 'FINALIZADA';
}

export interface AuthData {
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
