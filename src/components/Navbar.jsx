import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/game',      label: 'Play' },
  { path: '/wallet',    label: 'Wallet' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, navbarHidden } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); setMenuOpen(false); navigate('/login'); };
  const closeMenu = () => setMenuOpen(false);

  if (navbarHidden) return null;

  const linkBase = 'px-3 py-1.5 text-sm font-medium transition-colors duration-150';
  const linkActive = 'text-indigo-500 border-b-2 border-indigo-500';
  const linkIdle = 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border-b-2 border-transparent';

  return (
    <>
      <nav className="sticky top-0 z-50 h-14 flex items-center
                      border-b border-slate-200 dark:border-slate-800
                      bg-white/95 dark:bg-[#0d0d14]/95 backdrop-blur-sm">
        <div className="w-full max-w-6xl mx-auto px-5 flex items-center justify-between gap-4">

          {/* Logo — no emoji, just text mark */}
          <NavLink
            to={user ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 outline-none"
            onClick={closeMenu}
          >
            {/* Monogram */}
            <span className="w-7 h-7 bg-indigo-600 text-white text-xs font-black flex items-center justify-center"
                  style={{ borderRadius: 3 }}>
              CB
            </span>
            <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-slate-50">
              CardBlitz
            </span>
          </NavLink>

          {/* Desktop nav */}
          {user && (
            <div className="hidden sm:flex items-center h-14">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
                >
                  {link.label}
                </NavLink>
              ))}
              {user.email === 'admin@cardblitz.com' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
                >
                  Admin
                </NavLink>
              )}
            </div>
          )}

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* Balance */}
            {user && (
              <div className="hidden sm:flex items-center gap-1 px-3 py-1.5
                              border border-amber-400/40 bg-amber-500/8
                              text-sm font-bold text-amber-600 dark:text-amber-400"
                   style={{ borderRadius: 4 }}>
                ₹{Number(user.balance).toLocaleString('en-IN')}
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400
                         hover:text-slate-900 dark:hover:text-slate-100
                         hover:bg-slate-100 dark:hover:bg-slate-800
                         transition-colors cursor-pointer outline-none"
              style={{ borderRadius: 4 }}
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <SunIcon />
                : <MoonIcon />
              }
            </button>

            {/* Sign out / Login */}
            {user ? (
              <button className="hidden sm:flex btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            ) : (
              <NavLink to="/login" className="btn btn-primary btn-sm hidden sm:inline-flex">
                Login
              </NavLink>
            )}

            {/* Mobile hamburger */}
            <button
              className="sm:hidden w-8 h-8 flex items-center justify-center
                         text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                         transition-colors cursor-pointer outline-none"
              style={{ borderRadius: 4 }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`sm:hidden fixed inset-0 top-14 z-40 flex flex-col
                       border-t border-slate-200 dark:border-slate-800
                       bg-white dark:bg-[#0d0d14]
                       transition-transform duration-250 ease-in-out
                       ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 flex flex-col gap-1">
          {user ? (
            <>
              <div className="py-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-0.5">Signed in as</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user.email}</div>
                <div className="mt-2 inline-flex items-center px-2.5 py-1 border border-amber-400/40 bg-amber-500/8
                                text-sm font-bold text-amber-600 dark:text-amber-400"
                     style={{ borderRadius: 3 }}>
                  ₹{Number(user.balance).toLocaleString('en-IN')}
                </div>
              </div>
              {[...NAV_LINKS, ...(user.email === 'admin@cardblitz.com' ? [{ path: '/admin', label: 'Admin' }] : [])].map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-3 text-sm font-medium border-l-2 transition-colors
                     ${isActive
                       ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                       : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                     }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button className="btn btn-ghost btn-full" onClick={handleLogout}>Sign Out</button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login"  className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400" onClick={closeMenu}>Login</NavLink>
              <NavLink to="/signup" className="px-3 py-3 text-sm text-slate-600 dark:text-slate-400" onClick={closeMenu}>Sign Up</NavLink>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Icon components ── */
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function HamburgerIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
        : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
      }
    </svg>
  );
}
