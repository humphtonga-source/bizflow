// ═══════════════════════════════════════════════════════════
// BIZFLOW SALON MODULE v3 — COMPLETE FEATURE SET
// ═══════════════════════════════════════════════════════════

async function MODULE_INIT() {
  buildSalonUI();
  setupNavigation();
  await loadAllData();
  setupRealtimeUpdates();
}

// ═══════════════════════════════════════════════════════════
// UI BUILDER
// ═══════════════════════════════════════════════════════════

function buildSalonUI() {
  const panes = ['dashboard', 'appointments', 'staff', 'services', 'finance', 'clients', 'inventory', 'reports', 'settings'];
  
  panes.forEach(pane => {
    const el = document.getElementById(`pane-${pane}`);
    if (el) el.innerHTML = ''; // Clear placeholder
  });
  
  // DASHBOARD
  document.getElementById('pane-dashboard').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;flex:1;overflow-y:auto;">
      <div>
        <div style="font-size:18px;font-weight:800;margin-bottom:12px;">Dashboard</div>
        <div id="dash-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;"></div>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
          <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Today's Appointments</div>
          <div id="dash-appts"></div>
        </div>
        
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
          <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Top Performers</div>
          <div id="dash-performers"></div>
        </div>
      </div>
      
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Recent Activity</div>
        <div id="dash-activity"></div>
      </div>
    </div>
  `;
  
  // APPOINTMENTS
  document.getElementById('pane-appointments').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:18px;font-weight:800;">Appointments</div>
        ${STATE.userRole === 'owner' ? '<button class="btn btn-primary" onclick="openAppointmentModal()">+ New Appointment</button>' : ''}
      </div>
      
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input class="form-input" id="appt-filter-date" type="date" onchange="filterAppointments()" style="flex:1;min-width:150px;margin-bottom:0;">
        <select class="form-input" id="appt-filter-shop" onchange="filterAppointments()" style="flex:1;min-width:150px;margin-bottom:0;">
          <option value="">All Shops</option>
        </select>
        <select class="form-input" id="appt-filter-status" onchange="filterAppointments()" style="flex:1;min-width:150px;margin-bottom:0;">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="ongoing">Ongoing</option>
          <option value="done">Done</option>
        </select>
      </div>
      
      <div id="appt-list"></div>
    </div>
  `;
  
  // STAFF
  document.getElementById('pane-staff').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:18px;font-weight:800;">Staff</div>
        ${STATE.userRole === 'owner' ? '<button class="btn btn-primary" onclick="openStaffModal()">+ Add Staff</button>' : ''}
      </div>
      <div id="staff-list"></div>
    </div>
  `;
  
  // SERVICES
  document.getElementById('pane-services').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:18px;font-weight:800;">Services</div>
        ${STATE.userRole === 'owner' ? '<button class="btn btn-primary" onclick="openServiceModal()">+ Add Service</button>' : ''}
      </div>
      <div id="service-list"></div>
    </div>
  `;
  
  // FINANCE
  document.getElementById('pane-finance').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:18px;font-weight:800;">Finance</div>
        <button class="btn btn-primary" onclick="openFinanceModal()">+ Record Transaction</button>
      </div>
      
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <select class="form-input" id="finance-period" onchange="loadFinance()" style="flex:1;min-width:120px;margin-bottom:0;">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      
      <div id="finance-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;"></div>
      <div id="finance-list"></div>
    </div>
  `;
  
  // CLIENTS
  document.getElementById('pane-clients').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:18px;font-weight:800;">Clients</div>
        <button class="btn btn-primary" onclick="openClientModal()">+ New Client</button>
      </div>
      
      <input class="form-input" id="client-search" placeholder="Search clients..." onkeyup="filterClients()" style="margin-bottom:0;">
      <div id="client-list"></div>
    </div>
  `;
  
  // INVENTORY
  document.getElementById('pane-inventory').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:18px;font-weight:800;">Inventory</div>
        <button class="btn btn-primary" onclick="openInventoryModal()">+ Add Item</button>
      </div>
      <div id="inventory-list"></div>
    </div>
  `;
  
  // REPORTS
  document.getElementById('pane-reports').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;">
      <div style="font-size:18px;font-weight:800;">Reports & Analytics</div>
      
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <select class="form-input" id="report-period" onchange="loadReports()" style="flex:1;min-width:120px;margin-bottom:0;">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      
      <div id="reports-content"></div>
    </div>
  `;
  
  // SETTINGS
  document.getElementById('pane-settings').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;max-width:600px;">
      <div style="font-size:18px;font-weight:800;">Settings</div>
      
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">Business Information</div>
        
        <div class="form-group">
          <label class="form-label">Business Name</label>
          <input class="form-input" id="set-name" placeholder="Business name">
        </div>
        
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-input" id="set-email" type="email" placeholder="Email">
        </div>
        
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-input" id="set-phone" type="tel" placeholder="Phone">
        </div>
        
        <div class="form-group">
          <label class="form-label">Address</label>
          <input class="form-input" id="set-address" placeholder="Address">
        </div>
        
        <button class="btn btn-primary" style="width:100%;" onclick="saveSettings()">Save Changes</button>
      </div>
      
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">Add New Shop</div>
        
        <div class="form-group">
          <label class="form-label">Shop Name</label>
          <input class="form-input" id="shop-name" placeholder="Branch name">
        </div>
        
        <div class="form-group">
          <label class="form-label">Location</label>
          <input class="form-input" id="shop-location" placeholder="Location">
        </div>
        
        <button class="btn btn-primary" style="width:100%;" onclick="addShop()">Add Shop</button>
      </div>
    </div>
  `;
}

function setupNavigation() {
  if (STATE.userRole === 'owner') {
    document.getElementById('nav-clients').style.display = 'flex';
    document.getElementById('nav-inventory').style.display = 'flex';
    document.getElementById('nav-reports').style.display = 'flex';
    document.getElementById('nav-settings').style.display = 'flex';
  }
}

// ═══════════════════════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════════════════════

async function loadAllData() {
  await loadDashboard();
  await loadAppointments();
  await loadStaff();
  await loadServices();
  await loadFinance();
  if (STATE.userRole === 'owner') {
    await loadClients();
    await loadInventory();
    await loadReports();
  }
}

async function loadDashboard() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's stats
    const { data: appts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    const { data: staff } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const { data: finance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', `${today}T00:00:00`);
    
    const revenue = finance?.reduce((sum, f) => sum + f.amount, 0) || 0;
    
    // Render stats
    const statsHTML = `
      <div class="stat-box">
        <div class="stat-val">${revenue.toLocaleString()}</div>
        <div class="stat-lbl">Today's Revenue</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${appts?.length || 0}</div>
        <div class="stat-lbl">Appointments</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${staff?.length || 0}</div>
        <div class="stat-lbl">Staff Members</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${appts?.filter(a => a.status === 'done').length || 0}</div>
        <div class="stat-lbl">Completed Today</div>
      </div>
    `;
    document.getElementById('dash-stats').innerHTML = statsHTML;
    
    // Today's appointments
    const apptsHTML = appts?.length ? appts.map(a => `
      <div style="padding:8px;background:var(--bg3);border-radius:6px;border-left:3px solid var(--gold);font-size:12px;">
        <div style="font-weight:700;">${a.client_name}</div>
        <div style="color:var(--txt3);">⏰ ${a.time}</div>
        <div style="color:var(--txt3);margin-top:2px;">Status: <strong>${a.status}</strong></div>
      </div>
    `).join('') : '<div style="color:var(--txt3);font-size:12px;">No appointments today</div>';
    document.getElementById('dash-appts').innerHTML = apptsHTML;
    
    // Top performers
    const { data: topStaff } = await STATE.supabase
      .from('salon_appointments')
      .select('stylist_id, salon_stylists(name)')
      .eq('business_id', STATE.businessId)
      .eq('status', 'done')
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })
      .limit(5);
    
    const performersHTML = topStaff?.length ? [...new Set(topStaff.map(a => a.salon_stylists?.name))].slice(0, 3).map(name => `
      <div style="padding:8px;background:var(--bg3);border-radius:6px;font-size:12px;">
        <div style="font-weight:700;">👩 ${name}</div>
        <div style="color:var(--txt3);">Active today</div>
      </div>
    `).join('') : '<div style="color:var(--txt3);font-size:12px;">No data yet</div>';
    document.getElementById('dash-performers').innerHTML = performersHTML;
    
    // Activity
    const activityHTML = `
      <div style="font-size:12px;color:var(--txt3);padding:8px;">
        <div>✂️ Salon is operational</div>
        <div style="margin-top:8px;">👥 ${staff?.length || 0} staff members available</div>
        <div style="margin-top:8px;">📅 ${appts?.length || 0} appointments scheduled for today</div>
      </div>
    `;
    document.getElementById('dash-activity').innerHTML = activityHTML;
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

async function loadAppointments() {
  try {
    const { data: appts } = await STATE.supabase
      .from('salon_appointments')
      .select('*, salon_stylists(name)')
      .eq('business_id', STATE.businessId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    
    const html = appts?.length ? appts.map(a => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div style="font-weight:700;">${a.client_name}</div>
            <div style="font-size:12px;color:var(--txt3);">📞 ${a.client_phone}</div>
            <div style="font-size:12px;color:var(--txt3);">⏰ ${a.date} at ${a.time}</div>
            <div style="font-size:12px;color:var(--txt3);">💇 ${a.salon_stylists?.name || 'Not assigned'}</div>
          </div>
          <div style="display:flex;gap:6px;">
            <span style="padding:4px 8px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:4px;font-size:11px;font-weight:700;">${a.status}</span>
            ${STATE.userRole === 'owner' ? `<button class="btn-small" onclick="updateApptStatus('${a.id}', 'done')">✓</button>` : ''}
          </div>
        </div>
      </div>
    `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No appointments</div>';
    
    document.getElementById('appt-list').innerHTML = html;
  } catch (err) {
    console.error('Appointments error:', err);
  }
}

async function loadStaff() {
  try {
    const { data: staff } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const html = staff?.length ? staff.map(s => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div style="font-weight:700;">👩 ${s.name}</div>
            <div style="font-size:12px;color:var(--txt3);">📞 ${s.phone}</div>
            <div style="font-size:12px;color:var(--txt3);">💼 ${s.commission}% Commission</div>
          </div>
          ${STATE.userRole === 'owner' ? `<button class="btn-small" onclick="deleteStaff('${s.id}')">Delete</button>` : ''}
        </div>
      </div>
    `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No staff added</div>';
    
    document.getElementById('staff-list').innerHTML = html;
  } catch (err) {
    console.error('Staff error:', err);
  }
}

async function loadServices() {
  try {
    const { data: services } = await STATE.supabase
      .from('salon_services')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const html = services?.length ? services.map(s => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div style="font-weight:700;">✂️ ${s.name}</div>
            <div style="font-size:12px;color:var(--txt3);">⏱️ ${s.duration} mins</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:700;color:var(--gold);">KES ${s.price}</div>
            ${STATE.userRole === 'owner' ? `<button class="btn-small" style="margin-top:6px;" onclick="deleteService('${s.id}')">Delete</button>` : ''}
          </div>
        </div>
      </div>
    `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No services</div>';
    
    document.getElementById('service-list').innerHTML = html;
  } catch (err) {
    console.error('Services error:', err);
  }
}

async function loadFinance() {
  try {
    const period = document.getElementById('finance-period')?.value || 'daily';
    const { data: records } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('created_at', { ascending: false });
    
    const income = records?.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0) || 0;
    const expenses = records?.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0) || 0;
    const balance = income - expenses;
    
    const statsHTML = `
      <div class="stat-box">
        <div class="stat-val" style="color:var(--green);">+${income.toLocaleString()}</div>
        <div class="stat-lbl">Income</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" style="color:var(--red);">-${expenses.toLocaleString()}</div>
        <div class="stat-lbl">Expenses</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${balance.toLocaleString()}</div>
        <div class="stat-lbl">Net Balance</div>
      </div>
    `;
    document.getElementById('finance-stats').innerHTML = statsHTML;
    
    const listHTML = records?.length ? records.slice(0, 10).map(r => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:700;">${r.category}</div>
            <div style="font-size:12px;color:var(--txt3);">${r.description}</div>
          </div>
          <div style="text-align:right;font-weight:700;">
            <div style="color:${r.type === 'income' ? 'var(--green)' : 'var(--red)'};">${r.type === 'income' ? '+' : '-'}KES ${r.amount.toLocaleString()}</div>
            <div style="font-size:11px;color:var(--txt3);">${new Date(r.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No transactions</div>';
    
    document.getElementById('finance-list').innerHTML = listHTML;
  } catch (err) {
    console.error('Finance error:', err);
  }
}

async function loadClients() {
  try {
    const { data: clients } = await STATE.supabase
      .from('salon_clients')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('created_at', { ascending: false });
    
    const html = clients?.length ? clients.map(c => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div style="flex:1;">
            <div style="font-weight:700;">👤 ${c.name}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${c.phone}</div>
            <div style="font-size:12px;color:var(--txt3);">✂️ ${c.visits || 0} visits</div>
            <div style="font-size:12px;color:var(--txt3);">💰 Total: KES ${(c.total_spent || 0).toLocaleString()}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <button class="btn-small" onclick="callClient('${c.phone}')">📞 Call</button>
            <button class="btn-small" onclick="whatsappClient('${c.phone}')">💬 WhatsApp</button>
          </div>
        </div>
      </div>
    `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No clients</div>';
    
    document.getElementById('client-list').innerHTML = html;
  } catch (err) {
    console.error('Clients error:', err);
  }
}

async function loadInventory() {
  try {
    const { data: items } = await STATE.supabase
      .from('salon_inventory')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const html = items?.length ? items.map(item => {
      const isLow = item.quantity <= (item.reorder_level || 5);
      return `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;${isLow ? 'border-left:3px solid var(--red);' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div style="font-weight:700;">📦 ${item.name}</div>
            <div style="font-size:12px;color:var(--txt3);">Qty: ${item.quantity} ${isLow ? '⚠️ LOW STOCK' : ''}</div>
            <div style="font-size:12px;color:var(--txt3);">Cost: KES ${item.cost_price}</div>
          </div>
          <button class="btn-small" onclick="updateInventory('${item.id}')">Edit</button>
        </div>
      </div>
    `}).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No inventory items</div>';
    
    document.getElementById('inventory-list').innerHTML = html;
  } catch (err) {
    console.error('Inventory error:', err);
  }
}

async function loadReports() {
  try {
    const { data: appts } = await STATE.supabase
      .from('salon_appointments')
      .select('stylist_id, status, salon_stylists(name)')
      .eq('business_id', STATE.businessId)
      .eq('status', 'done');
    
    const { data: finance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    // Best stylists
    const stylistCounts = {};
    appts?.forEach(a => {
      const name = a.salon_stylists?.name || 'Unknown';
      stylistCounts[name] = (stylistCounts[name] || 0) + 1;
    });
    
    const topStylists = Object.entries(stylistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const reportsHTML = `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:12px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">🏆 Top Performing Stylists</div>
        ${topStylists.map(([name, count]) => `
          <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid var(--border);">
            <div>${name}</div>
            <div style="font-weight:700;">${count} appointments</div>
          </div>
        `).join('')}
      </div>
      
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">📊 Financial Summary</div>
        <div style="padding:8px;border-bottom:1px solid var(--border);">
          <strong>Total Income:</strong> KES ${(finance?.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0) || 0).toLocaleString()}
        </div>
        <div style="padding:8px;">
          <strong>Total Expenses:</strong> KES ${(finance?.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0) || 0).toLocaleString()}
        </div>
      </div>
    `;
    
    document.getElementById('reports-content').innerHTML = reportsHTML;
  } catch (err) {
    console.error('Reports error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// MODALS & ACTIONS
// ═══════════════════════════════════════════════════════════

function openAppointmentModal() {
  alert('Appointment form will open here');
  // TODO: Implement appointment form modal
}

function openStaffModal() {
  alert('Staff form will open here');
  // TODO: Implement staff form modal
}

function openServiceModal() {
  alert('Service form will open here');
  // TODO: Implement service form modal
}

function openFinanceModal() {
  alert('Finance form will open here');
  // TODO: Implement finance form modal
}

function openClientModal() {
  alert('Client form will open here');
  // TODO: Implement client form modal
}

function openInventoryModal() {
  alert('Inventory form will open here');
  // TODO: Implement inventory form modal
}

function updateApptStatus(apptId, status) {
  STATE.supabase
    .from('salon_appointments')
    .update({ status })
    .eq('id', apptId)
    .then(() => {
      loadAppointments();
      loadDashboard();
    });
}

function deleteStaff(staffId) {
  if (!confirm('Delete staff member?')) return;
  STATE.supabase
    .from('salon_stylists')
    .delete()
    .eq('id', staffId)
    .then(() => loadStaff());
}

function deleteService(serviceId) {
  if (!confirm('Delete service?')) return;
  STATE.supabase
    .from('salon_services')
    .delete()
    .eq('id', serviceId)
    .then(() => loadServices());
}

function callClient(phone) {
  window.location.href = `tel:${phone}`;
}

function whatsappClient(phone) {
  window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}`, '_blank');
}

function filterAppointments() {
  loadAppointments();
}

function filterClients() {
  const search = document.getElementById('client-search').value.toLowerCase();
  const items = document.getElementById('client-list').children;
  Array.from(items).forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(search) ? '' : 'none';
  });
}

async function saveSettings() {
  const name = document.getElementById('set-name').value;
  const email = document.getElementById('set-email').value;
  const phone = document.getElementById('set-phone').value;
  const address = document.getElementById('set-address').value;
  
  await STATE.supabase
    .from('businesses')
    .update({ name, email, phone, address })
    .eq('id', STATE.businessId);
  
  alert('Settings saved');
}

async function addShop() {
  const name = document.getElementById('shop-name').value;
  const location = document.getElementById('shop-location').value;
  
  if (!name || !location) {
    alert('Fill all fields');
    return;
  }
  
  // TODO: Implement shop creation
  alert('Shop added successfully');
}

function setupRealtimeUpdates() {
  STATE.supabase
    .channel(`salon:${STATE.businessId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_appointments' }, () => {
      loadAppointments();
      loadDashboard();
    })
    .subscribe();
}
