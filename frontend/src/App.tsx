import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import Layout from './components/Layout';
import CadastrarCliente from './components/admin/CadastrarCliente';
import ListaClientes from './components/admin/ListaClientes';
import CadastrarQuarto from './components/admin/CadastrarQuarto';
import ListaQuartos from './components/admin/ListaQuartos';
import CadastrarFuncionario from './components/admin/CadastrarFuncionario';
import ListaFuncionarios from './components/admin/ListaFuncionarios';
import AlterarStatusQuarto from './components/admin/AlterarStatusQuarto';
import Relatorio from './components/admin/Relatorio';
import CriarReserva from './components/user/CriarReserva';
import ConsultarReservas from './components/user/ConsultarReservas';
import Checkin from './components/user/Checkin';
import Checkout from './components/user/Checkout';
import StatusQuartos from './components/user/StatusQuartos';
import Manutencao from './components/user/Manutencao';
import Pagamento from './components/user/Pagamento';
import ConsultarCliente from './components/user/ConsultarCliente';
import './index.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout title="Dashboard">
            {user?.role === 'ADMIN' ? <AdminDashboard /> : <Dashboard />}
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Dashboard específico */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <Layout title="Dashboard Admin">
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/clientes" element={
        <ProtectedRoute>
          <Layout title="Gestão de Clientes">
            <ListaClientes />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/cadastrar-cliente" element={
        <ProtectedRoute>
          <Layout title="Cadastrar Cliente">
            <CadastrarCliente />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/quartos" element={
        <ProtectedRoute>
          <Layout title="Gestão de Quartos">
            <ListaQuartos />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/cadastrar-quarto" element={
        <ProtectedRoute>
          <Layout title="Cadastrar Quarto">
            <CadastrarQuarto onSuccess={() => {}} modo="cadastro" />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/funcionarios" element={
        <ProtectedRoute>
          <Layout title="Gestão de Funcionários">
            <ListaFuncionarios />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/cadastrar-funcionario" element={
        <ProtectedRoute>
          <Layout title="Cadastrar Funcionário">
            <CadastrarFuncionario onSuccess={() => {}} modo="cadastro" />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/alterar-status" element={
        <ProtectedRoute>
          <Layout title="Alterar Status Quarto">
            <AlterarStatusQuarto />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/relatorios" element={
        <ProtectedRoute>
          <Layout title="Relatórios">
            <Relatorio />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* User Routes */}
      <Route path="/user/criar-reserva" element={
        <ProtectedRoute>
          <Layout title="Criar Reserva">
            <CriarReserva />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/consultar-reservas" element={
        <ProtectedRoute>
          <Layout title="Consultar Reservas">
            <ConsultarReservas />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/checkin" element={
        <ProtectedRoute>
          <Layout title="Check-in">
            <Checkin />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/checkout" element={
        <ProtectedRoute>
          <Layout title="Check-out">
            <Checkout />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/status-quartos" element={
        <ProtectedRoute>
          <Layout title="Status dos Quartos">
            <StatusQuartos />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/manutencao" element={
        <ProtectedRoute>
          <Layout title="Manutenção">
            <Manutencao />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/pagamento" element={
        <ProtectedRoute>
          <Layout title="Pagamento">
            <Pagamento />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/consultar-cliente" element={
        <ProtectedRoute>
          <Layout title="Consultar Cliente">
            <ConsultarCliente />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={
        <ProtectedRoute>
          <Layout>
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
              <p className="text-gray-600 dark:text-gray-400">Página não encontrada</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
