import { useState } from 'react';
import { 
  Wallet as WalletIcon, ArrowDownToLine, ArrowUpToLine, 
  CheckCircle2, QrCode, X, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Wallet({ user, onDeposit, onWithdraw, depositMsg, withdrawMsg, isWithdrawError }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(null);

  const handlePromptDeposit = (amount) => {
    setPendingAmount(amount);
    setShowQRModal(true);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    onWithdraw(Number(withdrawAmount));
    setWithdrawAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Balance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary-500/10 border border-primary-500/20">
              <WalletIcon className="w-5 h-5 text-primary-500" />
            </div>
            <p className="text-dim text-[10px] uppercase font-black tracking-widest">Available Credits</p>
          </div>
          <h2 className="text-3xl font-black text-main mt-1 tracking-tighter italic">₹{(user?.balance ?? 0).toLocaleString()}</h2>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
           <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-field border border-field">
              <ArrowDownToLine className="w-5 h-5 text-dim" />
            </div>
            <p className="text-dim text-[10px] uppercase font-black tracking-widest">Total Injected</p>
          </div>
          <h2 className="text-3xl font-black text-main mt-1 tracking-tighter italic opacity-80">₹{(user?.totalDeposited ?? 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit */}
        <div className="glass-panel p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownToLine className="text-primary-500 w-5 h-5" />
            <h3 className="text-lg font-black text-main uppercase italic tracking-tight">Fuel Injection</h3>
          </div>
          <p className="text-dim text-[10px] uppercase font-black tracking-widest mb-4 leading-relaxed">Select amount to generate secure QR payload.</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[500, 1000, 5000, 10000].map(amt => (
              <button 
                key={amt}
                onClick={() => handlePromptDeposit(amt)} 
                className="btn-secondary py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest"
              >
                +₹{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {depositMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400"
              >
                <CheckCircle2 size={14} />
                {depositMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Withdraw */}
        <div className="glass-panel p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpToLine className="text-primary-500 w-5 h-5" />
            <h3 className="text-lg font-black text-main uppercase italic tracking-tight">Extract Credits</h3>
          </div>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-muted uppercase tracking-widest mb-1.5">Withdrawal Amount (Min ₹100)</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-black italic">₹</span>
                <input
                  type="number"
                  min="100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full glass-input pl-8 font-black tracking-tighter"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full btn-secondary py-3 text-[10px] font-black uppercase tracking-widest">Submit Request</button>
            <AnimatePresence>
              {withdrawMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border ${
                    isWithdrawError 
                      ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
                      : 'bg-primary-500/10 border-primary-500/20 text-primary-600 dark:text-primary-400'
                  }`}
                >
                  {isWithdrawError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                  {withdrawMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-8 text-center space-y-6 relative"
            >
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-dim hover:text-main transition-colors"
              >
                <X size={20} />
              </button>
              
              <div>
                <h3 className="text-xl font-black text-main uppercase italic tracking-tight">Secure Deposit</h3>
                <p className="text-[10px] text-dim font-black uppercase tracking-widest mt-1">₹{pendingAmount?.toLocaleString()} Pending</p>
              </div>
              
              <div className="bg-white p-4 w-fit mx-auto rounded-xs shadow-xl">
                <QrCode className="w-44 h-44 text-slate-900" />
              </div>
              
              <p className="text-[10px] text-dim font-black uppercase tracking-widest leading-relaxed">
                Generic gateway for manual credit addition. Contact station admin after payout confirmation.
              </p>
              
              <button
                onClick={() => {
                  onDeposit(pendingAmount);
                  setShowQRModal(false);
                }}
                className="btn-primary w-full py-4 text-xs font-black uppercase tracking-widest"
              >
                I Have Paid
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
