import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, XCircle, Info, X } from 'lucide-react';

// Colours defined with opaque-enough values to read in BOTH themes
const STYLES = {
  error:   { Icon: XCircle,       bg: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.35)',  text: '#dc2626' },
  success: { Icon: CheckCircle2,  bg: 'rgba(22,197,94,0.15)',  border: 'rgba(22,197,94,0.35)',  text: '#15803d' },
  warning: { Icon: ShieldAlert,   bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.35)',  text: '#a16207' },
  info:    { Icon: Info,          bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', text: '#1d4ed8' },
};

// ── ToastContainer ──────────────────────────────────────────────────────────
export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col-reverse items-center gap-2 w-72 sm:w-80 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const { Icon, bg, border, text } = STYLES[t.type] || STYLES.info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="flex items-start gap-3 px-4 py-3 rounded-sm pointer-events-auto"
              style={{
                backgroundColor: 'var(--surface-bg)',
                border: `1px solid ${border}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <Icon size={17} className="shrink-0 mt-0.5" style={{ color: text }} />
              <span className="text-sm font-semibold flex-1 leading-snug" style={{ color: text }}>
                {t.message}
              </span>
              <button
                onClick={() => onDismiss(t.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: text }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── useToast hook ───────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return { toasts, toast, dismiss };
}
