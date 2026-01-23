import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

interface QuartoFormData {
  numero: string;
  diaria: string;
}

interface FormErrors {
  numero?: string;
  diaria?: string;
}

interface QuartoExistente {
  [key: string]: boolean;
}

const CadastrarQuarto: React.FC = () => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState<QuartoFormData>({
    numero: '',
    diaria: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingQuartos, setIsCheckingQuartos] = useState<boolean>(false);
  const [quartosExistentes, setQuartosExistentes] = useState<QuartoExistente>({});
  const [andarSelecionado, setAndarSelecionado] = useState<string>('');
  const [quartoSelecionado, setQuartoSelecionado] = useState<string>('');
  
  // Estados para o modal de erro
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  // Estados para o modal de sucesso
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [successDetails, setSuccessDetails] = useState<string>('');

  // Gerar opções de andares e quartos
  const andares = [
    { value: '1', label: '1º Andar' },
    { value: '2', label: '2º Andar' },
    { value: '3', label: '3º Andar' },
    { value: '4', label: '4º Andar' },
    { value: '5', label: '5º Andar' }
  ];

  const gerarQuartosPorAndar = (andar: string) => {
    const quartos = [];
    for (let i = 0; i <= 20; i++) {
      const numero = `${andar}${i.toString().padStart(2, '0')}`;
      quartos.push({
        value: numero,
        label: `Quarto ${numero}`,
        numero: i
      });
    }
    return quartos;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar andar
    if (!andarSelecionado) {
      newErrors.numero = 'Selecione um andar';
    }

    // Validar quarto
    if (!quartoSelecionado) {
      newErrors.numero = 'Selecione um quarto';
    }

    // Validar diária
    if (!formData.diaria.trim()) {
      newErrors.diaria = 'Diária é obrigatória';
    } else {
      // Remover formatação para converter para número (centavos)
      const diariaNumerica = parseInt(formData.diaria.replace(/[^\d]/g, '')) / 100;
      if (isNaN(diariaNumerica) || diariaNumerica <= 0) {
        newErrors.diaria = 'Diária deve ser um valor positivo';
      } else if (diariaNumerica < 550) {
        newErrors.diaria = 'Diária mínima é R$ 550,00';
      } else if (diariaNumerica > 10000) {
        newErrors.diaria = 'Diária máxima é R$ 10.000,00';
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

  // Formatar diária como moeda brasileira
  const formatDiaria = (value: string) => {
    // Remove tudo que não é dígito
    let numeros = value.replace(/[^\d]/g, '');
    
    // Converte para número e divide por 100 para tratar centavos
    let valor = parseInt(numeros) / 100;
    
    if (isNaN(valor)) valor = 0;
    
    // Formata como moeda brasileira
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Verificar quais quartos já existem
  const verificarQuartosExistentes = async () => {
    setIsCheckingQuartos(true);
    const novosQuartosExistentes: QuartoExistente = {};
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
      const token = localStorage.getItem('token');
      
      // Verificar todos os quartos possíveis
      for (let andar = 1; andar <= 5; andar++) {
        for (let numero = 0; numero <= 20; numero++) {
          const numeroCompleto = `${andar}${numero.toString().padStart(2, '0')}`;
          
          try {
            const response = await fetch(`${API_BASE_URL}/quartos/numero/${numeroCompleto}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              }
            });

            if (response.ok) {
              novosQuartosExistentes[numeroCompleto] = true;
            }
          } catch (error) {
            // Se der 404, o quarto não existe (isso é esperado)
            novosQuartosExistentes[numeroCompleto] = false;
          }
        }
      }
      
      setQuartosExistentes(novosQuartosExistentes);
    } catch (error) {
      console.error('Erro ao verificar quartos existentes:', error);
    } finally {
      setIsCheckingQuartos(false);
    }
  };

  // Carregar quartos existentes ao montar o componente
  useEffect(() => {
    verificarQuartosExistentes();
  }, []);

  const handleAndarChange = (andar: string) => {
    setAndarSelecionado(andar);
    setQuartoSelecionado(''); // Limpar seleção do quarto ao mudar de andar
    setErrors((prev: FormErrors) => ({ ...prev, numero: '' }));
  };

  const handleQuartoChange = (quarto: string) => {
    setQuartoSelecionado(quarto);
    setErrors((prev: FormErrors) => ({ ...prev, numero: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'diaria') {
      // Aplicar máscara de moeda
      processedValue = formatDiaria(value);
    }
    
    setFormData((prev: QuartoFormData) => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados para a API
      const quartoData = {
        numero: parseInt(quartoSelecionado),
        diaria: parseInt(formData.diaria.replace(/[^\d]/g, '')) / 100 // Remove formatação e converte centavos para integer
      };

      console.log('Dados enviados para API:', quartoData);

      // Enviar para a API
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/quartos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(quartoData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mostrar modal de sucesso
        showSuccessModal(
          'Quarto Cadastrado!',
          `O quarto ${quartoSelecionado} foi cadastrado com sucesso.`,
          `Diária: ${formData.diaria} | Status: Disponível`
        );
        
        // Adicionar quarto à lista de existentes
        setQuartosExistentes(prev => ({
          ...prev,
          [quartoSelecionado]: true
        }));
        
        // Reset form
        setFormData({
          numero: '',
          diaria: ''
        });
        setAndarSelecionado('');
        setQuartoSelecionado('');
        setErrors({});
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).message || `Erro ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('Erro ao cadastrar quarto:', error);
      
      let errorMessage = 'Erro ao cadastrar quarto. Tente novamente.';
      let errorDetails = '';
      
      if (error.message.includes('409')) {
        errorMessage = 'Quarto já existe';
        errorDetails = 'Este quarto já está cadastrado no sistema.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Dados inválidos';
        errorDetails = 'Verifique os campos e tente novamente.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Não autorizado';
        errorDetails = 'Faça login novamente para continuar.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Erro no servidor';
        errorDetails = 'Tente novamente mais tarde.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão';
        errorDetails = 'Não foi possível conectar ao servidor. Verifique sua internet.';
      }
      
      showErrorModal(errorMessage, errorDetails);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpar = () => {
    setFormData({
      numero: '',
      diaria: ''
    });
    setErrors({});
    setAndarSelecionado('');
    setQuartoSelecionado('');
  };

  const quartosDisponiveis = andarSelecionado ? gerarQuartosPorAndar(andarSelecionado) : [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cadastrar Quarto</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Selecione o andar e o quarto disponível
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seleção de Andar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Andar *
              </label>
              <select
                value={andarSelecionado}
                onChange={(e) => handleAndarChange(e.target.value)}
                className={`input-field ${errors.numero ? 'border-red-300 dark:border-red-700' : ''}`}
                disabled={isLoading || isCheckingQuartos}
              >
                <option value="">Selecione um andar</option>
                {andares.map(andar => (
                  <option key={andar.value} value={andar.value}>
                    {andar.label}
                  </option>
                ))}
              </select>
              {errors.numero && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numero}</p>
              )}
            </div>

            {/* Seleção de Quarto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quarto *
              </label>
              <select
                value={quartoSelecionado}
                onChange={(e) => handleQuartoChange(e.target.value)}
                className={`input-field ${errors.numero ? 'border-red-300 dark:border-red-700' : ''}`}
                disabled={isLoading || !andarSelecionado || isCheckingQuartos}
              >
                <option value="">Selecione um quarto</option>
                {quartosDisponiveis.map(quarto => (
                  <option 
                    key={quarto.value} 
                    value={quarto.value}
                    disabled={quartosExistentes[quarto.value]}
                    style={{ 
                      color: quartosExistentes[quarto.value] ? '#999' : 'inherit',
                      backgroundColor: quartosExistentes[quarto.value] ? '#f5f5f5' : 'inherit'
                    }}
                  >
                    {quarto.label} {quartosExistentes[quarto.value] ? '(Criado)' : '(Não-Criado)'}
                  </option>
                ))}
              </select>
              {errors.numero && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numero}</p>
              )}
              {isCheckingQuartos && (
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">Verificando quartos disponíveis...</p>
              )}
            </div>

            {/* Diária */}
            <div>
              <label htmlFor="diaria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diária (R$) *
              </label>
              <input
                type="text"
                id="diaria"
                name="diaria"
                value={formData.diaria}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
                className={`input-field ${errors.diaria ? 'border-red-300 dark:border-red-700' : ''}`}
                disabled={isLoading}
              />
              {errors.diaria && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.diaria}</p>
              )}
            </div>
          </div>

          {/* Visualização dos Quartos */}
          {andarSelecionado && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                📍 Quartos do {andares.find(a => a.value === andarSelecionado)?.label}
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {quartosDisponiveis.map(quarto => (
                  <div
                    key={quarto.value}
                    className={`
                      text-center p-2 rounded-lg border-2 text-xs font-medium cursor-pointer transition-colors
                      ${quartosExistentes[quarto.value] 
                        ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400' 
                        : 'bg-white dark:bg-gray-700 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }
                    `}
                    onClick={() => !quartosExistentes[quarto.value] && handleQuartoChange(quarto.value)}
                  >
                    {quarto.numero}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Não-Criado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Criado</span>
                </div>
              </div>
            </div>
          )}

          {/* Informações sobre os quartos */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              📋 Informações sobre os Quartos
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• 5 andares disponíveis (1º ao 5º)</li>
              <li>• 21 quartos por andar (00 a 20)</li>
              <li>• Total: {105 - Object.values(quartosExistentes).filter(existe => existe).length} quartos disponíveis para cadastro</li>
              <li>• {Object.values(quartosExistentes).filter(existe => existe).length} quartos já criados</li>
              <li>• Diária mínima: R$ 550,00</li>
              <li>• Quartos criados são desabilitados automaticamente</li>
              <li>• Clique nos quartos não criados para selecionar</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleLimpar}
              className="btn-secondary"
              disabled={isLoading}
            >
              Limpar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !quartoSelecionado || quartosExistentes[quartoSelecionado]}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Quarto'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title="Erro ao Cadastrar Quarto"
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

export default CadastrarQuarto;
