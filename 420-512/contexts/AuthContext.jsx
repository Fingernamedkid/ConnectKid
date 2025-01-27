import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const response = await axios.post('YOUR_API_URL/login', { username, password });
      const { token } = response.data;

      await AsyncStorage.setItem('token', token);
      setUser({ username, token });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const loadUserData = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      // You can also decode the token to extract user info if needed
      setUser({ token });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
