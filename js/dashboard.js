// ============================================================
// dashboard.js — Dashboard Page Rendering
// ============================================================

const Dashboard = {
  render(filters = {}) {
    this.renderSummaryCards(filters);
    this.renderRecentList(filters);
    this.renderCashflow(filters);
  },

  renderSummaryCards(filters = {}) {
    const stats = Store.getStats(filters);
    const container = document.getElementById('summaryCards');

    container.innerHTML = `
      <div class="summary-card animate-in">
        <div class="summary-card-header">
          <span class="summary-card-label">Total Spending</span>
          <div class="summary-card-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
        </div>
        <div class="summary-card-value" id="statTotalSpending">Rp ${stats.totalExpense.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</div>
        <div class="summary-card-formula">
          Google Sheets<br>Formula:
          <span>=SUMIF(DATA!E:E; "Expense"; DATA!D:D)</span>
        </div>
      </div>

      <div class="summary-card animate-in">
        <div class="summary-card-header">
          <span class="summary-card-label">Average Transaction</span>
          <div class="summary-card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
        </div>
        <div class="summary-card-value text-lg">Rp ${stats.avgTransaction.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</div>
        <div class="summary-card-formula">
          Google Sheets<br>Formula:
          <span>=AVERAGEIF(DATA!E:E; "Expense"; DATA!D:D)</span>
        </div>
      </div>

      <div class="summary-card animate-in">
        <div class="summary-card-header">
          <span class="summary-card-label">Top Category</span>
          <div class="summary-card-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
        </div>
        <div class="summary-card-value text-lg">${stats.topCategory}</div>
        <div class="summary-card-formula">
          Google Sheets<br>Formula:
          <span>=INDEX(QUERY(DATA!A:E; ...); 2; 1)</span>
        </div>
      </div>

      <div class="summary-card animate-in">
        <div class="summary-card-header">
          <span class="summary-card-label">Transaction Count</span>
          <div class="summary-card-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>
        <div class="summary-card-value">${stats.transactionCount}</div>
        <div class="summary-card-formula">
          Google Sheets<br>Formula:
          <span>=COUNTIF(DATA!E:E; "Expense")</span>
        </div>
      </div>
    `;
  },

  renderRecentList(filters = {}) {
    const stats = Store.getStats(filters);
    const recent = stats.recentTransactions;
    const container = document.getElementById('recentList');
    const subtitle = document.getElementById('recentSubtitle');

    subtitle.textContent = `Menampilkan ${recent.length} aktivitas belanja terbaru`;

    if (recent.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="18" rx="2"></rect>
            <line x1="2" y1="9" x2="22" y2="9"></line>
          </svg>
          <p>Belum ada transaksi</p>
        </div>
      `;
      return;
    }

    container.innerHTML = recent.map(txn => {
      const color = Store.getCategoryColor(txn.category);
      return `
        <div class="recent-item">
          <div class="recent-item-left">
            <div class="recent-item-dot" style="background: ${color.hex}"></div>
            <div class="recent-item-info">
              <div class="recent-item-name">${txn.name}</div>
              <div class="recent-item-meta">
                ${txn.date}
                <span class="recent-item-category" style="color: ${color.hex}; background: ${color.bg}">${txn.category}</span>
              </div>
            </div>
          </div>
          <div class="recent-item-amount">${formatRupiah(txn.amount)}</div>
        </div>
      `;
    }).join('');
  },

  renderCashflow(filters = {}) {
    const stats = Store.getStats(filters);
    const container = document.getElementById('cashflowCards');

    container.innerHTML = `
      <div class="cashflow-card animate-in">
        <div class="cashflow-card-label">Total Income (Pemasukan)</div>
        <div class="cashflow-card-value income">${formatRupiah(stats.totalIncome)}</div>
      </div>
      <div class="cashflow-card animate-in">
        <div class="cashflow-card-label">Total Expense (Pengeluaran)</div>
        <div class="cashflow-card-value expense">${formatRupiah(stats.totalExpense)}</div>
      </div>
      <div class="cashflow-card highlight animate-in">
        <div class="cashflow-card-label highlight-label">Net Savings (Selisih Bersih)</div>
        <div class="cashflow-card-value savings">${formatRupiah(stats.netSavings)}</div>
      </div>
    `;
  }
};
