// ============================================================
// modal.js — Transaction Modal
// ============================================================

const Modal = {
  currentType: 'expense',

  open() {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const dateInput = document.getElementById('txnDate');

    // Reset form
    form.reset();
    dateInput.value = getToday();
    this.currentType = 'expense';
    this.updateTypeToggle();

    // Populate categories
    const categorySelect = document.getElementById('txnCategory');
    const categories = Store.getCategories();
    categorySelect.innerHTML = '<option value="">Pilih Kategori</option>' +
      categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    // Load saved sheets URL
    const sheetsUrl = Store.getSheetsUrl();
    document.getElementById('sheetsUrl').value = sheetsUrl;

    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const modal = document.getElementById('transactionModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
  },

  updateTypeToggle() {
    document.querySelectorAll('.type-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === this.currentType);
    });
  },

  toggleType(type) {
    this.currentType = type;
    this.updateTypeToggle();
  },

  save() {
    const date = document.getElementById('txnDate').value;
    const name = document.getElementById('txnName').value.trim();
    const category = document.getElementById('txnCategory').value;
    const amount = parseInt(document.getElementById('txnAmount').value, 10);

    if (!date || !name || !category || !amount || amount <= 0) {
      showToast('Mohon lengkapi semua field', 'error');
      return;
    }

    // Save sheets URL if provided
    const sheetsUrl = document.getElementById('sheetsUrl').value.trim();
    if (sheetsUrl) {
      Store.setSheetsUrl(sheetsUrl);
    }

    const txn = Store.addTransaction({
      date,
      name,
      category,
      amount,
      type: this.currentType
    });

    // Try to sync to Google Sheets
    if (sheetsUrl) {
      Sheets.syncTransaction(txn);
    }

    this.close();
    App.refreshAll();
    showToast('Transaksi berhasil disimpan!', 'success');
  }
};
