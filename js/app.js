/* ============================================
   APPLICATION CORE & ROUTER
   ============================================ */

const AppModule = {
  currentUser: null,
  currentView: 'dashboard',

  init() {
    // 1. Initialize seed data if required
    initDummyData();

    // 2. Check session/login state
    const savedUser = StorageService.get('currentUser');
    if (savedUser) {
      this.currentUser = savedUser;
      this.showApp();
    } else {
      this.showLogin();
    }

    // 3. Setup event listeners
    this.setupEventListeners();
    this.populateBranchSelectors();
  },

  showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('app').classList.remove('visible');
  },

  showApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app').classList.add('visible');

    // Update user info display
    const nameEl = document.getElementById('user-display-name');
    const roleEl = document.getElementById('user-display-role');
    const avatarEl = document.getElementById('user-avatar-initials');

    if (this.currentUser) {
      if (nameEl) nameEl.textContent = this.currentUser.name || 'Admin User';
      if (roleEl) roleEl.textContent = this.currentUser.role || 'Administrator';
      if (avatarEl) avatarEl.textContent = (this.currentUser.name || 'A').charAt(0).toUpperCase();
    }

    // Render Notifications & Dashboard
    this.renderNotifications();
    this.navigateTo(this.currentView);
  },

  login(email, password, role = 'Admin') {
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }
    const user = {
      email,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: role
    };
    StorageService.save('currentUser', user);
    this.currentUser = user;
    showToast(`Welcome back, ${user.name}!`, 'success');
    this.showApp();
  },

  logout() {
    StorageService.save('currentUser', null);
    this.currentUser = null;
    showToast('Logged out successfully', 'info');
    this.showLogin();
  },

  navigateTo(viewId) {
    this.currentView = viewId;

    // Update Sidebar Navigation highlights
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.view === viewId) item.classList.add('active');
      else item.classList.remove('active');
    });

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.style.display = 'none';
    });

    // Show target view section
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.style.display = 'block';
    } else {
      console.warn('View not found:', viewId);
    }

    // Update breadcrumb
    const bcCurrent = document.getElementById('breadcrumb-current');
    if (bcCurrent) {
      bcCurrent.textContent = viewId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Render corresponding module view
    switch (viewId) {
      case 'dashboard':
        DashboardModule.render();
        break;
      case 'new-gadgets':
        InventoryModule.renderNewGadgets();
        break;
      case 'used-gadgets':
        InventoryModule.renderUsedGadgets();
        break;
      case 'spare-parts':
        InventoryModule.renderSpareParts();
        break;
      case 'stock-aging':
        InventoryModule.renderStockAging();
        break;
      case 'slow-moving':
        InventoryModule.renderSlowMovingStock();
        break;
      case 'stock-take':
        InventoryModule.renderStockTake();
        break;
      case 'stock-adjustment':
        InventoryModule.renderStockAdjustments();
        break;
      case 'barcode':
        InventoryModule.renderBarcodes();
        break;
      case 'sales':
        SalesModule.renderSales();
        break;
      case 'customers':
        SalesModule.renderCustomers();
        break;
      case 'loyalty':
        SalesModule.renderLoyalty();
        break;
      case 'trade-in':
        TradeInModule.renderTradeIns();
        break;
      case 'trade-in-valuation':
        TradeInModule.calculateValuation();
        break;
      case 'repairs':
        RepairModule.renderRepairs();
        break;
      case 'refurbishment':
        RefurbishmentModule.renderRefurbishments();
        break;
      case 'suppliers':
        PurchasingModule.renderSuppliers();
        break;
      case 'purchase-orders':
        PurchasingModule.renderPurchaseOrders();
        break;
      case 'purchase-invoices':
        PurchasingModule.renderPurchaseInvoices();
        break;
      case 'grn':
        PurchasingModule.renderGRNs();
        break;
      case 'branches':
        BranchesModule.renderBranches();
        break;
      case 'branch-transfers':
        BranchesModule.renderTransfers();
        break;
      case 'reports':
        ReportsModule.renderReports();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }

    // Close mobile sidebar drawer if open
    document.querySelector('.sidebar').classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('open');
  },

  populateBranchSelectors() {
    const branches = StorageService.get('branches') || [];
    const selectors = document.querySelectorAll('.branch-dropdown-select');
    selectors.forEach(sel => {
      const current = sel.value;
      sel.innerHTML = '<option value="">All Branches</option>' +
        branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
      sel.value = current;
    });
  },

  renderNotifications() {
    const newGadgets = StorageService.get('newGadgets') || [];
    const repairs = StorageService.get('repairs') || [];
    const usedGadgets = StorageService.get('usedGadgets') || [];
    const purchaseInvoices = StorageService.get('purchaseInvoices') || [];

    const notifs = [];

    // Low stock
    const lowStock = newGadgets.filter(n => n.currentStock <= n.minimumStock);
    if (lowStock.length) {
      notifs.push({ icon: '⚠️', msg: `<strong>${lowStock.length} items</strong> are low in stock (${lowStock[0].brand} ${lowStock[0].model})`, time: '10m ago' });
    }

    // Pending repairs
    const readyRepairs = repairs.filter(r => r.status === 'Ready for Pickup');
    if (readyRepairs.length) {
      notifs.push({ icon: '🔧', msg: `<strong>${readyRepairs.length} repairs</strong> are ready for customer pickup!`, time: '30m ago' });
    }

    // Aging stock alert
    const agingCount = usedGadgets.filter(u => u.status !== 'Sold' && daysAgo(u.acquisitionDate) > 90).length;
    if (agingCount) {
      notifs.push({ icon: '⏳', msg: `<strong>${agingCount} devices</strong> are in stock for over 90 days.`, time: '2h ago' });
    }

    // Overdue invoices
    const overdueInvoices = purchaseInvoices.filter(p => p.paymentStatus === 'Overdue');
    if (overdueInvoices.length) {
      notifs.push({ icon: '🚨', msg: `<strong>${overdueInvoices.length} purchase invoices</strong> are overdue for payment.`, time: '1d ago' });
    }

    const badge = document.getElementById('notif-badge');
    const container = document.getElementById('notif-dropdown-items');

    if (badge) badge.textContent = notifs.length.toString();
    if (container) {
      container.innerHTML = notifs.length ? notifs.map(n => `
        <div class="dropdown-item">
          <div class="notif-icon">${n.icon}</div>
          <div class="notif-content">
            <div class="notif-msg">${n.msg}</div>
            <div class="notif-time">${n.time}</div>
          </div>
        </div>
      `).join('') : '<div style="padding:1rem;text-align:center;color:var(--text-muted);">No new notifications</div>';
    }
  },

  renderSettings() {
    const settings = StorageService.getSettings();
    populateForm('form-settings', settings);
  },

  saveSettings() {
    const data = getFormData('form-settings');
    StorageService.saveSettings(data);
    showToast('Settings saved successfully', 'success');
  },

  resetDemoData() {
    showConfirm('Reset Demo Data', 'This will wipe custom changes and restore default fictional records. Continue?', () => {
      initDummyData(true);
      showToast('Demo data restored!', 'success');
      setTimeout(() => location.reload(), 800);
    }, 'warning');
  },

  clearAllData() {
    showConfirm('CLEAR ALL DATA', 'WARNING: This will erase all inventory, sales, and transaction records! This action cannot be undone!', () => {
      StorageService.clearAll();
      showToast('All local storage cleared', 'error');
      setTimeout(() => location.reload(), 800);
    }, 'danger');
  },

  setupEventListeners() {
    // Toggle sidebar on mobile
    const toggleBtn = document.getElementById('btn-sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggleBtn && sidebar) {
      toggleBtn.onclick = () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('open');
      };
    }
    if (overlay) {
      overlay.onclick = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      };
    }

    // Toggle Notifications dropdown
    const notifBtn = document.getElementById('btn-notif-toggle');
    const notifDrop = document.getElementById('notif-dropdown');
    if (notifBtn && notifDrop) {
      notifBtn.onclick = (e) => {
        e.stopPropagation();
        notifDrop.classList.toggle('open');
      };
      document.addEventListener('click', (e) => {
        if (!notifDrop.contains(e.target) && e.target !== notifBtn) {
          notifDrop.classList.remove('open');
        }
      });
    }

    // Global Branch Selector in Header
    const headerBranchSelect = document.getElementById('header-branch-select');
    if (headerBranchSelect) {
      headerBranchSelect.onchange = (e) => {
        const bId = e.target.value;
        DashboardModule.render(bId);
        showToast(bId ? `Filtered to ${getBranchName(bId)}` : 'Showing all branches', 'info');
      };
    }

    // Nav Item Click Handling
    document.querySelectorAll('.nav-item').forEach(item => {
      item.onclick = () => {
        const view = item.dataset.view;
        if (view) this.navigateTo(view);
      };
    });
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AppModule.init();
});
