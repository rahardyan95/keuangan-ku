// ============================================================
// app.js — Main Application Entry Point
// ============================================================

// ── Toast Notification ──────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type;
  // Trigger show
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ── App Object ──────────────────────────────────────────────
const App = {
  currentView: 'dashboard',
  currentFilters: {
    category: 'all',
    period: 'all'
  },

  init() {
    // Initialize store
    Store.init();

    // Set footer year
    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

    // Set up event listeners
    this.bindEvents();

    // Populate category dropdowns
    this.populateCategoryDropdowns();

    // Initial render
    this.renderView('dashboard');
  },

  bindEvents() {
    // ── Top Navigation ──
    document.querySelectorAll('.top-nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.renderView(tab.dataset.view);
      });
    });

    // ── Add Transaction Buttons ──
    document.getElementById('btnAddTransaction').addEventListener('click', () => Modal.open());
    document.getElementById('btnNewTransaction').addEventListener('click', () => Modal.open());

    // ── Modal Close ──
    document.getElementById('btnCloseModal').addEventListener('click', () => Modal.close());
    document.getElementById('transactionModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Modal.close();
    });

    // ── Transaction Form ──
    document.getElementById('transactionForm').addEventListener('submit', (e) => {
      e.preventDefault();
      Modal.save();
    });

    // ── Type Toggle ──
    document.querySelectorAll('.type-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => Modal.toggleType(btn.dataset.type));
    });

    // ── Filter Controls ──
    document.getElementById('filterCategory').addEventListener('change', (e) => {
      this.currentFilters.category = e.target.value;
      this.refreshDashboard();
    });

    document.getElementById('filterPeriod').addEventListener('change', (e) => {
      this.currentFilters.period = e.target.value;
      this.refreshDashboard();
    });

    document.getElementById('btnResetFilter').addEventListener('click', () => {
      this.currentFilters = { category: 'all', period: 'all' };
      document.getElementById('filterCategory').value = 'all';
      document.getElementById('filterPeriod').value = 'all';
      this.refreshDashboard();
    });

    // ── Search Transactions ──
    document.getElementById('searchTransactions').addEventListener('input',
      debounce((e) => Transactions.search(e.target.value), 250)
    );

    // ── Save Category ──
    document.getElementById('btnSaveCategory').addEventListener('click', () => {
      Categories.saveCategory();
    });

    // ── Enter key on category input ──
    document.getElementById('categoryNameInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        Categories.saveCategory();
      }
    });

    // ── Export to Google Sheets ──
    document.getElementById('btnExportSheets').addEventListener('click', () => {
      Sheets.exportAll();
    });

    // ── Validation Rules Button ──
    document.getElementById('btnValidationRules').addEventListener('click', () => {
      showToast('Validation rules menggunakan dropdown dari sheet KATEGORI', 'success');
    });

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Modal.close();
      }
    });
  },

  renderView(viewName) {
    this.currentView = viewName;

    // Update tab states
    document.querySelectorAll('.top-nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Update view visibility
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    const viewMap = {
      dashboard: 'viewDashboard',
      data: 'viewData',
      category: 'viewCategory'
    };

    const targetView = document.getElementById(viewMap[viewName]);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Render content based on view
    switch (viewName) {
      case 'dashboard':
        this.refreshDashboard();
        break;
      case 'data':
        Transactions.render();
        break;
      case 'category':
        Categories.render();
        break;
    }
  },

  refreshDashboard() {
    Dashboard.render(this.currentFilters);
    Charts.renderCategoryChart(this.currentFilters);
  },

  refreshAll() {
    if (this.currentView === 'dashboard') {
      this.refreshDashboard();
    } else if (this.currentView === 'data') {
      Transactions.render();
    } else if (this.currentView === 'category') {
      Categories.render();
    }
  },

  populateCategoryDropdowns() {
    const categories = Store.getCategories();

    // Filter dropdown on dashboard
    const filterSelect = document.getElementById('filterCategory');
    const currentFilter = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">Semua Kategori</option>' +
      categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    filterSelect.value = currentFilter || 'all';
  }
};

// ── Initialize on DOM ready ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
