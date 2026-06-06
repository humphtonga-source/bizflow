// ═══════════════════════════════════════════════════════════
// SALON MODULE v2 — IMPROVED
// ═══════════════════════════════════════════════════════════

async function MODULE_INIT() {
  buildSalonHTML();
  
  // Role-based nav
  let navModules = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'stylists', label: 'Staff', icon: '👩' },
    { id: 'services', label: 'Services', icon: '✂️' },
    { id: 'finance', label: 'Finance', icon: '💰' },
  ];
  
  // Only owner sees inventory + clients + reports + settings
  if (STATE.userRole === 'owner') {
    navModules.push(
      { id: 'clients', label: 'Clients', icon: '👥' },
      { id: 'inventory', label: 'Stock', icon: '📦' },
      { id: 'reports', label: 'Reports', icon: '📈' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    );
  }
  
  buildNavMenu(navModules);
  
  await loadDashboard();
  await loadStylists();
  await loadServices();
  await loadAppointments();
  await loadFinance();
  
  setupRealtimeSubscriptions();
}

// ═══════════════════════════════════════════════════════════
// HTML BUILDER
// ═══════════════════════════════════════════════════════════
function buildSalonHTML() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <!-- DASHBOARD -->
    <div class="section active" id="sec-dashboard">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="page-sub">Your salon at a glance</p>
        </div>
      </div>
      
      <div class="stat-grid" id="dash-stats"></div>
      
      <div class="two-col">
        <div class="card">
          <div class="card-title">Today's Schedule</div>
          <div id="dash-today-appts" class="card-content"></div>
        </div>
        <div class="card">
          <div class="card-title">Recent Activity</div>
          <div id="dash-activity" class="card-content"></div>
        </div>
      </div>
    </div>

    <!-- APPOINTMENTS -->
    <div class="section" id="sec-appointments">
      <div class="page-header">
        <div>
          <h1>Appointments</h1>
          <p class="page-sub" id="appt-date-lbl"></p>
        </div>
        <button class="btn btn-gold" onclick="openApptForm()">+ New</button>
      </div>
      
      <div class="filters">
        <input class="input" id="appt-filter-date" type="date" onchange="renderAppointments()" placeholder="Filter by date">
        <select class="input" id="appt-filter-status" onchange="renderAppointments()">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div id="appt-form" class="card" style="display:none;margin-bottom:20px;">
        <div class="card-title">New Appointment</div>
        <div class="form-grid">
          <input class="input" id="a-client" placeholder="Client name">
          <input class="input" id="a-phone" type="tel" placeholder="Phone">
          <select class="input" id="a-service"></select>
          <select class="input" id="a-stylist"></select>
          <input class="input" id="a-date" type="date">
          <input class="input" id="a-time" type="time">
          <textarea class="input" id="a-notes" placeholder="Notes" style="grid-column:1/-1;"></textarea>
          <div style="display:flex;gap:8px;grid-column:1/-1;">
            <button class="btn btn-gold" style="flex:1;" onclick="saveAppointment()">Save</button>
            <button class="btn btn-cancel" style="flex:1;" onclick="closeApptForm()">Cancel</button>
          </div>
        </div>
      </div>
      
      <div id="appt-list"></div>
    </div>

    <!-- STYLISTS -->
    <div class="section" id="sec-stylists">
      <div class="page-header">
        <div>
          <h1>Staff</h1>
          <p class="page-sub">Manage your team</p>
        </div>
        ${STATE.userRole === 'owner' ? '<button class="btn btn-gold" onclick="openStylistForm()">+ Add Staff</button>' : ''}
      </div>
      
      <div id="stylist-form" class="card" style="display:none;margin-bottom:20px;">
        <div class="card-title">Add Staff Member</div>
        <div class="form-grid">
          <input class="input" id="s-name" placeholder="Name">
          <input class="input" id="s-email" type="email" placeholder="Email">
          <input class="input" id="s-phone" type="tel" placeholder="Phone">
          <input class="input" id="s-commission" type="number" placeholder="Commission %" min="0" max="100">
          <div style="display:flex;gap:8px;grid-column:1/-1;">
            <button class="btn btn-gold" style="flex:1;" onclick="saveStylist()">Save</button>
            <button class="btn btn-cancel" style="flex:1;" onclick="closeStylistForm()">Cancel</button>
          </div>
        </div>
      </div>
      
      <div id="stylist-list"></div>
    </div>

    <!-- SERVICES -->
    <div class="section" id="sec-services">
      <div class="page-header">
        <div>
          <h1>Services</h1>
          <p class="page-sub">Manage your offerings</p>
        </div>
        ${STATE.userRole === 'owner' ? '<button class="btn btn-gold" onclick="openServiceForm()">+ Add Service</button>' : ''}
      </div>
      
      <div id="service-form" class="card" style="display:none;margin-bottom:20px;">
        <div class="card-title">New Service</div>
        <div class="form-grid">
          <input class="input" id="svc-name" placeholder="Service name">
          <input class="input" id="svc-price" type="number" placeholder="Price" step="0.01">
          <input class="input" id="svc-duration" type="number" placeholder="Duration (mins)">
          <textarea class="input" id="svc-desc" placeholder="Description" style="grid-column:1/-1;"></textarea>
          <div style="display:flex;gap:8px;grid-column:1/-1;">
            <button class="btn btn-gold" style="flex:1;" onclick="saveService()">Save</button>
            <button class="btn btn-cancel" style="flex:1;" onclick="closeServiceForm()">Cancel</button>
          </div>
        </div>
      </div>
      
      <div id="service-list"></div>
    </div>

    <!-- FINANCE -->
    <div class="section" id="sec-finance">
      <div class="page-header">
        <div>
          <h1>Finance</h1>
          <p class="page-sub">Revenue & expenses</p>
        </div>
        <button class="btn btn-gold" onclick="openFinanceForm()">+ Record</button>
      </div>
      
      <div class="stat-grid" id="finance-stats"></div>
      
      <div class="two-col">
        <div class="card">
          <div class="card-title">Add Transaction</div>
          <div id="finance-form" style="display:none;">
            <div class="form-grid">
              <select class="input" id="f-type">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <input class="input" id="f-amount" type="number" placeholder="Amount" step="0.01">
              <input class="input" id="f-category" placeholder="Category (e.g. Service, Supplies)">
              <input class="input" id="f-desc" placeholder="Description">
              <div style="display:flex;gap:8px;grid-column:1/-1;">
                <button class="btn btn-gold" style="flex:1;" onclick="saveFinanceRecord()">Save</button>
                <button class="btn btn-cancel" style="flex:1;" onclick="closeFinanceForm()">Cancel</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Recent Transactions</div>
          <div id="finance-list" class="card-content"></div>
        </div>
      </div>
    </div>

    <!-- CLIENTS (Owner only) -->
    <div class="section" id="sec-clients" style="display:${STATE.userRole === 'owner' ? 'block' : 'none'};">
      <div class="page-header">
        <div>
          <h1>Clients</h1>
          <p class="page-sub">Customer database</p>
        </div>
      </div>
      
      <input class="input" id="client-search" placeholder="Search clients..." onkeyup="renderClients()" style="margin-bottom:20px;">
      <div id="client-list"></div>
    </div>

    <!-- INVENTORY (Owner only) -->
    <div class="section" id="sec-inventory" style="display:${STATE.userRole === 'owner' ? 'block' : 'none'};">
      <div class="page-header">
        <div>
          <h1>Stock</h1>
          <p class="page-sub">Manage inventory</p>
        </div>
        <button class="btn btn-gold" onclick="openInventoryForm()">+ Add Item</button>
      </div>
      
      <div id="inventory-form" class="card" style="display:none;margin-bottom:20px;">
        <div class="card-title">New Item</div>
        <div class="form-grid">
          <input class="input" id="inv-name" placeholder="Item name">
          <input class="input" id="inv-qty" type="number" placeholder="Quantity">
          <input class="input" id="inv-cost" type="number" placeholder="Cost price" step="0.01">
          <div style="display:flex;gap:8px;grid-column:1/-1;">
            <button class="btn btn-gold" style="flex:1;" onclick="saveInventory()">Save</button>
            <button class="btn btn-cancel" style="flex:1;" onclick="closeInventoryForm()">Cancel</button>
          </div>
        </div>
      </div>
      
      <div id="inventory-list"></div>
    </div>

    <!-- REPORTS (Owner only) -->
    <div class="section" id="sec-reports" style="display:${STATE.userRole === 'owner' ? 'block' : 'none'};">
      <div class="page-header">
        <div>
          <h1>Reports</h1>
          <p class="page-sub">Business analytics</p>
        </div>
      </div>
      <div id="reports-content"></div>
    </div>

    <!-- SETTINGS (Owner only) -->
    <div class="section" id="sec-settings" style="display:${STATE.userRole === 'owner' ? 'block' : 'none'};">
      <div class="page-header">
        <div>
          <h1>Settings</h1>
          <p class="page-sub">Business configuration</p>
        </div>
      </div>
      
      <div class="card" style="max-width:600px;">
        <div class="card-title">Business Info</div>
        <div class="form-grid">
          <input class="input" id="set-name" placeholder="Business name">
          <input class="input" id="set-email" type="email" placeholder="Email">
          <input class="input" id="set-phone" type="tel" placeholder="Phone">
          <input class="input" id="set-address" placeholder="Address" style="grid-column:1/-1;">
          <button class="btn btn-gold" style="grid-column:1/-1;" onclick="saveSettings()">Save Changes</button>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: appts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const { data: finance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income');
    
    const totalRevenue = finance?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    
    // Stats cards
    const statsHtml = `
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Today's Revenue</div>
        <div class="stat-value">KES ${totalRevenue.toLocaleString()}</div>
        <div class="stat-sub">${appts?.length || 0} appointments</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👩</div>
        <div class="stat-label">Staff</div>
        <div class="stat-value">${stylists?.length || 0}</div>
        <div class="stat-sub">Active members</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-label">Today's Appts</div>
        <div class="stat-value">${appts?.length || 0}</div>
        <div class="stat-sub">Scheduled</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-label">Avg Rating</div>
        <div class="stat-value">4.8</div>
        <div class="stat-sub">From reviews</div>
      </div>
    `;
    document.getElementById('dash-stats').innerHTML = statsHtml;
    
    // Today's appointments
    const apptHtml = appts?.length ? appts.map(a => `
      <div class="appt-item">
        <div class="appt-time">${a.time}</div>
        <div class="appt-details">
          <div class="appt-name">${a.client_name}</div>
          <div class="appt-phone">${a.client_phone}</div>
        </div>
        <div class="appt-status ${a.status}">${a.status}</div>
      </div>
    `).join('') : '<p class="empty">No appointments today</p>';
    
    document.getElementById('dash-today-appts').innerHTML = apptHtml;
    
    // Activity
    const activityHtml = `
      <div class="activity-item">
        <div class="activity-icon">✂️</div>
        <div class="activity-text">
          <div class="activity-title">Salon Active</div>
          <div class="activity-time">Now</div>
        </div>
      </div>
      <div class="activity-item">
        <div class="activity-icon">👩</div>
        <div class="activity-text">
          <div class="activity-title">${stylists?.length || 0} staff members</div>
          <div class="activity-time">On board</div>
        </div>
      </div>
    `;
    document.getElementById('dash-activity').innerHTML = activityHtml;
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════
function openApptForm() {
  document.getElementById('appt-form').style.display = 'block';
  document.getElementById('a-date').valueAsDate = new Date();
  closeMenuOnMobile();
}

function closeApptForm() {
  document.getElementById('appt-form').style.display = 'none';
}

async function saveAppointment() {
  const clientName = document.getElementById('a-client').value.trim();
  const phone = document.getElementById('a-phone').value.trim();
  const serviceId = document.getElementById('a-service').value;
  const stylistId = document.getElementById('a-stylist').value;
  const date = document.getElementById('a-date').value;
  const time = document.getElementById('a-time').value;
  
  if (!clientName || !date || !time) {
    showToast('Fill all required fields', 'error');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .insert([{
        business_id: STATE.businessId,
        client_name: clientName,
        client_phone: phone,
        service_id: serviceId,
        stylist_id: stylistId,
        date,
        time,
        status: 'pending',
        created_at: new Date()
      }]);
    
    if (error) throw error;
    showToast('Appointment created');
    closeApptForm();
    await renderAppointments();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function renderAppointments() {
  try {
    const filterDate = document.getElementById('appt-filter-date').value;
    const filterStatus = document.getElementById('appt-filter-status').value;
    
    let query = STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    if (filterDate) query = query.eq('date', filterDate);
    if (filterStatus) query = query.eq('status', filterStatus);
    
    const { data: appts } = await query.order('date', { ascending: false });
    
    const html = appts?.length ? appts.map(a => `
      <div class="appt-card">
        <div class="appt-card-left">
          <div class="appt-card-name">${a.client_name}</div>
          <div class="appt-card-details">📅 ${a.date} at ${a.time}</div>
          <div class="appt-card-details">📞 ${a.client_phone}</div>
        </div>
        <div class="appt-card-right">
          <div class="badge ${a.status}">${a.status}</div>
          <button class="btn-small" onclick="updateApptStatus('${a.id}', 'done')">Done</button>
        </div>
      </div>
    `).join('') : '<p class="empty">No appointments</p>';
    
    document.getElementById('appt-list').innerHTML = html;
  } catch (err) {
    console.error('Render appts error:', err);
  }
}

async function updateApptStatus(apptId, status) {
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .update({ status })
      .eq('id', apptId);
    
    if (error) throw error;
    await renderAppointments();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// STYLISTS
// ═══════════════════════════════════════════════════════════
function openStylistForm() {
  document.getElementById('stylist-form').style.display = 'block';
  closeMenuOnMobile();
}

function closeStylistForm() {
  document.getElementById('stylist-form').style.display = 'none';
}

async function loadStylists() {
  try {
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const html = stylists?.length ? stylists.map(s => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div class="card-title">${s.name}</div>
            <div class="card-sub">📞 ${s.phone}</div>
            <div class="card-sub">💼 ${s.commission}% commission</div>
          </div>
          ${STATE.userRole === 'owner' ? `<button class="btn-sm" onclick="deleteStylist('${s.id}')">Remove</button>` : ''}
        </div>
      </div>
    `).join('') : '<p class="empty">No stylists added</p>';
    
    document.getElementById('stylist-list').innerHTML = html;
  } catch (err) {
    console.error('Load stylists error:', err);
  }
}

async function saveStylist() {
  const name = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const phone = document.getElementById('s-phone').value.trim();
  const commission = parseFloat(document.getElementById('s-commission').value) || 0;
  
  if (!name || !email) {
    showToast('Name and email required', 'error');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_stylists')
      .insert([{
        business_id: STATE.businessId,
        name,
        email,
        phone,
        commission,
        created_at: new Date()
      }]);
    
    if (error) throw error;
    showToast('Staff member added');
    closeStylistForm();
    document.getElementById('s-name').value = '';
    document.getElementById('s-email').value = '';
    document.getElementById('s-phone').value = '';
    document.getElementById('s-commission').value = '';
    await loadStylists();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteStylist(stylistId) {
  if (!confirm('Remove this staff member?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_stylists')
      .delete()
      .eq('id', stylistId);
    
    if (error) throw error;
    await loadStylists();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════
function openServiceForm() {
  document.getElementById('service-form').style.display = 'block';
  closeMenuOnMobile();
}
