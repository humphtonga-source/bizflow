// ═══════════════════════════════════════════════════════════
// SALON MODULE
// ═══════════════════════════════════════════════════════════

async function MODULE_INIT() {
  // Build HTML
  buildSalonHTML();
  
  // Build nav
  buildNavMenu([
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'stylists', label: 'Stylists', icon: '👩' },
    { id: 'services', label: 'Services', icon: '✂️' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'inventory', label: 'Stock', icon: '📦' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]);
  
  // Load data
  await loadDashboard();
  await loadStylists();
  await loadServices();
  await loadClients();
  await renderAppointments();
  
  // Setup realtime
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
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Welcome back</h1>
        <p style="font-size:13px;color:var(--muted);">Here's your salon overview</p>
      </div>
      <div class="stat-grid" id="dash-stats"></div>
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:16px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">Today's Appointments</h3>
        <div id="dash-today-appts"></div>
      </div>
    </div>

    <!-- APPOINTMENTS -->
    <div class="section" id="sec-appointments">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Appointments</h1>
          <p style="font-size:13px;color:var(--muted);" id="appt-date-lbl"></p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddApptForm()">+ New</button>
      </div>
      
      <div id="add-appt-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Appointment</h3>
        <input class="input" id="a-client" placeholder="Client name">
        <input class="input" id="a-phone" type="tel" placeholder="Phone">
        <select class="input" id="a-service"></select>
        <select class="input" id="a-stylist"></select>
        <input class="input" id="a-date" type="date">
        <input class="input" id="a-time" type="time">
        <input class="input" id="a-notes" placeholder="Notes">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveAppointment()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddApptForm()">Cancel</button>
        </div>
      </div>
      
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <input class="input" id="appt-filter-date" type="date" style="flex:1;margin-bottom:0;" onchange="renderAppointments()">
        <select class="input" id="appt-filter-status" style="width:140px;margin-bottom:0;" onchange="renderAppointments()">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div id="appt-list"></div>
    </div>

    <!-- STYLISTS -->
    <div class="section" id="sec-stylists">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Stylists</h1>
          <p style="font-size:13px;color:var(--muted);">Manage your team</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddStylistForm()">+ Add</button>
      </div>
      
      <div id="add-stylist-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Stylist</h3>
        <input class="input" id="s-name" placeholder="Name">
        <input class="input" id="s-phone" type="tel" placeholder="Phone">
        <input class="input" id="s-commission" type="number" placeholder="Commission %">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveStylist()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddStylistForm()">Cancel</button>
        </div>
      </div>
      
      <div id="stylist-list"></div>
    </div>

    <!-- SERVICES -->
    <div class="section" id="sec-services">
      <div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Services</h1>
          <p style="font-size:13px;color:var(--muted);">Manage your offerings</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddServiceForm()">+ Add</button>
      </div>
      
      <div id="add-service-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Service</h3>
        <input class="input" id="svc-name" placeholder="Service name">
        <input class="input" id="svc-price" type="number" placeholder="Price" step="0.01">
        <input class="input" id="svc-duration" type="number" placeholder="Duration (mins)">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveService()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddServiceForm()">Cancel</button>
        </div>
      </div>
      
      <div id="service-list"></div>
    </div>

    <!-- CLIENTS -->
    <div class="section" id="sec-clients">
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Clients</h1>
        <p style="font-size:13px;color:var(--muted);">Manage your customer base</p>
      </div>
      
      <input class="input" id="client-search" placeholder="Search clients..." onkeyup="renderClients()">
      
      <div id="client-list"></div>
    </div>

    <!-- FINANCE -->
    <div class="section" id="sec-finance">
      <div style="margin-bottom:20px;">
        <h1 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">Finance</h1>
        <p style="font-size:13px;color:var(--muted);">Revenue and transactions</p>
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
          <p style="font-size:13px;color:var(--muted);">Manage inventory</p>
        </div>
        <button class="btn btn-gold" style="padding:10px 16px;" onclick="toggleAddItemForm()">+ Add</button>
      </div>
      
      <div id="add-item-form" style="display:none;background:var(--black2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">New Item</h3>
        <input class="input" id="inv-name" placeholder="Item name">
        <input class="input" id="inv-qty" type="number" placeholder="Quantity">
        <input class="input" id="inv-cost" type="number" placeholder="Cost price" step="0.01">
        <div style="display:flex;gap:8px;">
          <button class="btn btn-gold" style="flex:1;" onclick="saveInventoryItem()">Save</button>
          <button class="btn btn-cancel" style="flex:1;" onclick="toggleAddItemForm()">Cancel</button>
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
        <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;">Business Info</h3>
        <input class="input" id="set-name" placeholder="Business name">
        <input class="input" id="set-email" type="email" placeholder="Email">
        <input class="input" id="set-phone" type="tel" placeholder="Phone">
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
    // Get stats
    const { data: appts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const { data: clients } = await STATE.supabase
      .from('salon_clients')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const todayAppts = appts?.filter(a => {
      const apptDate = new Date(a.date).toDateString();
      const today = new Date().toDateString();
      return apptDate === today;
    }) || [];
    
    // Render stats
    const statsHtml = `
      <div class="stat-card">
        <div class="stat-label">Today's Revenue</div>
        <div class="stat-value" style="color:var(--green);">KES ${(todayAppts.length * 500).toLocaleString()}</div>
        <div class="stat-sub">${todayAppts.length} appointments</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Clients</div>
        <div class="stat-value">${clients?.length || 0}</div>
        <div class="stat-sub">Active customers</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Stylists</div>
        <div class="stat-value">${stylists?.length || 0}</div>
        <div class="stat-sub">Team members</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Rating</div>
        <div class="stat-value">4.8</div>
        <div class="stat-sub">From 120 reviews</div>
      </div>
    `;
    document.getElementById('dash-stats').innerHTML = statsHtml;
    
    // Render today's appointments
    const todayApptHtml = todayAppts.length ? todayAppts.map(a => `
      <div style="background:var(--black3);border-left:3px solid var(--gold);padding:12px;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;">
        <div>
          <div style="font-size:14px;font-weight:600;">${a.client_name}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">${new Date(a.date + ' ' + a.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <div style="font-size:12px;background:var(--goldl);color:var(--gold);padding:4px 8px;border-radius:6px;height:fit-content;">${a.status || 'pending'}</div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No appointments today</p>';
    
    document.getElementById('dash-today-appts').innerHTML = todayApptHtml;
    
    document.getElementById('appt-date-lbl').textContent = new Date().toLocaleDateString();
  } catch (err) {
    console.error('Dashboard error:', err);
    showToast('Failed to load dashboard', 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════
function toggleAddApptForm() {
  const form = document.getElementById('add-appt-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
  if (form.style.display === 'block') {
    document.getElementById('a-date').valueAsDate = new Date();
  }
}

async function saveAppointment() {
  const clientName = document.getElementById('a-client').value.trim();
  const phone = document.getElementById('a-phone').value.trim();
  const serviceId = document.getElementById('a-service').value;
  const stylistId = document.getElementById('a-stylist').value;
  const date = document.getElementById('a-date').value;
  const time = document.getElementById('a-time').value;
  const notes = document.getElementById('a-notes').value.trim();
  
  if (!clientName || !date || !time || !serviceId || !stylistId) {
    showToast('Please fill all required fields', 'error');
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
        date: date,
        time: time,
        notes: notes,
        status: 'pending',
        created_at: new Date()
      }]);
    
    if (error) throw error;
    showToast('Appointment created');
    toggleAddApptForm();
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
    
    const { data: appts, error } = await query.order('time', { ascending: true });
    
    if (error) throw error;
    
    const html = appts?.length ? appts.map(a => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:600;">${a.client_name}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">📅 ${a.date} at ${a.time}</div>
          <div style="font-size:12px;color:var(--muted);">📞 ${a.client_phone}</div>
        </div>
        <div style="text-align:right;">
          <div style="display:inline-block;background:${a.status === 'done' ? 'var(--greenl)' : a.status === 'cancelled' ? 'var(--redl)' : 'var(--goldl)'};color:${a.status === 'done' ? 'var(--green)' : a.status === 'cancelled' ? 'var(--red)' : 'var(--gold)'};padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;margin-bottom:8px;">${a.status}</div>
          <button class="btn btn-sm" style="width:100%;background:var(--black3);border:1px solid var(--border);color:var(--muted);padding:4px 8px;font-size:11px;margin-top:4px;" onclick="updateApptStatus('${a.id}', 'done')">Mark Done</button>
        </div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No appointments</p>';
    
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
    showToast('Appointment updated');
    await renderAppointments();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// STYLISTS
// ═══════════════════════════════════════════════════════════
function toggleAddStylistForm() {
  const form = document.getElementById('add-stylist-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function loadStylists() {
  try {
    const { data: stylists, error } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    if (error) throw error;
    
    const html = stylists?.length ? stylists.map(s => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:14px;font-weight:600;">${s.name}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">${s.phone}</div>
          <div style="font-size:12px;color:var(--gold);margin-top:2px;">${s.commission}% commission</div>
        </div>
        <button class="btn btn-red" style="padding:6px 12px;font-size:12px;" onclick="deleteStylist('${s.id}')">Remove</button>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No stylists added</p>';
    
    document.getElementById('stylist-list').innerHTML = html;
  } catch (err) {
    console.error('Load stylists error:', err);
  }
}

async function saveStylist() {
  const name = document.getElementById('s-name').value.trim();
  const phone = document.getElementById('s-phone').value.trim();
  const commission = parseFloat(document.getElementById('s-commission').value);
  
  if (!name || !phone || isNaN(commission)) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_stylists')
      .insert([{
        business_id: STATE.businessId,
        name,
        phone,
        commission,
        created_at: new Date()
      }]);
    
    if (error) throw error;
    showToast('Stylist added');
    toggleAddStylistForm();
    await loadStylists();
    document.getElementById('s-name').value = '';
    document.getElementById('s-phone').value = '';
    document.getElementById('s-commission').value = '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteStylist(stylistId) {
  if (!confirm('Remove this stylist?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_stylists')
      .delete()
      .eq('id', stylistId);
    
    if (error) throw error;
    showToast('Stylist removed');
    await loadStylists();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════
function toggleAddServiceForm() {
  const form = document.getElementById('add-service-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function loadServices() {
  try {
    const { data: services, error } = await STATE.supabase
      .from('salon_services')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    if (error) throw error;
    
    // Populate service dropdowns
    const opts = services?.map(s => `<option value="${s.id}">${s.name} (KES ${s.price})</option>`).join('') || '';
    document.getElementById('a-service').innerHTML = '<option value="">Select service</option>' + opts;
    
    // Render service list
    const html = services?.length ? services.map(s => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:14px;font-weight:600;">${s.name}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;">${s.duration} mins</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px;font-weight:700;color:var(--gold);">KES ${s.price}</div>
          <button class="btn btn-red" style="padding:6px 12px;font-size:12px;margin-top:8px;" onclick="deleteService('${s.id}')">Delete</button>
        </div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No services added</p>';
    
    document.getElementById('service-list').innerHTML = html;
  } catch (err) {
    console.error('Load services error:', err);
  }
}

async function saveService() {
  const name = document.getElementById('svc-name').value.trim();
  const price = parseFloat(document.getElementById('svc-price').value);
  const duration = parseInt(document.getElementById('svc-duration').value);
  
  if (!name || isNaN(price) || isNaN(duration)) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_services')
      .insert([{
        business_id: STATE.businessId,
        name,
        price,
        duration,
        created_at: new Date()
      }]);
    
    if (error) throw error;
    showToast('Service added');
    toggleAddServiceForm();
    await loadServices();
    document.getElementById('svc-name').value = '';
    document.getElementById('svc-price').value = '';
    document.getElementById('svc-duration').value = '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteService(serviceId) {
  if (!confirm('Delete this service?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_services')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
    showToast('Service deleted');
    await loadServices();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════
async function loadClients() {
  await renderClients();
}

async function renderClients() {
  try {
    const search = document.getElementById('client-search').value.toLowerCase();
    
    const { data: clients, error } = await STATE.supabase
      .from('salon_clients')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    if (error) throw error;
    
    const filtered = clients?.filter(c => 
      c.name.toLowerCase().includes(search) || 
      c.phone.includes(search)
    ) || [];
    
    const html = filtered.length ? filtered.map(c => `
      <div style="background:var(--black2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;">
        <div style="font-size:14px;font-weight:600;">${c.name}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;">📞 ${c.phone}</div>
        <div style="font-size:12px;color:var(--muted);">✂️ ${c.visits} visits</div>
      </div>
    `).join('') : '<p style="color:var(--muted);font-size:13px;">No clients found</p>';
    
    document.getElementById('client-list').innerHTML = html;
  } catch (err) {
    console.error('Render clients error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════
function toggleAddItemForm() {
  const form = document.getElementById('add-item-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveInventoryItem() {
  const name = document.getElementById('inv-name').value.trim();
  const qty = parseInt(document.getElementById('inv-qty').value);
  const cost = parseFloat(document.getElementById('inv-cost').value);
  
  if (!name || isNaN(qty) || isNaN(cost)) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_inventory')
      .insert([{
        business_id: STATE.businessId,
        name,
        quantity: qty,
        cost_price: cost,
        created_at: new Date()
      }]);
    
    if (error) throw error;
    showToast('Item added');
    toggleAddItemForm();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
async function saveSettings() {
  const name = document.getElementById('set-name').value.trim();
  const email = document.getElementById('set-email').value.trim();
  const phone = document.getElementById('set-phone').value.trim();
  
  try {
    const { error } = await STATE.supabase
      .from('businesses')
      .update({ name, email, phone })
      .eq('id', STATE.businessId);
    
    if (error) throw error;
    showToast('Settings saved');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// REALTIME SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════
function setupRealtimeSubscriptions() {
  // Listen to appointments changes
  STATE.supabase
    .channel(`salon_appointments:business_id=eq.${STATE.businessId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_appointments' }, () => {
      renderAppointments();
      loadDashboard();
    })
    .subscribe();
  
  // Listen to stylists changes
  STATE.supabase
    .channel(`salon_stylists:business_id=eq.${STATE.businessId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_stylists' }, () => {
      loadStylists();
      loadServices();
    })
    .subscribe();
}
