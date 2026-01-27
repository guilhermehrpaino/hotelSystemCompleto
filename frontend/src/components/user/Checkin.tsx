import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quartoService, clienteService } from '../../services/api';
import { QuartoResponse, ClienteResponse } from '../../services/api';

interface CheckinData {
  reservaId: number;
  quartoId: number;
  clienteId: number;
  dataCheckin: string;
  observacoes: string;
}

const Checkin: React.FC = () => {
  const navigate = useNavigate();
  
  const [quartos, setQuartos] = useState<QuartoResponse[]>([]);
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<CheckinData>({
    reservaId: 0,
    quartoId: 0,
    clienteId: 0,
    dataCheckin: new Date().toISOString().split('T')[0],
    observacoes: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quartoId || !formData.clienteId || !formData.dataCheckin) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      setShowError(true);
      return;
    }

    const quarto = quartos.find(q => q.id === formData.quartoId);
    if (!quarto) {
      setErrorMessage('Quarto não encontrado.');
      setShowError(true);
      return;
    }

    if (quarto.status !== 'RESERVADO') {
      setErrorMessage('Check-in só pode ser realizado em quartos reservados.');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    try {
      // Simulação de check-in (você pode ajustar quando tiver a API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/user/status-quartos');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      setErrorMessage('Não foi possível realizar o check-in. Tente novamente.');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Realizar Check-in</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Registre a entrada de hóspedes no sistema.
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
                Check-in Realizado com Sucesso!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                O check-in foi registrado e você será redirecionado para a lista de quartos.
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
                Erro ao Realizar Check-in
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
                .filter(q => q.status === 'RESERVADO')
                .map(quarto => (
                  <option key={quarto.id} value={quarto.id}>
                    {quarto.numero} - {quarto.tipo}
                  </option>
                ))}
            </select>
            {quartos.filter(q => q.status === 'RESERVADO').length === 0 && (
              <p className="text-sm text-yellow-500 mt-1">
                Nenhum quarto reservado disponível para check-in.
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

          {/* Data Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Check-in *
            </label>
            <input
              type="date"
              value={formData.dataCheckin}
              onChange={(e) => setFormData(prev => ({ ...prev, dataCheckin: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* ID da Reserva (simulado) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID da Reserva
            </label>
            <input
              type="number"
              value={formData.reservaId}
              onChange={(e) => setFormData(prev => ({ ...prev, reservaId: parseInt(e.target.value) }))}
              placeholder="Opcional - preencha se tiver o ID da reserva"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
            placeholder="Informações adicionais sobre o check-in..."
          />
        </div>

        {/* Informações do Check-in */}
        {formData.quartoId && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 Informações do Check-in
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Quarto:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {quartos.find(q => q.id === formData.quartoId)?.numero} - {quartos.find(q => q.id === formData.quartoId)?.tipo}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {clientes.find(c => c.id === formData.clienteId)?.nome}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Data:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(formData.dataCheckin).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="ml-2 text-yellow-600 dark:text-yellow-400 font-medium">
                  Aguardando confirmação
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
            disabled={isLoading || quartos.filter(q => q.status === 'RESERVADO').length === 0}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Realizar Check-in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkin;
