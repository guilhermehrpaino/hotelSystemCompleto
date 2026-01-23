import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthData, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Simulação de login - substituir com chamada real à API
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const mockUser: User = {
          id: 1,
          username: 'admin',
          email: 'admin@hotel.com',
          role: 'ADMIN'
        };
        const mockToken = 'mock-jwt-token';
        
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return true;
      } else if (credentials.username === 'user' && credentials.password === 'user') {
        const mockUser: User = {
          id: 2,
          username: 'user',
          email: 'user@hotel.com',
          role: 'USER'
        };
        const mockToken = 'mock-jwt-token-user';
        
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
