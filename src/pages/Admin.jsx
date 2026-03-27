import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';
import { getUsers, updateUserById } from '../utils/localStorage';

export default function Admin() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();

  useEffect(() => {
    if (user?.email !== 'admin@cardblitz.com') navigate('/dashboard');
  }, [user, navigate]);

  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  const refresh = () => setUsers(getUsers());

  useEffect(() => { refresh(); }, []);

  const filtered = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

  const startEdit  = (u) => { setEditing(u.id); setEditVal(String(u.balance)); };
  const cancelEdit = ()  => { setEditing(null); setEditVal(''); };

  const saveEdit = (id) => {
    const newBal = Number(editVal);
    if (isNaN(newBal) || newBal < 0) { toast('Invalid balance value', 'error'); return; }
    updateUserById(id, { balance: newBal });
    toast('Balance updated ✅', 'success');
    cancelEdit();
    refresh();
  };

  const totalBalance = users.reduce((s, u) => s + u.balance, 0);

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: '👥',
      gradient: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/30',
      valueClass: 'text-blue-400',
    },
    {
      label: 'Total Balance',
      value: `₹${totalBalance.toLocaleString('en-IN')}`,
      icon: '💰',
      gradient: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
      valueClass: 'gradient-text-gold',
    },
    {
      label: 'Avg Balance',
      value: `₹${users.length ? Math.round(totalBalance / users.length).toLocaleString('en-IN') : 0}`,
      icon: '📊',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
      valueClass: 'text-emerald-400',
    },
  ];

  return (
    <div className="py-8 pb-16">
      <div className="max-w-6xl mx-auto px-5">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30
                              flex items-center justify-center text-xl">
                🛡
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-purple">Admin: {user?.email}</span>
              <span className="badge badge-blue">{users.length} Users</span>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={refresh}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(s => (
            <div
              key={s.label}
              className={`stat-card bg-gradient-to-br ${s.gradient} border ${s.border}
                          hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className={`font-display text-2xl font-bold ${s.valueClass} mb-0.5`}>{s.value}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-sm mb-5">
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/8">
                  {['#', 'Email', 'Balance', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500">
                      No users found
                    </td>
                  </tr>
                )}
                {filtered.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{idx + 1}</td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{u.email}</div>
                      {u.email === 'admin@cardblitz.com' && (
                        <span className="badge badge-purple mt-1 text-[0.6rem]">admin</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {editing === u.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            className="form-input w-28 !px-2.5 !py-1.5 text-sm"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter')  saveEdit(u.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button className="btn btn-success btn-sm !px-2.5" onClick={() => saveEdit(u.id)}>✓</button>
                          <button className="btn btn-ghost btn-sm !px-2.5"   onClick={cancelEdit}>✕</button>
                        </div>
                      ) : (
                        <span className="font-bold text-sm text-amber-600 dark:text-amber-300">
                          ₹{Number(u.balance).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="px-5 py-4">
                      {editing !== u.id && (
                        <button
                          className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => startEdit(u)}
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-600 text-right">
          Last refreshed: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
