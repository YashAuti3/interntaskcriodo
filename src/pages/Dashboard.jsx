import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { getHistory } from '../utils/localStorage';

export default function Dashboard() {
  const { user }  = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => { if (user) setHistory(getHistory(user.email)); }, [user]);

  const wins    = history.filter(h => h.result === 'win').length;
  const total   = history.length;
  const earned  = history.filter(h => h.result === 'win').reduce((s, h) => s + (h.reward || 0), 0);
  const spent   = history.reduce((s, h) => s + (h.bet || 0), 0);
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const stats = [
    { label: 'Balance',      value: `₹${Number(user?.balance || 0).toLocaleString('en-IN')}`, sub: 'Available',       accent: '#d97706', border: 'rgba(217,119,6,0.35)'    },
    { label: 'Games Won',    value: wins,                                                       sub: `of ${total}`,     accent: '#059669', border: 'rgba(5,150,105,0.35)'   },
    { label: 'Total Earned', value: `₹${Number(earned).toLocaleString('en-IN')}`,               sub: 'from wins',       accent: '#6366f1', border: 'rgba(99,102,241,0.35)'  },
    { label: 'Win Rate',     value: `${winRate}%`,                                              sub: `₹${Number(spent).toLocaleString('en-IN')} bet`, accent: '#8b5cf6', border: 'rgba(139,92,246,0.35)' },
  ];

  return (
    <div className="py-8 pb-16">
      <div className="max-w-6xl mx-auto px-5">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Live session</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">
            Welcome back, <span className="gradient-text">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-sm text-slate-500">Ready to play?</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map(s => (
            <div
              key={s.label}
              className="stat-card"
              style={{ borderLeftWidth: 3, borderLeftColor: s.accent, borderLeftStyle: 'solid' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-2"
                   style={{ color: '#64748b' }}>
                {s.label}
              </div>
              <div className="text-xl font-bold font-display" style={{ color: s.accent }}>
                {s.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-10">
          <Link to="/game"   className="btn btn-primary btn-lg">Play Now</Link>
          <Link to="/wallet" className="btn btn-gold btn-lg">Add Funds</Link>
        </div>

        {/* History */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recent Games
            </h2>
            {history.length > 0 && (
              <span className="badge badge-purple">{history.length} games</span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <div className="text-4xl mb-3" style={{ fontFamily: 'serif' }}>♠</div>
              <p className="text-sm mb-4">No games yet.</p>
              <Link to="/game" className="btn btn-primary btn-sm">Play your first game</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5
                                        hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold
                                    border ${h.result === 'win'
                                      ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                      : 'border-red-500/50 text-red-500 bg-red-50 dark:bg-red-500/10'}`}
                         style={{ borderRadius: 3 }}>
                      {h.result === 'win' ? 'W' : 'L'}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${h.result === 'win' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {h.result === 'win' ? 'Victory' : 'Defeat'}
                      </div>
                      <div className="text-xs text-slate-400">{new Date(h.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${h.result === 'win' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {h.result === 'win' ? `+₹${h.reward}` : `-₹${h.bet}`}
                    </div>
                    <div className="text-xs text-slate-400">bet ₹{h.bet}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
