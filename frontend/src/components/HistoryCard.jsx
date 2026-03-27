import { Clock, Gamepad2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function HistoryCard({ history }) {
  if (!history || !history.length) {
    return (
      <div className="glass-panel p-12 text-center border border-field relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rotate-45 translate-x-16 -translate-y-16" />
        <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-10 text-dim" />
        <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed text-dim">
          System history empty.<br/>No recorded sequences found.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden border border-field shadow-sm">
      <div className="p-4 border-b border-field flex items-center justify-between bg-field/5">
        <h3 className="font-black text-main uppercase italic tracking-tight flex items-center gap-2">
          <Clock size={16} className="text-primary-500" /> Recorded Sequences
        </h3>
        <span className="text-[10px] text-dim font-black uppercase tracking-widest italic">{history.length} Logs</span>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-field">
              <th className="px-5 py-4 text-dim font-black text-[10px] uppercase tracking-widest">Timestamp</th>
              <th className="px-5 py-4 text-dim font-black text-[10px] uppercase tracking-widest">Stake</th>
              <th className="px-5 py-4 text-dim font-black text-[10px] uppercase tracking-widest text-center">Status</th>
              <th className="px-5 py-4 text-dim font-black text-[10px] uppercase tracking-widest text-right">Yield</th>
            </tr>
          </thead>
          <tbody>
            {history.map((g, i) => (
              <tr key={i} className="border-b border-field last:border-0 hover:bg-primary-500/5 transition-colors group">
                <td className="px-5 py-4 text-dim font-medium text-xs">
                  {new Date(g.date).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-5 py-4 text-main font-black italic tracking-tighter">₹{g.bet.toLocaleString()}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                    g.won
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                      : g.forfeited
                      ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}>
                    {g.won ? 'Win' : g.forfeited ? 'Abort' : 'Loss'}
                  </span>
                </td>
                <td className={`px-5 py-4 font-black tracking-widest text-right ${g.won ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'}`}>
                  {g.won ? (
                    <div className="flex items-center justify-end gap-1">
                      <ArrowUpRight size={12} />
                      ₹{g.payout.toLocaleString()}
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <ArrowDownRight size={12} />
                      -₹{g.bet.toLocaleString()}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden p-4 space-y-3">
        {history.map((g, i) => (
          <div key={i} className="glass-card p-4 space-y-4 border border-field relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-1 h-full bg-primary-500/10" />
             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-dim">
               <span className="flex items-center gap-1"><Clock size={10} /> {new Date(g.date).toLocaleDateString()}</span>
               <span className={g.won ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'}>
                {g.won ? 'Sequence Secured' : 'Sequence Broken'}
               </span>
             </div>
             
             <div className="flex justify-between items-end bg-field p-3 border border-field rounded-xs">
                <div>
                  <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-1">Injected</p>
                  <p className="text-sm font-black text-main italic tracking-tighter">₹{g.bet.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted font-black uppercase tracking-widest mb-1">Outcome</p>
                  <p className={`text-sm font-black italic tracking-tighter ${g.won ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500'}`}>
                    {g.won ? `+₹${g.payout.toLocaleString()}` : `-₹${g.bet.toLocaleString()}`}
                  </p>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
