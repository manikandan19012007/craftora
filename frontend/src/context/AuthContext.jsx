import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('craftora_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(localStorage.getItem('craftora_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore and validate session on application mount
  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('craftora_user', JSON.stringify(res.user));
          } else {
            // Token is no longer valid — clear session
            logout();
          }
        })
        .catch(() => {
          // Backend unreachable or token invalid — clear session
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.token && res.user) {
      localStorage.setItem('craftora_token', res.token);
      localStorage.setItem('craftora_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Login failed: unexpected response from server.');
  };

  const register = async (userData) => {
    // Real backend registration only — no demo fallback
    return await registerUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('craftora_token');
    localStorage.removeItem('craftora_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('craftora_user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin         = user?.role === 'ADMIN';
  const isSeller        = user?.role === 'SELLER' || user?.role === 'ARTISAN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      isSeller,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};