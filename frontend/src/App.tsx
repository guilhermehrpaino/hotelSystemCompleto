import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import CadastrarCliente from './components/admin/CadastrarCliente';
import CadastrarQuarto from './components/admin/CadastrarQuarto';
import CadastrarFuncionario from './components/admin/CadastrarFuncionario';
import AlterarStatusQuarto from './components/admin/AlterarStatusQuarto';
import Relatorio from './components/admin/Relatorio';
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
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/cadastrar-cliente" element={
        <ProtectedRoute>
          <Layout title="Cadastrar Cliente">
            <CadastrarCliente />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/cadastrar-quarto" element={
        <ProtectedRoute>
          <Layout title="Cadastrar Quarto">
            <CadastrarQuarto />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/cadastrar-funcionario" element={
        <ProtectedRoute>
          <Layout title="Cadastrar Funcionário">
            <CadastrarFuncionario />
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
