import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  currency: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (idToken: string) => {
    const data = await authApi.googleLogin(idToken);
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const updateUser = async (updatedFields: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(updatedFields);
      setUser(updatedUser);
    } catch (e) {
      console.error('Failed to update profile', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
