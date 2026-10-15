import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    workplace_or_org?: string;
    preferred_language?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('heatsafe_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('heatsafe_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
      localStorage.setItem('heatsafe_user', JSON.stringify(u));
    } catch {
      // If token expired, clear
      setToken(null);
      setUser(null);
      localStorage.removeItem('heatsafe_token');
      localStorage.removeItem('heatsafe_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('heatsafe_token', data.access_token);
      localStorage.setItem('heatsafe_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (regData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    workplace_or_org?: string;
    preferred_language?: string;
  }) => {
    setIsLoading(true);
    try {
      const data = await api.register(regData);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('heatsafe_token', data.access_token);
      localStorage.setItem('heatsafe_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('heatsafe_token');
    localStorage.removeItem('heatsafe_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
