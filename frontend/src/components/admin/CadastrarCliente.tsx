import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { clienteService, ClienteRequest } from '../../services/api';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

interface CustomerFormData {
  nome: string;
  idade: string;
  cpf: string;
  telefone: string;
  email: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

const CadastrarCliente: React.FC = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<CustomerFormData>({
    nome: '',
    idade: '',
    cpf: '',
    telefone: '',
    email: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  });
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});
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

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.idade.trim()) {
      newErrors.idade = 'Idade é obrigatória';
    } else if (isNaN(Number(formData.idade)) || Number(formData.idade) < 0 || Number(formData.idade) > 120) {
      newErrors.idade = 'Idade deve ser um número válido entre 0 e 120';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve conter 11 dígitos';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.rua.trim() || !formData.numero.trim() || !formData.bairro.trim() || !formData.cidade.trim() || !formData.estado.trim() || !formData.cep.trim()) {
      newErrors.rua = 'Todos os campos do endereço são obrigatórios';
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof CustomerFormData]) {
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

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) {
      return digits;
    }
    return digits
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(\d{5})-(\d{3}).*/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário - todos os campos obrigatórios
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Campo obrigatório';
    }

    if (!formData.idade.trim()) {
      newErrors.idade = 'Campo obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'Campo obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Campo obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Campo obrigatório';
    }

    if (!formData.rua.trim()) {
      newErrors.rua = 'Campo obrigatório';
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'Campo obrigatório';
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Campo obrigatório';
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Campo obrigatório';
    }

    if (!formData.estado.trim()) {
      newErrors.estado = 'Campo obrigatório';
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'Campo obrigatório';
    }

    // Se houver campos obrigatórios vazios, mostrar mensagem geral
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validações específicas
    const specificErrors: Partial<CustomerFormData> = {};

    if (formData.nome.length < 3) {
      specificErrors.nome = 'Nome inválido';
    }

    const idadeNum = Number(formData.idade);
    if (idadeNum < 18) {
      specificErrors.idade = 'A Idade tem que ser maior que 18 anos';
    } else if (idadeNum > 100) {
      specificErrors.idade = 'A idade tem que ser menor que 100 anos';
    }

    if (formData.cpf.replace(/\D/g, '').length < 11) {
      specificErrors.cpf = 'CPF deve conter 11 caracteres';
    }

    if (formData.telefone.replace(/\D/g, '').length < 11) {
      specificErrors.telefone = 'Telefone inválido';
    }

    // CEP - deve ter formato 12345-678
    if (!/^\d{5}-\d{3}$/.test(formData.cep)) {
      specificErrors.cep = 'CEP inválido';
    }

    // Email - deve ter @ e pelo menos um .
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      specificErrors.email = 'Email inválido';
    }

    // Se houver erros específicos, mostrar mensagens abaixo dos campos
    if (Object.keys(specificErrors).length > 0) {
      setErrors(specificErrors);
      return;
    }

    // Se não houver erros, prosseguir com o cadastro
    setIsLoading(true);
    setSuccessMessage('');

    try {
      // Preparar dados para a API
      const clienteData: ClienteRequest = {
        nome: formData.nome,
        idade: parseInt(formData.idade),
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        email: formData.email,
        endereco: `${formData.rua}, ${formData.numero}, ${formData.bairro}, ${formData.cidade} - ${formData.estado}, CEP: ${formData.cep.replace(/\D/g, '')}`
      };

      // Enviar para a API
      await clienteService.cadastrarCliente(clienteData);
      
      // Mostrar modal de sucesso
      showSuccessModal(
        'Cliente Cadastrado!',
        `O cliente ${formData.nome} foi cadastrado com sucesso.`,
      //  undefined // Sem detalhes de endereço
      );
      
      // Reset form
      setFormData({
        nome: '',
        idade: '',
        cpf: '',
        telefone: '',
        email: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      });
      
    } catch (error: any) {
      console.error('Erro ao cadastrar cliente:', error);
      
      let errorMessage = 'Erro ao cadastrar cliente. Tente novamente.';
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastrar Cliente</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Preencha os dados do novo cliente
          </p>
        </div>

        {Object.keys(errors).length > 0 && Object.values(errors).some(error => error === 'Campo obrigatório') && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            Preencha todos os campos
          </div>
        )}

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
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9!@#$%¨&*()_+=\[\]{};':"\\|,.<>\/?]/g, ''); // Remove números e caracteres especiais
                  handleInputChange({ ...e, target: { ...e.target, name: 'nome', value } });
                }}
                className={`input-field ${errors.nome ? 'border-red-300 dark:border-red-700' : ''}`}
                placeholder="Digite o nome completo do cliente"
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
                min="0"
                max="120"
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
                placeholder="cliente@exemplo.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <div>
                <label htmlFor="rua" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rua *
                </label>
                <input
                  type="text"
                  id="rua"
                  name="rua"
                  value={formData.rua}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[0-9!@#$%¨&*()_+=\[\]{};':"\\|,.<>\/?]/g, ''); // Remove números e caracteres especiais
                    handleInputChange({ ...e, target: { ...e.target, name: 'rua', value } });
                  }}
                  className={`input-field ${errors.rua ? 'border-red-300 dark:border-red-700' : ''}`}
                  placeholder="Nome da rua"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove não números
                    handleInputChange({ ...e, target: { ...e.target, name: 'numero', value } });
                  }}
                  className={`input-field ${errors.numero ? 'border-red-300 dark:border-red-700' : ''}`}
                  placeholder="Número"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[0-9!@#$%¨&*()_+=\[\]{};':"\\|,.<>\/?]/g, ''); // Remove números e caracteres especiais
                    handleInputChange({ ...e, target: { ...e.target, name: 'bairro', value } });
                  }}
                  className={`input-field ${errors.bairro ? 'border-red-300 dark:border-red-700' : ''}`}
                  placeholder="Bairro"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[0-9!@#$%¨&*()_+=\[\]{};':"\\|,.<>\/?]/g, ''); // Remove números e caracteres especiais
                    handleInputChange({ ...e, target: { ...e.target, name: 'cidade', value } });
                  }}
                  className={`input-field ${errors.cidade ? 'border-red-300 dark:border-red-700' : ''}`}
                  placeholder="Cidade"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado *
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className={`input-field ${errors.estado ? 'border-red-300 dark:border-red-700' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Selecione</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
              </div>

              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    handleInputChange({ ...e, target: { ...e.target, name: 'cep', value: formatted } });
                  }}
                  className={`input-field ${errors.cep ? 'border-red-300 dark:border-red-700' : ''}`}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={isLoading}
                />
                {errors.cep && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cep}</p>
                )}
              </div>
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
                  rua: '',
                  numero: '',
                  bairro: '',
                  cidade: '',
                  estado: '',
                  cep: ''
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
                  Cadastrando...
                </span>
              ) : (
                'Cadastrar Cliente'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="Erro ao Cadastrar Cliente"
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

export default CadastrarCliente;
