import { useState, useEffect } from 'react';
import { api } from '../api/Axios';
import UserTable from '../components/UserTable';
import { Users, ShieldCheck, Database, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [search, setSearch] = useState('');
  const [confirmDeleteEmail, setConfirmDeleteEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.admin.listUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setConfirmDeleteEmail(null);
    setEditingEmail(user.email);
    setEditBalance(user.balance.toString());
  };

  const handleSave = async (email) => {
    try {
      await api.admin.updateUserBalance(email, Number(editBalance));
      await loadUsers();
      setEditingEmail(null);
    } catch (err) {
      console.error('Failed to update balance:', err);
    }
  };

  const handleDeleteConfirm = async (email) => {
    try {
      await api.admin.deleteUser(email);
      await loadUsers();
      setConfirmDeleteEmail(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Activity className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-[10px] text-dim font-black uppercase tracking-widest">Accessing Network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rotate-45 translate-x-12 -translate-y-12" />
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-500/10 border border-primary-500/20">
               <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
             </div>
             <div>
               <p className="text-[10px] text-dim font-black uppercase tracking-widest">Privileged Access</p>
               <h2 className="text-xl font-black text-main uppercase italic tracking-tighter">Root Console</h2>
             </div>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 border border-blue-500/20">
               <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
             </div>
             <div>
               <p className="text-[10px] text-dim font-black uppercase tracking-widest">Network Nodes</p>
               <h2 className="text-xl font-black text-main italic tracking-tighter">{users.length} Active Accounts</h2>
             </div>
          </div>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group hidden lg:block shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-500/10 border border-orange-500/20">
               <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
             </div>
             <div>
               <p className="text-[10px] text-dim font-black uppercase tracking-widest">Total Liquidity</p>
               <h2 className="text-xl font-black text-main italic tracking-tighter">
                ₹{users.reduce((acc, u) => acc + (u.balance || 0), 0).toLocaleString()}
               </h2>
             </div>
          </div>
        </div>
      </div>

      {/* Main User Table Component */}
      <UserTable 
        users={users}
        search={search}
        setSearch={setSearch}
        editingEmail={editingEmail}
        editBalance={editBalance}
        setEditBalance={setEditBalance}
        confirmDeleteEmail={confirmDeleteEmail}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={() => { setEditingEmail(null); setConfirmDeleteEmail(null); }}
        onDelete={(email) => setConfirmDeleteEmail(email)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
