// ─── User Management ────────────────────────────────────────────────────────

export const getUsers = () => {
  return JSON.parse(localStorage.getItem('bettingUsers') || '[]');
};

export const saveUsers = (users) => {
  localStorage.setItem('bettingUsers', JSON.stringify(users));
};

export const getUserByEmail = (email) => {
  return getUsers().find((u) => u.email === email) || null;
};

export const createUser = ({ email, password }) => {
  const users = getUsers();
  if (users.find((u) => u.email === email)) return null; // duplicate
  const newUser = {
    id: `user_${Date.now()}`,
    email,
    password,
    balance: 1000, // starter balance ₹1000
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUserBalance = (email, newBalance) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx === -1) return false;
  users[idx].balance = newBalance;
  saveUsers(users);
  // also update session
  const session = getSession();
  if (session && session.email === email) {
    saveSession({ ...session, balance: newBalance });
  }
  return true;
};

export const updateUserById = (id, updates) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  const session = getSession();
  if (session && session.id === id) {
    saveSession({ ...session, ...updates });
  }
  return true;
};

// ─── Session Management ─────────────────────────────────────────────────────

export const getSession = () => {
  return JSON.parse(localStorage.getItem('bettingSession') || 'null');
};

export const saveSession = (user) => {
  localStorage.setItem('bettingSession', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('bettingSession');
};

// ─── Game History ────────────────────────────────────────────────────────────

export const getHistory = (email) => {
  const all = JSON.parse(localStorage.getItem('bettingHistory') || '{}');
  return all[email] || [];
};

export const addHistoryEntry = (email, entry) => {
  const all = JSON.parse(localStorage.getItem('bettingHistory') || '{}');
  if (!all[email]) all[email] = [];
  all[email].unshift({ ...entry, timestamp: new Date().toISOString() });
  // keep last 50
  all[email] = all[email].slice(0, 50);
  localStorage.setItem('bettingHistory', JSON.stringify(all));
};

// ─── Wallet Helpers ──────────────────────────────────────────────────────────

export const deductBalance = (email, amount) => {
  const user = getUserByEmail(email);
  if (!user || user.balance < amount) return false;
  updateUserBalance(email, user.balance - amount);
  return true;
};

export const addBalance = (email, amount) => {
  const user = getUserByEmail(email);
  if (!user) return false;
  updateUserBalance(email, user.balance + amount);
  return true;
};
