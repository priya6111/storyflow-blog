import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('storyflow_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);

  // Verify token on mount
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.auth.getCurrentUser();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.auth.login({ identifier, password });
    if (res.success && res.token) {
      localStorage.setItem('storyflow_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (authSuccessCallback) {
        authSuccessCallback(res.user);
        setAuthSuccessCallback(null);
      }
      setIsAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('storyflow_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (authSuccessCallback) {
        authSuccessCallback(res.user);
        setAuthSuccessCallback(null);
      }
      setIsAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('storyflow_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const openAuthModal = (mode = 'login', callback = null) => {
    setAuthModalMode(mode);
    setAuthSuccessCallback(() => callback);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
