// ============================================================
// sheets.js — Google Sheets Integration (via Apps Script)
// ============================================================
// Uses hidden iframe + form POST approach to bypass CORS
// restrictions. Works from ANY origin including file:// protocol.
// ============================================================

const Sheets = {

  /**
   * Send data to Google Apps Script via hidden iframe + form POST
   * This approach works from any origin (file://, http://, https://)
   */
  _postToSheets(url, payload) {
    return new Promise((resolve) => {
      // Create unique iframe name
      const iframeName = 'sheets_frame_' + Date.now();

      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create form targeting the iframe
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.target = iframeName;

      // Add payload as hidden input field
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      // Submit the form
      document.body.appendChild(form);
      form.submit();

      // Cleanup after 4 seconds
      setTimeout(() => {
        if (document.body.contains(form)) document.body.removeChild(form);
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        resolve(true);
      }, 4000);
    });
  },

  /**
   * Sync a single transaction to Google Sheets
   */
  async syncTransaction(txn) {
    const url = Store.getSheetsUrl();
    if (!url) return;

    try {
      await this._postToSheets(url, {
        action: 'addTransaction',
        data: txn
      });
    } catch (err) {
      console.warn('Google Sheets sync failed:', err);
    }
  },

  /**
   * Export all data to Google Sheets
   */
  async exportAll() {
    // Read URL directly from input field and save it
    const inputField = document.getElementById('sheetsUrl');
    const inputUrl = inputField ? inputField.value.trim() : '';
    if (inputUrl) {
      Store.setSheetsUrl(inputUrl);
    }

    const url = inputUrl || Store.getSheetsUrl();
    if (!url) {
      showToast('Masukkan Google Apps Script URL terlebih dahulu', 'error');
      return;
    }

    const btn = document.getElementById('btnExportSheets');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;animation:spin 1s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      Exporting...
    `;

    try {
      const transactions = Store.getTransactions();
      const categories = Store.getCategories();

      await this._postToSheets(url, {
        action: 'exportAll',
        data: {
          transactions,
          categories
        }
      });

      btn.disabled = false;
      btn.innerHTML = originalText;
      showToast('Data berhasil dikirim ke Google Sheets! Cek spreadsheet Anda.', 'success');

    } catch (err) {
      console.error('Export failed:', err);
      btn.disabled = false;
      btn.innerHTML = originalText;
      showToast('Gagal export ke Google Sheets. Periksa URL.', 'error');
    }
  }
};

// Add spin animation for loading
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);
