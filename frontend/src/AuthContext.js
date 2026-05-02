import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // If we have a token but no user, we could theoretically fetch the user profile here.
    // For now, we store the user details in localStorage along with the token.
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        logout();
      }
    }
  }, [token]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await axios.post('http://localhost:8000/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = res.data;
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setIsAuthModalOpen(false);
  };

  const register = async (email, password, lat, lon) => {
    const res = await axios.post('http://localhost:8000/register', {
      email,
      password,
      lat,
      lon
    });

    const data = res.data;
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthModalOpen, setIsAuthModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
};
