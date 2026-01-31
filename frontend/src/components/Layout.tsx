import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificacaoDropdown from './common/NotificacaoDropdown';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof menuItems>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const adminMenuItems = [
    { id: 'dashboard', title: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { id: 'clientes', title: 'Gestão de Clientes', path: '/admin/clientes', icon: '👥' },
    { id: 'quartos', title: 'Gestão de Quartos', path: '/admin/quartos', icon: '🏨' },
    { id: 'funcionarios', title: 'Gestão de Funcionários', path: '/admin/funcionarios', icon: '👔' },
    { id: 'alterar-status', title: 'Alterar Status Quarto', path: '/admin/alterar-status', icon: '🔄' },
    { id: 'relatorios', title: 'Relatórios', path: '/admin/relatorios', icon: '📈' },
  ];

  const userMenuItems = [
    { id: 'dashboard', title: 'Dashboard', path: '/user/dashboard', icon: '📊' },
    { id: 'criar-reserva', title: 'Criar Reserva', path: '/user/criar-reserva', icon: '➕' },
    { id: 'consultar-reservas', title: 'Gestão de Reservas', path: '/user/consultar-reservas', icon: '📋' },
    { id: 'cancelar-reserva', title: 'Cancelar Reserva', path: '/user/cancelar-reserva', icon: '❌' },
    { id: 'status-quartos', title: 'Controle de Quartos', path: '/user/status-quartos', icon: '🏠' },
    { id: 'consultar-cliente', title: 'Consultar Cliente', path: '/user/consultar-cliente', icon: '🔍' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleLogoClick = () => {
    navigate(isAdmin ? '/admin/dashboard' : '/user/dashboard');
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = menuItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
  };

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setSearchResults([]);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="flex">
        {/* Sidebar Moderna */}
        <aside
          className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} sticky top-0 h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40`}
        >
          {/* Logo e Nome no topo da sidebar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogoClick}
              className={`flex items-center w-full hover:opacity-80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl p-3 ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105`}
              title="Ir para o Dashboard"
            >
              <div className="h-10 w-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <img 
                  src="/assets/logo.png" 
                  alt="Hotel System Logo" 
                  className="w-32 h-32 object-contain"
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="text-left">
                  <h2 className="text-lg font-bold text-white">
                    Hotel System
                  </h2>
                  <p className="text-xs text-blue-100 mt-1 opacity-90">
                    Sistema de Gestão Hoteleira
                  </p>
                </div>
              )}
            </button>
          </div>

          {/* Toggle Sidebar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className={`w-full flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 ${isSidebarCollapsed ? 'justify-center' : 'space-x-2'}`}
            >
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isSidebarCollapsed ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5l-7 7 7 7M19 5l-7 7 7 7"
                  />
                )}
              </svg>
              {!isSidebarCollapsed && <span>Recolher menu</span>}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    isActivePath(item.path)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-lg mr-3 flex-shrink-0">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {isActivePath(item.path) && (
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* User Info no Bottom */}
          {!isSidebarCollapsed && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header Moderno */}
          <header className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Breadcrumb/Title */}
                <div className="flex items-center space-x-4">
                  {title && (
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                      </h1>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>
                          {isAdmin ? 'Admin' : 'User'} Dashboard
                        </span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative" ref={searchContainerRef}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar páginas..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Search Results Dropdown */}
                    {isSearchFocused && searchResults.length > 0 && (
                      <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-64 overflow-y-auto">
                        {searchResults.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSearchSelect(item.path)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.path}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {isSearchFocused && searchQuery && searchResults.length === 0 && (
                      <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-4 z-50">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="text-sm">Nenhuma página encontrada</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notificações */}
                  <div className="relative">
                    <NotificacaoDropdown />
                  </div>
                  
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                    aria-label="Alternar tema"
                  >
                    {theme === 'light' ? (
                      <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
                      </div>
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sair</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
