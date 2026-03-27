import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../utils/localStorage';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validateEmail(v)       { if (!v.trim()) return 'Required'; if (!EMAIL_RE.test(v)) return 'Invalid email address'; return ''; }
function validatePassword(v)    { if (!v) return 'Required'; if (v.length < 6) return 'Min. 6 characters'; if (!/[A-Z]/.test(v)) return 'Include one uppercase letter'; if (!/[0-9]/.test(v)) return 'Include one number'; return ''; }
function validateConfirm(v, pw) { if (!v) return 'Required'; if (v !== pw) return 'Passwords do not match'; return ''; }

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak',        color: '#ef4444', bars: 1 };
  if (s === 2) return { score: s, label: 'Fair',        color: '#f97316', bars: 2 };
  if (s === 3) return { score: s, label: 'Good',        color: '#eab308', bars: 3 };
  if (s === 4) return { score: s, label: 'Strong',      color: '#22c55e', bars: 4 };
  return           { score: s, label: 'Very Strong',  color: '#10b981', bars: 5 };
}

export default function Signup() {
  const { login }  = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCf,  setShowCf]  = useState(false);

  const strength = useMemo(() => getStrength(form.password), [form.password]);

  const validators = {
    email:    (v) => validateEmail(v),
    password: (v) => validatePassword(v),
    confirm:  (v) => validateConfirm(v, form.password),
  };

  const change = (k) => (ev) => {
    const v = ev.target.value;
    setForm(f => ({ ...f, [k]: v }));
    if (touched[k]) setErrors(e => ({ ...e, [k]: validators[k](v), general: '' }));
    if (k === 'password' && touched.confirm) setErrors(e => ({ ...e, confirm: validateConfirm(form.confirm, v) }));
  };
  const blur = (k) => () => {
    setTouched(t => ({ ...t, [k]: true }));
    setErrors(e => ({ ...e, [k]: validators[k](form[k]) }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setTouched({ email: true, password: true, confirm: true });
    const e = { email: validateEmail(form.email), password: validatePassword(form.password), confirm: validateConfirm(form.confirm, form.password) };
    if (e.email || e.password || e.confirm) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const user = createUser({ email: form.email.trim().toLowerCase(), password: form.password });
    if (!user) {
      setErrors({ general: 'An account with this email already exists.' });
      toast('Account already exists.', 'error');
      setLoading(false); return;
    }
    login(user);
    toast('Account created! ₹1000 added.', 'success', 4000);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">Create account</h1>
          <p className="text-sm text-slate-500">
            Get <span className="font-semibold text-slate-700 dark:text-slate-300">₹1,000</span> free on signup
          </p>
        </div>

        <div className="card p-6">
          {errors.general && (
            <div className="mb-4 px-3 py-2.5 text-sm text-red-600 dark:text-red-400
                            border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
                 style={{ borderRadius: 4 }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="signup-email">Email</label>
              <div className="relative">
                <input id="signup-email" type="email"
                  className={`form-input ${fs('email') === 'error' ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email} onChange={change('email')} onBlur={blur('email')} autoComplete="email" />
                <FieldIcon state={fs('email')} />
              </div>
              {touched.email && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="relative">
                <input id="signup-password" type={showPw ? 'text' : 'password'}
                  className={`form-input pr-12 ${fs('password') === 'error' ? 'error' : ''}`}
                  placeholder="Min. 6 chars"
                  value={form.password} onChange={change('password')} onBlur={blur('password')} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex-1 h-0.5 transition-all duration-300"
                           style={{ background: i <= strength.bars ? strength.color : 'rgba(148,163,184,0.2)' }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}

              {touched.password && errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}

              {/* Requirements */}
              {touched.password && (
                <ul className="mt-2 flex flex-col gap-1">
                  {[
                    { ok: form.password.length >= 6, text: '6+ characters' },
                    { ok: /[A-Z]/.test(form.password), text: 'One uppercase' },
                    { ok: /[0-9]/.test(form.password), text: 'One number' },
                  ].map(r => (
                    <li key={r.text} className={`flex items-center gap-1.5 text-xs ${r.ok ? 'text-emerald-500' : 'text-slate-400'}`}>
                      <span>{r.ok ? '✓' : '○'}</span>{r.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
              <div className="relative">
                <input id="signup-confirm" type={showCf ? 'text' : 'password'}
                  className={`form-input pr-12 ${fs('confirm') === 'error' ? 'error' : ''}`}
                  placeholder="Repeat password"
                  value={form.confirm} onChange={change('confirm')} onBlur={blur('confirm')} autoComplete="new-password" />
                <button type="button" onClick={() => setShowCf(s => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs">
                  {showCf ? 'Hide' : 'Show'}
                </button>
              </div>
              {touched.confirm && errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
              {touched.confirm && !errors.confirm && <p className="mt-1 text-xs text-emerald-500">Passwords match</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ paddingTop:'0.65rem', paddingBottom:'0.65rem' }} disabled={loading}>
              {loading ? <><Spinner /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <p className="mt-4 text-center text-sm text-slate-500">
            Have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Perks */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {['₹1,000 free', 'Win 3× your bet', 'Instant funds'].map(p => (
            <div key={p} className="px-2 py-2 border border-slate-200 dark:border-slate-800" style={{ borderRadius: 4 }}>
              {p}
            </div>
          ))}
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
