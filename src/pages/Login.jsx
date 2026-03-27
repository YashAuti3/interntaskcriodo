import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserByEmail } from '../utils/localStorage';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validateEmail(v)    { if (!v.trim()) return 'Required'; if (!EMAIL_RE.test(v)) return 'Invalid email address'; return ''; }
function validatePassword(v) { if (!v) return 'Required'; if (v.length < 6) return 'At least 6 characters'; return ''; }

export default function Login() {
  const { login }  = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const validators = { email: validateEmail, password: validatePassword };

  const change = (k) => (ev) => {
    const v = ev.target.value;
    setForm(f => ({ ...f, [k]: v }));
    if (touched[k]) setErrors(e => ({ ...e, [k]: validators[k](v), general: '' }));
  };
  const blur = (k) => () => {
    setTouched(t => ({ ...t, [k]: true }));
    setErrors(e => ({ ...e, [k]: validators[k](form[k]) }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setTouched({ email: true, password: true });
    const e = { email: validateEmail(form.email), password: validatePassword(form.password) };
    if (e.email || e.password) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const user = getUserByEmail(form.email.trim().toLowerCase());
    if (!user || user.password !== form.password) {
      setErrors({ general: 'Invalid email or password.' });
      setLoading(false);
      toast('Invalid credentials.', 'error');
      return;
    }
    login(user);
    toast(`Welcome back!`, 'success');
    navigate('/dashboard');
  };

  const fs = (k) => !touched[k] ? 'idle' : errors[k] ? 'error' : 'ok';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8">
          <div className="w-8 h-8 bg-indigo-600 text-white text-xs font-black flex items-center justify-center mb-5"
               style={{ borderRadius: 3 }}>
            CB
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">Sign in</h1>
          <p className="text-sm text-slate-500">
            Continue to <span className="font-semibold text-slate-700 dark:text-slate-300">CardBlitz</span>
          </p>
        </div>

        {/* Card */}
        <div className="card p-6">
          {errors.general && (
            <div className="mb-4 px-3 py-2.5 text-sm text-red-600 dark:text-red-400
                            border border-red-200 dark:border-red-500/30
                            bg-red-50 dark:bg-red-500/10"
                 style={{ borderRadius: 4 }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="login-email">Email</label>
              <div className="relative">
                <input
                  id="login-email" type="email"
                  className={`form-input ${fs('email') === 'error' ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email} onChange={change('email')} onBlur={blur('email')}
                  autoComplete="email"
                />
                <FieldIcon state={fs('email')} />
              </div>
              {touched.email && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="relative">
                <input
                  id="login-password" type={showPw ? 'text' : 'password'}
                  className={`form-input pr-9 ${fs('password') === 'error' ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={form.password} onChange={change('password')} onBlur={blur('password')}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                        aria-label="Toggle password">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {touched.password && errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ paddingTop:'0.65rem', paddingBottom:'0.65rem' }} disabled={loading}>
              {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

function FieldIcon({ state }) {
  if (state === 'idle') return null;
  return (
    <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none
      ${state === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}>
      {state === 'ok' ? '✓' : '✕'}
    </span>
  );
}
function Spinner() {
  return <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
