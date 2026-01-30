import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { quartoService } from '../../services/api';
import { QuartoResponse } from '../../services/api';
import { formatarDataBrasil, getDataAtualInput } from '../../utils/dateUtils';
import { getTipoQuarto } from '../../utils/quartoUtils';

interface ManutencaoData {
  quartoId: number;
  motivo: string;
  dataInicio: string;
  dataFim: string;
  observacoes: string;
}

const Manutencao: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quartoIdFromUrl = searchParams.get('quartoId');
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ManutencaoData>({
    quartoId: quartoIdFromUrl ? parseInt(quartoIdFromUrl) : 0,
    motivo: '',
    dataInicio: getDataAtualInput(),
    dataFim: getDataAtualInput(),
    observacoes: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarQuartos();
  }, []);

  const carregarQuartos = async () => {
    setIsLoading(true);
    try {
      const quartosData = await quartoService.listarQuartos();
      // Ordenar quartos por número
      const quartosOrdenados = quartosData.sort((a, b) => parseInt(a.numero.toString()) - parseInt(b.numero.toString()));
      setQuartos(quartosOrdenados);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
      setErrorMessage('Não foi possível carregar os quartos. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quartoId || !formData.motivo || !formData.dataInicio || !formData.dataFim) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      setShowError(true);
      return;
    }

    const inicio = new Date(formData.dataInicio);
    const fim = new Date(formData.dataFim);
    
    if (fim <= inicio) {
      setErrorMessage('A data de fim deve ser posterior à data de início.');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      // Primeiro atualiza o status do quarto para MANUTENCAO
      await quartoService.atualizarStatusQuarto(formData.quartoId, 'MANUTENCAO');
      
      // Depois salva a observação (se houver)
      if (formData.observacoes.trim()) {
        await quartoService.atualizarObservacaoQuarto(formData.quartoId, formData.observacoes);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/status-quartos');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao solicitar manutenção:', error);
      setErrorMessage('Não foi possível solicitar a manutenção. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && quartos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Solicitar Manutenção</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Marque quartos para manutenção e registre os detalhes do serviço.
        </p>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Manutenção Solicitada com Sucesso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                A solicitação foi registrada e você será redirecionado para a lista de quartos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Erro ao Solicitar Manutenção
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => setShowError(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quarto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quarto *
            </label>
            <select
              value={formData.quartoId}
              onChange={(e) => setFormData(prev => ({ ...prev, quartoId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione um quarto...</option>
              {quartos.map((quarto: QuartoResponse) => (
                <option key={quarto.id} value={quarto.id}>
                  {quarto.numero} - {getTipoQuarto(parseInt(quarto.numero.toString()))}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo da Manutenção *
            </label>
            <select
              value={formData.motivo}
              onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione um motivo</option>
              <option value="reparo">Reparo</option>
              <option value="manutencao-preventiva">Manutenção Preventiva</option>
              <option value="pintura">Pintura</option>
              <option value="eletrica">Elétrica</option>
              <option value="hidraulica">Hidráulica</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Início *
            </label>
            <input
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Fim Prevista *
            </label>
            <input
              type="date"
              value={formData.dataFim}
              onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
              min={formData.dataInicio || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Observações */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Descreva detalhes sobre a manutenção necessária..."
          />
        </div>

        {/* Informações da Manutenção */}
        {formData.quartoId && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900 rounded-lg border border-orange-200 dark:border-orange-700">
            <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">
              🔧 Informações da Manutenção
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Quarto:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {quartos.find(q => q.id === formData.quartoId)?.numero} - {quartos.find(q => q.id === formData.quartoId)?.tipo}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status Atual:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {quartos.find(q => q.id === formData.quartoId)?.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Motivo:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {formData.motivo || 'Não informado'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Período:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {formatarDataBrasil(formData.dataInicio)} - {formData.dataFim ? formatarDataBrasil(formData.dataFim) : 'Não definido'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Solicitar Manutenção'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Manutencao;
