/* ============================================
   SALES & CUSTOMERS MODULE
   ============================================ */

const SalesModule = {
  state: {
    sales: { page: 1, perPage: 10, search: '', branch: '' },
    customers: { page: 1, perPage: 10, search: '', tier: '' }
  },

  renderSales() {
    const list = StorageService.get('sales') || [];
    const { page, perPage, search, branch } = this.state.sales;

    const filtered = filterData(list, search, ['invoiceNum', 'customerName', 'productName', 'imei'], { branchId: branch });
    const paginated = paginate(filtered, page, perPage);

    const cols = [
      { key: 'invoiceNum', render: r => `<span class="font-mono fw-700">${r.invoiceNum}</span>` },
      { key: 'saleDate', render: r => formatDate(r.saleDate) },
      { key: 'customerName', render: r => `<strong>${r.customerName}</strong>` },
      { key: 'productName', render: r => `
        <div>
          <div>${r.productName}</div>
          <div class="font-mono imei-field" style="font-size:0.6875rem;color:var(--text-muted);">${r.imei || '—'}</div>
        </div>
      `},
      { key: 'totalCost', render: r => formatCurrency(r.totalCost) },
      { key: 'finalSellingPrice', render: r => `<strong style="font-size:0.9375rem;">${formatCurrency(r.finalSellingPrice)}</strong>` },
      { key: 'profit', render: r => profitDisplay(r.profit) },
      { key: 'paymentMethod', render: r => `<span class="badge badge-info">${r.paymentMethod}</span>` },
      { key: 'branchId', render: r => getBranchName(r.branchId) },
      { key: 'actions', render: r => `
        <button class="btn btn-outline btn-sm" onclick="SalesModule.printInvoice('${r.id}')">🧾 Receipt</button>
      `}
    ];

    renderTable('table-sales-body', cols, paginated.data, 'No sales records found');
    renderPagination('sales-pagination', 'sales-info', page, filtered.length, perPage, (p) => {
      this.state.sales.page = p;
      this.renderSales();
    });
  },

  openNewSaleModal() {
    clearForm('form-new-sale');
    
    // Populate dropdowns
    const customers = StorageService.get('customers') || [];
    const custSelect = document.getElementById('sale-customer-select');
    if (custSelect) {
      custSelect.innerHTML = '<option value="">Select Customer...</option>' + 
        customers.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('');
    }

    const availableDevices = [
      ...(StorageService.get('newGadgets') || []).filter(n => n.currentStock > 0).map(n => ({
        id: n.id, type: 'new', name: `[NEW] ${n.brand} ${n.model} (${n.variant})`, cost: n.purchaseCost, price: n.sellingPrice, imei: n.imei
      })),
      ...(StorageService.get('usedGadgets') || []).filter(u => u.status === 'Ready for Sale').map(u => ({
        id: u.id, type: 'used', name: `[USED] ${u.brand} ${u.model} - IMEI: ${u.imei}`, cost: u.totalCost, price: u.targetSellingPrice, imei: u.imei
      }))
    ];

    const devSelect = document.getElementById('sale-device-select');
    if (devSelect) {
      devSelect.innerHTML = '<option value="">Select Device from Available Stock...</option>' + 
        availableDevices.map(d => `<option value="${d.id}" data-type="${d.type}" data-cost="${d.cost}" data-price="${d.price}" data-name="${d.name}" data-imei="${d.imei}">${d.name} - ${formatCurrency(d.price)}</option>`).join('');
    }

    openModal('modal-new-sale');
  },

  onDeviceSelectChange() {
    const sel = document.getElementById('sale-device-select');
    const opt = sel.options[sel.selectedIndex];
    if (!opt.value) return;

    const price = parseFloat(opt.dataset.price || 0);
    const cost = parseFloat(opt.dataset.cost || 0);

    document.getElementById('sale-cost-field').value = cost;
    document.getElementById('sale-price-field').value = price;
    document.getElementById('sale-discount-field').value = 0;
    this.calcSaleTotals();
  },

  calcSaleTotals() {
    const cost = parseFloat(document.getElementById('sale-cost-field').value || 0);
    const price = parseFloat(document.getElementById('sale-price-field').value || 0);
    const discount = parseFloat(document.getElementById('sale-discount-field').value || 0);
    
    const finalPrice = Math.max(price - discount, 0);
    const profit = finalPrice - cost;

    document.getElementById('sale-final-price').textContent = formatCurrency(finalPrice);
    document.getElementById('sale-profit').textContent = formatCurrency(profit);
  },

  saveSale() {
    const custId = document.getElementById('sale-customer-select').value;
    const devSelect = document.getElementById('sale-device-select');
    const opt = devSelect.options[devSelect.selectedIndex];

    if (!custId || !opt || !opt.value) { showToast('Please select customer and device', 'error'); return; }

    const customer = StorageService.getById('customers', custId);
    const devType = opt.dataset.type;
    const devId = opt.value;
    const cost = parseFloat(document.getElementById('sale-cost-field').value || 0);
    const price = parseFloat(document.getElementById('sale-price-field').value || 0);
    const discount = parseFloat(document.getElementById('sale-discount-field').value || 0);
    const finalPrice = Math.max(price - discount, 0);
    const profit = finalPrice - cost;
    const payMethod = document.getElementById('sale-payment-method').value;
    const branchId = document.getElementById('sale-branch-select').value || 'BR-001';

    const invNum = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const saleRecord = {
      id: generateId('SALE'),
      invoiceNum: invNum,
      saleDate: todayISO(),
      customerId: customer.id,
      customerName: customer.name,
      deviceId: devId,
      imei: opt.dataset.imei || '—',
      productName: opt.dataset.name,
      purchaseCost: cost,
      additionalCosts: 0,
      totalCost: cost,
      sellingPrice: price,
      discount: discount,
      finalSellingPrice: finalPrice,
      profit: profit,
      paymentMethod: payMethod,
      staff: 'Admin',
      branchId: branchId
    };

    // Update inventory item status
    if (devType === 'used') {
      StorageService.update('usedGadgets', devId, { status: 'Sold', actualSellingPrice: finalPrice, actualProfit: profit });
    } else {
      const prod = StorageService.getById('newGadgets', devId);
      if (prod) {
        prod.currentStock = Math.max((prod.currentStock || 1) - 1, 0);
        StorageService.update('newGadgets', devId, prod);
      }
    }

    // Save Sale record
    StorageService.add('sales', saleRecord);

    // Update Customer purchase total & loyalty points
    customer.totalPurchases = (customer.totalPurchases || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + finalPrice;
    
    // Earn 1 point per $10 spent
    const ptsEarned = Math.floor(finalPrice / 10);
    customer.loyaltyPoints = (customer.loyaltyPoints || 0) + ptsEarned;
    
    // Auto upgrade membership level based on spend
    if (customer.totalSpent > 10000) customer.membershipLevel = 'Platinum';
    else if (customer.totalSpent > 2500) customer.membershipLevel = 'Gold';
    else if (customer.totalSpent > 1000) customer.membershipLevel = 'Silver';

    StorageService.update('customers', customer.id, customer);

    // Add Loyalty transaction
    StorageService.add('loyaltyTransactions', {
      id: generateId('LOY'),
      date: todayISO(),
      customerId: customer.id,
      customerName: customer.name,
      type: 'Earned',
      points: ptsEarned,
      invoiceId: invNum,
      notes: `Earned ${ptsEarned} pts for sale ${invNum}`
    });

    showToast(`Sale completed! Invoice #${invNum} generated.`, 'success');
    closeModal('modal-new-sale');
    this.renderSales();
    DashboardModule.render();
  },

  printInvoice(saleId) {
    const sale = StorageService.getById('sales', saleId);
    if (!sale) return;
    const settings = StorageService.getSettings();

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
      <head>
        <title>Invoice - ${sale.invoiceNum}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
          .hdr { display: flex; justify-content: space-between; border-bottom: 2px solid #ccc; padding-bottom: 15px; }
          .title { font-size: 24px; font-weight: bold; color: #3730a3; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
          th { background: #f4f4f4; }
          .tot { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="hdr">
          <div>
            <div class="title">${settings.companyName}</div>
            <div>${getBranchName(sale.branchId)}</div>
          </div>
          <div>
            <h3>INVOICE</h3>
            <div><strong>Number:</strong> ${sale.invoiceNum}</div>
            <div><strong>Date:</strong> ${formatDate(sale.saleDate)}</div>
          </div>
        </div>
        <br/>
        <div><strong>Billed To:</strong> ${sale.customerName}</div>
        <table>
          <thead>
            <tr><th>Item Description</th><th>IMEI / Serial</th><th>Price</th><th>Discount</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${sale.productName}</td>
              <td>${sale.imei}</td>
              <td>${formatCurrency(sale.sellingPrice)}</td>
              <td>${formatCurrency(sale.discount)}</td>
              <td>${formatCurrency(sale.finalSellingPrice)}</td>
            </tr>
          </tbody>
        </table>
        <div class="tot">Grand Total: ${formatCurrency(sale.finalSellingPrice)}</div>
        <p style="text-align:center;margin-top:40px;color:#777;">Thank you for shopping with ${settings.companyName}!</p>
        <script>window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
  },

  // --- CUSTOMER MANAGEMENT ---
  renderCustomers() {
    const list = StorageService.get('customers') || [];
    const { page, perPage, search, tier } = this.state.customers;

    const filtered = filterData(list, search, ['name', 'phone', 'email', 'address'], { membershipLevel: tier });
    const paginated = paginate(filtered, page, perPage);

    const cols = [
      { key: 'name', render: r => `
        <div>
          <div style="font-weight:600;">${r.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${r.email || r.phone}</div>
        </div>
      `},
      { key: 'phone' },
      { key: 'customerType', render: r => `<span class="badge badge-gray">${r.customerType}</span>` },
      { key: 'membershipLevel', render: r => `<span class="badge tier-${(r.membershipLevel||'regular').toLowerCase()}">${r.membershipLevel}</span>` },
      { key: 'totalPurchases', render: r => `<strong>${r.totalPurchases || 0}</strong>` },
      { key: 'totalSpent', render: r => formatCurrency(r.totalSpent || 0) },
      { key: 'loyaltyPoints', render: r => `<span class="points-display">⭐ ${r.loyaltyPoints || 0} pts</span>` },
      { key: 'actions', render: r => `
        <div class="table-actions">
          <button class="btn btn-outline btn-sm" onclick="SalesModule.openEditCustomerModal('${r.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="SalesModule.deleteCustomer('${r.id}')">🗑️</button>
        </div>
      `}
    ];

    renderTable('table-customers-body', cols, paginated.data, 'No customers found');
    renderPagination('customers-pagination', 'customers-info', page, filtered.length, perPage, (p) => {
      this.state.customers.page = p;
      this.renderCustomers();
    });
  },

  openAddCustomerModal() {
    clearForm('form-add-customer');
    document.getElementById('modal-customer-title').textContent = 'Add New Customer';
    document.getElementById('customer-id-field').value = '';
    openModal('modal-customer');
  },

  openEditCustomerModal(id) {
    const cust = StorageService.getById('customers', id);
    if (!cust) return;
    populateForm('form-add-customer', cust);
    document.getElementById('modal-customer-title').textContent = 'Edit Customer: ' + cust.name;
    document.getElementById('customer-id-field').value = cust.id;
    openModal('modal-customer');
  },

  saveCustomer() {
    const data = getFormData('form-add-customer');
    if (!validateRequired('form-add-customer', [{ name: 'name', label: 'Name' }, { name: 'phone', label: 'Phone' }])) return;

    if (data.id) {
      StorageService.update('customers', data.id, data);
      showToast('Customer record updated', 'success');
    } else {
      data.id = generateId('CUST');
      data.totalPurchases = 0;
      data.totalSpent = 0;
      data.loyaltyPoints = 0;
      data.membershipLevel = data.membershipLevel || 'Regular';
      data.status = 'Active';
      StorageService.add('customers', data);
      showToast('New customer created', 'success');
    }
    closeModal('modal-customer');
    this.renderCustomers();
  },

  deleteCustomer(id) {
    showConfirm('Delete Customer', 'Are you sure you want to delete this customer record?', () => {
      StorageService.delete('customers', id);
      showToast('Customer deleted', 'success');
      this.renderCustomers();
    });
  },

  // --- MEMBERSHIP & LOYALTY ---
  renderLoyalty() {
    const list = StorageService.get('loyaltyTransactions') || [];
    const cols = [
      { key: 'id', render: r => `<span class="font-mono">${r.id}</span>` },
      { key: 'date', render: r => formatDate(r.date) },
      { key: 'customerName', render: r => `<strong>${r.customerName}</strong>` },
      { key: 'type', render: r => `<span class="badge ${r.type === 'Earned' ? 'badge-success' : r.type === 'Redeemed' ? 'badge-warning' : 'badge-info'}">${r.type}</span>` },
      { key: 'points', render: r => `<span class="${r.points > 0 ? 'text-success' : 'text-danger'} fw-700">${r.points > 0 ? '+' : ''}${r.points} pts</span>` },
      { key: 'notes' }
    ];

    renderTable('table-loyalty-body', cols, list, 'No loyalty transactions found');
  }
};
