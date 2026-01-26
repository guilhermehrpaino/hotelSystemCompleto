import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { funcionarioService, FuncionarioResponse, FuncionarioRequest } from '../../services/funcionarioApi';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

interface FuncionarioFormData {
  nome: string;
  idade: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  cargo: string;
  salario: string;
}

interface FormErrors {
  nome?: string;
  idade?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cargo?: string;
  salario?: string;
}

interface CadastrarFuncionarioProps {
  onSuccess: () => void;
  modo: 'cadastro' | 'atualizacao';
  funcionarioParaAtualizar?: FuncionarioResponse | null;
}

const CadastrarFuncionario: React.FC<CadastrarFuncionarioProps> = ({ onSuccess, modo, funcionarioParaAtualizar }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FuncionarioFormData>({
    nome: '',
    idade: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    cargo: '',
    salario: ''
  });
  const [errors, setErrors] = useState<Partial<FuncionarioFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para o modal de erro
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  
  // Estados para o modal de sucesso
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successDetails, setSuccessDetails] = useState('');

  // Carregar dados do funcionário para atualização
  useEffect(() => {
    if (modo === 'atualizacao' && funcionarioParaAtualizar) {
      setFormData({
        nome: funcionarioParaAtualizar.nome,
        idade: funcionarioParaAtualizar.idade.toString(),
        cpf: funcionarioParaAtualizar.cpf,
        telefone: funcionarioParaAtualizar.telefone,
        email: funcionarioParaAtualizar.email,
        endereco: funcionarioParaAtualizar.endereco,
        cargo: funcionarioParaAtualizar.cargo,
        salario: funcionarioParaAtualizar.salario.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) // Formata BigDecimal do backend como moeda
      });
    }
  }, [modo, funcionarioParaAtualizar]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FuncionarioFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 3) {
      newErrors.nome = 'Nome inválido';
    }

    if (!formData.idade.trim()) {
      newErrors.idade = 'Idade é obrigatória';
    } else {
      const idadeNum = Number(formData.idade);
      if (idadeNum < 18) {
        newErrors.idade = 'A Idade tem que ser maior que 18 anos';
      } else if (idadeNum > 100) {
        newErrors.idade = 'A idade tem que ser menor que 100 anos';
      }
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length < 11) {
      newErrors.cpf = 'CPF deve conter 11 caracteres';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (formData.telefone.replace(/\D/g, '').length < 11) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }

    if (!formData.salario.trim()) {
      newErrors.salario = 'Salário é obrigatório';
    } else {
      // Remover formatação para converter para número (BigDecimal compatibility)
      const salarioNumerico = parseFloat(formData.salario.replace(/[^\d,]/g, '').replace(',', '.'));
      console.log('Salário formatado:', formData.salario);
      console.log('Salário numérico (para BigDecimal):', salarioNumerico);
      
      if (isNaN(salarioNumerico) || salarioNumerico < 999) {
        newErrors.salario = 'Salário deve ser no mínimo R$ 999,00';
      } else if (salarioNumerico > 20000) {
        newErrors.salario = 'Salário deve ser no máximo R$ 20.000,00';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showErrorModal = (message: string, details?: string) => {
    setErrorMessage(message);
    setErrorDetails(details || '');
    setIsErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage('');
    setErrorDetails('');
  };

  const showSuccessModal = (title: string, message: string, details?: string) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessDetails(details || '');
    setIsSuccessModalOpen(true);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessTitle('');
    setSuccessMessage('');
    setSuccessDetails('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Para campos de texto, remover caracteres especiais
    let processedValue = value;
    if (name === 'nome') {
      processedValue = value.replace(/[0-9!@#$%¨&*()_+=\[\]{};':"\\|,.<>\/?]/g, ''); // Remove números e caracteres especiais
    } else if (name === 'endereco') {
      processedValue = value.replace(/[!@#$%¨&*()_+=\[\]{};':"\\|.<>\/?]/g, ''); // Permite números, hífen e vírgula
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FuncionarioFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatSalario = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const numericValue = Number(digits) / 100;
    
    // Limitar o valor máximo para 20000
    if (numericValue > 20000) {
      return 'R$ 20.000,00';
    }
    
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      // Preparar dados para a API
      const funcionarioData: FuncionarioRequest = {
        nome: formData.nome,
        idade: parseInt(formData.idade),
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        email: formData.email,
        endereco: formData.endereco,
        cargo: formData.cargo, // Voltado para cargo
        salario: parseFloat(formData.salario.replace(/[^\d,]/g, '').replace(',', '.')) // Converte para number com precisão decimal
      };

      // Enviar para a API
      let result;
      if (modo === 'atualizacao' && funcionarioParaAtualizar) {
        // Atualizar funcionário existente - PUT
        result = await funcionarioService.atualizarFuncionario(funcionarioParaAtualizar.id, funcionarioData);
        showSuccessModal(
          'Funcionário Atualizado!',
          `O funcionário ${formData.nome} foi atualizado com sucesso.`,
          `Cargo: ${formData.cargo} | Salário: ${formData.salario}`
        );
      } else {
        // Cadastrar novo funcionário - POST
        result = await funcionarioService.cadastrarFuncionario(funcionarioData);
        showSuccessModal(
          'Funcionário Cadastrado!',
          `O funcionário ${formData.nome} foi cadastrado com sucesso.`,
          `Cargo: ${formData.cargo} | Salário: ${formData.salario}`
        );
      }
      
      // Reset form apenas no modo cadastro
      if (modo === 'cadastro') {
        setFormData({
          nome: '',
          idade: '',
          cpf: '',
          telefone: '',
          email: '',
          endereco: '',
          cargo: '',
          salario: ''
        });
      }
      
    } catch (error: any) {
      console.error(`Erro ao ${modo === 'atualizacao' ? 'atualizar' : 'cadastrar'} funcionário:`, error);
      
      let errorMessage = `Erro ao ${modo === 'atualizacao' ? 'atualizar' : 'cadastrar'} funcionário. Tente novamente.`;
      let errorDetails = '';
      
      // Erros de API/conexão - mostrar modal
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Erro de conexão';
        errorDetails = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
        errorMessage = 'Erro de rede';
        errorDetails = 'Não foi possível acessar o servidor. Verifique sua conexão.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro no servidor';
        errorDetails = 'O servidor encontrou um erro interno. Tente novamente mais tarde.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Bad Request';
        errorDetails = 'Dados inválidos enviados ao servidor.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Serviço não encontrado';
        errorDetails = 'O endpoint da API não está disponível.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro no servidor';
        errorDetails = 'O servidor está indisponível no momento.';
      } else if (error.message) {
        errorMessage = 'Erro de conexão';
        errorDetails = error.message;
      }
      
      // Mostrar modal apenas para erros de API/conexão
      showErrorModal(errorMessage, errorDetails);
    } finally {
      setIsLoading(false);
    }
  };

  const cargoOptions = [
    'Recepcionista',
    'Camareira',
    'Gerente',
    'Auxiliar de Limpeza',
    'Mensageiro',
    'Concierge',
    'Cozinheiro',
    'Garçom',
    'Administrativo',
    'Manutenção'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {modo === 'atualizacao' ? 'Atualizar Funcionário' : 'Cadastrar Funcionário'}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {modo === 'atualizacao' 
              ? 'Atualize os dados do funcionário selecionado'
              : 'Preencha os dados do novo funcionário'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="md:col-span-2">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                className={`input-field ${errors.nome ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="Digite o nome completo do funcionário"
                disabled={isLoading}
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nome}</p>
              )}
            </div>

            {/* Idade */}
            <div>
              <label htmlFor="idade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idade *
              </label>
              <input
                type="number"
                id="idade"
                name="idade"
                value={formData.idade}
                onChange={handleInputChange}
                className={`input-field ${errors.idade ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="Ex: 25"
                min="18"
                max="70"
                disabled={isLoading}
              />
              {errors.idade && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.idade}</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CPF *
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  handleInputChange({ ...e, target: { ...e.target, name: 'cpf', value: formatted } });
                }}
                className={`input-field ${errors.cpf ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="000.000.000-00"
                maxLength={14}
                disabled={isLoading}
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cpf}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={(e) => {
                  const formatted = formatTelefone(e.target.value);
                  handleInputChange({ ...e, target: { ...e.target, name: 'telefone', value: formatted } });
                }}
                className={`input-field ${errors.telefone ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="(00) 00000-0000"
                maxLength={15}
                disabled={isLoading}
              />
              {errors.telefone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input-field ${errors.email ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="funcionario@exemplo.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Cargo */}
            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cargo *
              </label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                className={`input-field ${errors.cargo ? 'border-red-300 dark:border-red-700' : ''}`}
                disabled={isLoading}
              >
                <option value="">Selecione um cargo</option>
                {cargoOptions.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
              {errors.cargo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cargo}</p>
              )}
            </div>

            {/* Salário */}
            <div>
              <label htmlFor="salario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salário *
              </label>
              <input
                type="text"
                id="salario"
                name="salario"
                value={formData.salario}
                onChange={(e) => {
                  const formatted = formatSalario(e.target.value);
                  handleInputChange({ ...e, target: { ...e.target, name: 'salario', value: formatted } });
                }}
                className={`input-field ${errors.salario ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="R$ 0,00"
                disabled={isLoading}
              />
              {errors.salario && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.salario}</p>
              )}
            </div>

            {/* Endereço */}
            <div className="md:col-span-2">
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endereço Completo *
              </label>
              <textarea
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                rows={3}
                className={`input-field resize-none ${errors.endereco ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="Rua, número, bairro, cidade, estado, CEP"
                disabled={isLoading}
              />
              {errors.endereco && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endereco}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  nome: '',
                  idade: '',
                  cpf: '',
                  telefone: '',
                  email: '',
                  endereco: '',
                  cargo: '',
                  salario: ''
                });
                setErrors({});
                setSuccessMessage('');
              }}
              className="btn-secondary"
              disabled={isLoading}
            >
              Limpar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {modo === 'atualizacao' ? 'Atualizando...' : 'Cadastrando...'}
                </span>
              ) : (
                modo === 'atualizacao' ? 'Atualizar Funcionário' : 'Cadastrar Funcionário'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title={`Erro ao ${modo === 'atualizacao' ? 'Atualizar' : 'Cadastrar'} Funcionário`}
        message={errorMessage}
        details={errorDetails}
      />

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title={successTitle}
        message={successMessage}
        details={successDetails}
      />
    </div>
  );
};

export default CadastrarFuncionario;
