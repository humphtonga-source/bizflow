// BIZFLOW RESTAURANT MODULE
async function MODULE_INIT() {
  console.log('Restaurant module loaded');
  await initializeDashboardData();
  await renderDashboard();
  await window.loadTables();
  await window.loadOrders();
  await window.loadMenu();
  await window.loadFinance();
  await window.loadInventory();
  await window.loadStaff();
  await window.loadSuppliers();
  await window.loadClients();
  await window.loadReports();
  await window.loadSettings();
  await window.loadOtherPanes();
  console.log('Restaurant module ready');
}

window.loadOtherPanes = async function() {
  // All panes have dedicated load functions
};

// RESTAURANT DASHBOARD
async function initializeDashboardData() {
  try {
    const { data: restaurant } = await STATE.supabase
      .from('restaurants')
      .select('*')
      .eq('business_id', STATE.businessId)
      .single();
    
    if (restaurant) {
      document.querySelector('.restaurant-name').textContent = restaurant.name || 'My Restaurant';
    }
  } catch (err) {
    console.error('Dashboard init error:', err);
  }
}

async function renderDashboard() {
  const dashboard = document.getElementById('pane-dashboard');
  if (!dashboard) return;
  
  dashboard.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-size:24px;font-weight:800;margin:0;">🏠 Dashboard</h2>
        <div style="font-size:12px;color:var(--txt3);text-align:right;">
          <div id="dash-date" style="font-weight:500;color:var(--txt);"></div>
          <div id="dash-time" style="color:var(--txt3);"></div>
        </div>
      </div>
      
      <!-- KPI TILES -->
      <div id="kpi-tiles" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;"></div>
      
      <!-- ALERTS -->
      <div id="alerts-section" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;margin-bottom:16px;"></div>
      
      <!-- LIVE TABLES -->
      <div id="tables-section" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;"></div>
    </div>
  `;
  
  updateDateTime();
  setInterval(updateDateTime, 1000);
  await loadKPIs();
  await loadAlerts();
  await loadLiveTables();
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('dash-date').textContent = now.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
  document.getElementById('dash-time').textContent = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

window.loadKPIs = async function() {
  try {
    // Get today's sales
    const today = new Date().toISOString().split('T')[0];
    const { data: orders } = await STATE.supabase
      .from('restaurant_orders')
      .select('total_amount,created_at')
      .eq('business_id', STATE.businessId)
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59')
      .eq('status', 'completed');
    
    const sales = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    
    // Get table stats
    const { data: tables } = await STATE.supabase
      .from('restaurant_tables')
      .select('status')
      .eq('business_id', STATE.businessId);
    
    const occupied = tables?.filter(t => t.status === 'occupied').length || 0;
    const available = tables?.filter(t => t.status === 'available').length || 0;
    const total = tables?.length || 0;
    
    // Get pending orders
    const { data: pending } = await STATE.supabase
      .from('restaurant_orders')
      .select('id')
      .eq('business_id', STATE.businessId)
      .eq('status', 'pending');
    
    // Get active staff
    const { data: staff } = await STATE.supabase
      .from('restaurant_staff')
      .select('id,shift_status')
      .eq('business_id', STATE.businessId)
      .eq('shift_status', 'on_shift');
    
    const html = `
      <div style="background:var(--bg2);border:1px solid var(--gold);border-radius:8px;padding:12px;cursor:pointer;" onclick="window.navTo && window.navTo('pane-orders')">
        <div style="font-size:24px;margin-bottom:6px;">💰</div>
        <div style="font-size:20px;font-weight:700;color:var(--gold);">KES ${sales.toLocaleString()}</div>
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em;">Today's Sales</div>
      </div>
      
      <div style="background:var(--bg2);border:1px solid var(--red);border-radius:8px;padding:12px;cursor:pointer;" onclick="window.navTo && window.navTo('pane-tables')">
        <div style="font-size:24px;margin-bottom:6px;">🔴</div>
        <div style="font-size:20px;font-weight:700;color:var(--red);">${occupied} / ${total}</div>
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em;">Occupied Tables</div>
      </div>
      
      <div style="background:var(--bg2);border:1px solid var(--green);border-radius:8px;padding:12px;cursor:pointer;" onclick="window.navTo && window.navTo('pane-tables')">
        <div style="font-size:24px;margin-bottom:6px;">🟢</div>
        <div style="font-size:20px;font-weight:700;color:var(--green);">${available} / ${total}</div>
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em;">Available</div>
      </div>
      
      <div style="background:var(--bg2);border:1px solid #3b82f6;border-radius:8px;padding:12px;">
        <div style="font-size:24px;margin-bottom:6px;">📋</div>
        <div style="font-size:20px;font-weight:700;color:#3b82f6;">${pending?.length || 0}</div>
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em;">Pending Orders</div>
      </div>
      
      <div style="background:var(--bg2);border:1px solid #a855f7;border-radius:8px;padding:12px;">
        <div style="font-size:24px;margin-bottom:6px;">🛵</div>
        <div style="font-size:20px;font-weight:700;color:#a855f7;">0</div>
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em;">Active Deliveries</div>
      </div>
      
      <div style="background:var(--bg2);border:1px solid #06b6d4;border-radius:8px;padding:12px;">
        <div style="font-size:24px;margin-bottom:6px;">👨‍🍳</div>
        <div style="font-size:20px;font-weight:700;color:#06b6d4;">${staff?.length || 0}</div>
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em;">On Shift</div>
      </div>
    `;
    
    document.getElementById('kpi-tiles').innerHTML = html;
  } catch (err) {
    console.error('Load KPIs error:', err);
  }
};

window.loadAlerts = async function() {
  try {
    const alerts = [
      { icon: '🔴', text: 'Table 6 — order not billed for 45 mins', time: '45m ago', type: 'red' },
      { icon: '⚠️', text: 'Beef stock low — 2kg remaining', time: 'today', type: 'yellow' }
    ];
    
    const html = `
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:700;font-size:12px;color:var(--txt3);text-transform:uppercase;">⚠️ Alerts</div>
      ${alerts.map(a => `
        <div style="display:flex;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border);font-size:12px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${a.type === 'red' ? 'var(--red)' : 'var(--yellow)};margin-top:4px;flex-shrink:0;"></div>
          <div style="flex:1;">${a.text}</div>
          <div style="color:var(--txt3);font-size:11px;">${a.time}</div>
        </div>
      `).join('')}
    `;
    
    document.getElementById('alerts-section').innerHTML = html;
  } catch (err) {
    console.error('Load alerts error:', err);
  }
};

window.loadLiveTables = async function() {
  try {
    const { data: tables } = await STATE.supabase
      .from('restaurant_tables')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('table_number', { ascending: true })
      .limit(4);
    
    const html = `
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;font-size:12px;color:var(--txt3);text-transform:uppercase;">🪑 Live Tables</div>
        <button onclick="window.navTo && window.navTo('pane-tables')" style="font-size:11px;color:var(--gold);background:none;border:none;cursor:pointer;font-weight:700;">View all →</button>
      </div>
      ${tables?.map(t => `
        <div style="display:flex;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer;" onclick="window.navTo && window.navTo('pane-tables')">
          <div style="width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:${t.status === 'occupied' ? 'rgba(239,68,68,0.15);color:var(--red)' : 'rgba(34,197,94,0.15);color:var(--green)'};">T${t.table_number}</div>
          <div style="flex:1;font-size:12px;">
            <div style="font-weight:500;color:var(--txt);">${t.waiter_name || 'Unassigned'}</div>
            <div style="color:var(--txt3);font-size:11px;">${t.status === 'occupied' ? 'Occupied' : 'Available'}</div>
          </div>
          <div style="text-align:right;font-size:11px;color:var(--txt3);">${t.occupied_since || '-'}</div>
        </div>
      `).join('') || '<div style="padding:20px;color:var(--txt3);text-align:center;">No tables yet</div>'}
    `;
    
    document.getElementById('tables-section').innerHTML = html;
  } catch (err) {
    console.error('Load live tables error:', err);
  }
};

async function loadAdminDashboard(container) {
  await renderDashboard();
}

async function loadEmployeeDashboard(container) {
  await renderDashboard();
}
// RESTAURANT TABLES MANAGEMENT
window.loadTables = async function() {
  const container = document.getElementById('pane-tables');
  if (!container) return;
  
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">🪑 Tables</h2>
        <button onclick="window.openAddTableModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ Add Table</button>
      </div>
      
      <div id="table-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-weight:700;margin-bottom:12px;">Add New Table</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input id="table-number" type="number" placeholder="Table number" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="table-capacity" type="number" placeholder="Capacity" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <select id="table-location" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <option value="">Select location</option>
            <option value="main">Main Hall</option>
            <option value="outdoor">Outdoor</option>
            <option value="vip">VIP</option>
            <option value="bar">Bar</option>
          </select>
          <select id="table-status" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="window.saveTable()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
          <button onclick="window.closeAddTableModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
        </div>
      </div>
      
      <div id="tables-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div>
    </div>
  `;
  
  await window.renderTables();
};

window.openAddTableModal = function() {
  document.getElementById('table-modal').style.display = 'block';
};

window.closeAddTableModal = function() {
  document.getElementById('table-modal').style.display = 'none';
  document.getElementById('table-number').value = '';
  document.getElementById('table-capacity').value = '';
  document.getElementById('table-location').value = '';
  document.getElementById('table-status').value = 'available';
};

window.saveTable = async function() {
  const number = parseInt(document.getElementById('table-number')?.value);
  const capacity = parseInt(document.getElementById('table-capacity')?.value);
  const location = document.getElementById('table-location')?.value;
  const status = document.getElementById('table-status')?.value;
  
  if (!number || !capacity || !location) {
    alert('Fill all required fields');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('restaurant_tables')
      .insert([{
        business_id: STATE.businessId,
        table_number: number,
        capacity: capacity,
        location: location,
        status: status || 'available'
      }]);
    
    if (error) throw error;
    
    window.closeAddTableModal();
    await window.renderTables();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.renderTables = async function() {
  try {
    const { data: tables } = await STATE.supabase
      .from('restaurant_tables')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('table_number', { ascending: true });
    
    const list = document.getElementById('tables-list');
    if (!list) return;
    
    if (!tables || tables.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No tables yet</div>';
      return;
    }
    
    const html = tables.map(t => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;">
        <div style="flex:1;">
          <div style="font-weight:700;font-size:13px;">Table ${t.table_number}</div>
          <div style="font-size:12px;color:var(--txt3);margin-top:4px;">Capacity: ${t.capacity} | Location: ${t.location}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px;">Status: <span style="color:${t.status === 'occupied' ? 'var(--red)' : 'var(--green)'}">${t.status}</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button onclick="window.deleteTable && window.deleteTable('${t.id}')" style="padding:6px 12px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
        </div>
      </div>
    `).join('');
    
    list.innerHTML = html;
  } catch (err) {
    console.error('Render tables error:', err);
  }
};

window.deleteTable = async function(id) {
  if (!confirm('Delete this table?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('restaurant_tables')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await window.renderTables();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};
// RESTAURANT ORDERS
window.loadOrders = async function() {
  const container = document.getElementById('pane-orders');
  if (!container) return;
  
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">📋 Orders</h2>
        <button onclick="window.openAddOrderModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ New Order</button>
      </div>
      
      <div id="orders-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div>
    </div>
  `;
  
  await window.renderOrders();
};

window.openAddOrderModal = function() {
  alert('Order creation coming soon');
};

window.renderOrders = async function() {
  try {
    const { data: orders } = await STATE.supabase
      .from('restaurant_orders')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    const list = document.getElementById('orders-list');
    if (!list) return;
    
    if (!orders || orders.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No orders yet</div>';
      return;
    }
    
    const html = orders.map(o => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;">Order #${o.order_number}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:4px;">Table: ${o.table_number || 'Delivery'}</div>
            <div style="font-size:12px;color:var(--txt3);">Status: <span style="color:${o.status === 'completed' ? 'var(--green)' : 'var(--yellow)'}">${o.status}</span></div>
            <div style="font-size:12px;color:var(--txt3);margin-top:2px;">Amount: KES ${(o.total_amount || 0).toLocaleString()}</div>
          </div>
          <div style="font-size:18px;cursor:pointer;" onclick="window.viewOrderDetails && window.viewOrderDetails('${o.id}')">›</div>
        </div>
      </div>
    `).join('');
    
    list.innerHTML = html;
  } catch (err) {
    console.error('Render orders error:', err);
  }
};

window.viewOrderDetails = async function(orderId) {
  alert('Order details coming soon');
};
window.loadMenu = async function() {
  const container = document.getElementById('pane-menu');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>🍛 Menu</h2><p>Coming soon...</p></div>`;
};
window.loadFinance = async function() {
  const container = document.getElementById('pane-finance');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>💰 Finance</h2><p>Coming soon...</p></div>`;
};
window.loadInventory = async function() {
  const container = document.getElementById('pane-inventory');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>📦 Inventory</h2><p>Coming soon...</p></div>`;
};
window.loadStaff = async function() {
  const container = document.getElementById('pane-staff');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>👨‍🍳 Staff</h2><p>Coming soon...</p></div>`;
};
window.loadSuppliers = async function() {
  const container = document.getElementById('pane-suppliers');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>🚚 Suppliers</h2><p>Coming soon...</p></div>`;
};
window.loadClients = async function() {
  const container = document.getElementById('pane-clients');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>👤 Clients</h2><p>Coming soon...</p></div>`;
};
window.loadReports = async function() {
  const container = document.getElementById('pane-reports');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>📊 Reports</h2><p>Coming soon...</p></div>`;
};
window.loadSettings = async function() {
  const container = document.getElementById('pane-settings');
  if (!container) return;
  container.innerHTML = `<div style="padding:20px;color:var(--txt3);"><h2>⚙️ Settings</h2><p>Coming soon...</p></div>`;
};
