
const USERS_KEY = 'betting_game_users';
const CURRENT_USER_KEY = 'betting_game_current_user';
const GAME_HISTORY_KEY = 'betting_game_history';
const DB_VERSION_KEY = 'betting_game_db_version';
const CURRENT_DB_VERSION = 2;

const SEED_ADMIN = {
  'admin@test.com': {
    username: 'Admin',
    email: 'admin@test.com',
    password: 'password',
    role: 'admin',
    balance: 0,
    totalDeposited: 0
  },
};

// --- Initialization Logic (from migration logic) ---
const initDB = () => {
  const storedVersion = Number(localStorage.getItem(DB_VERSION_KEY) || '0');
  if (storedVersion < CURRENT_DB_VERSION) {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(GAME_HISTORY_KEY);
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_ADMIN));
    localStorage.setItem(DB_VERSION_KEY, String(CURRENT_DB_VERSION));
  }
};

initDB();

// --- Helpers ---
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const getHistory = () => JSON.parse(localStorage.getItem(GAME_HISTORY_KEY) || '{}');
const saveHistory = (history) => localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));

// --- Mock Axios Instance ---
// In a real app, this would be axios.create()
// Here we export async functions that simulate API responses
export const api = {
  // Auth API
  auth: {
    login: async (email, password) => {
      await new Promise(r => setTimeout(r, 500)); // Simulate network latency
      const users = getUsers();
      const user = users[email];
      if (!user || user.password !== password) {
        throw { response: { data: { message: 'Invalid credentials' } } };
      }
      return { data: { ...user } };
    },
    register: async (username, email, password) => {
      await new Promise(r => setTimeout(r, 800));
      const users = getUsers();
      if (users[email]) {
        throw { response: { data: { message: 'Email already exists' } } };
      }
      const newUser = { 
        username, 
        email, 
        password, 
        role: 'user', 
        balance: 1000, 
        totalDeposited: 1000 
      };
      users[email] = newUser;
      saveUsers(users);
      return { data: { ...newUser } };
    }
  },

  // User API
  user: {
    getProfile: async (email) => {
      const users = getUsers();
      return { data: { ...users[email] } };
    },
    updateBalance: async (email, newBalance) => {
      const users = getUsers();
      if (users[email]) {
        users[email].balance = newBalance;
        saveUsers(users);
      }
      return { data: { balance: newBalance } };
    },
    deposit: async (email, amount) => {
      const users = getUsers();
      if (users[email]) {
        users[email].balance += amount;
        users[email].totalDeposited = (users[email].totalDeposited || 0) + amount;
        saveUsers(users);
      }
      return { data: { ...users[email] } };
    }
  },

  // Admin API
  admin: {
    listUsers: async () => {
      const users = Object.values(getUsers());
      return { data: users };
    },
    updateUserBalance: async (email, balance) => {
      const users = getUsers();
      if (users[email]) {
        users[email].balance = balance;
        saveUsers(users);
      }
      return { data: users[email] };
    },
    deleteUser: async (email) => {
      const users = getUsers();
      if (users[email] && users[email].role !== 'admin') {
        delete users[email];
        saveUsers(users);
        // Cleanup history
        const history = getHistory();
        delete history[email];
        saveHistory(history);
      }
      return { data: { success: true } };
    }
  },

  // Game API
  game: {
    getHistory: async (email) => {
      const history = getHistory();
      return { data: history[email] || [] };
    },
    saveResult: async (email, result) => {
      const history = getHistory();
      if (!history[email]) history[email] = [];
      const entry = { ...result, date: new Date().toISOString() };
      history[email].unshift(entry);
      // Cap at 50
      history[email] = history[email].slice(0, 50);
      saveHistory(history);
      return { data: entry };
    }
  }
};

export default api;
