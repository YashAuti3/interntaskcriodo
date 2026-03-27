import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession, saveSession, clearSession, getUserByEmail } from '../utils/localStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const login = (userData) => {
    saveSession(userData);
    setUser(userData);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  // Refresh user from localStorage (e.g. after balance change)
  const refreshUser = (email) => {
    const updated = getUserByEmail(email || user?.email);
    if (updated) {
      saveSession(updated);
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
