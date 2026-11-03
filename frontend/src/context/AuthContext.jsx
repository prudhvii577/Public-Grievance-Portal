import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pgrp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pgrp_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('pgrp_token');
      if (storedToken) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
          localStorage.setItem('pgrp_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: jwtToken, user: userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('pgrp_token', jwtToken);
    localStorage.setItem('pgrp_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { token: jwtToken, user: registeredUser } = res.data;
    setToken(jwtToken);
    setUser(registeredUser);
    localStorage.setItem('pgrp_token', jwtToken);
    localStorage.setItem('pgrp_user', JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pgrp_token');
    localStorage.removeItem('pgrp_user');
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pgrp_user', JSON.stringify(updatedUser));
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'officer':
        return '/officer/dashboard';
      case 'citizen':
      default:
        return '/citizen/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfileState,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
