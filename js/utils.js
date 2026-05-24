// ============================================================
// utils.js — Utility / Helper Functions
// ============================================================

/**
 * Format a number to Indonesian Rupiah format
 * Example: 15000000 => "Rp 15.000.000"
 */
function formatRupiah(amount) {
  const abs = Math.abs(amount);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}

/**
 * Format a number to short Rupiah format (for chart axis)
 * Example: 1500000 => "1.5 M", 200000 => "200 k"
 */
function formatRupiahShort(amount) {
  if (amount >= 1000000) {
    const val = amount / 1000000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + ' M';
  }
  if (amount >= 1000) {
    const val = amount / 1000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + ' k';
  }
  return amount.toString();
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to display string (e.g. "20 Mei 2026")
 */
function formatDateDisplay(dateStr) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Generate a simple unique ID
 */
function generateId() {
  return 'txn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

/**
 * Get today's date as YYYY-MM-DD
 */
function getToday() {
  return formatDate(new Date());
}

/**
 * Parse a Rupiah string back to number
 * Example: "Rp 15.000.000" => 15000000
 */
function parseRupiah(str) {
  if (typeof str === 'number') return str;
  return parseInt(str.replace(/[^\d]/g, ''), 10) || 0;
}

/**
 * Debounce function for search input
 */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Animate a number counting up
 */
function animateCount(element, target, duration = 600) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);
    element.textContent = formatRupiah(current);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatRupiah(target);
    }
  }
  requestAnimationFrame(update);
}
