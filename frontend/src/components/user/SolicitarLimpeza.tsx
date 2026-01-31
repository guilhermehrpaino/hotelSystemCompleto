import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { quartoService, QuartoResponse } from '../../services/api';
import { getTipoQuarto } from '../../utils/quartoUtils';
import ErrorModal from '../common/ErrorModal';
import SuccessModal from '../common/SuccessModal';

interface LimpezaData {
  quartoId: number;
  observacoes: string;
}

const SolicitarLimpeza: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { quartoId?: number; quartoNumero?: number } || {};
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [quartoSelecionado, setQuartoSelecionado] = useState<QuartoResponse | null>(null);
  const [formData, setFormData] = useState<LimpezaData>({
    quartoId: state.quartoId || 0,
    observacoes: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    carregarQuartos();
  }, []);

  useEffect(() => {
    if (state.quartoId && quartos.length > 0) {
      const quarto = quartos.find(q => q.id === state.quartoId);
      if (quarto) {
        setQuartoSelecionado(quarto);
        setFormData(prev => ({ ...prev, quartoId: quarto.id }));
      }
    }
  }, [state.quartoId, quartos]);

  const carregarQuartos = async () => {
    try {
      const quartosData = await quartoService.listarQuartos();
      // Ordenar quartos por número
      const quartosOrdenados = quartosData.sort((a, b) => parseInt(a.numero.toString()) - parseInt(b.numero.toString()));
      setQuartos(quartosOrdenados);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
      setErrorMessage('Não foi possível carregar os quartos. Tente novamente.');
      setShowError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quartoId) {
      setErrorMessage('Selecione um quarto para solicitar limpeza.');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      // Primeiro atualiza o status do quarto para SUJO
      await quartoService.atualizarStatusQuarto(formData.quartoId, 'SUJO');
      
      // Depois salva a observação (se houver)
      if (formData.observacoes.trim()) {
        await quartoService.atualizarObservacaoQuarto(formData.quartoId, formData.observacoes);
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/status-quartos');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao solicitar limpeza:', error);
      setErrorMessage('Não foi possível solicitar a limpeza. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuartoDisponivel = (id: number): QuartoResponse | null => {
    const quarto = quartos.find(q => q.id === id);
    if (!quarto) return null;
    
    // Retorna o quarto com tipo padronizado
    return {
      ...quarto,
      tipo: getTipoQuarto(parseInt(quarto.numero.toString()))
    };
  };

  const quartosDisponiveis = quartos.filter(quarto => 
    quarto.status === 'DISPONIVEL' || 
    quarto.status === 'OCUPADO' || 
    quarto.status === 'RESERVADO'
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Solicitar Limpeza</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Selecione um quarto para solicitar serviço de limpeza.
          </p>
        </div>

        {/* Selected Room Info */}
        {quartoSelecionado && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl shadow-lg p-6 border border-purple-200 dark:border-purple-700 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Quarto Selecionado
                </h3>
                <div className="space-y-1">
                  <p className="text-purple-700 dark:text-purple-300">
                    <span className="font-medium">Quarto:</span> {quartoSelecionado.numero}
                  </p>
                  <p className="text-purple-700 dark:text-purple-300">
                    <span className="font-medium">Tipo:</span> {getTipoQuarto(parseInt(quartoSelecionado.numero.toString()))}
                  </p>
                  <p className="text-purple-700 dark:text-purple-300">
                    <span className="font-medium">Diária:</span> {quartoSelecionado.diaria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
              <div className="bg-purple-500 bg-opacity-20 rounded-full p-4">
                <span className="text-3xl">🧹</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solicitar Limpeza
            </h2>
            <button
              onClick={() => navigate('/user/status-quartos')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Voltar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Quarto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quarto *
              </label>
              <select
                value={formData.quartoId}
                onChange={(e) => setFormData({ ...formData, quartoId: parseInt(e.target.value) })}
                disabled={quartoSelecionado !== null}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  quartoSelecionado !== null 
                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value="">Selecione um quarto...</option>
                {quartosDisponiveis.map(quarto => (
                  <option key={quarto.id} value={quarto.id}>
                    {quarto.numero} - {getTipoQuarto(parseInt(quarto.numero.toString()))} ({quarto.status})
                  </option>
                ))}
              </select>
              {quartoSelecionado && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quarto pré-selecionado não pode ser alterado
                </p>
              )}
              {quartosDisponiveis.length === 0 && !quartoSelecionado && (
                <p className="text-sm text-yellow-500 mt-1">
                  Nenhum quarto disponível para limpeza no momento.
                </p>
              )}
            </div>

            {/* Informações do Quarto Selecionado */}
            {formData.quartoId && (() => {
              const quarto = getQuartoDisponivel(formData.quartoId);
              if (!quarto) return null;
              
              return (
                <div className="bg-cyan-50 dark:bg-cyan-900 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700">
                  <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
                    🧹 Informações do Quarto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-cyan-700 dark:text-cyan-300">Número:</span>
                      <span className="ml-2 font-bold text-cyan-900 dark:text-cyan-100">
                        {quarto.numero}
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-700 dark:text-cyan-300">Tipo:</span>
                      <span className="ml-2 font-bold text-cyan-900 dark:text-cyan-100">
                        {quarto.tipo}
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-700 dark:text-cyan-300">Status Atual:</span>
                      <span className="ml-2 font-bold text-cyan-900 dark:text-cyan-100">
                        {quarto.status === 'DISPONIVEL' ? 'Disponível' : 
                         quarto.status === 'OCUPADO' ? 'Ocupado' : 
                         quarto.status === 'RESERVADO' ? 'Reservado' : quarto.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-cyan-700 dark:text-cyan-300">Diária:</span>
                      <span className="ml-2 font-bold text-cyan-900 dark:text-cyan-100">
                        R$ {quarto.diaria.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Adicione informações adicionais sobre a solicitação de limpeza..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/user/status-quartos')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : 'Solicitar Limpeza'}
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
          message="Limpeza solicitada com sucesso! O quarto foi marcado como sujo."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default SolicitarLimpeza;
