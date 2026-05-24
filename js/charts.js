// ============================================================
// charts.js — Chart.js Configurations
// ============================================================

let categoryChartInstance = null;

const Charts = {
  renderCategoryChart(filters = {}) {
    const stats = Store.getStats(filters);
    const categories = Store.getCategories();
    const data = stats.expensesByCategory;

    // Sort categories by amount descending
    const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(e => e[0]);
    const values = sortedEntries.map(e => e[1]);
    const colors = labels.map(label => {
      const cat = categories.find(c => c.name === label);
      if (cat && COLOR_PALETTE[cat.color]) {
        return COLOR_PALETTE[cat.color].hex;
      }
      return COLOR_PALETTE.SLATE.hex;
    });

    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Destroy previous instance
    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pengeluaran',
          data: values,
          backgroundColor: colors.map(c => c + '30'),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 22,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E293B',
            titleFont: { family: 'Inter', size: 12, weight: '600' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return ' ' + formatRupiah(context.parsed.x);
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: '#F1F3F9',
              drawBorder: false
            },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#9CA3AF',
              callback: function(value) {
                return formatRupiahShort(value);
              }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { family: 'Inter', size: 12, weight: '500' },
              color: '#374151',
              padding: 8
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    });
  },

  destroy() {
    if (categoryChartInstance) {
      categoryChartInstance.destroy();
      categoryChartInstance = null;
    }
  }
};
