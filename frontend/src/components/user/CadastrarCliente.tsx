import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  endereco?: string;
}

const CadastrarCliente: React.FC = () => {
  const navigate = useNavigate();
  
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
    cep: '',
    endereco: ''
  });
  
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.idade) {
      newErrors.idade = 'Idade é obrigatória';
    } else if (parseInt(formData.idade) < 0 || parseInt(formData.idade) > 120) {
      newErrors.idade = 'Idade deve estar entre 0 e 120 anos';
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

    if (!formData.rua.trim()) {
      newErrors.rua = 'Rua é obrigatória';
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!/^\d{8}$/.test(formData.cep.replace(/\D/g, ''))) {
      newErrors.cep = 'CEP deve conter 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const enderecoCompleto = `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade} - ${formData.estado}, CEP: ${formData.cep}`;
      
      const clienteData: ClienteRequest = {
        nome: formData.nome,
        idade: parseInt(formData.idade),
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        email: formData.email,
        endereco: enderecoCompleto
      };

      await clienteService.cadastrarCliente(clienteData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/consultar-cliente');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      setErrorMessage('Não foi possível cadastrar o cliente. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatarCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cadastrar Novo Cliente
            </h2>
            <button
              onClick={() => navigate('/user/consultar-cliente')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Voltar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="João da Silva"
                  />
                  {errors.nome && (
                    <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idade *
                  </label>
                  <input
                    type="number"
                    value={formData.idade}
                    onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.idade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="25"
                    min="0"
                    max="120"
                  />
                  {errors.idade && (
                    <p className="text-red-500 text-xs mt-1">{errors.idade}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatarCPF(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.cpf ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="123.456.789-00"
                    maxLength={14}
                  />
                  {errors.cpf && (
                    <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                  />
                  {errors.telefone && (
                    <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="joao.silva@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rua *
                  </label>
                  <input
                    type="text"
                    value={formData.rua}
                    onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.rua ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Rua das Flores"
                  />
                  {errors.rua && (
                    <p className="text-red-500 text-xs mt-1">{errors.rua}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.numero ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="123"
                  />
                  {errors.numero && (
                    <p className="text-red-500 text-xs mt-1">{errors.numero}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.bairro ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Centro"
                  />
                  {errors.bairro && (
                    <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.cidade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="São Paulo"
                  />
                  {errors.cidade && (
                    <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.estado ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">AC - Acre</option>
                    <option value="AL">AL - Alagoas</option>
                    <option value="AP">AP - Amapá</option>
                    <option value="AM">AM - Amazonas</option>
                    <option value="BA">BA - Bahia</option>
                    <option value="CE">CE - Ceará</option>
                    <option value="DF">DF - Distrito Federal</option>
                    <option value="ES">ES - Espírito Santo</option>
                    <option value="GO">GO - Goiás</option>
                    <option value="MA">MA - Maranhão</option>
                    <option value="MT">MT - Mato Grosso</option>
                    <option value="MS">MS - Mato Grosso do Sul</option>
                    <option value="MG">MG - Minas Gerais</option>
                    <option value="PA">PA - Pará</option>
                    <option value="PB">PB - Paraíba</option>
                    <option value="PR">PR - Paraná</option>
                    <option value="PE">PE - Pernambuco</option>
                    <option value="PI">PI - Piauí</option>
                    <option value="RJ">RJ - Rio de Janeiro</option>
                    <option value="RN">RN - Rio Grande do Norte</option>
                    <option value="RS">RS - Rio Grande do Sul</option>
                    <option value="RO">RO - Rondônia</option>
                    <option value="RR">RR - Roraima</option>
                    <option value="SC">SC - Santa Catarina</option>
                    <option value="SP">SP - São Paulo</option>
                    <option value="SE">SE - Sergipe</option>
                    <option value="TO">TO - Tocantins</option>
                  </select>
                  {errors.estado && (
                    <p className="text-red-500 text-xs mt-1">{errors.estado}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: formatarCEP(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white ${
                      errors.cep ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="01234-567"
                    maxLength={9}
                  />
                  {errors.cep && (
                    <p className="text-red-500 text-xs mt-1">{errors.cep}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/user/consultar-cliente')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      {showError && (
        <ErrorModal
          isOpen={showError}
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      {showSuccess && (
        <SuccessModal
          isOpen={showSuccess}
          title="Sucesso!"
          message="Cliente cadastrado com sucesso!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default CadastrarCliente;
