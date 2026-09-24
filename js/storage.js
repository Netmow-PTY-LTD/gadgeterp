/* ============================================
   STORAGE SERVICE
   ============================================ */
const StorageService = {
  save(key, data) {
    try {
      localStorage.setItem('gms_' + key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  },
  get(key) {
    try {
      const d = localStorage.getItem('gms_' + key);
      return d ? JSON.parse(d) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },
  update(key, id, updatedData) {
    const records = this.get(key) || [];
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
      records[idx] = { ...records[idx], ...updatedData, updatedAt: new Date().toISOString() };
      this.save(key, records);
      return records[idx];
    }
    return null;
  },
  delete(key, id) {
    const records = this.get(key) || [];
    const filtered = records.filter(r => r.id !== id);
    this.save(key, filtered);
    return filtered;
  },
  add(key, record) {
    const records = this.get(key) || [];
    records.push(record);
    this.save(key, records);
    return record;
  },
  getById(key, id) {
    const records = this.get(key) || [];
    return records.find(r => r.id === id) || null;
  },
  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('gms_'));
    keys.forEach(k => localStorage.removeItem(k));
  },
  getSettings() {
    return this.get('settings') || {
      companyName: 'GadgetPro Management',
      currency: 'USD',
      taxRate: 0,
      defaultBranch: '',
      lowStockThreshold: 5,
      slowMovingDays: 90,
      loyaltyRate: 1,
      theme: 'light'
    };
  },
  saveSettings(settings) {
    this.save('settings', settings);
  }
};
