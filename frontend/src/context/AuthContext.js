import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = (newToken) => {
    console.log("Storing new token:", newToken);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/home');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  useEffect(() => {
    if (!token && window.location.pathname !== '/signup') {
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};