import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clienteService, pagamentoService } from '../../services/api';
import { ClienteResponse } from '../../services/api';

interface CheckoutData {
  reservaId: number;
  quartoId: number;
  clienteId: number;
  clienteNome?: string;
  quartoNumero?: string;
  dataCheckout: string;
  diarias: number;
  valorTotal: number;
}

interface PagamentoData {
  clienteId: number;
  tipo: string;
  valor: number;
  dataPagamento: string;
  metodo: string;
  status: string;
  observacoes: string;
}

const Pagamento: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state?.checkoutData as CheckoutData;
  
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<PagamentoData>({
    clienteId: checkoutData?.clienteId || 0,
    tipo: 'hospedagem',
    valor: checkoutData?.valorTotal || 0,
    dataPagamento: new Date().toISOString().split('T')[0],
    metodo: 'dinheiro',
    status: 'pago',
    observacoes: checkoutData ? `Pagamento referente ao check-out do quarto ${checkoutData.quartoNumero} - ${checkoutData.diarias} diárias` : ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setIsLoading(true);
    try {
      const clientesData = await clienteService.listarClientes();
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setErrorMessage('Não foi possível carregar os clientes. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.valor || !formData.dataPagamento) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      setShowError(true);
      return;
    }

    if (formData.valor <= 0) {
      setErrorMessage('O valor deve ser maior que zero.');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando dados de pagamento:', formData);
      
      // Enviar para API real
      await pagamentoService.registrarPagamento({
        clienteId: formData.clienteId,
        tipo: formData.tipo,
        valor: formData.valor,
        dataPagamento: formData.dataPagamento,
        metodo: formData.metodo,
        status: formData.status,
        observacoes: formData.observacoes,
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Pagamento registrado com sucesso!');
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      setErrorMessage('Não foi possível registrar o pagamento. Tente novamente.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading && clientes.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registrar Pagamento</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Registre pagamentos de clientes e gerencie transações.
        </p>
      </div>

      {/* Resumo do Check-out */}
      {checkoutData && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📋 Resumo do Check-out
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Cliente:</span>
              <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                {checkoutData.clienteNome}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Quarto:</span>
              <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                {checkoutData.quartoNumero}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Diárias:</span>
              <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                {checkoutData.diarias}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Valor Total:</span>
              <span className="ml-2 font-bold text-blue-900 dark:text-blue-100">
                {formatarMoeda(checkoutData.valorTotal)}
              </span>
            </div>
          </div>
        </div>
      )}

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
                Pagamento Registrado com Sucesso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                O pagamento foi registrado e você será redirecionado para o dashboard.
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
                Erro ao Registrar Pagamento
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
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente *
            </label>
            {checkoutData ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                {checkoutData.clienteNome}
              </div>
            ) : (
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
            )}
          </div>

          {/* Tipo de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Pagamento *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="hospedagem">Hospedagem</option>
              <option value="reserva">Reserva</option>
              <option value="servico">Serviço Adicional</option>
              <option value="multa">Multa</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor *
            </label>
            {checkoutData ? (
              <input
                type="text"
                value={formatarMoeda(checkoutData.valorTotal)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
            ) : (
              <input
                type="number"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            )}
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data do Pagamento *
            </label>
            <input
              type="date"
              value={formData.dataPagamento}
              onChange={(e) => setFormData(prev => ({ ...prev, dataPagamento: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
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
              value={formData.metodo}
              onChange={(e) => setFormData(prev => ({ ...prev, metodo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão de Crédito</option>
              <option value="cartao-debito">Cartão de Débito</option>
              <option value="pix">PIX</option>
              <option value="transferencia">Transferência Bancária</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Observações */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observações
          </label>
          {checkoutData ? (
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Adicione informações adicionais sobre o pagamento..."
            />
          ) : (
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Informações adicionais sobre o pagamento..."
            />
          )}
        </div>

        {/* Resumo do Pagamento */}
        {formData.valor > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
              💳 Resumo do Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">
                  {formatarMoeda(formData.valor)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Método:</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">
                  {formData.metodo.charAt(0).toUpperCase() + formData.metodo.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">
                  {formData.tipo.charAt(0).toUpperCase() + formData.tipo.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
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
            disabled={isLoading}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Registrar Pagamento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Pagamento;
