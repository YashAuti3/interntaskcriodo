import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/ToastContext';
import { addBalance, deductBalance, getUserByEmail } from '../utils/localStorage';

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function Wallet() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [tab,     setTab]     = useState('add');
  const [amount,  setAmount]  = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showQr,  setShowQr]  = useState(false);

  const fresh   = getUserByEmail(user?.email);
  const balance = fresh?.balance ?? user?.balance ?? 0;

  const initiateAdd = () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return; }
    if (amt > 100000) { setError('Max ₹1,00,000 per transaction'); return; }
    setShowQr(true);
  };

  const handleTransaction = async () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setError('Enter a valid amount'); return; }
    if (amt > 100000) { setError('Max ₹1,00,000 per transaction'); return; }
    if (tab === 'withdraw' && amt > balance) { setError('Insufficient balance'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (tab === 'add') {
      addBalance(user.email, amt);
      toast(`₹${amt.toLocaleString('en-IN')} added.`, 'success');
      setShowQr(false);
    } else {
      deductBalance(user.email, amt);
      toast(`₹${amt.toLocaleString('en-IN')} withdrawn.`, 'info');
    }
    refreshUser(user.email);
    setAmount(''); setError(''); setLoading(false);
  };

  const newBal     = tab === 'add' ? balance + Number(amount) : balance - Number(amount);
  const showPreview = amount && !isNaN(Number(amount)) && Number(amount) > 0;

  return (
    <div className="py-8 pb-16">
      <div className="max-w-lg mx-auto px-5">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">Wallet</h1>
          <p className="text-sm text-slate-500">Manage your funds</p>
        </div>

        {/* Balance card */}
        <div className="card mb-5 p-6 relative overflow-hidden"
             style={{ borderLeftWidth: 3, borderLeftColor: '#d97706' }}>
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Current Balance
          </div>
          <div className="font-display text-4xl font-extrabold gradient-text-gold mb-1">
            ₹{Number(balance).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500">{user?.email}</div>
        </div>

        {/* Tabs */}
        <div className="flex border border-slate-200 dark:border-slate-800 mb-5 overflow-hidden"
             style={{ borderRadius: 4 }}>
          {['add', 'withdraw'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setAmount(''); setError(''); setShowQr(false); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all cursor-pointer outline-none
                ${tab === t
                  ? t === 'add'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-red-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              {t === 'add' ? 'Add Money' : 'Withdraw'}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="card p-5 mb-4">
          {!showQr || tab !== 'add' ? (
            <>
              {/* Quick amounts */}
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Quick Select</div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map(q => (
                    <button
                      key={q}
                      className={`btn btn-sm ${amount === String(q) ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => { setAmount(String(q)); setError(''); }}
                    >
                      ₹{q.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="mb-4">
                <label className="form-label">Custom amount (₹)</label>
                <input
                  id="wallet-amount" type="number" min="1"
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="Enter amount…"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && (tab === 'add' ? initiateAdd() : handleTransaction())}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="mb-4 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700"
                     style={{ borderRadius: 4 }}>
                  <span className="text-slate-500">{tab === 'add' ? 'New balance:' : 'Remaining:'}</span>{' '}
                  <strong className={newBal >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}>
                    ₹{newBal.toLocaleString('en-IN')}
                  </strong>
                </div>
              )}

              <button
                id="wallet-submit-btn"
                className={`btn btn-lg btn-full ${tab === 'add' ? 'btn-success' : 'btn-danger'}`}
                onClick={tab === 'add' ? initiateAdd : handleTransaction}
                disabled={loading}
              >
                {loading ? <><Spinner /> Processing…</> : tab === 'add' ? 'Proceed to Pay' : 'Withdraw'}
              </button>
            </>
          ) : (
            /* QR view */
            <div className="text-center py-2">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Pay ₹{Number(amount).toLocaleString('en-IN')}
                </h3>
                <p className="text-sm text-slate-500">Scan using any UPI app to complete payment.</p>
              </div>
              <div className="inline-block bg-white p-3 border border-slate-200 mb-6" style={{ borderRadius: 4 }}>
                <img src="/qr_code.png" alt="UPI QR Code" className="w-48 block" />
              </div>
              <div className="flex gap-3">
                <button className="btn btn-ghost flex-1" onClick={() => setShowQr(false)} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-success flex-[2]" onClick={handleTransaction} disabled={loading}>
                  {loading ? <><Spinner /> Processing…</> : 'I have Paid'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-slate-400">
          Transactions are simulated. No real money involved.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
