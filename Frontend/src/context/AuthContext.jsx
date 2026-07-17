import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      toast.error('Session restore failed');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

const login = async (email, password) => {
    const response = await userService.login(email, password);
    const token = response.accessToken;
    const user = response.user;
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    toast.success('Login successful');
    return user;
  };

  const register = async (userData) => {
    const response = await userService.register(userData);
    toast.success('OTP sent!');
    return response.user;
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (e) {
      // ignore logout errors
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedData) => {
    const updated = {
      ...user,
      ...updatedData
    };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
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
