// BIZFLOW RESTAURANT MODULE - CLEAN VERSION
async function MODULE_INIT() {
  console.log('[Restaurant] module loaded');
  
  try {
    await initRestaurantDashboard();
    console.log('[Restaurant] module ready');
  } catch (err) {
    console.error('[Restaurant] init error:', err);
  }
}

window.initRestaurantDashboard = async function() {
  try {
    const container = document.getElementById('pane-dashboard');
    
    container.innerHTML = '<div style="padding:20px;"><h2 style="font-size:24px;font-weight:700;margin-bottom:20px;">Restaurant Dashboard</h2><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;margin-bottom:20px;"><h3 style="font-size:16px;font-weight:700;margin-bottom:10px;">Welcome to Your Restaurant</h3><p style="color:var(--txt3);font-size:14px;">Manage tables, orders, and inventory from here.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;"><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;"><div style="font-size:32px;font-weight:800;color:var(--gold);">0</div><div style="font-size:13px;color:var(--txt3);margin-top:8px;">Tables Occupied</div></div><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;"><div style="font-size:32px;font-weight:800;color:var(--gold);">KES 0</div><div style="font-size:13px;color:var(--txt3);margin-top:8px;">Today Sales</div></div><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;"><div style="font-size:32px;font-weight:800;color:var(--gold);">0</div><div style="font-size:13px;color:var(--txt3);margin-top:8px;">Orders Today</div></div></div></div>';
    
    setupRestaurantMenu();
    
  } catch (err) {
    console.error('[Restaurant] dashboard error:', err);
  }
};

window.setupRestaurantMenu = function() {
  const navMenu = document.getElementById('nav-menu');
  
  const items = [
    { name: 'Dashboard', id: 'dashboard', icon: '📊' },
    { name: 'Tables', id: 'tables', icon: '🪑' },
    { name: 'Orders', id: 'orders', icon: '📋' },
    { name: 'Menu', id: 'menu', icon: '🍽️' },
    { name: 'Finance', id: 'finance', icon: '💰' },
    { name: 'Inventory', id: 'inventory', icon: '📦' },
    { name: 'Staff', id: 'staff', icon: '👥' },
    { name: 'Suppliers', id: 'suppliers', icon: '🚚' },
    { name: 'Reports', id: 'reports', icon: '📈' },
    { name: 'Settings', id: 'settings', icon: '⚙️' }
  ];
  
  navMenu.innerHTML = items.map(item => '<button onclick="window.selectRestaurantPane(\'' + item.id + '\')" style="width:100%;text-align:left;padding:12px 16px;background:none;border:none;color:var(--text);cursor:pointer;font-size:14px;border-left:3px solid transparent;transition:all 0.2s;" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'none\'">' + item.icon + ' ' + item.name + '</button>').join('');
};

window.selectRestaurantPane = function(paneId) {
  document.querySelectorAll('[id^="pane-"]').forEach(pane => {
    pane.style.display = 'none';
  });
  
  const pane = document.getElementById('pane-' + paneId);
  if (pane) {
    pane.style.display = 'block';
    pane.innerHTML = '<div style="padding:20px;"><h2 style="font-size:20px;font-weight:700;margin-bottom:20px;">' + paneId.charAt(0).toUpperCase() + paneId.slice(1) + '</h2><p style="color:var(--txt3);">Coming soon...</p></div>';
  }
};

window.loadTables = async function() { console.log('[Restaurant] tables loaded'); };
window.loadOrders = async function() { console.log('[Restaurant] orders loaded'); };
window.loadMenu = async function() { console.log('[Restaurant] menu loaded'); };
window.loadFinance = async function() { console.log('[Restaurant] finance loaded'); };
window.loadInventory = async function() { console.log('[Restaurant] inventory loaded'); };
window.loadStaff = async function() { console.log('[Restaurant] staff loaded'); };
window.loadSuppliers = async function() { console.log('[Restaurant] suppliers loaded'); };
window.loadReports = async function() { console.log('[Restaurant] reports loaded'); };
window.loadSettings = async function() { console.log('[Restaurant] settings loaded'); };
window.loadOtherPanes = async function() { console.log('[Restaurant] other panes loaded'); };
window.setupRealtimeUpdates = function() { console.log('[Restaurant] realtime setup'); };
