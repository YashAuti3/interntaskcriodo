import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let toastId = 0;

const STYLES = {
  success: { bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.4)', color: '#34d399', label: 'Success' },
  error:   { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.4)', color: '#f87171', label: 'Error'   },
  warning: { bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.4)', color: '#fbbf24', label: 'Warning' },
  info:    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.4)', color: '#818cf8', label: 'Info'   },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none w-72 max-w-[calc(100vw-2.5rem)]">
        {toasts.map(t => {
          const s = STYLES[t.type] || STYLES.info;
          return (
            <div
              key={t.id}
              className="toast pointer-events-auto cursor-pointer select-none"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: 4,
                padding: '10px 14px',
              }}
              onClick={() => remove(t.id)}
              role="alert"
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: s.color }}>
                {s.label}
              </div>
              <div className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                {t.message}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx.addToast;
};
