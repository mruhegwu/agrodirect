import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Farm } from '../types';
import { api, setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  farm: Farm | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone: string; role?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchPersona: (personaKey: 'CUSTOMER' | 'FARMER_OBEGU' | 'FARMER_GREEN' | 'FARMER_NEW' | 'LOGISTICS' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PERSONAS = {
  CUSTOMER: { email: 'customer@agrodirect.ng', password: 'Password123!', label: 'Customer (Dr. Babatunde Adeyemi)', role: 'CUSTOMER', location: 'Lagos' },
  FARMER_OBEGU: { email: 'obegu@agrodirect.ng', password: 'Password123!', label: 'Verified Farmer (Obegu Farms)', role: 'FARMER', location: 'Abia' },
  FARMER_GREEN: { email: 'greenvalley@agrodirect.ng', password: 'Password123!', label: 'Verified Farmer (Green Valley)', role: 'FARMER', location: 'Abia' },
  FARMER_NEW: { email: 'newfarmer@agrodirect.ng', password: 'Password123!', label: 'Unverified Farmer (New Dawn)', role: 'FARMER', location: 'Abia' },
  LOGISTICS: { email: 'logistics@agrodirect.ng', password: 'Password123!', label: 'Logistics Partner (SwiftAgro Express)', role: 'LOGISTICS_PROVIDER', location: 'Abia-Lagos' },
  ADMIN: { email: 'admin@agrodirect.ng', password: 'Password123!', label: 'Super Admin (Emeka Okonkwo)', role: 'SUPER_ADMIN', location: 'HQ' }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!getAuthToken()) {
        setUser(null);
        setFarm(null);
        setIsLoading(false);
        return;
      }
      const data = await api.auth.getMe();
      setUser(data.user);
      setFarm(data.farm);
    } catch (err) {
      console.error('Failed to fetch current user session', err);
      setAuthToken(null);
      setUser(null);
      setFarm(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setFarm(res.user.farm || null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; phone: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setFarm(null);
  };

  const switchPersona = async (personaKey: keyof typeof DEMO_PERSONAS) => {
    const p = DEMO_PERSONAS[personaKey];
    if (p) {
      await login({ email: p.email, password: p.password });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farm,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        switchPersona
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
