import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quartoService, clienteService } from '../../services/api';
import { QuartoResponse, ClienteResponse } from '../../services/api';

interface CheckoutData {
  quartoId: number;
  clienteId: number;
  dataCheckout: string;
  hospedes: number;
  diarias: number;
  valorTotal: number;
  valorPago: number;
  metodoPagamento: string;
  observacoes: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutData>({
    quartoId: 0,
    clienteId: 0,
    dataCheckout: new Date().toISOString().split('T')[0],
    hospedes: 1,
    diarias: 1,
    valorTotal: 0,
    valorPago: 0,
    metodoPagamento: 'dinheiro',
    observacoes: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    calcularValorTotal();
  }, [formData.quartoId, formData.diarias, formData.hospedes]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [quartosData, clientesData] = await Promise.all([
        quartoService.listarQuartos(),
        clienteService.listarClientes()
      ]);
      
      setQuartos(quartosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErrorMessage('Não foi possível carregar os dados. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularValorTotal = () => {
    if (!formData.quartoId) return;

    const quarto = quartos.find(q => q.id === formData.quartoId);
    if (!quarto) return;

    const valorTotal = formData.diarias * quarto.diaria;
    setFormData(prev => ({ ...prev, valorTotal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quartoId || !formData.clienteId || !formData.dataCheckout) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      setShowError(true);
      return;
    }

    if (formData.valorPago < formData.valorTotal) {
      setErrorMessage('O valor pago deve ser maior ou igual ao valor total.');
      setShowError(true);
      return;
    }

    const quarto = quartos.find(q => q.id === formData.quartoId);
    if (!quarto) {
      setErrorMessage('Quarto não encontrado.');
      setShowError(true);
      return;
    }

    if (quarto.status !== 'OCUPADO') {
      setErrorMessage('Check-out só pode ser realizado em quartos ocupados.');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      // Simulação de check-out (você pode ajustar quando tiver a API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/status-quartos');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao realizar check-out:', error);
      setErrorMessage('Não foi possível realizar o check-out. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Realizar Check-out</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Registre a saída de hóspedes e finalize a estadia.
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
                Check-out Realizado com Sucesso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                O check-out foi registrado e você será redirecionado para a lista de quartos.
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
                Erro ao Realizar Check-out
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
              <option value="">Selecione um quarto</option>
              {quartos
                .filter(q => q.status === 'OCUPADO')
                .map(quarto => (
                  <option key={quarto.id} value={quarto.id}>
                    {quarto.numero} - {quarto.tipo} ({formatarMoeda(quarto.diaria)}/noite)
                  </option>
                ))}
            </select>
            {quartos.filter(q => q.status === 'OCUPADO').length === 0 && (
              <p className="text-sm text-yellow-500 mt-1">
                Nenhum quarto ocupado disponível para check-out.
              </p>
            )}
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente *
            </label>
            <select
              value={formData.clienteId}
              onChange={(e) => setFormData(prev => ({ ...prev, clienteId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.cpf}
                </option>
              ))}
            </select>
          </div>

          {/* Data Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Check-out *
            </label>
            <input
              type="date"
              value={formData.dataCheckout}
              onChange={(e) => setFormData(prev => ({ ...prev, dataCheckout: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Número de Hóspedes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Hóspedes *
            </label>
            <input
              type="number"
              value={formData.hospedes}
              onChange={(e) => setFormData(prev => ({ ...prev, hospedes: parseInt(e.target.value) }))}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Diárias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diárias *
            </label>
            <input
              type="number"
              value={formData.diarias}
              onChange={(e) => setFormData(prev => ({ ...prev, diarias: parseInt(e.target.value) }))}
              min="1"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de Pagamento *
            </label>
            <select
              value={formData.metodoPagamento}
              onChange={(e) => setFormData(prev => ({ ...prev, metodoPagamento: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">PIX</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>

          {/* Valor Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Total
            </label>
            <input
              type="text"
              value={formatarMoeda(formData.valorTotal)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300"
            />
          </div>

          {/* Valor Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Pago *
            </label>
            <input
              type="number"
              value={formData.valorPago}
              onChange={(e) => setFormData(prev => ({ ...prev, valorPago: parseFloat(e.target.value) }))}
              min="0"
              step="0.01"
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
            placeholder="Informações adicionais sobre o check-out..."
          />
        </div>

        {/* Resumo Financeiro */}
        {formData.valorTotal > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
              💰 Resumo Financeiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Valor Total:</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">
                  {formatarMoeda(formData.valorTotal)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Valor Pago:</span>
                <span className="ml-2 font-bold text-green-600 dark:text-green-400">
                  {formatarMoeda(formData.valorPago)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Troco:</span>
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                  {formatarMoeda(formData.valorPago - formData.valorTotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/user')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || quartos.filter(q => q.status === 'OCUPADO').length === 0}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Realizar Check-out'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
