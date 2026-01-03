import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    console.log("AuthContext updated:", userData, authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // ✅ AÑADE ESTO
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
