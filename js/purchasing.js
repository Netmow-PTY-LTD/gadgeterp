/* ============================================
   PURCHASING MODULE (SUPPLIERS, PO, INVOICES, GRN)
   ============================================ */

const PurchasingModule = {
  // --- SUPPLIERS ---
  renderSuppliers() {
    const list = StorageService.get('suppliers') || [];
    const cols = [
      { key: 'companyName', render: r => `<strong>${r.companyName}</strong>` },
      { key: 'contactPerson' },
      { key: 'phone' },
      { key: 'email' },
      { key: 'taxId', render: r => `<span class="font-mono">${r.taxId || '—'}</span>` },
      { key: 'paymentTerms', render: r => `<span class="badge badge-info">${r.paymentTerms}</span>` },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="PurchasingModule.openEditSupplierModal('${r.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="PurchasingModule.deleteSupplier('${r.id}')">🗑️</button>
        </div>
      `}
    ];

    renderTable('table-suppliers-body', cols, list, 'No suppliers found');
  },

  openAddSupplierModal() {
    clearForm('form-add-supplier');
    document.getElementById('modal-supplier-title').textContent = 'Add Supplier';
    document.getElementById('supplier-id-field').value = '';
    openModal('modal-supplier');
  },

  openEditSupplierModal(id) {
    const sup = StorageService.getById('suppliers', id);
    if (!sup) return;
    populateForm('form-add-supplier', sup);
    document.getElementById('modal-supplier-title').textContent = 'Edit Supplier: ' + sup.companyName;
    document.getElementById('supplier-id-field').value = sup.id;
    openModal('modal-supplier');
  },

  saveSupplier() {
    const data = getFormData('form-add-supplier');
    if (!validateRequired('form-add-supplier', [{ name: 'companyName', label: 'Company Name' }, { name: 'phone', label: 'Phone' }])) return;

    if (data.id) {
      StorageService.update('suppliers', data.id, data);
      showToast('Supplier details updated', 'success');
    } else {
      data.id = generateId('SUP');
      data.status = 'Active';
      StorageService.add('suppliers', data);
      showToast('New supplier added', 'success');
    }
    closeModal('modal-supplier');
    this.renderSuppliers();
  },

  deleteSupplier(id) {
    showConfirm('Delete Supplier', 'Are you sure you want to remove this supplier?', () => {
      StorageService.delete('suppliers', id);
      showToast('Supplier deleted', 'success');
      this.renderSuppliers();
    });
  },

  // --- PURCHASE ORDERS ---
  renderPurchaseOrders() {
    const list = StorageService.get('purchaseOrders') || [];
    const cols = [
      { key: 'poNumber', render: r => `<span class="font-mono fw-700">${r.poNumber}</span>` },
      { key: 'orderDate', render: r => formatDate(r.orderDate) },
      { key: 'supplierName', render: r => `<strong>${r.supplierName}</strong>` },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'grandTotal', render: r => `<strong style="font-size:0.9375rem;">${formatCurrency(r.grandTotal)}</strong>` },
      { key: 'status', render: r => statusBadge(r.status) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="PurchasingModule.receiveGRNFromPO('${r.id}')">📦 Receive (GRN)</button>
        </div>
      `}
    ];

    renderTable('table-po-body', cols, list, 'No purchase orders found');
  },

  openNewPOModal() {
    clearForm('form-new-po');

    const suppliers = StorageService.get('suppliers') || [];
    const supSelect = document.getElementById('po-supplier-select');
    if (supSelect) {
      supSelect.innerHTML = '<option value="">Select Supplier...</option>' + 
        suppliers.map(s => `<option value="${s.id}">${s.companyName}</option>`).join('');
    }

    openModal('modal-new-po');
  },

  savePO() {
    const supId = document.getElementById('po-supplier-select').value;
    const sup = StorageService.getById('suppliers', supId);
    if (!sup) { showToast('Select a supplier', 'error'); return; }

    const itemDesc = document.getElementById('po-item-desc').value;
    const qty = parseInt(document.getElementById('po-item-qty').value || 1);
    const cost = parseFloat(document.getElementById('po-item-cost').value || 0);

    if (!itemDesc || cost <= 0) { showToast('Provide valid item details', 'error'); return; }

    const subtotal = qty * cost;
    const poNum = 'PO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const poRecord = {
      id: generateId('PO'),
      poNumber: poNum,
      supplierId: sup.id,
      supplierName: sup.companyName,
      branchId: document.getElementById('po-branch-select').value || 'BR-001',
      orderDate: todayISO(),
      expectedDelivery: addDays(todayISO(), 5),
      items: [{ productId: 'PROD-GENERIC', productName: itemDesc, qty: qty, unitCost: cost, total: subtotal }],
      subtotal: subtotal,
      discount: 0,
      tax: 0,
      grandTotal: subtotal,
      status: 'Sent',
      notes: document.getElementById('po-notes').value || ''
    };

    // Auto-generate Purchase Invoice
    const pinv = {
      id: generateId('PINV'),
      invoiceNumber: 'PINV-' + Math.floor(1000 + Math.random() * 9000),
      supplierId: sup.id,
      supplierName: sup.companyName,
      poNumber: poNum,
      invoiceDate: todayISO(),
      dueDate: addDays(todayISO(), 30),
      branchId: poRecord.branchId,
      subtotal: subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      paid: 0,
      due: subtotal,
      paymentStatus: 'Unpaid'
    };

    StorageService.add('purchaseOrders', poRecord);
    StorageService.add('purchaseInvoices', pinv);

    showToast(`Purchase Order ${poNum} & Invoice created!`, 'success');
    closeModal('modal-new-po');
    this.renderPurchaseOrders();
    this.renderPurchaseInvoices();
  },

  // --- PURCHASE INVOICES ---
  renderPurchaseInvoices() {
    const list = StorageService.get('purchaseInvoices') || [];
    const cols = [
      { key: 'invoiceNumber', render: r => `<span class="font-mono fw-700">${r.invoiceNumber}</span>` },
      { key: 'poNumber', render: r => `<span class="font-mono">${r.poNumber || 'Direct'}</span>` },
      { key: 'supplierName', render: r => `<strong>${r.supplierName}</strong>` },
      { key: 'invoiceDate', render: r => formatDate(r.invoiceDate) },
      { key: 'dueDate', render: r => formatDate(r.dueDate) },
      { key: 'total', render: r => formatCurrency(r.total) },
      { key: 'due', render: r => `<span style="color:${r.due > 0 ? 'var(--danger)' : 'var(--success)'};font-weight:700;">${formatCurrency(r.due)}</span>` },
      { key: 'paymentStatus', render: r => statusBadge(r.paymentStatus) },
      { key: 'actions', render: r => `
        <div class="table-actions">
          ${r.due > 0 ? `<button class="btn btn-secondary btn-sm" onclick="PurchasingModule.payInvoice('${r.id}')">💳 Pay</button>` : ''}
        </div>
      `}
    ];

    renderTable('table-purchase-invoices-body', cols, list, 'No purchase invoices found');
  },

  payInvoice(id) {
    const inv = StorageService.getById('purchaseInvoices', id);
    if (!inv) return;

    inv.paid = inv.total;
    inv.due = 0;
    inv.paymentStatus = 'Paid';
    StorageService.update('purchaseInvoices', id, inv);

    showToast('Invoice marked as Paid', 'success');
    this.renderPurchaseInvoices();
  },

  // --- GOODS RECEIVED NOTE (GRN) ---
  renderGRNs() {
    const list = StorageService.get('grns') || [];
    const cols = [
      { key: 'grnNumber', render: r => `<span class="font-mono fw-700">${r.grnNumber}</span>` },
      { key: 'poNumber', render: r => `<span class="font-mono">${r.poNumber || '—'}</span>` },
      { key: 'supplierName', render: r => `<strong>${r.supplierName}</strong>` },
      { key: 'receivedDate', render: r => formatDate(r.receivedDate) },
      { key: 'receivedBy' },
      { key: 'orderedQty' },
      { key: 'acceptedQty', render: r => `<span class="badge badge-success">${r.acceptedQty}</span>` },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'notes', render: r => truncate(r.notes, 30) }
    ];

    renderTable('table-grn-body', cols, list, 'No GRN records found');
  },

  receiveGRNFromPO(poId) {
    const po = StorageService.getById('purchaseOrders', poId);
    if (!po) return;

    const grnNum = 'GRN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const grn = {
      id: generateId('GRN'),
      grnNumber: grnNum,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      receivedDate: todayISO(),
      branchId: po.branchId,
      receivedBy: 'Admin',
      orderedQty: po.items.reduce((s, i) => s + i.qty, 0),
      receivedQty: po.items.reduce((s, i) => s + i.qty, 0),
      damagedQty: 0,
      acceptedQty: po.items.reduce((s, i) => s + i.qty, 0),
      notes: `Received and verified stock for PO ${po.poNumber}`
    };

    // Update PO status
    po.status = 'Received';
    StorageService.update('purchaseOrders', po.id, po);
    StorageService.add('grns', grn);

    showToast(`GRN ${grnNum} logged and stock updated!`, 'success');
    this.renderPurchaseOrders();
    this.renderGRNs();
  }
};
