// app/hooks/useAuth.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, createContext, useContext, useEffect } from 'react';

const API_URL = "http://127.0.0.1:8000/api/auth";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/login`, data);
      await AsyncStorage.setItem("authToken", res.data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/register`, data);
      await AsyncStorage.setItem("authToken", res.data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        await axios.post(
          `${API_URL}/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await AsyncStorage.clear();
      setUser(null);
    }
  };

  const getUser = async () => {
    const data = await AsyncStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getUser,
  };

  return (
    <AuthContext.Provider value={value}>
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