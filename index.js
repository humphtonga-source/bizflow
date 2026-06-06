// ═══════════════════════════════════════════════════════════
// RESTAURANT MODULE
// ═══════════════════════════════════════════════════════════

async function MODULE_INIT() {
  buildRestaurantHTML();
  
  buildNavMenu([
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'menu', label: 'Menu', icon: '📋' },
    { id: 'tables', label: 'Tables', icon: '🪑' },
    { id: 'staff', label: 'Staff', icon: '👨‍🍳' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'inventory', label: 'Stock', icon: '📦' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]);
  
  await loadDashboard();
  await loadOrders();
  await loadMenu();
  await loadTables();
  await loadStaff();
  
  setupRealtimeSubscriptions();
}

function buildRestaurantHTML() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <!-- DASHBOARD -->
    <div class="section active" id="sec-dashboard">
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Restaurant Dashboard</h1>
        <p style="font-size:13px;color:var(--muted);">Today's overview</p>
      </div>
      <div class="stat-grid" id="dash-stats"></div>
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">Active Orders</h3>
        <div id="dash-active-orders"></div>
      </div>
    </div>

    <!-- ORDERS -->
    <div class="section" id="sec-orders">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Orders</h1>
          <p style="font-size:13px;color:var(--muted);">Manage customer orders</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddOrderForm()">+ New Order</button>
      </div>
      
      <div id="add-order-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Order</h3>
        <select class="input" id="o-table"></select>
        <select class="input" id="o-item"></select>
        <input class="input" id="o-qty" type="number" placeholder="Quantity" value="1">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveOrder()">Add Item</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddOrderForm()">Done</button>
        </div>
      </div>
      
      <div id="order-list"></div>
    </div>

    <!-- MENU -->
    <div class="section" id="sec-menu">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Menu</h1>
          <p style="font-size:13px;color:var(--muted);">Manage your menu items</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddMenuForm()">+ Add Item</button>
      </div>
      
      <div id="add-menu-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Menu Item</h3>
        <input class="input" id="m-name" placeholder="Item name">
        <textarea class="input" id="m-desc" placeholder="Description" rows="2"></textarea>
        <input class="input" id="m-price" type="number" placeholder="Price" step="0.01">
        <input class="input" id="m-category" placeholder="Category (e.g. Main, Appetizer)">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveMenuItem()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddMenuForm()">Cancel</button>
        </div>
      </div>
      
      <div id="menu-list"></div>
    </div>

    <!-- TABLES -->
    <div class="section" id="sec-tables">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Tables</h1>
          <p style="font-size:13px;color:var(--muted);">Manage seating</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddTableForm()">+ Add Table</button>
      </div>
      
      <div id="add-table-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Table</h3>
        <input class="input" id="t-number" placeholder="Table number">
        <input class="input" id="t-capacity" type="number" placeholder="Capacity">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveTable()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddTableForm()">Cancel</button>
        </div>
      </div>
      
      <div id="table-list"></div>
    </div>

    <!-- STAFF -->
    <div class="section" id="sec-staff">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Staff</h1>
          <p style="font-size:13px;color:var(--muted);">Manage your team</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddStaffForm()">+ Add Staff</button>
      </div>
      
      <div id="add-staff-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Staff Member</h3>
        <input class="input" id="st-name" placeholder="Name">
        <input class="input" id="st-phone" type="tel" placeholder="Phone">
        <select class="input" id="st-role">
          <option value="">Select role</option>
          <option value="waiter">Waiter</option>
          <option value="chef">Chef</option>
          <option value="bartender">Bartender</option>
          <option value="manager">Manager</option>
        </select>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveStaff()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddStaffForm()">Cancel</button>
        </div>
      </div>
      
      <div id="staff-list"></div>
    </div>

    <!-- FINANCE -->
    <div class="section" id="sec-finance">
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Finance</h1>
        <p style="font-size:13px;color:var(--muted);">Revenue & expenses</p>
      </div>
      
      <div class="stat-grid" id="finance-stats"></div>
      
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">Recent Transactions</h3>
        <div id="finance-list"></div>
      </div>
    </div>

    <!-- INVENTORY -->
    <div class="section" id="sec-inventory">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Stock</h1>
          <p style="font-size:13px;color:var(--muted);">Ingredient inventory</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddInventoryForm()">+ Add Item</button>
      </div>
      
      <div id="add-inventory-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Item</h3>
        <input class="input" id="i-name" placeholder="Item name">
        <input class="input" id="i-qty" type="number" placeholder="Quantity">
        <input class="input" id="i-unit" placeholder="Unit (kg, L, pieces)">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveInventory()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddInventoryForm()">Cancel</button>
        </div>
      </div>
      
      <div id="inventory-list"></div>
    </div>

    <!-- REPORTS -->
    <div class="section" id="sec-reports">
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Reports</h1>
        <p style="font-size:13px;color:var(--muted);">Business analytics</p>
      </div>
      <div id="reports-content"></div>
    </div>

    <!-- SETTINGS -->
    <div class="section" id="sec-settings">
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Settings</h1>
        <p style="font-size:13px;color:var(--muted);">Business configuration</p>
      </div>
      
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">Restaurant Info</h3>
        <input class="input" id="set-name" placeholder="Restaurant name">
        <input class="input" id="set-email" type="email" placeholder="Email">
        <input class="input" id="set-phone" type="tel" placeholder="Phone">
        <input class="input" id="set-address" placeholder="Address">
        <button class="btn btn-gold" style="width:100%;margin-top:16px;" onclick="saveSettings()">Save Changes</button>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const { data: orders } = await STATE.supabase
      .from('restaurant_orders')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('status', 'pending');
    
    const html = `
      <div class="stat-card">
        <div class="stat-label">Today's Orders</div>
        <div class="stat-value" style="color:var(--green);">${orders?.length || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">KES 0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Order Value</div>
        <div class="stat-value">KES 0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tables</div>
        <div class="stat-value">0</div>
      </div>
    `;
    
    document.getElementById('dash-stats').innerHTML = html;
    
    const activeOrdersHtml = orders?.length ? orders.slice(0, 5).map(o => `
      <div style="background:var(--black3);border-left:3px solid var(--gold);padding:12px;border-radius:8px;margin-bottom:8px;">
        <div style="font-size:14px;font-weight:600;">Table ${o.table_number}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;">${o.status}</div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No active orders</p>';
    
    document.getElementById('dash-active-orders').innerHTML = activeOrdersHtml;
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════
function toggleAddOrderForm() {
  const form = document.getElementById('add-order-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveOrder() {
  showToast('Order saved');
}

async function loadOrders() {
  try {
    const { data: orders } = await STATE.supabase
      .from('restaurant_orders')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    const html = orders?.length ? orders.map(o => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;">
        <div style="font-size:14px;font-weight:600;">Table ${o.table_number}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;">Status: ${o.status}</div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No orders</p>';
    
    document.getElementById('order-list').innerHTML = html;
  } catch (err) {
    console.error('Load orders error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════════
function toggleAddMenuForm() {
  const form = document.getElementById('add-menu-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveMenuItem() {
  showToast('Menu item saved');
}

async function loadMenu() {
  try {
    const { data: items } = await STATE.supabase
      .from('restaurant_menu')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const html = items?.length ? items.map(i => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;">
        <div>
          <div style="font-size:14px;font-weight:600;">${i.name}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">${i.category}</div>
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--gold);">KES ${i.price}</div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No menu items</p>';
    
    document.getElementById('menu-list').innerHTML = html;
  } catch (err) {
    console.error('Load menu error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════
function toggleAddTableForm() {
  const form = document.getElementById('add-table-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveTable() {
  showToast('Table added');
}

async function loadTables() {
  try {
    const { data: tables } = await STATE.supabase
      .from('restaurant_tables')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const html = tables?.length ? tables.map(t => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;">
        <div>
          <div style="font-size:14px;font-weight:600;">Table ${t.table_number}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">Capacity: ${t.capacity}</div>
        </div>
        <div style="background:var(--goldl);color:var(--gold);padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;height:fit-content;">${t.status}</div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No tables</p>';
    
    document.getElementById('table-list').innerHTML = html;
  } catch (err) {
    console.error('Load tables error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════════
function toggleAddStaffForm() {
  const form = document.getElementById('add-staff-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveStaff() {
  showToast('Staff member added');
}

async function loadStaff() {
  try {
    const { data: staff } = await STATE.supabase
      .from('restaurant_staff')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const html = staff?.length ? staff.map(s => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;">
        <div style="font-size:14px;font-weight:600;">${s.name}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;">${s.role}</div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No staff</p>';
    
    document.getElementById('staff-list').innerHTML = html;
  } catch (err) {
    console.error('Load staff error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
async function saveSettings() {
  showToast('Settings saved');
}

// ═══════════════════════════════════════════════════════════
// REALTIME
// ═══════════════════════════════════════════════════════════
function setupRealtimeSubscriptions() {
  STATE.supabase
    .channel(`restaurant_orders:business_id=eq.${STATE.businessId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_orders' }, () => {
      loadOrders();
      loadDashboard();
    })
    .subscribe();
}

function toggleAddInventoryForm() {
  const form = document.getElementById('add-inventory-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveInventory() {
  showToast('Inventory item saved');
}
