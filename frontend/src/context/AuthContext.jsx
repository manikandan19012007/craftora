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

  // Restore user session on application mount
  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('craftora_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Keep local mock session alive in demo mode
          if (!user) logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    // 1. First attempt authenticating with MySQL backend API to get standard signed JWT token
    try {
      const res = await loginUser({ email, password });
      if (res.token && res.user) {
        localStorage.setItem('craftora_token', res.token);
        localStorage.setItem('craftora_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (apiErr) {
      console.warn("Backend auth attempt notice:", apiErr.message);
    }

    // 2. Fallback to pre-configured demo user accounts if backend is offline or for demo credentials
    if (email === 'admin@craftora.com' && password === 'password123') {
      const adminUser = {
        id: 1,
        name: 'Craftora Administrator',
        email: 'admin@craftora.com',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        stats: { orders: 24, wishlist: 5, reviews: 18 }
      };
      localStorage.setItem('craftora_token', 'demo_admin_token');
      localStorage.setItem('craftora_user', JSON.stringify(adminUser));
      setToken('demo_admin_token');
      setUser(adminUser);
      return adminUser;
    }

    if (email === 'artisan@craftora.com' && password === 'password123') {
      const artisanUser = {
        id: 10,
        name: 'Rajesh Kumar',
        email: 'artisan@craftora.com',
        role: 'SELLER',
        craft_name: 'Studio Jaipur Pottery',
        craft_category: 'Pottery & Ceramics',
        location: 'Jaipur, Rajasthan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        stats: { orders: 42, wishlist: 0, reviews: 68 }
      };
      localStorage.setItem('craftora_token', 'demo_artisan_token');
      localStorage.setItem('craftora_user', JSON.stringify(artisanUser));
      setToken('demo_artisan_token');
      setUser(artisanUser);
      return artisanUser;
    }

    if (email === 'ananya@example.com' && password === 'password123') {
      const patronUser = {
        id: 2,
        name: 'Ananya Sharma',
        email: 'ananya@example.com',
        role: 'USER',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        stats: { orders: 3, wishlist: 7, reviews: 2 }
      };
      localStorage.setItem('craftora_token', 'demo_patron_token');
      localStorage.setItem('craftora_user', JSON.stringify(patronUser));
      setToken('demo_patron_token');
      setUser(patronUser);
      return patronUser;
    }

    throw new Error('Invalid email or password');
  };

  const register = async (userData) => {
    try {
      return await registerUser(userData);
    } catch (err) {
      // Fallback register for instant demo
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'USER',
        craft_name: userData.craft_name || null,
        craft_category: userData.craft_category || null,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      };
      localStorage.setItem('craftora_token', `demo_user_${Date.now()}`);
      localStorage.setItem('craftora_user', JSON.stringify(newUser));
      setToken(`demo_user_${Date.now()}`);
      setUser(newUser);
      return { user: newUser };
    }
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

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER' || user?.role === 'ARTISAN';

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