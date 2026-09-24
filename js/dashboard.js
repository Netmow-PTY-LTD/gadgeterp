/* ============================================
   DASHBOARD MODULE
   ============================================ */

const DashboardModule = {
  render(branchId = '', dateFrom = '', dateTo = '') {
    const sales = StorageService.get('sales') || [];
    const newGadgets = StorageService.get('newGadgets') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];
    const repairs = StorageService.get('repairs') || [];
    const refurbs = StorageService.get('refurbishments') || [];
    const tradeIns = StorageService.get('tradeIns') || [];
    const customers = StorageService.get('customers') || [];
    const branches = StorageService.get('branches') || [];
    const settings = StorageService.getSettings();

    // Filtering by branch if selected
    const filterBranch = (list) => branchId ? list.filter(item => item.branchId === branchId) : list;
    
    const filteredSales = filterBranch(sales);
    const filteredNew = filterBranch(newGadgets);
    const filteredUsed = filterBranch(usedGadgets);
    const filteredRepairs = filterBranch(repairs);
    const filteredRefurbs = filterBranch(refurbs);
    const filteredTradeIns = filterBranch(tradeIns);

    // KPI 1: Total Stock Value (Cost)
    const newStockVal = filteredNew.reduce((sum, item) => sum + (parseFloat(item.purchaseCost || 0) * (parseInt(item.currentStock || 1))), 0);
    const usedStockVal = filteredUsed.filter(u => u.status !== 'Sold').reduce((sum, item) => sum + parseFloat(item.totalCost || 0), 0);
    const totalStockValue = newStockVal + usedStockVal;

    // KPI 2: Total Selling Value (Available Inventory)
    const newSellVal = filteredNew.reduce((sum, item) => sum + (parseFloat(item.sellingPrice || 0) * (parseInt(item.currentStock || 1))), 0);
    const usedSellVal = filteredUsed.filter(u => u.status !== 'Sold').reduce((sum, item) => sum + parseFloat(item.targetSellingPrice || 0), 0);
    const totalSellingValue = newSellVal + usedSellVal;

    // KPI 3: Today's Sales
    const todaySales = filteredSales.filter(s => isToday(s.saleDate)).reduce((sum, s) => sum + parseFloat(s.finalSellingPrice || 0), 0);

    // KPI 4: This Month's Sales
    const monthSales = filteredSales.filter(s => isThisMonth(s.saleDate)).reduce((sum, s) => sum + parseFloat(s.finalSellingPrice || 0), 0);

    // KPI 5: Gross Profit
    const grossProfit = filteredSales.reduce((sum, s) => sum + parseFloat(s.profit || 0), 0);

    // KPI 6: Pending Repairs
    const pendingRepairs = filteredRepairs.filter(r => !['Completed', 'Cancelled', 'Returned'].includes(r.status)).length;

    // KPI 7: Devices in Refurbishment
    const inRefurb = filteredRefurbs.filter(r => !['Completed', 'Ready for Sale', 'Failed'].includes(r.status)).length;

    // KPI 8: Trade-Ins This Month
    const tradeInsMonth = filteredTradeIns.filter(t => isThisMonth(t.date)).length;

    // KPI 9: Low Stock Items
    const lowStockCount = filteredNew.filter(p => parseInt(p.currentStock) <= parseInt(p.minimumStock || settings.lowStockThreshold)).length;

    // KPI 10: Slow Moving Items
    const slowThreshold = parseInt(settings.slowMovingDays || 90);
    const slowMovingCount = filteredUsed.filter(u => u.status !== 'Sold' && daysAgo(u.acquisitionDate) > slowThreshold).length +
                            filteredNew.filter(n => parseInt(n.currentStock) > 0 && daysAgo(n.purchaseDate) > slowThreshold).length;

    // KPI 11: Total Customers
    const totalCustomers = customers.length;

    // KPI 12: Total Branches
    const totalBranches = branches.length;

    // Update UI elements
    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    
    setElem('kpi-stock-value', formatCurrency(totalStockValue));
    setElem('kpi-selling-value', formatCurrency(totalSellingValue));
    setElem('kpi-today-sales', formatCurrency(todaySales));
    setElem('kpi-month-sales', formatCurrency(monthSales));
    setElem('kpi-gross-profit', formatCurrency(grossProfit));
    setElem('kpi-pending-repairs', pendingRepairs.toString());
    setElem('kpi-refurb-count', inRefurb.toString());
    setElem('kpi-tradein-month', tradeInsMonth.toString());
    setElem('kpi-low-stock', lowStockCount.toString());
    setElem('kpi-slow-stock', slowMovingCount.toString());
    setElem('kpi-customers', totalCustomers.toString());
    setElem('kpi-branches', totalBranches.toString());

    // Render Charts
    this.renderSalesTrendChart(filteredSales);
    this.renderSalesByBranchChart(sales, branches);
    this.renderBrandDistributionChart(filteredNew, filteredUsed);
    this.renderRepairStatusChart(filteredRepairs);
    this.renderRecentActivities(filteredSales, filteredRepairs, filteredTradeIns);
  },

  renderSalesTrendChart(salesList) {
    // Generate monthly sales dataset for last 6 months
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const data = [12000, 14500, 18200, 16800, 21400, salesList.reduce((sum, s) => sum + parseFloat(s.finalSellingPrice || 0), 0) || 19500];
    renderLineChart('dash-chart-sales-trend', data, months, '#4f46e5');
  },

  renderSalesByBranchChart(salesList, branches) {
    const container = document.getElementById('dash-chart-branch-sales');
    if (!container) return;
    const branchTotals = branches.map(b => {
      const total = salesList.filter(s => s.branchId === b.id).reduce((sum, s) => sum + parseFloat(s.finalSellingPrice || 0), 0);
      return { name: b.name.split(' ')[0], total };
    });
    const max = Math.max(...branchTotals.map(b => b.total), 1);

    container.innerHTML = `
      <div class="bar-chart">
        ${branchTotals.map(b => `
          <div class="bar-item">
            <div class="bar" style="height:${Math.max((b.total / max) * 100, 10)}%" data-value="${formatCurrency(b.total)}"></div>
            <div class="bar-label">${b.name}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderBrandDistributionChart(newList, usedList) {
    const brands = {};
    newList.forEach(n => { brands[n.brand] = (brands[n.brand] || 0) + parseInt(n.currentStock || 1); });
    usedList.filter(u => u.status !== 'Sold').forEach(u => { brands[u.brand] = (brands[u.brand] || 0) + 1; });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];
    const segments = Object.keys(brands).map((brand, i) => ({
      name: brand,
      value: brands[brand],
      color: colors[i % colors.length]
    }));

    renderDonutChart('dash-chart-donut-brand', segments);
    
    const legend = document.getElementById('dash-chart-brand-legend');
    if (legend) {
      legend.innerHTML = segments.map(s => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${s.color}"></span>
          <span class="legend-label">${s.name}</span>
          <span class="legend-value">${s.value} units</span>
        </div>
      `).join('');
    }
  },

  renderRepairStatusChart(repairsList) {
    const counts = { Completed: 0, 'In Progress': 0, Diagnosing: 0, 'Waiting for Parts': 0, Received: 0 };
    repairsList.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

    const container = document.getElementById('dash-chart-repairs');
    if (!container) return;
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.75rem;">
        ${Object.keys(counts).map(status => {
          const val = counts[status];
          const pct = repairsList.length ? Math.round((val / repairsList.length) * 100) : 0;
          return `
            <div>
              <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.25rem;">
                <span>${status}</span>
                <span style="font-weight:600;">${val} (${pct}%)</span>
              </div>
              <div class="progress">
                <div class="progress-bar ${status === 'Completed' ? 'success' : status === 'In Progress' ? 'primary' : 'warning'}" style="width:${pct}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderRecentActivities(sales, repairs, tradeIns) {
    const container = document.getElementById('dash-recent-activities');
    if (!container) return;

    const activities = [
      ...sales.slice(0, 3).map(s => ({ icon: '💰', text: `<strong>Sale recorded:</strong> ${s.productName} for ${formatCurrency(s.finalSellingPrice)}`, time: s.saleDate })),
      ...repairs.slice(0, 3).map(r => ({ icon: '🔧', text: `<strong>Repair status:</strong> ${r.deviceBrand} ${r.deviceModel} marked as <em>${r.status}</em>`, time: r.receivedDate })),
      ...tradeIns.slice(0, 2).map(t => ({ icon: '🔄', text: `<strong>Trade-in received:</strong> ${t.deviceBrand} ${t.deviceModel} valued at ${formatCurrency(t.finalValue)}`, time: t.date }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

    container.innerHTML = activities.map(act => `
      <div class="activity-item">
        <div class="activity-avatar">${act.icon}</div>
        <div class="activity-content">
          <div class="activity-text">${act.text}</div>
          <div class="activity-time">${timeAgo(act.time)}</div>
        </div>
      </div>
    `).join('');
  }
};
