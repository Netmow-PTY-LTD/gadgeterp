/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// ID Generation
let _idCounter = Date.now();
function generateId(prefix = 'ID') {
  return prefix + '-' + (++_idCounter).toString(36).toUpperCase();
}

// Currency
function formatCurrency(value, currency) {
  const settings = StorageService.getSettings();
  const cur = currency || settings.currency || 'USD';
  const symbols = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', INR: '₹', AED: 'د.إ', SAR: '﷼' };
  const sym = symbols[cur] || '$';
  const num = parseFloat(value) || 0;
  return sym + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Date helpers
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function todayISO() { return new Date().toISOString().split('T')[0]; }
function daysAgo(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function thisMonthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}
function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr.startsWith(todayISO());
}
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const secs = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return Math.floor(secs/60) + 'm ago';
  if (secs < 86400) return Math.floor(secs/3600) + 'h ago';
  return Math.floor(secs/86400) + 'd ago';
}

// Toast Notifications
function showToast(message, type = 'success', title = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const titles = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✅'}</span>
    <div class="toast-content">
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
}

// Confirmation Modal
function showConfirm(title, message, onConfirm, type = 'danger') {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal-sm">
      <div class="modal-body" style="text-align:center;padding:2rem;">
        <div class="confirm-icon ${type}">
          ${type === 'danger' ? '🗑️' : '⚠️'}
        </div>
        <div class="confirm-text">
          <h3>${title}</h3>
          <p>${message}</p>
        </div>
        <div style="display:flex;gap:.75rem;justify-content:center;margin-top:1.5rem;">
          <button class="btn btn-outline" id="confirm-cancel">Cancel</button>
          <button class="btn btn-${type === 'danger' ? 'danger' : 'warning'}" id="confirm-ok">${type === 'danger' ? 'Delete' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirm-cancel').onclick = () => overlay.remove();
  overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); onConfirm(); };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// Modal helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'none'; document.body.style.overflow = ''; }
}

// Form helpers
function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  const data = {};
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.name) {
      if (input.type === 'checkbox') data[input.name] = input.checked;
      else data[input.name] = input.value;
    }
  });
  return data;
}
function populateForm(formId, data) {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.keys(data).forEach(key => {
    const el = form.querySelector(`[name="${key}"]`);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!data[key];
    else el.value = data[key] || '';
  });
}
function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) form.reset();
}
function validateRequired(formId, fields) {
  let valid = true;
  // Clear previous errors
  const form = document.getElementById(formId);
  if (!form) return false;
  form.querySelectorAll('.form-error').forEach(e => e.remove());
  form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  
  fields.forEach(f => {
    const el = form.querySelector(`[name="${f.name}"]`);
    if (!el) return;
    const val = el.value.trim();
    if (!val) {
      el.classList.add('error');
      const err = document.createElement('div');
      err.className = 'form-error';
      err.textContent = f.label + ' is required';
      el.parentNode.appendChild(err);
      valid = false;
    }
  });
  return valid;
}

// CSV Export
function exportToCSV(data, filename) {
  if (!data || !data.length) { showToast('No data to export', 'warning'); return; }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      return '"' + val.replace(/"/g, '""') + '"';
    }).join(','))
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported to ' + filename + '.csv', 'success');
}

// Status badge
function statusBadge(status) {
  const map = {
    'In Stock': 'badge-success',
    'Available': 'badge-success',
    'Completed': 'badge-success',
    'Paid': 'badge-success',
    'Active': 'badge-success',
    'Ready for Sale': 'badge-success',
    'Ready for Pickup': 'badge-success',
    'Received': 'badge-info',
    'Approved': 'badge-info',
    'In Progress': 'badge-info',
    'In Transit': 'badge-info',
    'Diagnosing': 'badge-info',
    'Refurbishment': 'badge-info',
    'Quality Check': 'badge-purple',
    'Pending': 'badge-warning',
    'Pending Evaluation': 'badge-warning',
    'Waiting for Approval': 'badge-warning',
    'Waiting for Parts': 'badge-warning',
    'Draft': 'badge-warning',
    'Sent': 'badge-warning',
    'Partially Received': 'badge-warning',
    'Partially Paid': 'badge-warning',
    'Requested': 'badge-warning',
    'Unpaid': 'badge-orange',
    'Overdue': 'badge-danger',
    'Sold': 'badge-primary',
    'Cancelled': 'badge-danger',
    'Rejected': 'badge-danger',
    'Failed': 'badge-danger',
    'Defective': 'badge-danger',
    'Inactive': 'badge-gray',
    'Returned': 'badge-gray',
    'Transferred': 'badge-gray',
    'Reserved': 'badge-purple',
    'Lost': 'badge-danger',
    'Gold': 'badge-warning',
    'Silver': 'badge-gray',
    'Platinum': 'badge-success',
    'Regular': 'badge-gray',
  };
  const cls = map[status] || 'badge-gray';
  return `<span class="badge ${cls}">${status || '—'}</span>`;
}

// Condition badge
function conditionBadge(cond) {
  const map = { 'Excellent': 'badge-success', 'Very Good': 'badge-success', 'Good': 'badge-info', 'Fair': 'badge-warning', 'Poor': 'badge-danger' };
  return `<span class="badge ${map[cond] || 'badge-gray'}">${cond || '—'}</span>`;
}

// Age badge
function ageBadge(days) {
  let cls = 'age-0-30', label = '0-30 days';
  if (days > 365) { cls = 'age-365plus'; label = '365+ days'; }
  else if (days > 180) { cls = 'age-181-365'; label = '181-365 days'; }
  else if (days > 90) { cls = 'age-91-180'; label = '91-180 days'; }
  else if (days > 60) { cls = 'age-61-90'; label = '61-90 days'; }
  else if (days > 30) { cls = 'age-31-60'; label = '31-60 days'; }
  return `<span class="badge ${cls}">${days}d</span>`;
}

// Simple table renderer
function renderTable(tbodyId, columns, data, emptyMsg = 'No records found') {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  if (!data || !data.length) {
    const colCount = columns.length;
    tbody.innerHTML = `<tr><td colspan="${colCount}" style="padding:2rem;text-align:center;color:var(--text-muted);">${emptyMsg}</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(row => `
    <tr>
      ${columns.map(col => `<td>${col.render ? col.render(row) : (row[col.key] || '—')}</td>`).join('')}
    </tr>
  `).join('');
}

// Pagination helper
function paginate(data, page, perPage) {
  const start = (page - 1) * perPage;
  return { data: data.slice(start, start + perPage), total: data.length, pages: Math.ceil(data.length / perPage) };
}

// Render pagination controls
function renderPagination(containerId, infoId, currentPage, totalItems, perPage, onPageChange) {
  const totalPages = Math.ceil(totalItems / perPage);
  const container = document.getElementById(containerId);
  const info = document.getElementById(infoId);
  if (!container) return;
  
  const start = ((currentPage - 1) * perPage) + 1;
  const end = Math.min(currentPage * perPage, totalItems);
  if (info) info.textContent = `Showing ${totalItems ? start : 0}–${end} of ${totalItems}`;
  
  let html = '';
  html += `<button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<span style="padding:0 .25rem;color:var(--text-muted);">…</span>`;
    }
  }
  
  html += `<button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;
  container.innerHTML = html;
  container.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
    btn.onclick = () => onPageChange(parseInt(btn.dataset.page));
  });
}

// Search/filter helper
function filterData(data, searchText, searchFields, filters = {}) {
  return data.filter(item => {
    // Text search
    if (searchText) {
      const text = searchText.toLowerCase();
      const match = searchFields.some(f => (item[f] || '').toString().toLowerCase().includes(text));
      if (!match) return false;
    }
    // Filter fields
    for (const [key, val] of Object.entries(filters)) {
      if (!val) continue;
      if (key === 'dateFrom' && item.createdAt && item.createdAt < val) return false;
      if (key === 'dateTo' && item.createdAt && item.createdAt > val + 'T23:59') return false;
      if (key !== 'dateFrom' && key !== 'dateTo') {
        if (item[key] && val && item[key].toString() !== val.toString()) return false;
      }
    }
    return true;
  });
}

// Sort helper
function sortData(data, key, direction = 'asc') {
  if (!key) return data;
  return [...data].sort((a, b) => {
    let av = a[key] || '', bv = b[key] || '';
    if (!isNaN(av) && !isNaN(bv)) { av = parseFloat(av); bv = parseFloat(bv); }
    else { av = av.toString().toLowerCase(); bv = bv.toString().toLowerCase(); }
    if (av < bv) return direction === 'asc' ? -1 : 1;
    if (av > bv) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Barcode visual generator
function generateBarcode(value) {
  if (!value) return '';
  const str = value.toString();
  let bars = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const widths = [1, 2, 1, 3, 2, 1, 2, 3, 1, 2];
    const w = widths[code % 10];
    bars += `<div class="${i % 2 === 0 ? 'b' : 'w'}" style="width:${w * 2}px"></div>`;
  }
  // Add some fixed pattern
  bars = '<div class="b" style="width:3px"></div><div class="w" style="width:2px"></div>' + bars + '<div class="b" style="width:3px"></div>';
  return `<div class="barcode-wrap"><div class="barcode-bars">${bars}</div><div class="barcode-num">${value}</div></div>`;
}

// Device image URL from Unsplash
function deviceImageUrl(brand, model, w = 200, h = 200) {
  const queries = {
    'Apple': 'iphone+smartphone',
    'Samsung': 'samsung+galaxy+phone',
    'Google': 'google+pixel+phone',
    'OnePlus': 'android+smartphone',
    'Xiaomi': 'xiaomi+smartphone',
    'Oppo': 'oppo+smartphone',
    'Vivo': 'vivo+smartphone',
    'Huawei': 'huawei+smartphone',
  };
  const q = queries[brand] || 'smartphone';
  return `https://source.unsplash.com/${w}x${h}/?${q}&sig=${encodeURIComponent(model || brand)}`;
}

// Format profit display
function profitDisplay(profit) {
  const cls = profit >= 0 ? 'text-success' : 'text-danger';
  return `<span class="${cls}">${formatCurrency(profit)}</span>`;
}

// Truncate text
function truncate(str, n = 30) {
  if (!str) return '—';
  return str.length > n ? str.substring(0, n) + '…' : str;
}

// Get branch name by ID
function getBranchName(id) {
  const branches = StorageService.get('branches') || [];
  const b = branches.find(b => b.id === id);
  return b ? b.name : id || '—';
}

// Get customer name by ID
function getCustomerName(id) {
  const customers = StorageService.get('customers') || [];
  const c = customers.find(c => c.id === id);
  return c ? c.name : id || '—';
}

// Get supplier name by ID
function getSupplierName(id) {
  const suppliers = StorageService.get('suppliers') || [];
  const s = suppliers.find(s => s.id === id);
  return s ? s.companyName : id || '—';
}

// Simple line chart using SVG
function renderLineChart(containerId, data, labels, color = '#4f46e5') {
  const container = document.getElementById(containerId);
  if (!container || !data.length) return;
  
  const w = container.offsetWidth || 400;
  const h = 150;
  const pad = { top: 10, right: 10, bottom: 30, left: 40 };
  const maxVal = Math.max(...data, 1);
  const minVal = 0;
  
  const xScale = (i) => pad.left + (i / (data.length - 1 || 1)) * (w - pad.left - pad.right);
  const yScale = (v) => pad.top + (1 - (v - minVal) / (maxVal - minVal)) * (h - pad.top - pad.bottom);
  
  const points = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
  const areaPoints = `${xScale(0)},${h - pad.bottom} ` + data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ') + ` ${xScale(data.length - 1)},${h - pad.bottom}`;
  
  const xLabels = labels.map((l, i) => `<text x="${xScale(i)}" y="${h - 5}" text-anchor="middle" font-size="10" fill="#94a3b8">${l}</text>`).join('');
  const yLabels = [0, Math.round(maxVal / 2), maxVal].map((v, i) => {
    const y = yScale(v);
    return `<text x="${pad.left - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}</text>
    <line x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
  }).join('');
  
  container.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${yLabels}
      <polygon points="${areaPoints}" fill="${color}" opacity="0.1"/>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${data.map((v, i) => `<circle cx="${xScale(i)}" cy="${yScale(v)}" r="3" fill="${color}" stroke="white" stroke-width="1.5"/>`).join('')}
      ${xLabels}
    </svg>
  `;
}

// Simple donut chart
function renderDonutChart(containerId, segments) {
  const container = document.getElementById(containerId);
  if (!container || !segments.length) return;
  
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0) || 1;
  let cumulative = 0;
  const parts = segments.map(seg => {
    const pct = (seg.value / total) * 100;
    const part = `${seg.color} ${cumulative}% ${cumulative + pct}%`;
    cumulative += pct;
    return part;
  });
  
  container.style.background = `conic-gradient(${parts.join(', ')})`;
  container.style.borderRadius = '50%';
}

// Number abbreviation
function abbrevNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}
