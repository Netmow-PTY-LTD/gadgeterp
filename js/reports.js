/* ============================================
   REPORTS & ANALYTICS MODULE
   ============================================ */

const ReportsModule = {
  renderReports() {
    this.renderStockReport();
    this.renderSalesReport();
    this.renderProfitLossReport();
    this.renderTradeInReport();
    this.renderRepairReport();
    this.renderRefurbishmentReport();
    this.renderBranchReport();
  },

  renderStockReport() {
    const newGadgets = StorageService.get('newGadgets') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];
    const spareParts = StorageService.get('spareParts') || [];

    const totalNewQty = newGadgets.reduce((s, n) => s + (parseInt(n.currentStock) || 0), 0);
    const totalUsedQty = usedGadgets.filter(u => u.status !== 'Sold').length;
    const totalPartsQty = spareParts.reduce((s, p) => s + (parseInt(p.stock) || 0), 0);

    const newCost = newGadgets.reduce((s, n) => s + (parseFloat(n.purchaseCost) * parseInt(n.currentStock || 0)), 0);
    const usedCost = usedGadgets.filter(u => u.status !== 'Sold').reduce((s, u) => s + parseFloat(u.totalCost || 0), 0);
    const partsCost = spareParts.reduce((s, p) => s + (parseFloat(p.purchaseCost) * parseInt(p.stock || 0)), 0);

    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElem('report-stock-qty', (totalNewQty + totalUsedQty).toString());
    setElem('report-stock-value', formatCurrency(newCost + usedCost));
    setElem('report-parts-value', formatCurrency(partsCost));
  },

  renderSalesReport() {
    const sales = StorageService.get('sales') || [];
    const totalRevenue = sales.reduce((s, r) => s + parseFloat(r.finalSellingPrice || 0), 0);
    const totalSalesCount = sales.length;
    const avgOrderVal = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElem('report-sales-revenue', formatCurrency(totalRevenue));
    setElem('report-sales-count', totalSalesCount.toString());
    setElem('report-sales-avg', formatCurrency(avgOrderVal));
  },

  renderProfitLossReport() {
    const sales = StorageService.get('sales') || [];
    const repairs = StorageService.get('repairs') || [];
    const refurbs = StorageService.get('refurbishments') || [];
    const parts = StorageService.get('spareParts') || [];

    const totalRevenue = sales.reduce((s, r) => s + parseFloat(r.finalSellingPrice || 0), 0);
    const cogs = sales.reduce((s, r) => s + parseFloat(r.totalCost || 0), 0);
    const grossProfit = totalRevenue - cogs;

    const totalRepairCosts = repairs.reduce((s, r) => s + parseFloat(r.totalCost || 0), 0);
    const totalRefurbCosts = refurbs.reduce((s, r) => s + parseFloat(r.totalCost || 0), 0);
    const totalPartInventory = parts.reduce((s, p) => s + (parseFloat(p.purchaseCost) * parseInt(p.stock)), 0);

    const netProfit = grossProfit - (totalRepairCosts + totalRefurbCosts);

    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElem('report-pl-revenue', formatCurrency(totalRevenue));
    setElem('report-pl-cogs', formatCurrency(cogs));
    setElem('report-pl-gross', formatCurrency(grossProfit));
    setElem('report-pl-repair-exp', formatCurrency(totalRepairCosts));
    setElem('report-pl-refurb-exp', formatCurrency(totalRefurbCosts));
    setElem('report-pl-net', formatCurrency(netProfit));
  },

  renderTradeInReport() {
    const tradeIns = StorageService.get('tradeIns') || [];
    const totalTradeVal = tradeIns.reduce((s, t) => s + parseFloat(t.finalValue || 0), 0);
    const totalCustPayment = tradeIns.reduce((s, t) => s + parseFloat(t.customerPayment || 0), 0);

    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElem('report-tradein-count', tradeIns.length.toString());
    setElem('report-tradein-value', formatCurrency(totalTradeVal));
    setElem('report-tradein-payments', formatCurrency(totalCustPayment));
  },

  renderRepairReport() {
    const repairs = StorageService.get('repairs') || [];
    const totalBilled = repairs.reduce((s, r) => s + parseFloat(r.customerPrice || 0), 0);
    const totalCost = repairs.reduce((s, r) => s + parseFloat(r.totalCost || 0), 0);
    const repairProfit = totalBilled - totalCost;

    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElem('report-repair-count', repairs.length.toString());
    setElem('report-repair-billed', formatCurrency(totalBilled));
    setElem('report-repair-profit', formatCurrency(repairProfit));
  },

  renderRefurbishmentReport() {
    const refurbs = StorageService.get('refurbishments') || [];
    const totalRefurbCost = refurbs.reduce((s, r) => s + parseFloat(r.totalCost || 0), 0);

    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElem('report-refurb-count', refurbs.length.toString());
    setElem('report-refurb-total-cost', formatCurrency(totalRefurbCost));
  },

  renderBranchReport() {
    const branches = StorageService.get('branches') || [];
    const sales = StorageService.get('sales') || [];
    const repairs = StorageService.get('repairs') || [];

    const cols = [
      { key: 'name', render: r => `<strong>${r.name}</strong>` },
      { key: 'sales', render: r => {
        const rev = sales.filter(s => s.branchId === r.id).reduce((sum, s) => sum + s.finalSellingPrice, 0);
        return formatCurrency(rev);
      }},
      { key: 'profit', render: r => {
        const prf = sales.filter(s => s.branchId === r.id).reduce((sum, s) => sum + s.profit, 0);
        return profitDisplay(prf);
      }},
      { key: 'repairsCount', render: r => repairs.filter(rep => rep.branchId === r.id).length },
      { key: 'status', render: r => statusBadge(r.status) }
    ];

    renderTable('table-branch-report-body', cols, branches, 'No branch performance data');
  }
};
