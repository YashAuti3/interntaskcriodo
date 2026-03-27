import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/Axios';

const AuthContext = createContext(null);

const CURRENT_USER_KEY = 'betting_game_current_user';

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideNav, setHideNav] = useState(false);
  
  // Shared Game State: 'lobby' | 'betting' | 'playing' | 'gameover'
  const [gameStage, setGameStage] = useState('lobby');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          const res = await api.user.getProfile(session.email);
          if (res.data) {
            setUserState(res.data);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.data));
          } else {
            localStorage.removeItem(CURRENT_USER_KEY);
          }
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem(CURRENT_USER_KEY);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setUserState(res.data);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.data));
    return res.data;
  };

  const signup = async (username, email, password) => {
    const res = await api.auth.register(username, email, password);
    setUserState(res.data);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setGameStage('lobby');
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const res = await api.user.getProfile(user.email);
        if (res.data) {
          setUserState(res.data);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.data));
        }
      } catch (err) {
        console.error('User refresh failed:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, refreshUser, 
      loading, hideNav, setHideNav,
      gameStage, setGameStage
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
