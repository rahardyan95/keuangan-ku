// ============================================================
// store.js — Data Store (localStorage + State Management)
// ============================================================

const STORAGE_KEYS = {
  TRANSACTIONS: 'fh_transactions_v2',
  CATEGORIES: 'fh_categories_v2',
  SHEETS_URL: 'fh_sheets_url' // Keep this so they don't lose their URL
};

// ── Color Palette for Categories ────────────────────────────
const COLOR_PALETTE = {
  BLUE:    { name: 'BLUE',    hex: '#3B82F6', bg: '#EFF6FF' },
  EMERALD: { name: 'EMERALD', hex: '#10B981', bg: '#ECFDF5' },
  ROSE:    { name: 'ROSE',    hex: '#F43F5E', bg: '#FFF1F2' },
  AMBER:   { name: 'AMBER',   hex: '#F59E0B', bg: '#FFFBEB' },
  VIOLET:  { name: 'VIOLET',  hex: '#8B5CF6', bg: '#F5F3FF' },
  SLATE:   { name: 'SLATE',   hex: '#64748B', bg: '#F8FAFC' }
};

// ── Default Categories ─────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'cat_belanja',       name: 'Belanja',       color: 'AMBER' },
  { id: 'cat_gaji',          name: 'Gaji',          color: 'EMERALD' },
  { id: 'cat_hiburan',       name: 'Hiburan',       color: 'VIOLET' },
  { id: 'cat_investasi',     name: 'Investasi',     color: 'EMERALD' },
  { id: 'cat_makanan',       name: 'Makanan',       color: 'ROSE' },
  { id: 'cat_transportasi',  name: 'Transportasi',  color: 'BLUE' },
  { id: 'cat_utilitas',      name: 'Utilitas',       color: 'SLATE' }
];

// ── Default Sample Transactions ─────────────────────────────
const DEFAULT_TRANSACTIONS = [];

// ── Store Object ────────────────────────────────────────────
const Store = {
  // ── Initialization ──
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.saveCategories(DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      this.saveTransactions(DEFAULT_TRANSACTIONS);
    }
  },

  // ── Transactions CRUD ──
  getTransactions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
    } catch {
      return [];
    }
  },

  saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction(txn) {
    const transactions = this.getTransactions();
    txn.id = generateId();
    transactions.unshift(txn);
    this.saveTransactions(transactions);
    return txn;
  },

  updateTransaction(id, updates) {
    const transactions = this.getTransactions();
    const idx = transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      transactions[idx] = { ...transactions[idx], ...updates };
      this.saveTransactions(transactions);
      return transactions[idx];
    }
    return null;
  },

  deleteTransaction(id) {
    const transactions = this.getTransactions().filter(t => t.id !== id);
    this.saveTransactions(transactions);
  },

  // ── Categories CRUD ──
  getCategories() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [];
    } catch {
      return [];
    }
  },

  saveCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory(cat) {
    const categories = this.getCategories();
    // Check duplicate
    if (categories.find(c => c.name.toLowerCase() === cat.name.toLowerCase())) {
      return null; // duplicate
    }
    cat.id = 'cat_' + Date.now().toString(36);
    categories.push(cat);
    // Sort alphabetically
    categories.sort((a, b) => a.name.localeCompare(b.name));
    this.saveCategories(categories);
    return cat;
  },

  deleteCategory(id) {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(categories);
  },

  getCategoryColor(categoryName) {
    const cat = this.getCategories().find(c => c.name === categoryName);
    if (cat && COLOR_PALETTE[cat.color]) {
      return COLOR_PALETTE[cat.color];
    }
    return COLOR_PALETTE.SLATE;
  },

  // ── Filtered Transactions ──
  getFilteredTransactions(filters = {}) {
    let transactions = this.getTransactions();

    if (filters.category && filters.category !== 'all') {
      transactions = transactions.filter(t => t.category === filters.category);
    }

    if (filters.period && filters.period !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.period) {
        case 'this_week': {
          const day = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        }
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last_3_months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      if (startDate) {
        transactions = transactions.filter(t => new Date(t.date) >= startDate);
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      transactions = transactions.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    if (filters.type && filters.type !== 'all') {
      transactions = transactions.filter(t => t.type === filters.type);
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    return transactions;
  },

  // ── Computed Stats ──
  getStats(filters = {}) {
    const transactions = this.getFilteredTransactions(filters);
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction = expenses.length > 0 ? Math.round(totalExpense / expenses.length) : 0;

    // Top category by total spending
    const categoryTotals = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalExpense,
      totalIncome,
      netSavings: totalIncome - totalExpense,
      avgTransaction,
      topCategory: topCategory ? topCategory[0] : '-',
      transactionCount: expenses.length,
      expensesByCategory: categoryTotals,
      recentTransactions: expenses.slice(0, 5)
    };
  },

  // ── Google Sheets URL ──
  getSheetsUrl() {
    return localStorage.getItem(STORAGE_KEYS.SHEETS_URL) || '';
  },

  setSheetsUrl(url) {
    localStorage.setItem(STORAGE_KEYS.SHEETS_URL, url);
  }
};
