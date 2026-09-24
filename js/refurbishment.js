/* ============================================
   REFURBISHMENT MANAGEMENT MODULE
   ============================================ */

const RefurbishmentModule = {
  renderRefurbishments() {
    const list = StorageService.get('refurbishments') || [];
    const cols = [
      { key: 'id', render: r => `<span class="font-mono fw-700">${r.id}</span>` },
      { key: 'deviceName', render: r => `
        <div>
          <div style="font-weight:600;">${r.deviceName}</div>
          <div class="font-mono imei-field" style="font-size:0.6875rem;color:var(--text-muted);">${r.imei}</div>
        </div>
      `},
      { key: 'technician', render: r => r.technician || 'Unassigned' },
      { key: 'startDate', render: r => formatDate(r.startDate) },
      { key: 'conditionChange', render: r => `
        <span style="font-size:0.75rem;">${conditionBadge(r.conditionBefore)} ➔ ${conditionBadge(r.conditionAfter)}</span>
      `},
      { key: 'totalCost', render: r => formatCurrency(r.totalCost) },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="RefurbishmentModule.openEditModal('${r.id}')">✏️ Edit</button>
        </div>
      `}
    ];

    renderTable('table-refurbishments-body', cols, list, 'No refurbishments found');
  },

  openNewRefurbModal() {
    clearForm('form-new-refurb');

    // Populate devices eligible for refurbishment (Used Devices)
    const usedDevices = StorageService.get('usedGadgets') || [];
    const devSelect = document.getElementById('refurb-device-select');
    if (devSelect) {
      devSelect.innerHTML = '<option value="">Select Used Device for Refurbishment...</option>' + 
        usedDevices.map(d => `<option value="${d.id}" data-imei="${d.imei}" data-name="${d.brand} ${d.model}" data-cond="${d.physicalCondition}">${d.brand} ${d.model} (${d.imei}) - ${d.status}</option>`).join('');
    }

    openModal('modal-new-refurb');
  },

  saveRefurbishment() {
    const devSelect = document.getElementById('refurb-device-select');
    const opt = devSelect.options[devSelect.selectedIndex];

    if (!opt || !opt.value) { showToast('Select a device to refurbish', 'error'); return; }

    const tech = document.getElementById('refurb-tech-field').value;
    const partsCost = parseFloat(document.getElementById('refurb-parts-cost').value || 0);
    const laborCost = parseFloat(document.getElementById('refurb-labor-cost').value || 0);
    const totalCost = partsCost + laborCost;
    const condBefore = opt.dataset.cond || 'Fair';
    const condAfter = document.getElementById('refurb-cond-after').value || 'Very Good';
    const branchId = document.getElementById('refurb-branch-select').value || 'BR-001';

    const refurbRecord = {
      id: generateId('REF'),
      deviceId: opt.value,
      imei: opt.dataset.imei,
      deviceName: opt.dataset.name,
      branchId: branchId,
      technician: tech || 'Alex Rivera',
      startDate: todayISO(),
      expectedCompletion: addDays(todayISO(), 3),
      completionDate: '',
      refurbCost: laborCost,
      partsCost: partsCost,
      laborCost: laborCost,
      totalCost: totalCost,
      conditionBefore: condBefore,
      conditionAfter: condAfter,
      status: 'In Progress',
      notes: document.getElementById('refurb-notes').value || 'Refurbishment initiated'
    };

    // Update used device state
    const dev = StorageService.getById('usedGadgets', opt.value);
    if (dev) {
      dev.status = 'Refurbishment';
      dev.refurbCost = (dev.refurbCost || 0) + totalCost;
      dev.totalCost = (dev.purchaseCost || 0) + (dev.repairCost || 0) + dev.refurbCost;
      dev.expectedProfit = (dev.targetSellingPrice || 0) - dev.totalCost;
      StorageService.update('usedGadgets', dev.id, dev);
    }

    StorageService.add('refurbishments', refurbRecord);
    showToast('Refurbishment record created and device sent to lab', 'success');
    closeModal('modal-new-refurb');
    this.renderRefurbishments();
    InventoryModule.renderUsedGadgets();
  },

  openEditModal(id) {
    const item = StorageService.getById('refurbishments', id);
    if (!item) return;
    document.getElementById('edit-refurb-id').value = item.id;
    document.getElementById('edit-refurb-status').value = item.status;
    document.getElementById('edit-refurb-cond-after').value = item.conditionAfter;
    openModal('modal-edit-refurb');
  },

  updateRefurbStatus() {
    const id = document.getElementById('edit-refurb-id').value;
    const status = document.getElementById('edit-refurb-status').value;
    const condAfter = document.getElementById('edit-refurb-cond-after').value;

    const refurb = StorageService.getById('refurbishments', id);
    if (refurb) {
      refurb.status = status;
      refurb.conditionAfter = condAfter;
      if (['Completed', 'Ready for Sale'].includes(status)) {
        refurb.completionDate = todayISO();
        
        // Update device physical condition & status
        const dev = StorageService.getById('usedGadgets', refurb.deviceId);
        if (dev) {
          dev.physicalCondition = condAfter;
          dev.displayCondition = condAfter;
          dev.status = 'Ready for Sale';
          StorageService.update('usedGadgets', dev.id, dev);
        }
      }
      StorageService.update('refurbishments', id, refurb);
    }

    showToast('Refurbishment record updated', 'success');
    closeModal('modal-edit-refurb');
    this.renderRefurbishments();
    InventoryModule.renderUsedGadgets();
  }
};
