import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { quartoService, QuartoResponse, QuartoRequest } from '../../services/quartoApi';
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

interface CadastrarQuartoProps {
  onSuccess: () => void;
  modo: 'cadastro' | 'atualizacao';
  quartoParaAtualizar?: QuartoResponse | null;
}

const CadastrarQuarto: React.FC<CadastrarQuartoProps> = ({ onSuccess, modo, quartoParaAtualizar }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState<QuartoFormData>({
    numero: '',
    diaria: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Estados para o modal de erro
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  // Estados para o modal de sucesso
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [successDetails, setSuccessDetails] = useState<string>('');

  // Carregar dados do quarto para atualização
  useEffect(() => {
    if (modo === 'atualizacao' && quartoParaAtualizar) {
      console.log('Dados do quarto carregados:', quartoParaAtualizar);
      setFormData({
        numero: quartoParaAtualizar.numero,
        diaria: quartoParaAtualizar.diaria.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      });
    }
  }, [modo, quartoParaAtualizar]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    if (name === 'diaria') {
      // Remover tudo que não for número
      const numbersOnly = value.replace(/[^\d]/g, '');
      
      // Converter para número e formatar como moeda brasileira
      if (numbersOnly) {
        const numericValue = parseInt(numbersOnly) / 100;
        processedValue = numericValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } else {
        processedValue = '';
      }
    }
    
    if (name === 'numero') {
      // Permitir apenas números
      processedValue = value.replace(/[^0-9]/g, '');
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validação do número do quarto
    const numeroStr = String(formData.numero);
    if (!numeroStr.trim()) {
      newErrors.numero = 'Número do quarto é obrigatório';
    } else if (parseInt(numeroStr) < 100 || parseInt(numeroStr) > 520) {
      newErrors.numero = 'Número do quarto deve estar entre 100 e 520';
    }

    // Validação da diária
    const diariaStr = String(formData.diaria);
    if (!diariaStr.trim()) {
      newErrors.diaria = 'Diária é obrigatória';
    } else {
      // Remover formatação para converter para número
      const diariaNumerico = Number(diariaStr.replace(/[^\d,]/g, '').replace(',', '.'));
      if (isNaN(diariaNumerico) || diariaNumerico < 50) {
        newErrors.diaria = 'Diária deve ser no mínimo R$ 50,00';
      } else if (diariaNumerico > 10000) {
        newErrors.diaria = 'Diária deve ser no máximo R$ 10.000,00';
      }
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
      // Preparar dados para a API
      const quartoData: QuartoRequest = {
        numero: String(formData.numero),
        diaria: Number(String(formData.diaria).replace(/[^\d,]/g, '').replace(',', '.'))
      };

      // Adicionar status apenas se for modo atualização e tiver o status original
      if (modo === 'atualizacao' && quartoParaAtualizar?.status) {
        quartoData.status = quartoParaAtualizar.status;
        console.log('Status original do quarto:', quartoParaAtualizar.status);
      }

      console.log('Dados enviados para API:', quartoData);

      let result: QuartoResponse;

      if (modo === 'atualizacao' && quartoParaAtualizar) {
        // Atualizar quarto existente
        result = await quartoService.atualizarQuarto(quartoParaAtualizar.id, quartoData);
        showSuccessModal(
          'Quarto Atualizado!',
          `O quarto ${String(formData.numero)} foi atualizado com sucesso.`,
          `Diária: ${String(formData.diaria)}`
        );
      } else {
        // Verificar se quarto já existe
        const quartoExistente = await quartoService.buscarQuartoPorNumero(String(formData.numero));
        if (quartoExistente) {
          showErrorModal('Quarto já existe', `O quarto ${String(formData.numero)} já está cadastrado no sistema.`);
          return;
        }

        // Cadastrar novo quarto
        result = await quartoService.cadastrarQuarto(quartoData);
        showSuccessModal(
          'Quarto Cadastrado!',
          `O quarto ${String(formData.numero)} foi cadastrado com sucesso.`,
          `Diária: ${String(formData.diaria)} | Status: Disponível`
        );
      }
      
      // Reset form apenas no modo cadastro
      if (modo === 'cadastro') {
        setFormData({
          numero: '',
          diaria: ''
        });
        setErrors({});
      }
      
      // Chamar callback de sucesso
      onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao salvar quarto:', error);
      
      let errorMessage = `Erro ao ${modo === 'atualizacao' ? 'atualizar' : 'cadastrar'} quarto. Tente novamente.`;
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
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {modo === 'atualizacao' ? 'Atualizar Quarto' : 'Cadastrar Quarto'}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {modo === 'atualizacao' 
              ? 'Atualize as informações do quarto selecionado'
              : 'Preencha os dados para cadastrar um novo quarto'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Número do Quarto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número do Quarto *
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Ex: 101, 201, 301"
                className={`input-field ${errors.numero ? 'border-red-300 dark:border-red-700' : ''}`}
                disabled={isLoading || modo === 'atualizacao'}
              />
              {errors.numero && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.numero}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Digite o número do quarto (ex: 101 para primeiro andar, 201 para segundo andar)
              </p>
            </div>

            {/* Diária */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diária (R$) *
              </label>
              <input
                type="text"
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Digite o valor da diária (será formatado automaticamente)
              </p>
            </div>
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {modo === 'atualizacao' ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                modo === 'atualizacao' ? 'Atualizar Quarto' : 'Cadastrar Quarto'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        title={`Erro ao ${modo === 'atualizacao' ? 'Atualizar' : 'Cadastrar'} Quarto`}
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
