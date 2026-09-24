/* ============================================
   TRADE-IN & VALUATION MODULE
   ============================================ */

const TradeInModule = {
  renderTradeIns() {
    const list = StorageService.get('tradeIns') || [];
    const cols = [
      { key: 'id', render: r => `<span class="font-mono fw-700">${r.id}</span>` },
      { key: 'date', render: r => formatDate(r.date) },
      { key: 'customerName', render: r => `<strong>${r.customerName}</strong>` },
      { key: 'tradedDevice', render: r => `
        <div>
          <div>${r.deviceBrand} ${r.deviceModel}</div>
          <div class="font-mono imei-field" style="font-size:0.6875rem;color:var(--text-muted);">${r.imei}</div>
        </div>
      `},
      { key: 'condition', render: r => conditionBadge(r.condition) },
      { key: 'estMarketValue', render: r => formatCurrency(r.estMarketValue) },
      { key: 'finalValue', render: r => `<strong style="color:var(--primary);">${formatCurrency(r.finalValue)}</strong>` },
      { key: 'customerPayment', render: r => formatCurrency(r.customerPayment) },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="TradeInModule.openEditStatusModal('${r.id}')">✏️ Status</button>
        </div>
      `}
    ];

    renderTable('table-tradeins-body', cols, list, 'No trade-in transactions found');
  },

  calculateValuation() {
    const marketVal = parseFloat(document.getElementById('val-market-value')?.value || 0);
    const cond = document.getElementById('val-condition')?.value || 'Excellent';
    const repairEst = parseFloat(document.getElementById('val-repair-est')?.value || 0);
    const margin = parseFloat(document.getElementById('val-margin')?.value || 15);

    // Condition deduction factors
    const condFactors = { Excellent: 0.95, 'Very Good': 0.85, Good: 0.75, Fair: 0.60, Poor: 0.40 };
    const factor = condFactors[cond] || 0.8;

    const condAdjusted = marketVal * factor;
    const afterRepair = Math.max(condAdjusted - repairEst, 0);
    const suggestedValue = Math.max(Math.round(afterRepair * (1 - (margin / 100))), 0);

    // Update UI elements
    const setElem = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setElem('val-res-market', formatCurrency(marketVal));
    setElem('val-res-cond-adj', '-' + formatCurrency(marketVal - condAdjusted));
    setElem('val-res-repair-ded', '-' + formatCurrency(repairEst));
    setElem('val-res-margin-ded', '-' + formatCurrency(afterRepair * (margin / 100)));
    setElem('val-res-suggested', formatCurrency(suggestedValue));

    // Fill override default
    const overrideInput = document.getElementById('val-final-override');
    if (overrideInput && !overrideInput.dataset.touched) {
      overrideInput.value = suggestedValue;
    }
  },

  openNewTradeInModal() {
    clearForm('form-new-tradein');
    
    // Populate customers
    const customers = StorageService.get('customers') || [];
    const custSelect = document.getElementById('tradein-customer-select');
    if (custSelect) {
      custSelect.innerHTML = '<option value="">Select Customer...</option>' + 
        customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // Populate new devices available
    const newDevices = StorageService.get('newGadgets') || [];
    const devSelect = document.getElementById('tradein-newdevice-select');
    if (devSelect) {
      devSelect.innerHTML = '<option value="">Select New Device Purchased...</option>' + 
        newDevices.map(d => `<option value="${d.id}" data-price="${d.sellingPrice}">${d.brand} ${d.model} (${formatCurrency(d.sellingPrice)})</option>`).join('');
    }

    this.calculateValuation();
    openModal('modal-new-tradein');
  },

  saveTradeIn() {
    const custId = document.getElementById('tradein-customer-select').value;
    const cust = StorageService.getById('customers', custId);
    if (!cust) { showToast('Select a customer', 'error'); return; }

    const brand = document.getElementById('tradein-brand').value;
    const model = document.getElementById('tradein-model').value;
    const imei = document.getElementById('tradein-imei').value;
    const cond = document.getElementById('val-condition').value;
    const marketVal = parseFloat(document.getElementById('val-market-value').value || 0);
    const finalVal = parseFloat(document.getElementById('val-final-override').value || 0);

    const newDevSelect = document.getElementById('tradein-newdevice-select');
    const newDevOpt = newDevSelect.options[newDevSelect.selectedIndex];
    const newDevId = newDevOpt ? newDevOpt.value : '';
    const newDevPrice = newDevOpt ? parseFloat(newDevOpt.dataset.price || 0) : 0;
    const custPayment = Math.max(newDevPrice - finalVal, 0);

    if (!brand || !model || !imei || finalVal <= 0) {
      showToast('Fill device info and valid valuation', 'error');
      return;
    }

    const tradeInRecord = {
      id: generateId('TRD'),
      customerId: cust.id,
      customerName: cust.name,
      deviceBrand: brand,
      deviceModel: model,
      imei: imei,
      condition: cond,
      estMarketValue: marketVal,
      tradeInValue: finalVal,
      adjustment: 0,
      finalValue: finalVal,
      newDeviceId: newDevId,
      newDeviceName: newDevOpt ? newDevOpt.textContent : '',
      customerPayment: custPayment,
      staffMember: 'Admin',
      branchId: document.getElementById('tradein-branch-select')?.value || 'BR-001',
      date: todayISO(),
      status: 'Received',
      notes: 'Customer trade-in accepted'
    };

    // Auto-create a Used Device inventory record
    const usedRecord = {
      id: generateId('USED'),
      brand: brand,
      model: model,
      variant: 'Trade-In Unit',
      color: 'Default',
      storage: '128GB',
      ram: '8GB',
      imei: imei,
      serialNumber: imei,
      batteryHealth: cond === 'Excellent' ? 92 : cond === 'Good' ? 85 : 78,
      physicalCondition: cond,
      displayCondition: cond,
      cameraCondition: 'Good',
      speakerCondition: 'Good',
      micCondition: 'Good',
      biometricsStatus: 'Working',
      networkStatus: 'Unlocked',
      originalBox: false,
      accessories: 'None',
      purchaseCost: finalVal,
      repairCost: 0,
      refurbCost: 0,
      totalCost: finalVal,
      targetSellingPrice: Math.round(finalVal * 1.3),
      expectedProfit: Math.round(finalVal * 0.3),
      sellerName: cust.name,
      acquisitionDate: todayISO(),
      branchId: tradeInRecord.branchId,
      status: 'Ready for Sale',
      notes: `Traded in against ${tradeInRecord.newDeviceName}`
    };

    StorageService.add('tradeIns', tradeInRecord);
    StorageService.add('usedGadgets', usedRecord);

    showToast('Trade-in completed and added to Used Inventory!', 'success');
    closeModal('modal-new-tradein');
    this.renderTradeIns();
    InventoryModule.renderUsedGadgets();
    DashboardModule.render();
  },

  openEditStatusModal(id) {
    const item = StorageService.getById('tradeIns', id);
    if (!item) return;
    document.getElementById('edit-tradein-id').value = item.id;
    document.getElementById('edit-tradein-status').value = item.status;
    openModal('modal-edit-tradein');
  },

  updateTradeInStatus() {
    const id = document.getElementById('edit-tradein-id').value;
    const status = document.getElementById('edit-tradein-status').value;
    StorageService.update('tradeIns', id, { status });
    showToast('Trade-in status updated', 'success');
    closeModal('modal-edit-tradein');
    this.renderTradeIns();
  }
};
