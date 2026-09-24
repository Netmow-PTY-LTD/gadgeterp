/* ============================================
   INVENTORY MODULE (NEW, USED, SPARE PARTS, AGING, TAKES, BARCODES)
   ============================================ */

const InventoryModule = {
  // State for pagination & filters
  state: {
    newGadgets: { page: 1, perPage: 10, search: '', brand: '', category: '', branch: '' },
    usedGadgets: { page: 1, perPage: 10, search: '', brand: '', condition: '', status: '', branch: '' },
    spareParts: { page: 1, perPage: 10, search: '', category: '', branch: '' },
    aging: { filterDays: 'all', branch: '' },
    slow: { thresholdDays: 90, branch: '' }
  },

  // --- NEW GADGETS ---
  renderNewGadgets() {
    const list = StorageService.get('newGadgets') || [];
    const { page, perPage, search, brand, category, branch } = this.state.newGadgets;

    const filtered = filterData(list, search, ['brand', 'model', 'sku', 'imei', 'barcode'], {
      brand, category, branchId: branch
    });

    const paginated = paginate(filtered, page, perPage);

    const cols = [
      { key: 'product', render: r => `
        <div style="display:flex;align-items:center;gap:.75rem;">
          <div class="device-img">${r.brand === 'Apple' ? '🍎' : r.brand === 'Samsung' ? '📱' : '📱'}</div>
          <div>
            <div style="font-weight:600;">${r.brand} ${r.model}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${r.variant} • ${r.color}</div>
          </div>
        </div>
      `},
      { key: 'sku', render: r => `<span class="font-mono">${r.sku}</span>` },
      { key: 'imei', render: r => `<span class="font-mono imei-field">${r.imei || '—'}</span>` },
      { key: 'purchaseCost', render: r => formatCurrency(r.purchaseCost) },
      { key: 'sellingPrice', render: r => formatCurrency(r.sellingPrice) },
      { key: 'currentStock', render: r => `
        <div class="stock-indicator ${r.currentStock <= r.minimumStock ? 'stock-low' : 'stock-ok'}">
          <span style="font-weight:700;">${r.currentStock}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">(min: ${r.minimumStock})</span>
        </div>
      `},
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="InventoryModule.viewDeviceDetail('${r.id}', 'new')">👁️</button>
          <button class="btn btn-outline btn-sm" onclick="InventoryModule.openEditNewGadgetModal('${r.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="InventoryModule.deleteNewGadget('${r.id}')">🗑️</button>
        </div>
      `}
    ];

    renderTable('table-new-gadgets-body', cols, paginated.data, 'No new gadgets found');
    renderPagination('new-gadgets-pagination', 'new-gadgets-info', page, filtered.length, perPage, (p) => {
      this.state.newGadgets.page = p;
      this.renderNewGadgets();
    });
  },

  openAddNewGadgetModal() {
    clearForm('form-add-new-gadget');
    document.getElementById('modal-new-gadget-title').textContent = 'Add New Gadget';
    document.getElementById('new-gadget-id-field').value = '';
    openModal('modal-new-gadget');
  },

  openEditNewGadgetModal(id) {
    const item = StorageService.getById('newGadgets', id);
    if (!item) return;
    populateForm('form-add-new-gadget', item);
    document.getElementById('modal-new-gadget-title').textContent = 'Edit Gadget: ' + item.brand + ' ' + item.model;
    document.getElementById('new-gadget-id-field').value = item.id;
    openModal('modal-new-gadget');
  },

  saveNewGadget() {
    const data = getFormData('form-add-new-gadget');
    if (!validateRequired('form-add-new-gadget', [
      { name: 'brand', label: 'Brand' },
      { name: 'model', label: 'Model' },
      { name: 'sku', label: 'SKU' },
      { name: 'purchaseCost', label: 'Purchase Cost' },
      { name: 'sellingPrice', label: 'Selling Price' }
    ])) return;

    // Check duplicate IMEI if entered
    if (data.imei) {
      const allNew = StorageService.get('newGadgets') || [];
      const dup = allNew.find(n => n.imei === data.imei && n.id !== data.id);
      if (dup) { showToast('IMEI already exists in inventory', 'error'); return; }
    }

    if (data.id) {
      StorageService.update('newGadgets', data.id, data);
      showToast('Gadget updated successfully', 'success');
    } else {
      data.id = generateId('PROD');
      data.createdAt = todayISO();
      data.status = data.status || 'In Stock';
      StorageService.add('newGadgets', data);
      showToast('New gadget created successfully', 'success');
    }
    closeModal('modal-new-gadget');
    this.renderNewGadgets();
    DashboardModule.render();
  },

  deleteNewGadget(id) {
    showConfirm('Delete Product', 'Are you sure you want to delete this gadget?', () => {
      StorageService.delete('newGadgets', id);
      showToast('Product deleted', 'success');
      this.renderNewGadgets();
      DashboardModule.render();
    });
  },

  // --- USED GADGETS ---
  renderUsedGadgets() {
    const list = StorageService.get('usedGadgets') || [];
    const { page, perPage, search, brand, condition, status, branch } = this.state.usedGadgets;

    const filtered = filterData(list, search, ['brand', 'model', 'imei', 'serialNumber', 'sellerName'], {
      brand, physicalCondition: condition, status, branchId: branch
    });

    const paginated = paginate(filtered, page, perPage);

    const cols = [
      { key: 'device', render: r => `
        <div style="display:flex;align-items:center;gap:.75rem;">
          <div class="device-img">📱</div>
          <div>
            <div style="font-weight:600;">${r.brand} ${r.model}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${r.variant || ''} • ${r.color || ''}</div>
          </div>
        </div>
      `},
      { key: 'imei', render: r => `<span class="font-mono imei-field">${r.imei}</span>` },
      { key: 'condition', render: r => conditionBadge(r.physicalCondition) },
      { key: 'batteryHealth', render: r => `
        <span style="font-weight:600;color:${r.batteryHealth > 85 ? 'var(--success)' : r.batteryHealth > 75 ? 'var(--warning)' : 'var(--danger)'}">
          ⚡ ${r.batteryHealth}%
        </span>
      `},
      { key: 'costs', render: r => `
        <div>
          <div>Cost: <strong>${formatCurrency(r.totalCost)}</strong></div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Target: ${formatCurrency(r.targetSellingPrice)}</div>
        </div>
      `},
      { key: 'profit', render: r => profitDisplay(r.expectedProfit || (r.targetSellingPrice - r.totalCost)) },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="InventoryModule.viewDeviceDetail('${r.id}', 'used')">👁️ Profile</button>
          <button class="btn btn-outline btn-sm" onclick="InventoryModule.openEditUsedGadgetModal('${r.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="InventoryModule.deleteUsedGadget('${r.id}')">🗑️</button>
        </div>
      `}
    ];

    renderTable('table-used-gadgets-body', cols, paginated.data, 'No used gadgets found');
    renderPagination('used-gadgets-pagination', 'used-gadgets-info', page, filtered.length, perPage, (p) => {
      this.state.usedGadgets.page = p;
      this.renderUsedGadgets();
    });
  },

  openAddUsedGadgetModal() {
    clearForm('form-add-used-gadget');
    document.getElementById('modal-used-gadget-title').textContent = 'Add Used Device Record';
    document.getElementById('used-gadget-id-field').value = '';
    openModal('modal-used-gadget');
  },

  openEditUsedGadgetModal(id) {
    const item = StorageService.getById('usedGadgets', id);
    if (!item) return;
    populateForm('form-add-used-gadget', item);
    document.getElementById('modal-used-gadget-title').textContent = 'Edit Used Device: ' + item.brand + ' ' + item.model;
    document.getElementById('used-gadget-id-field').value = item.id;
    openModal('modal-used-gadget');
  },

  saveUsedGadget() {
    const data = getFormData('form-add-used-gadget');
    if (!validateRequired('form-add-used-gadget', [
      { name: 'brand', label: 'Brand' },
      { name: 'model', label: 'Model' },
      { name: 'imei', label: 'IMEI Number' },
      { name: 'purchaseCost', label: 'Purchase Cost' },
      { name: 'targetSellingPrice', label: 'Target Selling Price' }
    ])) return;

    // Check duplicate IMEI
    const allUsed = StorageService.get('usedGadgets') || [];
    const dup = allUsed.find(u => u.imei === data.imei && u.id !== data.id);
    if (dup) { showToast('IMEI already registered in Used Devices', 'error'); return; }

    // Calculate total cost & profit
    const pCost = parseFloat(data.purchaseCost || 0);
    const rCost = parseFloat(data.repairCost || 0);
    const refCost = parseFloat(data.refurbCost || 0);
    const totCost = pCost + rCost + refCost;
    const sellPrice = parseFloat(data.targetSellingPrice || 0);

    data.totalCost = totCost;
    data.expectedProfit = sellPrice - totCost;
    data.batteryHealth = parseInt(data.batteryHealth || 85);

    if (data.id) {
      StorageService.update('usedGadgets', data.id, data);
      showToast('Used device updated', 'success');
    } else {
      data.id = generateId('USED');
      data.acquisitionDate = data.acquisitionDate || todayISO();
      data.status = data.status || 'Ready for Sale';
      StorageService.add('usedGadgets', data);
      showToast('Used device created', 'success');
    }
    closeModal('modal-used-gadget');
    this.renderUsedGadgets();
    DashboardModule.render();
  },

  deleteUsedGadget(id) {
    showConfirm('Delete Used Device', 'Are you sure you want to delete this device record?', () => {
      StorageService.delete('usedGadgets', id);
      showToast('Used device record removed', 'success');
      this.renderUsedGadgets();
      DashboardModule.render();
    });
  },

  // --- DEVICE DETAIL PAGE & FINANCIAL PROFILE ---
  viewDeviceDetail(id, type = 'new') {
    let device = null;
    if (type === 'used') {
      device = StorageService.getById('usedGadgets', id);
    } else {
      device = StorageService.getById('newGadgets', id);
    }

    if (!device) { showToast('Device record not found', 'error'); return; }

    const container = document.getElementById('device-profile-content');
    if (!container) return;

    // Financial calculations
    const purchaseCost = parseFloat(device.purchaseCost || 0);
    const repairCost = parseFloat(device.repairCost || 0);
    const refurbCost = parseFloat(device.refurbCost || 0);
    const partsCost = parseFloat(device.partsCost || 0);
    const otherCost = parseFloat(device.otherCost || 0);
    const totalCost = device.totalCost ? parseFloat(device.totalCost) : (purchaseCost + repairCost + refurbCost + partsCost + otherCost);
    const sellingPrice = parseFloat(device.sellingPrice || device.targetSellingPrice || 0);
    const profit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;

    // Related records search
    const repairs = (StorageService.get('repairs') || []).filter(r => r.imei === device.imei);
    const refurbs = (StorageService.get('refurbishments') || []).filter(rf => rf.imei === device.imei || rf.deviceId === device.id);
    const sales = (StorageService.get('sales') || []).filter(s => s.imei === device.imei || s.deviceId === device.id);
    const tradeIns = (StorageService.get('tradeIns') || []).filter(t => t.imei === device.imei);

    container.innerHTML = `
      <div class="two-col" style="margin-bottom:1.5rem;">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Device General Info</div>
            ${statusBadge(device.status)}
          </div>
          <div class="card-body">
            <div style="display:flex;gap:1.25rem;margin-bottom:1.25rem;align-items:center;">
              <div style="width:72px;height:72px;background:var(--primary-bg);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;font-size:2.5rem;">
                📱
              </div>
              <div>
                <h3 style="font-size:1.25rem;font-weight:700;">${device.brand} ${device.model}</h3>
                <p style="color:var(--text-secondary);font-size:0.875rem;">${device.variant || ''} • ${device.color || ''} • ${device.storage || ''}</p>
                <div style="margin-top:0.25rem;">${generateBarcode(device.barcode || device.imei)}</div>
              </div>
            </div>
            
            <div class="detail-grid">
              <div class="detail-item"><div class="detail-label">IMEI Number</div><div class="detail-value font-mono">${device.imei || '—'}</div></div>
              <div class="detail-item"><div class="detail-label">Serial Number</div><div class="detail-value font-mono">${device.serialNumber || device.sku || '—'}</div></div>
              <div class="detail-item"><div class="detail-label">Branch</div><div class="detail-value">${getBranchName(device.branchId)}</div></div>
              <div class="detail-item"><div class="detail-label">Battery Health</div><div class="detail-value">${device.batteryHealth ? device.batteryHealth + '%' : 'N/A (New)'}</div></div>
              <div class="detail-item"><div class="detail-label">Condition</div><div class="detail-value">${conditionBadge(device.physicalCondition || 'New')}</div></div>
              <div class="detail-item"><div class="detail-label">Acquisition / Purchase</div><div class="detail-value">${formatDate(device.acquisitionDate || device.purchaseDate)}</div></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">IMEI Financial Breakdown</div>
          </div>
          <div class="card-body">
            <table class="financial-table">
              <tr><td class="label-col">Purchase / Acquisition Cost</td><td class="value-col">${formatCurrency(purchaseCost)}</td></tr>
              ${repairCost ? `<tr><td class="label-col">+ Repair Cost</td><td class="value-col">${formatCurrency(repairCost)}</td></tr>` : ''}
              ${refurbCost ? `<tr><td class="label-col">+ Refurbishment Cost</td><td class="value-col">${formatCurrency(refurbCost)}</td></tr>` : ''}
              ${partsCost ? `<tr><td class="label-col">+ Spare Parts Cost</td><td class="value-col">${formatCurrency(partsCost)}</td></tr>` : ''}
              <tr class="total-row"><td class="label-col">TOTAL ACCUMULATED COST</td><td class="value-col">${formatCurrency(totalCost)}</td></tr>
              <tr><td class="label-col">Target / Actual Selling Price</td><td class="value-col" style="font-weight:700;">${formatCurrency(sellingPrice)}</td></tr>
              <tr class="${profit >= 0 ? 'profit-row' : 'loss-row'}">
                <td class="label-col">ESTIMATED / ACTUAL PROFIT</td>
                <td class="value-col" style="font-size:1.125rem;">${formatCurrency(profit)} (${margin}%)</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="card-header"><div class="card-title">Lifecycle History & Timeline</div></div>
          <div class="card-body">
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot filled"></div>
                <div class="timeline-content">
                  <div class="timeline-title">Device Acquired</div>
                  <div class="timeline-desc">Acquired from ${device.supplierId ? getSupplierName(device.supplierId) : (device.sellerName || 'Customer Trade-In')} for ${formatCurrency(purchaseCost)}</div>
                  <div class="timeline-time">${formatDate(device.acquisitionDate || device.purchaseDate)}</div>
                </div>
              </div>
              
              ${refurbs.length ? `
                <div class="timeline-item">
                  <div class="timeline-dot filled"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Refurbishment & Quality Check</div>
                    <div class="timeline-desc">Status: ${refurbs[0].status}. Cost: ${formatCurrency(refurbs[0].totalCost)}</div>
                    <div class="timeline-time">${formatDate(refurbs[0].completionDate || refurbs[0].startDate)}</div>
                  </div>
                </div>
              ` : ''}

              ${repairs.length ? `
                <div class="timeline-item">
                  <div class="timeline-dot filled"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Repair Ticket (${repairs[0].id})</div>
                    <div class="timeline-desc">Problem: ${repairs[0].problemDesc}. Diagnosis: ${repairs[0].diagnosis}</div>
                    <div class="timeline-time">${formatDate(repairs[0].receivedDate)}</div>
                  </div>
                </div>
              ` : ''}

              <div class="timeline-item">
                <div class="timeline-dot ${device.status === 'Sold' ? 'filled' : ''}"></div>
                <div class="timeline-content">
                  <div class="timeline-title">${device.status === 'Sold' ? 'Sold to Customer' : 'Listed in Inventory'}</div>
                  <div class="timeline-desc">${device.status === 'Sold' ? 'Completed sale invoice generated' : 'Available for purchase or trade-in'}</div>
                  <div class="timeline-time">${device.status === 'Sold' && sales.length ? formatDate(sales[0].saleDate) : 'Current Status: ' + device.status}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Associated Logs (Repairs / Sales / Trade-ins)</div></div>
          <div class="card-body">
            <p style="font-size:0.8125rem;font-weight:600;margin-bottom:0.5rem;">Repair Logs (${repairs.length})</p>
            ${repairs.length ? repairs.map(r => `<div style="font-size:0.75rem;padding:0.375rem 0;border-bottom:1px solid var(--border-light);">${r.id} - ${r.problemDesc} (${statusBadge(r.status)})</div>`).join('') : '<p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">No repair history</p>'}

            <p style="font-size:0.8125rem;font-weight:600;margin-top:1rem;margin-bottom:0.5rem;">Sales Log (${sales.length})</p>
            ${sales.length ? sales.map(s => `<div style="font-size:0.75rem;padding:0.375rem 0;border-bottom:1px solid var(--border-light);">${s.invoiceNum} - Sold to ${s.customerName} on ${formatDate(s.saleDate)}</div>`).join('') : '<p style="font-size:0.75rem;color:var(--text-muted);">Not sold yet</p>'}
          </div>
        </div>
      </div>
    `;

    // Navigate to device details view
    AppModule.navigateTo('device-details');
  },

  // --- SPARE PARTS ---
  renderSpareParts() {
    const list = StorageService.get('spareParts') || [];
    const { page, perPage, search, category, branch } = this.state.spareParts;

    const filtered = filterData(list, search, ['partName', 'partNumber', 'compatibleBrand', 'compatibleModel', 'barcode', 'location'], {
      category, branchId: branch
    });

    const paginated = paginate(filtered, page, perPage);

    const cols = [
      { key: 'partName', render: r => `
        <div>
          <div style="font-weight:600;">${r.partName}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">P/N: ${r.partNumber} • Loc: ${r.location || '—'}</div>
        </div>
      `},
      { key: 'category', render: r => `<span class="badge badge-purple">${r.category}</span>` },
      { key: 'compatible', render: r => `<span style="font-size:0.75rem;">${r.compatibleBrand} ${r.compatibleModel}</span>` },
      { key: 'purchaseCost', render: r => formatCurrency(r.purchaseCost) },
      { key: 'sellingPrice', render: r => formatCurrency(r.sellingPrice) },
      { key: 'stock', render: r => `
        <div class="stock-indicator ${r.stock <= r.minimumStock ? 'stock-low' : 'stock-ok'}">
          <span style="font-weight:700;">${r.stock}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">(min: ${r.minimumStock})</span>
        </div>
      `},
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="InventoryModule.openEditSparePartModal('${r.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="InventoryModule.deleteSparePart('${r.id}')">🗑️</button>
        </div>
      `}
    ];

    renderTable('table-spare-parts-body', cols, paginated.data, 'No spare parts found');
    renderPagination('spare-parts-pagination', 'spare-parts-info', page, filtered.length, perPage, (p) => {
      this.state.spareParts.page = p;
      this.renderSpareParts();
    });
  },

  openAddSparePartModal() {
    clearForm('form-add-spare-part');
    document.getElementById('modal-spare-part-title').textContent = 'Add Spare Part';
    document.getElementById('spare-part-id-field').value = '';
    openModal('modal-spare-part');
  },

  openEditSparePartModal(id) {
    const item = StorageService.getById('spareParts', id);
    if (!item) return;
    populateForm('form-add-spare-part', item);
    document.getElementById('modal-spare-part-title').textContent = 'Edit Spare Part: ' + item.partName;
    document.getElementById('spare-part-id-field').value = item.id;
    openModal('modal-spare-part');
  },

  saveSparePart() {
    const data = getFormData('form-add-spare-part');
    if (!validateRequired('form-add-spare-part', [
      { name: 'partName', label: 'Part Name' },
      { name: 'partNumber', label: 'Part Number' },
      { name: 'category', label: 'Category' },
      { name: 'purchaseCost', label: 'Purchase Cost' },
      { name: 'stock', label: 'Stock Quantity' }
    ])) return;

    if (data.id) {
      StorageService.update('spareParts', data.id, data);
      showToast('Spare part updated', 'success');
    } else {
      data.id = generateId('PART');
      data.status = 'In Stock';
      StorageService.add('spareParts', data);
      showToast('Spare part added', 'success');
    }
    closeModal('modal-spare-part');
    this.renderSpareParts();
    DashboardModule.render();
  },

  deleteSparePart(id) {
    showConfirm('Delete Spare Part', 'Are you sure you want to remove this part?', () => {
      StorageService.delete('spareParts', id);
      showToast('Spare part deleted', 'success');
      this.renderSpareParts();
      DashboardModule.render();
    });
  },

  // --- STOCK AGING ---
  renderStockAging() {
    const newGadgets = StorageService.get('newGadgets') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];

    const allStock = [
      ...newGadgets.filter(n => n.currentStock > 0).map(n => ({
        id: n.id, brand: n.brand, model: n.model, imei: n.imei || '—', branchId: n.branchId,
        purchaseDate: n.purchaseDate, days: daysAgo(n.purchaseDate), cost: n.purchaseCost, price: n.sellingPrice,
        type: 'New', status: n.status
      })),
      ...usedGadgets.filter(u => u.status !== 'Sold').map(u => ({
        id: u.id, brand: u.brand, model: u.model, imei: u.imei, branchId: u.branchId,
        purchaseDate: u.acquisitionDate, days: daysAgo(u.acquisitionDate), cost: u.totalCost, price: u.targetSellingPrice,
        type: 'Used', status: u.status
      }))
    ].sort((a, b) => b.days - a.days);

    const cols = [
      { key: 'device', render: r => `<strong>${r.brand} ${r.model}</strong> <span class="badge ${r.type === 'New' ? 'badge-info' : 'badge-purple'}">${r.type}</span>` },
      { key: 'imei', render: r => `<span class="font-mono imei-field">${r.imei}</span>` },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'purchaseDate', render: r => formatDate(r.purchaseDate) },
      { key: 'days', render: r => ageBadge(r.days) },
      { key: 'cost', render: r => formatCurrency(r.cost) },
      { key: 'price', render: r => formatCurrency(r.price) },
      { key: 'status', render: r => statusBadge(r.status) }
    ];

    renderTable('table-stock-aging-body', cols, allStock, 'No aging stock items');
  },

  // --- SLOW MOVING STOCK ---
  renderSlowMovingStock() {
    const threshold = parseInt(document.getElementById('slow-moving-days-filter')?.value || 90);
    const newGadgets = StorageService.get('newGadgets') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];

    const slowItems = [
      ...newGadgets.filter(n => n.currentStock > 0 && daysAgo(n.purchaseDate) >= threshold).map(n => ({
        id: n.id, brand: n.brand, model: n.model, imei: n.imei || '—', branchId: n.branchId,
        purchaseDate: n.purchaseDate, days: daysAgo(n.purchaseDate), cost: n.purchaseCost, price: n.sellingPrice,
        potentialProfit: n.sellingPrice - n.purchaseCost, type: 'new'
      })),
      ...usedGadgets.filter(u => u.status !== 'Sold' && daysAgo(u.acquisitionDate) >= threshold).map(u => ({
        id: u.id, brand: u.brand, model: u.model, imei: u.imei, branchId: u.branchId,
        purchaseDate: u.acquisitionDate, days: daysAgo(u.acquisitionDate), cost: u.totalCost, price: u.targetSellingPrice,
        potentialProfit: u.targetSellingPrice - u.totalCost, type: 'used'
      }))
    ].sort((a, b) => b.days - a.days);

    const cols = [
      { key: 'product', render: r => `<strong>${r.brand} ${r.model}</strong>` },
      { key: 'imei', render: r => `<span class="font-mono imei-field">${r.imei}</span>` },
      { key: 'days', render: r => ageBadge(r.days) },
      { key: 'cost', render: r => formatCurrency(r.cost) },
      { key: 'price', render: r => formatCurrency(r.price) },
      { key: 'potentialProfit', render: r => profitDisplay(r.potentialProfit) },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="InventoryModule.viewDeviceDetail('${r.id}', '${r.type}')">👁️ View</button>
          <button class="btn btn-warning btn-sm" onclick="showToast('Device marked for clearance promo!', 'info')">🏷️ Mark Promo</button>
        </div>
      `}
    ];

    renderTable('table-slow-moving-body', cols, slowItems, 'No slow moving stock detected for this threshold');
  },

  // --- STOCK TAKE & ADJUSTMENTS ---
  renderStockTake() {
    const newGadgets = StorageService.get('newGadgets') || [];
    const container = document.getElementById('stock-take-table-body');
    if (!container) return;

    container.innerHTML = newGadgets.map((item, idx) => `
      <tr>
        <td><strong>${item.brand} ${item.model}</strong> (${item.variant})</td>
        <td class="font-mono">${item.sku}</td>
        <td>${getBranchName(item.branchId)}</td>
        <td><span class="font-mono fw-700" id="sys-qty-${item.id}">${item.currentStock}</span></td>
        <td>
          <input type="number" min="0" class="form-control" style="width:90px;" value="${item.currentStock}" id="phys-qty-${item.id}" onchange="InventoryModule.calcStockTakeVariance('${item.id}')">
        </td>
        <td><span id="variance-${item.id}" class="badge badge-gray">0</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="InventoryModule.applyStockTakeAdjustment('${item.id}')">Approve</button>
        </td>
      </tr>
    `).join('');
  },

  calcStockTakeVariance(id) {
    const sysQty = parseInt(document.getElementById(`sys-qty-${id}`).textContent);
    const physQty = parseInt(document.getElementById(`phys-qty-${id}`).value || 0);
    const variance = physQty - sysQty;
    const varEl = document.getElementById(`variance-${id}`);
    
    varEl.textContent = (variance > 0 ? '+' : '') + variance;
    varEl.className = 'badge ' + (variance === 0 ? 'badge-gray' : variance > 0 ? 'badge-success' : 'badge-danger');
  },

  applyStockTakeAdjustment(id) {
    const sysQty = parseInt(document.getElementById(`sys-qty-${id}`).textContent);
    const physQty = parseInt(document.getElementById(`phys-qty-${id}`).value || 0);
    const diff = physQty - sysQty;
    
    if (diff === 0) { showToast('No variance to adjust', 'info'); return; }

    const item = StorageService.getById('newGadgets', id);
    if (!item) return;

    // Update product stock
    item.currentStock = physQty;
    StorageService.update('newGadgets', id, item);

    // Create adjustment log
    const adj = {
      id: generateId('ADJ'),
      date: todayISO(),
      branchId: item.branchId,
      productId: item.id,
      productName: `${item.brand} ${item.model}`,
      imeiSerial: item.imei || item.sku,
      previousQty: sysQty,
      adjustmentQty: diff,
      newQty: physQty,
      reason: 'Stock Take Difference',
      user: 'Admin',
      notes: 'Automated stock take variance adjustment'
    };
    StorageService.add('stockAdjustments', adj);
    showToast(`Stock updated to ${physQty}. Adjustment log saved.`, 'success');
    this.renderStockTake();
    this.renderStockAdjustments();
  },

  renderStockAdjustments() {
    const list = StorageService.get('stockAdjustments') || [];
    const cols = [
      { key: 'id', render: r => `<span class="font-mono">${r.id}</span>` },
      { key: 'date', render: r => formatDate(r.date) },
      { key: 'productName', render: r => `<strong>${r.productName}</strong>` },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'previousQty' },
      { key: 'adjustmentQty', render: r => `<span class="${r.adjustmentQty > 0 ? 'text-success' : 'text-danger'} fw-700">${r.adjustmentQty > 0 ? '+' : ''}${r.adjustmentQty}</span>` },
      { key: 'newQty', render: r => `<strong>${r.newQty}</strong>` },
      { key: 'reason', render: r => `<span class="badge badge-warning">${r.reason}</span>` },
      { key: 'user' }
    ];

    renderTable('table-stock-adjustments-body', cols, list, 'No stock adjustments logged');
  },

  // --- BARCODE MANAGEMENT ---
  renderBarcodes() {
    const newGadgets = StorageService.get('newGadgets') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];
    const spareParts = StorageService.get('spareParts') || [];

    const items = [
      ...newGadgets.map(n => ({ name: `${n.brand} ${n.model}`, code: n.barcode || n.sku, type: 'New Device', sku: n.sku })),
      ...usedGadgets.map(u => ({ name: `${u.brand} ${u.model}`, code: u.imei, type: 'Used Device (IMEI)', sku: u.serialNumber })),
      ...spareParts.map(p => ({ name: p.partName, code: p.barcode || p.partNumber, type: 'Spare Part', sku: p.partNumber }))
    ];

    const container = document.getElementById('barcode-grid');
    if (!container) return;

    container.innerHTML = items.map(item => `
      <div class="card" style="padding:1rem;text-align:center;">
        <div style="font-size:0.8125rem;font-weight:700;margin-bottom:0.25rem;">${item.name}</div>
        <div style="font-size:0.6875rem;color:var(--text-muted);margin-bottom:0.75rem;">${item.type}</div>
        ${generateBarcode(item.code)}
        <button class="btn btn-outline btn-sm" style="margin-top:0.75rem;width:100%;" onclick="showToast('Barcode label printed', 'info')">🖨️ Print Label</button>
      </div>
    `).join('');
  }
};
