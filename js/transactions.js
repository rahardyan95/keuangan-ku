// ============================================================
// transactions.js — Data (Transaksi) Page
// ============================================================

const Transactions = {
  searchQuery: '',

  render() {
    this.renderTable();
  },

  renderTable() {
    const transactions = Store.getFilteredTransactions({ search: this.searchQuery });
    const allTransactions = Store.getTransactions();
    const tbody = document.getElementById('transactionsBody');
    const footer = document.getElementById('dataFooter');

    if (transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <p>Belum ada transaksi. Klik "+ Baru" untuk menambahkan.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = transactions.map(txn => {
        const color = Store.getCategoryColor(txn.category);
        const typeClass = txn.type === 'income' ? 'badge-income' : 'badge-expense';
        const typeLabel = txn.type === 'income' ? 'Income' : 'Expense';

        return `
          <tr>
            <td class="col-date">${txn.date}</td>
            <td class="col-name">${txn.name}</td>
            <td>
              <span class="badge-category" style="color: ${color.hex}; background: ${color.bg}">${txn.category}</span>
            </td>
            <td class="col-amount">${formatRupiah(txn.amount)}</td>
            <td style="text-align:center">
              <span class="badge ${typeClass}">${typeLabel}</span>
            </td>
            <td class="col-action">
              <button class="btn-delete" onclick="Transactions.deleteTransaction('${txn.id}')">Hapus</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    footer.innerHTML = `
      <div class="data-footer-left">
        <span class="dot"></span>
        Menampilkan ${transactions.length} dari ${allTransactions.length} transaksi
      </div>
      <div>
        <span style="font-weight:600">Aturan Google Sheet:</span> Kolom Nominal menggunakan format mata uang (IDR Rp)
      </div>
    `;
  },

  deleteTransaction(id) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      Store.deleteTransaction(id);
      this.renderTable();
      App.refreshDashboard();
      showToast('Transaksi berhasil dihapus', 'success');
    }
  },

  search(query) {
    this.searchQuery = query;
    this.renderTable();
  }
};
