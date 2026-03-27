import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Gamepad2, AlertCircle, User, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const getPasswordStrengths = (pw) => ({
  length:    pw.length >= 6,
  uppercase: /[A-Z]/.test(pw),
  lowercase: /[a-z]/.test(pw),
  number:    /[0-9]/.test(pw),
  special:   /[^a-zA-Z0-9]/.test(pw),
});

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pwStrengths = getPasswordStrengths(password);
  const allStrong = Object.values(pwStrengths).every(Boolean);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!EMAIL_REGEX.test(email)) {
      setError('Invalid email format (e.g., user@domain.com)');
      return;
    }
    if (!allStrong) {
      setError('Security clearance requirements not met.');
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password);
      navigate('/game');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-y-auto">
      {/* Decorative Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-125 h-125 bg-primary-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 py-8"
      >
        <div className="glass-card p-8 border border-field relative shadow-2xl">
          <div className="text-center space-y-6 mb-8">
            <motion.div
              initial={{ rotate: 12, scale: 0 }}
              animate={{ rotate: -12, scale: 1 }}
              className="w-16 h-16 mx-auto bg-primary-600 rounded-xs flex items-center justify-center shadow-lg shadow-primary-600/20"
            >
              <Gamepad2 className="w-8 h-8 text-white rotate-12" />
            </motion.div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-main uppercase italic tracking-tight">Create Identity</h1>
              <p className="text-[10px] text-dim uppercase font-black tracking-widest italic">Join the BetMatch Network</p>
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
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary-500 transition-colors w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="USERNAME"
                required
                className="w-full glass-input pl-10 text-xs font-black uppercase tracking-widest"
              />
            </div>

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
                placeholder="NEW PASSWORD"
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

            {/* Password strength checklist */}
            {password.length > 0 && (
              <div className="bg-field rounded-xs p-4 space-y-2 border border-field">
                <p className="text-[9px] text-dim uppercase font-black tracking-widest mb-1.5 flex justify-between">
                  <span>Security Protocol</span>
                  <span className={allStrong ? 'text-primary-600 dark:text-primary-500' : 'text-muted'}>
                    {allStrong ? 'READY' : 'INCOMPLETE'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    { key: 'length',    label: '6+ Сhars' },
                    { key: 'uppercase', label: 'Caps' },
                    { key: 'lowercase', label: 'Small' },
                    { key: 'number',    label: 'Num' },
                    { key: 'special',   label: 'Symbol' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5">
                      {pwStrengths[key]
                        ? <CheckCircle2 size={10} className="text-green-500" />
                        : <XCircle size={10} className="text-red-500/30" />}
                      <span className={`text-[10px] uppercase font-black tracking-tight ${pwStrengths[key] ? 'text-main' : 'text-muted'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/10"
            >
              {loading ? 'Initializing...' : 'Join the Network'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-field text-center">
            <p className="text-[10px] text-dim font-black uppercase tracking-widest">
              Identity exists?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-500 hover:text-primary-400 ml-1 transition-colors">
                Return to Access
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
