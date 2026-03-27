import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Gamepad2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/game');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="glass-card p-8 border border-field shadow-2xl">
          <div className="text-center space-y-6 mb-8">
            <motion.div
              initial={{ rotate: -12, scale: 0 }}
              animate={{ rotate: 12, scale: 1 }}
              className="w-16 h-16 mx-auto bg-primary-600 rounded-xs flex items-center justify-center shadow-lg shadow-primary-600/20"
            >
              <Gamepad2 className="w-8 h-8 text-white -rotate-12" />
            </motion.div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-main uppercase italic tracking-tight">BetMatch Access</h1>
              <p className="text-[10px] text-dim uppercase font-black tracking-widest italic">Sync with the network</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <AlertCircle size={14} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-500 transition-colors w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                required
                className="w-full glass-input pl-10 text-xs font-black uppercase tracking-widest"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-500 transition-colors w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                required
                className="w-full glass-input pl-10 pr-10 text-xs font-black tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-xs font-black uppercase tracking-widest"
            >
              {loading ? 'Decrypting...' : 'Initiate Session'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-field text-center">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">
              New to BetMatch?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-500 hover:text-primary-400 ml-1 transition-colors">
                Register Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
