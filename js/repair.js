/* ============================================
   REPAIR MANAGEMENT MODULE
   ============================================ */

const RepairModule = {
  state: {
    page: 1, perPage: 10, search: '', status: '', branch: ''
  },

  renderRepairs() {
    const list = StorageService.get('repairs') || [];
    const { page, perPage, search, status, branch } = this.state;

    const filtered = filterData(list, search, ['id', 'customerName', 'deviceBrand', 'deviceModel', 'imei', 'problemDesc'], {
      status, branchId: branch
    });

    const paginated = paginate(filtered, page, perPage);

    const cols = [
      { key: 'id', render: r => `<span class="font-mono fw-700">${r.id}</span>` },
      { key: 'receivedDate', render: r => formatDate(r.receivedDate) },
      { key: 'customerName', render: r => `<strong>${r.customerName}</strong>` },
      { key: 'device', render: r => `
        <div>
          <div>${r.deviceBrand} ${r.deviceModel}</div>
          <div class="font-mono imei-field" style="font-size:0.6875rem;color:var(--text-muted);">${r.imei}</div>
        </div>
      `},
      { key: 'problemDesc', render: r => truncate(r.problemDesc, 25) },
      { key: 'technician', render: r => r.technician || 'Unassigned' },
      { key: 'costSummary', render: r => `
        <div>
          <div>Est: ${formatCurrency(r.customerPrice)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Parts: ${formatCurrency(r.partsCost)}</div>
        </div>
      `},
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="RepairModule.viewRepairDetails('${r.id}')">👁️ Detail</button>
          <button class="btn btn-outline btn-sm" onclick="RepairModule.openEditRepairModal('${r.id}')">✏️</button>
        </div>
      `}
    ];

    renderTable('table-repairs-body', cols, paginated.data, 'No repair tickets found');
    renderPagination('repairs-pagination', 'repairs-info', page, filtered.length, perPage, (p) => {
      this.state.page = p;
      this.renderRepairs();
    });
  },

  openNewRepairModal() {
    clearForm('form-new-repair');
    
    // Populate customers
    const customers = StorageService.get('customers') || [];
    const custSelect = document.getElementById('repair-customer-select');
    if (custSelect) {
      custSelect.innerHTML = '<option value="">Select Customer...</option>' + 
        customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // Populate spare parts options
    const spareParts = StorageService.get('spareParts') || [];
    const partSelect = document.getElementById('repair-part-select');
    if (partSelect) {
      partSelect.innerHTML = '<option value="">(Optional) Add Repair Spare Part...</option>' + 
        spareParts.map(p => `<option value="${p.id}" data-cost="${p.purchaseCost}">${p.partName} - ${formatCurrency(p.sellingPrice)}</option>`).join('');
    }

    openModal('modal-new-repair');
  },

  openEditRepairModal(id) {
    const item = StorageService.getById('repairs', id);
    if (!item) return;
    populateForm('form-new-repair', item);
    document.getElementById('modal-repair-title').textContent = 'Edit Ticket: ' + item.id;
    document.getElementById('repair-id-field').value = item.id;
    openModal('modal-new-repair');
  },

  saveRepair() {
    const data = getFormData('form-new-repair');
    if (!validateRequired('form-new-repair', [
      { name: 'deviceBrand', label: 'Device Brand' },
      { name: 'deviceModel', label: 'Device Model' },
      { name: 'problemDesc', label: 'Problem Description' }
    ])) return;

    const cust = StorageService.getById('customers', data.customerId);
    data.customerName = cust ? cust.name : (data.customerName || 'Walk-in Customer');

    const partsCost = parseFloat(data.partsCost || 0);
    const laborCost = parseFloat(data.laborCost || 0);
    data.totalCost = partsCost + laborCost;
    data.customerPrice = parseFloat(data.customerPrice || data.estimatedCost || (data.totalCost * 1.4));

    if (data.id) {
      StorageService.update('repairs', data.id, data);
      showToast('Repair ticket updated', 'success');
    } else {
      data.id = generateId('REP');
      data.receivedDate = todayISO();
      data.status = data.status || 'Received';
      StorageService.add('repairs', data);
      showToast('New repair ticket created!', 'success');
    }
    closeModal('modal-new-repair');
    this.renderRepairs();
    DashboardModule.render();
  },

  viewRepairDetails(id) {
    const repair = StorageService.getById('repairs', id);
    if (!repair) return;

    const container = document.getElementById('repair-detail-content');
    if (!container) return;

    container.innerHTML = `
      <div class="two-col mb-4">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Ticket Information: ${repair.id}</div>
            ${statusBadge(repair.status)}
          </div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item"><div class="detail-label">Customer</div><div class="detail-value">${repair.customerName}</div></div>
              <div class="detail-item"><div class="detail-label">Device</div><div class="detail-value">${repair.deviceBrand} ${repair.deviceModel}</div></div>
              <div class="detail-item"><div class="detail-label">IMEI / Serial</div><div class="detail-value font-mono">${repair.imei || '—'}</div></div>
              <div class="detail-item"><div class="detail-label">Technician</div><div class="detail-value">${repair.technician || 'Unassigned'}</div></div>
              <div class="detail-item"><div class="detail-label">Branch</div><div class="detail-value">${getBranchName(repair.branchId)}</div></div>
              <div class="detail-item"><div class="detail-label">Warranty</div><div class="detail-value">${repair.warranty || '30 Days'}</div></div>
              <div class="detail-item"><div class="detail-label">Received Date</div><div class="detail-value">${formatDate(repair.receivedDate)}</div></div>
              <div class="detail-item"><div class="detail-label">Expected Completion</div><div class="detail-value">${formatDate(repair.expectedDate)}</div></div>
            </div>
            <div class="mt-3">
              <div class="detail-label">Problem Reported</div>
              <p style="font-size:0.875rem;background:var(--bg);padding:0.75rem;border-radius:var(--radius);">${repair.problemDesc}</p>
            </div>
            <div class="mt-2">
              <div class="detail-label">Technician Diagnosis</div>
              <p style="font-size:0.875rem;background:var(--bg);padding:0.75rem;border-radius:var(--radius);">${repair.diagnosis || 'Pending inspection.'}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Financial Summary & Payment</div></div>
          <div class="card-body">
            <table class="financial-table">
              <tr><td class="label-col">Parts Cost</td><td class="value-col">${formatCurrency(repair.partsCost)}</td></tr>
              <tr><td class="label-col">Labor Cost</td><td class="value-col">${formatCurrency(repair.laborCost)}</td></tr>
              <tr class="total-row"><td class="label-col">TOTAL INTERNAL COST</td><td class="value-col">${formatCurrency(repair.totalCost)}</td></tr>
              <tr><td class="label-col">Customer Billed Price</td><td class="value-col" style="font-size:1.125rem;font-weight:700;color:var(--primary);">${formatCurrency(repair.customerPrice)}</td></tr>
              <tr class="profit-row"><td class="label-col">REPAIR PROFIT MARGIN</td><td class="value-col" style="font-weight:700;">${formatCurrency(repair.customerPrice - repair.totalCost)}</td></tr>
            </table>

            <div class="mt-4" style="text-align:right;">
              <button class="btn btn-outline btn-sm" onclick="RepairModule.openEditRepairModal('${repair.id}')">Update Status / Diagnosis</button>
            </div>
          </div>
        </div>
      </div>
    `;

    openModal('modal-repair-detail');
  }
};
