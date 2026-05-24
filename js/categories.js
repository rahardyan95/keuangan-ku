// ============================================================
// categories.js — Kategori Page
// ============================================================

const Categories = {
  selectedColor: 'BLUE',

  render() {
    this.renderColorPicker();
    this.renderTable();
  },

  renderColorPicker() {
    const container = document.getElementById('colorPicker');
    const colors = Object.keys(COLOR_PALETTE);

    container.innerHTML = colors.map(colorKey => {
      const color = COLOR_PALETTE[colorKey];
      const activeClass = colorKey === this.selectedColor ? 'active' : '';
      return `
        <div class="color-swatch ${activeClass}"
             style="background: ${color.hex}"
             data-color="${colorKey}"
             onclick="Categories.selectColor('${colorKey}')"
             title="${colorKey}">
        </div>
      `;
    }).join('');
  },

  renderTable() {
    const categories = Store.getCategories();
    const tbody = document.getElementById('categoryBody');

    if (categories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3">
            <div class="empty-state">
              <p>Belum ada kategori. Tambahkan kategori baru di form sebelah kiri.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = categories.map(cat => {
      const color = COLOR_PALETTE[cat.color] || COLOR_PALETTE.SLATE;
      return `
        <tr>
          <td class="cat-name">${cat.name}</td>
          <td>
            <div class="cat-color">
              <div class="cat-color-dot" style="background: ${color.hex}"></div>
              <span class="cat-color-label">${cat.color}</span>
            </div>
          </td>
          <td style="text-align:center">
            <button class="btn-delete" onclick="Categories.deleteCategory('${cat.id}', '${cat.name}')">Hapus</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  selectColor(colorKey) {
    this.selectedColor = colorKey;
    // Update active state
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.classList.toggle('active', swatch.dataset.color === colorKey);
    });
  },

  saveCategory() {
    const nameInput = document.getElementById('categoryNameInput');
    const name = nameInput.value.trim();

    if (!name) {
      showToast('Masukkan nama kategori', 'error');
      nameInput.focus();
      return;
    }

    const result = Store.addCategory({
      name: name,
      color: this.selectedColor
    });

    if (result === null) {
      showToast('Kategori sudah ada!', 'error');
      return;
    }

    nameInput.value = '';
    this.renderTable();
    // Update category dropdowns everywhere
    App.populateCategoryDropdowns();
    showToast(`Kategori "${name}" berhasil ditambahkan`, 'success');
  },

  deleteCategory(id, name) {
    // Check if category is used by any transaction
    const transactions = Store.getTransactions();
    const isUsed = transactions.some(t => t.category === name);

    if (isUsed) {
      showToast(`Kategori "${name}" masih digunakan oleh transaksi`, 'error');
      return;
    }

    if (confirm(`Hapus kategori "${name}"?`)) {
      Store.deleteCategory(id);
      this.renderTable();
      App.populateCategoryDropdowns();
      showToast(`Kategori "${name}" dihapus`, 'success');
    }
  }
};
