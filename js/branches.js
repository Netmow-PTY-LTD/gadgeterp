/* ============================================
   BRANCH MANAGEMENT & TRANSFERS MODULE
   ============================================ */

const BranchesModule = {
  renderBranches() {
    const list = StorageService.get('branches') || [];
    const newGadgets = StorageService.get('newGadgets') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];
    const sales = StorageService.get('sales') || [];

    const cols = [
      { key: 'name', render: r => `
        <div>
          <div style="font-weight:600;">${r.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${r.code} • Manager: ${r.manager}</div>
        </div>
      `},
      { key: 'address' },
      { key: 'phone' },
      { key: 'email' },
      { key: 'stockMetrics', render: r => {
        const bNew = newGadgets.filter(n => n.branchId === r.id);
        const bUsed = usedGadgets.filter(u => u.branchId === r.id && u.status !== 'Sold');
        const val = bNew.reduce((sum, n) => sum + (n.purchaseCost * n.currentStock), 0) + bUsed.reduce((sum, u) => sum + u.totalCost, 0);
        return `<div>Stock: <strong>${bNew.reduce((s,n)=>s+n.currentStock,0) + bUsed.length} units</strong><br/><span style="font-size:0.75rem;color:var(--text-muted);">Val: ${formatCurrency(val)}</span></div>`;
      }},
      { key: 'salesTotal', render: r => {
        const total = sales.filter(s => s.branchId === r.id).reduce((sum, s) => sum + s.finalSellingPrice, 0);
        return `<strong style="color:var(--success);">${formatCurrency(total)}</strong>`;
      }},
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="BranchesModule.openEditBranchModal('${r.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="BranchesModule.deleteBranch('${r.id}')">🗑️</button>
        </div>
      `}
    ];

    renderTable('table-branches-body', cols, list, 'No branches found');
  },

  openAddBranchModal() {
    clearForm('form-add-branch');
    document.getElementById('modal-branch-title').textContent = 'Add New Branch';
    document.getElementById('branch-id-field').value = '';
    openModal('modal-branch');
  },

  openEditBranchModal(id) {
    const b = StorageService.getById('branches', id);
    if (!b) return;
    populateForm('form-add-branch', b);
    document.getElementById('modal-branch-title').textContent = 'Edit Branch: ' + b.name;
    document.getElementById('branch-id-field').value = b.id;
    openModal('modal-branch');
  },

  saveBranch() {
    const data = getFormData('form-add-branch');
    if (!validateRequired('form-add-branch', [{ name: 'name', label: 'Branch Name' }, { name: 'code', label: 'Branch Code' }])) return;

    if (data.id) {
      StorageService.update('branches', data.id, data);
      showToast('Branch updated', 'success');
    } else {
      data.id = generateId('BR');
      data.openingDate = todayISO();
      data.status = 'Active';
      StorageService.add('branches', data);
      showToast('New branch created', 'success');
    }
    closeModal('modal-branch');
    this.renderBranches();
    AppModule.populateBranchSelectors();
  },

  deleteBranch(id) {
    showConfirm('Delete Branch', 'Are you sure you want to delete this branch location?', () => {
      StorageService.delete('branches', id);
      showToast('Branch removed', 'success');
      this.renderBranches();
      AppModule.populateBranchSelectors();
    });
  },

  // --- BRANCH TRANSFERS ---
  renderTransfers() {
    const list = StorageService.get('branchTransfers') || [];
    const cols = [
      { key: 'id', render: r => `<span class="font-mono fw-700">${r.id}</span>` },
      { key: 'transferDate', render: r => formatDate(r.transferDate) },
      { key: 'routing', render: r => `
        <div class="transfer-card" style="padding:0.375rem 0.5rem;">
          <div class="branch-from"><div class="val" style="font-size:0.75rem;">${getBranchName(r.fromBranchId)}</div></div>
          <div class="transfer-arrow" style="font-size:0.875rem;">➔</div>
          <div class="branch-to"><div class="val" style="font-size:0.75rem;">${getBranchName(r.toBranchId)}</div></div>
        </div>
      `},
      { key: 'requestedBy' },
      { key: 'approvedBy', render: r => r.approvedBy || 'Pending' },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          ${r.status === 'Requested' ? `<button class="btn btn-secondary btn-sm" onclick="BranchesModule.updateTransferStatus('${r.id}', 'In Transit')">🚚 Ship</button>` : ''}
          ${r.status === 'In Transit' ? `<button class="btn btn-primary btn-sm" onclick="BranchesModule.updateTransferStatus('${r.id}', 'Received')">✅ Receive</button>` : ''}
        </div>
      `}
    ];

    renderTable('table-transfers-body', cols, list, 'No stock transfers found');
  },

  openNewTransferModal() {
    clearForm('form-new-transfer');
    
    // Populate branches
    const branches = StorageService.get('branches') || [];
    const fromSel = document.getElementById('trf-from-branch');
    const toSel = document.getElementById('trf-to-branch');
    if (fromSel && toSel) {
      const opts = '<option value="">Select Branch...</option>' + branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
      fromSel.innerHTML = opts;
      toSel.innerHTML = opts;
    }

    // Populate devices
    const newGadgets = StorageService.get('newGadgets') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];
    const devSelect = document.getElementById('trf-device-select');
    if (devSelect) {
      devSelect.innerHTML = '<option value="">Select Device to Transfer...</option>' +
        newGadgets.map(n => `<option value="${n.id}" data-type="new">[NEW] ${n.brand} ${n.model} (${n.sku})</option>`).join('') +
        usedGadgets.map(u => `<option value="${u.id}" data-type="used">[USED] ${u.brand} ${u.model} (${u.imei})</option>`).join('');
    }

    openModal('modal-new-transfer');
  },

  saveTransfer() {
    const fromB = document.getElementById('trf-from-branch').value;
    const toB = document.getElementById('trf-to-branch').value;
    const devSelect = document.getElementById('trf-device-select');
    const opt = devSelect.options[devSelect.selectedIndex];

    if (!fromB || !toB || fromB === toB || !opt || !opt.value) {
      showToast('Select different source/destination branches and a device', 'error');
      return;
    }

    const trfRecord = {
      id: generateId('TRF'),
      fromBranchId: fromB,
      toBranchId: toB,
      productId: opt.value,
      imeiSerial: opt.textContent,
      transferDate: todayISO(),
      requestedBy: 'Admin',
      approvedBy: 'Sarah Jenkins',
      status: 'In Transit',
      notes: document.getElementById('trf-notes')?.value || ''
    };

    StorageService.add('branchTransfers', trfRecord);
    showToast('Branch stock transfer initiated!', 'success');
    closeModal('modal-new-transfer');
    this.renderTransfers();
  },

  updateTransferStatus(id, newStatus) {
    const trf = StorageService.getById('branchTransfers', id);
    if (!trf) return;

    trf.status = newStatus;
    if (newStatus === 'Received') {
      // Re-assign device branch
      const prodNew = StorageService.getById('newGadgets', trf.productId);
      if (prodNew) {
        prodNew.branchId = trf.toBranchId;
        StorageService.update('newGadgets', prodNew.id, prodNew);
      }
      const prodUsed = StorageService.getById('usedGadgets', trf.productId);
      if (prodUsed) {
        prodUsed.branchId = trf.toBranchId;
        StorageService.update('usedGadgets', prodUsed.id, prodUsed);
      }
    }
    StorageService.update('branchTransfers', id, trf);

    showToast(`Transfer marked as ${newStatus}`, 'success');
    this.renderTransfers();
    InventoryModule.renderNewGadgets();
    InventoryModule.renderUsedGadgets();
  }
};
