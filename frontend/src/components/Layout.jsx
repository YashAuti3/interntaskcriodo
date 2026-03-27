import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Gamepad2, LogOut, Sun, Moon, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export function Layout() {
  const { user, logout, hideNav, gameStage, setGameStage } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isGamePage = location.pathname === '/game';
  const homePath = isAdmin ? '/admin' : '/game';

  // --- Play Button Logic ---
  const handlePlayAction = () => {
    if (!isGamePage) {
      navigate('/game');
    } else if (gameStage === 'lobby' || gameStage === 'gameover') {
      setGameStage('betting');
    }
  };

  const playButtonLabel = 
    gameStage === 'playing' ? 'Mission Active' : 
    gameStage === 'betting' ? (isGamePage ? 'Mission Active' : 'Return to Mission') : 
    'Play Game';
  
  const isPlayDisabled = isGamePage && (gameStage === 'playing' || gameStage === 'betting');

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300 selection:bg-primary-500/30">
      {!hideNav && (
        <nav className="glass-panel rounded-none border-x-0 border-t-0 p-3 sm:p-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-70">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link to={homePath} className="flex items-center gap-2 group shrink-0">
              <div className="p-1.5 bg-primary-600 rounded-xs group-hover:rotate-6 transition-transform shadow-lg shadow-primary-600/20">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-black text-main italic tracking-tighter uppercase hidden xs:block">
                BetMatch
              </span>
            </Link>
            
            {/* Primary Actions */}
            <div className="flex items-center gap-2 sm:gap-6">
              
              {!isAdmin && (
                <button
                  onClick={handlePlayAction}
                  disabled={isPlayDisabled}
                  className="btn-primary px-4 py-2 sm:px-6 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-primary-500/10"
                >
                  <Gamepad2 size={14} className="mr-2 hidden sm:inline" />
                  {playButtonLabel}
                </button>
              )}

              {isAdmin && location.pathname !== '/admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 text-dim hover:text-main transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <ShieldAlert size={16} />
                  <span className="hidden sm:inline">Admin Console</span>
                </Link>
              )}

              <div className="h-6 w-px bg-white/10 hidden sm:block" />

              {/* Theme & Profile */}
              <div className="flex items-center gap-1 sm:gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-white/10 rounded-xs transition-colors text-dim hover:text-primary-500 focus:outline-none"
                  title="Toggle Theme"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs font-black text-main italic leading-none">{user.username || 'OPERATOR'}</span>
                  <span className="text-[9px] text-primary-500 font-black uppercase tracking-widest mt-0.5">{user.role}</span>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="p-2 hover:bg-red-500/10 rounded-xs transition-colors text-dim hover:text-red-500 group focus:outline-none"
                  title="Terminate Session"
                >
                  <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={`flex-1 w-full mx-auto ${hideNav ? 'max-w-5xl overflow-hidden' : 'p-4 sm:p-6 lg:p-8 max-w-7xl'}`}>
        <Outlet />
      </main>
    </div>
  );
}
