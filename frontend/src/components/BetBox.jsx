import { motion } from 'framer-motion';
import { Coins, ArrowRight } from 'lucide-react';

export default function BetBox({ betAmount, setBetAmount, error, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 sm:p-8 text-center max-w-[90vw] sm:max-w-md mx-auto relative overflow-hidden shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 -rotate-45 translate-x-12 -translate-y-12" />
      
      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4 sm:mb-5 rounded-xs">
        <Coins className="text-primary-500 w-6 h-6 sm:w-7 sm:h-7" />
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-main mb-1 sm:mb-2 tracking-tight uppercase italic">Place Your Injection</h2>
      <p className="text-dim mb-6 text-[10px] sm:text-xs uppercase font-black tracking-widest leading-relaxed">Match 5 pairs to 3x your stake.<br/>Min ₹10 · Max ₹5,000</p>

      <form onSubmit={onSubmit} className="space-y-4 relative z-10">
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 dark:text-primary-400 font-black text-xl italic group-focus-within:scale-110 transition-transform">₹</span>
          <input
            type="number"
            min="10"
            max="5000"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="0"
            className="w-full glass-input pl-10 text-xl sm:text-2xl font-black text-center py-3 sm:py-4 tracking-tighter"
            required
            autoFocus
          />
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">{error}</p>}
        <button type="submit" className="w-full btn-primary py-3 sm:py-4 text-sm sm:text-base font-black uppercase tracking-widest flex justify-center items-center gap-2 group">
          Initiate Matrix <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </motion.div>
  );
}
