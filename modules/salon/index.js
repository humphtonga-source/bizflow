// BIZFLOW SALON MODULE - CLEAN VERSION
async function MODULE_INIT() {
  console.log('[Salon] module loaded');
  
  try {
    // Initialize dashboard
    await initSalonDashboard();
    console.log('[Salon] module ready');
  } catch (err) {
    console.error('[Salon] init error:', err);
  }
}

window.initSalonDashboard = async function() {
  try {
    const container = document.getElementById('pane-dashboard');
    
    container.innerHTML = '<div style="padding:20px;"><h2 style="font-size:24px;font-weight:700;margin-bottom:20px;">Salon Dashboard</h2><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;margin-bottom:20px;"><h3 style="font-size:16px;font-weight:700;margin-bottom:10px;">Welcome to Your Salon</h3><p style="color:var(--txt3);font-size:14px;">Manage appointments, staff, and services from here.</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;"><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;"><div style="font-size:32px;font-weight:800;color:var(--gold);">0</div><div style="font-size:13px;color:var(--txt3);margin-top:8px;">Today Appointments</div></div><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;"><div style="font-size:32px;font-weight:800;color:var(--gold);">KES 0</div><div style="font-size:13px;color:var(--txt3);margin-top:8px;">Today Revenue</div></div><div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;"><div style="font-size:32px;font-weight:800;color:var(--gold);">0</div><div style="font-size:13px;color:var(--txt3);margin-top:8px;">Staff Present</div></div></div></div>';
    
    setupSalonMenu();
    
  } catch (err) {
    console.error('[Salon] dashboard error:', err);
  }
};

window.setupSalonMenu = function() {
  const navMenu = document.getElementById('nav-menu');
  
  const items = [
    { name: 'Dashboard', id: 'dashboard', icon: '📊' },
    { name: 'Appointments', id: 'appointments', icon: '📅' },
    { name: 'Staff', id: 'staff', icon: '👥' },
    { name: 'Services', id: 'services', icon: '✂️' },
    { name: 'Finance', id: 'finance', icon: '💰' },
    { name: 'Clients', id: 'clients', icon: '👤' },
    { name: 'Inventory', id: 'inventory', icon: '📦' },
    { name: 'Reports', id: 'reports', icon: '📈' },
    { name: 'Settings', id: 'settings', icon: '⚙️' }
  ];
  
  navMenu.innerHTML = items.map(item => '<button onclick="window.selectSalonPane(\'' + item.id + '\')" style="width:100%;text-align:left;padding:12px 16px;background:none;border:none;color:var(--text);cursor:pointer;font-size:14px;border-left:3px solid transparent;transition:all 0.2s;" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'none\'">' + item.icon + ' ' + item.name + '</button>').join('');
};

window.selectSalonPane = function(paneId) {
  document.querySelectorAll('[id^="pane-"]').forEach(pane => {
    pane.style.display = 'none';
  });
  
  const pane = document.getElementById('pane-' + paneId);
  if (pane) {
    pane.style.display = 'block';
    pane.innerHTML = '<div style="padding:20px;"><h2 style="font-size:20px;font-weight:700;margin-bottom:20px;">' + paneId.charAt(0).toUpperCase() + paneId.slice(1) + '</h2><p style="color:var(--txt3);">Coming soon...</p></div>';
  }
};

window.loadAppointments = async function() { console.log('[Salon] appointments loaded'); };
window.loadStaff = async function() { console.log('[Salon] staff loaded'); };
window.loadServices = async function() { console.log('[Salon] services loaded'); };
window.loadFinance = async function() { console.log('[Salon] finance loaded'); };
window.loadClients = async function() { console.log('[Salon] clients loaded'); };
window.loadInventory = async function() { console.log('[Salon] inventory loaded'); };
window.loadReports = async function() { console.log('[Salon] reports loaded'); };
window.loadSettings = async function() { console.log('[Salon] settings loaded'); };
window.loadOtherPanes = async function() { console.log('[Salon] other panes loaded'); };
window.setupRealtimeUpdates = function() { console.log('[Salon] realtime setup'); };
