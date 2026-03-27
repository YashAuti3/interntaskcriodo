import { Search, Edit2, Save, X, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserTable({ 
  users, 
  search, 
  setSearch, 
  editingEmail, 
  editBalance, 
  setEditBalance,
  confirmDeleteEmail,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onDeleteConfirm
}) {
  const filteredUsers = users.filter(u =>
    u.role !== 'admin' && (
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="glass-panel p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-black text-main uppercase italic tracking-tight">Active Accounts</h2>
        <div className="relative w-full sm:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim w-4 h-4 transition-colors group-focus-within:text-primary-500" />
          <input
            type="text"
            placeholder="Filter nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-10 py-2 text-sm font-bold uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-field">
              <th className="py-3 px-4 text-dim font-black text-[10px] uppercase tracking-widest">Operator</th>
              <th className="py-3 px-4 text-dim font-black text-[10px] uppercase tracking-widest">Contact</th>
              <th className="py-3 px-4 text-dim font-black text-[10px] uppercase tracking-widest text-center">Status</th>
              <th className="py-3 px-4 text-dim font-black text-[10px] uppercase tracking-widest">Injected</th>
              <th className="py-3 px-4 text-dim font-black text-[10px] uppercase tracking-widest">Credits</th>
              <th className="py-3 px-4 text-dim font-black text-[10px] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((u) => (
                <motion.tr
                  key={u.email}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-field hover:bg-primary-500/5 transition-colors group"
                >
                  <td className="py-3 px-4 text-sm text-main font-black italic uppercase">{u.username || '-'}</td>
                  <td className="py-3 px-4 text-sm text-dim font-medium">{u.email}</td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                      Sync
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-black text-green-600 dark:text-green-400">
                    ₹{(u.totalDeposited || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-black text-main">
                    {editingEmail === u.email ? (
                      <input
                        type="number"
                        value={editBalance}
                        onChange={(e) => setEditBalance(e.target.value)}
                        className="glass-input py-1 px-2 w-24 text-sm font-black"
                        autoFocus
                      />
                    ) : (
                      <span className="tracking-tighter italic">₹{(u.balance ?? 0).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <UserActions 
                      user={u} 
                      isEditing={editingEmail === u.email}
                      isConfirmingDelete={confirmDeleteEmail === u.email}
                      onEdit={() => onEdit(u)}
                      onSave={() => onSave(u.email)}
                      onCancel={onCancel}
                      onDelete={() => onDelete(u.email)}
                      onDeleteConfirm={() => onDeleteConfirm(u.email)}
                    />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        <AnimatePresence>
          {filteredUsers.map((u) => (
            <motion.div
              key={u.email}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-4 space-y-3 border border-field relative overflow-hidden group shadow-sm"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-primary-500/10" />
              <div className="flex justify-between items-start">
                <div className="max-w-[180px]">
                  <h3 className="font-black text-main text-base uppercase italic tracking-tight truncate">{u.username || 'Anonymous'}</h3>
                  <p className="text-xs text-dim font-medium truncate">{u.email}</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                  Sync
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-field bg-field/5 rounded-xs p-2">
                <div>
                  <p className="text-[9px] text-muted uppercase font-black tracking-widest mb-1">Lifetime</p>
                  <p className="text-sm font-black text-green-600 dark:text-green-400 tracking-tighter italic">₹{(u.totalDeposited || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted uppercase font-black tracking-widest mb-1">Current</p>
                  {editingEmail === u.email ? (
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="glass-input py-1 px-2 w-full text-sm font-black"
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm font-black text-main tracking-tighter italic">₹{(u.balance ?? 0).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <UserActions 
                  user={u} 
                  isEditing={editingEmail === u.email}
                  isConfirmingDelete={confirmDeleteEmail === u.email}
                  onEdit={() => onEdit(u)}
                  onSave={() => onSave(u.email)}
                  onCancel={onCancel}
                  onDelete={() => onDelete(u.email)}
                  onDeleteConfirm={() => onDeleteConfirm(u.email)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredUsers.length === 0 && (
        <div className="py-12 text-center text-dim font-black uppercase tracking-widest text-[10px]">
          No accounts found matching search criteria.
        </div>
      )}
    </div>
  );
}

function UserActions({ 
  user, isEditing, isConfirmingDelete, 
  onEdit, onSave, onCancel, onDelete, onDeleteConfirm 
}) {
  if (user.role === 'admin') return <span className="text-[9px] text-muted font-black italic uppercase tracking-widest">Immune</span>;

  if (isConfirmingDelete) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase flex items-center gap-1 tracking-widest">
           Purge?
        </span>
        <button onClick={onDeleteConfirm} className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors shadow-lg shadow-red-600/10">
          Confirm
        </button>
        <button onClick={onCancel} className="btn-secondary py-1 px-3 text-[10px] tracking-widest uppercase">
          Abort
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={onSave} className="p-2 text-green-600 dark:text-green-400 hover:bg-green-500/10 rounded-xs border border-green-500/20" title="Commit Changes">
          <Save size={16} />
        </button>
        <button onClick={onCancel} className="p-2 text-dim hover:bg-field rounded-xs border border-field" title="Discard">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={onEdit} className="p-2 text-dim hover:text-primary-500 hover:bg-primary-500/5 rounded-xs border border-field transition-all" title="Override Balance">
        <Edit2 size={16} />
      </button>
      <button onClick={onDelete} className="p-2 text-dim hover:text-red-500 hover:bg-red-500/5 rounded-xs border border-field transition-all" title="Purge Account">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
