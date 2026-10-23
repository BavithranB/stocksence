import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify session on mount
  const verifySession = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getMe();
      setUser(data.data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('ss_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const register = async (formData) => {
    setError(null);
    const { data } = await authAPI.register(formData);
    if (data.data.token) {
      localStorage.setItem('ss_token', data.data.token);
    }
    setUser(data.data.user);
    return data;
  };

  const login = async (formData) => {
    setError(null);
    const { data } = await authAPI.login(formData);
    if (data.data.token) {
      localStorage.setItem('ss_token', data.data.token);
    }
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('ss_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export default AuthContext;
