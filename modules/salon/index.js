// ═══════════════════════════════════════════════════════════════════════════
// BIZFLOW SALON - COMPLETE MODULE (CLEAN VERSION)
// SwiftStake Method: Single File, All Features
// ═══════════════════════════════════════════════════════════════════════════

// Import all modules in sequence
const SALON_MODULES = [
  'dashboard-complete-swiftstake.js',
  'appointments-complete-final.js',
  'staff.js',
  'services.js',
  'finance.js',
  'clients.js',
  'inventory.js',
  'reports.js',
  'settings.js'
];

async function MODULE_INIT() {
  console.log('Salon module loaded');
  await initializeDashboardData();
  await renderDashboard();
  await loadAppointments();
  await window.loadStaff();
  await window.loadServices();
  await window.loadFinance();
  await window.loadClients();
  await window.loadInventory();
  await window.loadReports();
  await window.loadSettings();
  await window.loadOtherPanes();
  setupRealtimeUpdates();
  console.log('Salon module ready');
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD (from dashboard-complete-swiftstake.js)
// ═══════════════════════════════════════════════════════════════════════════

async function MODULE_INIT() {
  console.log('Salon module loaded');
  await initializeDashboardData();
  await renderDashboard();
  await loadAppointments();
  await loadOtherPanes();
  setupRealtimeUpdates();
  console.log('Salon module ready');
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE DATA
// ═══════════════════════════════════════════════════════════════════════════

async function initializeDashboardData() {
  try {
    // Get all shops for this business owner
    const { data: shops } = await STATE.supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', STATE.user.id);
    
    DASHBOARD_STATE.allShops = shops || [];
    DASHBOARD_STATE.currentShop = STATE.businessId;
    
    // Get all stylists
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    DASHBOARD_STATE.allStylists = stylists || [];
  } catch (err) {
    console.error('Initialize dashboard error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER DASHBOARD (ADMIN vs EMPLOYEE)
// ═══════════════════════════════════════════════════════════════════════════

window.renderDashboard = async function() {
  const dashboard = document.getElementById('pane-dashboard');
  if (!dashboard) return;
  
  if (STATE.userRole === 'owner') {
    await renderAdminDashboard(dashboard);
  } else {
    await renderEmployeeDashboard(dashboard);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

async function renderAdminDashboard(container) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's data
    const { data: todayAppts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    const { data: todayCheckins } = await STATE.supabase
      .from('salon_checkins')
      .select('*,salon_stylists(name)')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    const { data: shopCheckins } = await STATE.supabase
      .from('salon_shop_checkins')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    const { data: todayFinance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);
    
    // Calculate stats
    const totalAppts = todayAppts?.length || 0;
    const completedAppts = todayAppts?.filter(a => a.status === 'done').length || 0;
    const totalRevenue = todayFinance?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const presentStaff = todayCheckins?.length || 0;
    const shopOpen = shopCheckins && shopCheckins.length > 0;
    
    container.innerHTML = `
      <div style="padding:20px;overflow-y:auto;flex:1;">
        <h2 style="font-size:20px;font-weight:800;margin-bottom:20px;">Admin Dashboard</h2>
        
        <!-- SHOP STATUS -->
        <div style="background:${shopOpen ? 'var(--green)' : 'var(--red)'};color:#fff;padding:16px;border-radius:8px;margin-bottom:16px;font-weight:700;">
          🏪 Shop is ${shopOpen ? 'OPEN' : 'CLOSED'} ${shopOpen ? `since ${shopCheckins[0].open_time.split('T')[1].slice(0,5)}` : ''}
          <button onclick="window.toggleShopStatus()" style="float:right;padding:8px 16px;background:#fff;color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">${shopOpen ? 'Close' : 'Open'}</button>
        </div>
        
        <!-- STATS GRID -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--gold);">KES ${totalRevenue.toLocaleString()}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Today Revenue</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--gold);">${totalAppts}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Appointments</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--gold);">${completedAppts}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Completed</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--gold);">${presentStaff}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Staff Present</div>
          </div>
        </div>
        
        <!-- TWO COLUMN LAYOUT -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
          <!-- STAFF CHECK-INS -->
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:12px;">👥 Staff Check-ins Today</div>
            ${todayCheckins && todayCheckins.length > 0 ? todayCheckins.map(c => `
              <div style="background:var(--bg3);padding:10px;border-radius:6px;margin-bottom:8px;border-left:3px solid var(--gold);">
                <div style="font-weight:700;font-size:12px;">${c.salon_stylists?.name || 'Unknown'}</div>
                <div style="font-size:11px;color:var(--txt3);margin-top:4px;">⏰ ${c.check_in_time.split('T')[1].slice(0,5)}</div>
              </div>
            `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No check-ins yet</div>'}
          </div>
          
          <!-- TODAY'S APPOINTMENTS -->
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:12px;">📅 Today's Appointments</div>
            ${todayAppts && todayAppts.length > 0 ? todayAppts.map(a => `
              <div style="background:var(--bg3);padding:10px;border-radius:6px;margin-bottom:8px;border-left:3px solid var(--gold);">
                <div style="font-weight:700;font-size:12px;">${a.client_name}</div>
                <div style="font-size:11px;color:var(--txt3);margin-top:2px;">⏰ ${a.time}</div>
                <span style="display:inline-block;padding:2px 6px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;margin-top:4px;">${a.status}</span>
              </div>
            `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No appointments</div>'}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Admin dashboard error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

async function renderEmployeeDashboard(container) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get employee data (assume stylist_id is stored in user_profiles or we get it from stylists)
    const { data: stylistData } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('user_id', STATE.user.id)
      .eq('business_id', STATE.businessId)
      .single();
    
    if (!stylistData) {
      container.innerHTML = '<div style="padding:20px;color:var(--red);">Error: Stylist profile not found</div>';
      return;
    }
    
    const stylistId = stylistData.id;
    
    // Get today's check-in
    const { data: todayCheckin } = await STATE.supabase
      .from('salon_checkins')
      .select('*')
      .eq('stylist_id', stylistId)
      .eq('date', today)
      .single();
    
    // Get agreement
    const { data: agreement } = await STATE.supabase
      .from('salon_agreements')
      .select('*')
      .eq('stylist_id', stylistId)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();
    
    // Get today's revenue (from finance table where stylist_id or notes mention them)
    const { data: todayFinance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);
    
    const todayRevenue = todayFinance?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    
    // Get this week's revenue (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: weekFinance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', `${weekAgo}T00:00:00`);
    
    const weekRevenue = weekFinance?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    
    // Get this month's revenue
    const monthAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const { data: monthFinance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', `${monthAgo}T00:00:00`);
    
    const monthRevenue = monthFinance?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    
    // Get today's appointments for this stylist
    const { data: todayAppts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    const agreementTypeText = agreement ? `${agreement.agreement_type}${agreement.commission_percent ? ` (${agreement.commission_percent}%)` : ''}${agreement.monthly_salary ? ` (KES ${agreement.monthly_salary})` : ''}` : 'Not set';
    
    container.innerHTML = `
      <div style="padding:20px;overflow-y:auto;flex:1;">
        <h2 style="font-size:20px;font-weight:800;margin-bottom:20px;">My Dashboard</h2>
        
        <!-- CHECK-IN SECTION -->
        <div style="background:${todayCheckin ? 'var(--green)' : 'var(--border)'};color:${todayCheckin ? '#fff' : 'var(--txt3)'};padding:16px;border-radius:8px;margin-bottom:16px;font-weight:700;display:flex;justify-content:space-between;align-items:center;">
          <div>
            ${todayCheckin ? `✅ You checked in at ${todayCheckin.check_in_time.split('T')[1].slice(0,5)}` : '⏳ Not checked in yet'}
          </div>
          <button onclick="window.handleCheckIn()" style="padding:8px 16px;background:#fff;color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">${todayCheckin ? 'Check Out' : 'Check In'}</button>
        </div>
        
        <!-- AGREEMENT INFO -->
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:8px;">💼 Employment Agreement</div>
          <div style="background:var(--bg3);padding:12px;border-radius:6px;color:var(--txt3);">
            ${agreementTypeText}
          </div>
        </div>
        
        <!-- REVENUE STATS -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:20px;font-weight:800;color:var(--gold);">KES ${todayRevenue.toLocaleString()}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Today</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:20px;font-weight:800;color:var(--gold);">KES ${(weekRevenue).toLocaleString()}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">This Week</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:20px;font-weight:800;color:var(--gold);">KES ${(monthRevenue).toLocaleString()}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">This Month</div>
          </div>
        </div>
        
        <!-- TODAY'S APPOINTMENTS -->
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:12px;">📅 My Appointments Today</div>
          ${todayAppts && todayAppts.length > 0 ? todayAppts.map(a => `
            <div style="background:var(--bg3);padding:10px;border-radius:6px;margin-bottom:8px;border-left:3px solid var(--gold);">
              <div style="font-weight:700;font-size:12px;">${a.client_name}</div>
              <div style="font-size:11px;color:var(--txt3);margin-top:2px;">📞 ${a.client_phone || 'N/A'}</div>
              <div style="font-size:11px;color:var(--txt3);margin-top:2px;">⏰ ${a.time}</div>
              <span style="display:inline-block;padding:2px 6px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;margin-top:4px;">${a.status}</span>
            </div>
          `).join('') : '<div style="color:var(--txt3);text-align:center;padding:20px;">No appointments today</div>'}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Employee dashboard error:', err);
    container.innerHTML = `<div style="padding:20px;color:var(--red);">Error loading dashboard: ${err.message}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

window.toggleShopStatus = async function() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: shopCheckins } = await STATE.supabase
      .from('salon_shop_checkins')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    if (shopCheckins && shopCheckins.length > 0 && !shopCheckins[0].close_time) {
      // Close the shop
      await STATE.supabase
        .from('salon_shop_checkins')
        .update({ close_time: new Date() })
        .eq('id', shopCheckins[0].id);
    } else {
      // Open the shop
      await STATE.supabase
        .from('salon_shop_checkins')
        .insert([{
          business_id: STATE.businessId,
          open_time: new Date(),
          date: today
        }]);
    }
    
    await window.renderDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.handleCheckIn = async function() {
  try {
    const { data: stylist } = await STATE.supabase
      .from('salon_stylists')
      .select('id')
      .eq('user_id', STATE.user.id)
      .eq('business_id', STATE.businessId)
      .single();
    
    if (!stylist) {
      alert('Stylist profile not found');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const { data: checkin } = await STATE.supabase
      .from('salon_checkins')
      .select('*')
      .eq('stylist_id', stylist.id)
      .eq('date', today)
      .single();
    
    if (checkin && !checkin.check_out_time) {
      // Check out
      await STATE.supabase
        .from('salon_checkins')
        .update({ check_out_time: new Date() })
        .eq('id', checkin.id);
    } else {
      // Check in
      await STATE.supabase
        .from('salon_checkins')
        .insert([{
          business_id: STATE.businessId,
          stylist_id: stylist.id,
          check_in_time: new Date(),
          date: today
        }]);
    }
    
    await window.renderDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// APPOINTMENTS (from before)
// ═══════════════════════════════════════════════════════════════════════════

window.loadAppointments = async function() {
  const appts = document.getElementById('pane-appointments');
  if (!appts) return;
  appts.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;">
      <h2 style="font-size:20px;font-weight:800;margin-bottom:20px;">Appointments</h2>
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;color:var(--txt3);">
        Coming soon...
      </div>
    </div>
  `;
};

// ═══════════════════════════════════════════════════════════════════════════
// OTHER PANES
// ═══════════════════════════════════════════════════════════════════════════

window.loadOtherPanes = async function() {
  const panes = {
    'pane-staff': '👥 Staff',
    'pane-services': '✂️ Services',
    'pane-finance': '💰 Finance',
    'pane-clients': '👤 Clients',
    'pane-inventory': '📦 Inventory',
    'pane-reports': '📊 Reports',
    'pane-settings': '⚙️ Settings'
  };
  Object.entries(panes).forEach(([id, title]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="padding:20px;"><h2>${title}</h2><div style="color:var(--txt3);">Coming soon...</div></div>`;
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// REAL-TIME UPDATES
// ═══════════════════════════════════════════════════════════════════════════

function setupRealtimeUpdates() {
  STATE.supabase
    .channel(`salon:${STATE.businessId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_checkins' }, () => {
      window.renderDashboard();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_shop_checkins' }, () => {
      window.renderDashboard();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_appointments' }, () => {
      window.renderDashboard();
    })
    .subscribe();
}
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════

async function loadAdminAppointments(container) {
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">Appointments</h2>
        <button onclick="window.openAddApptModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ New</button>
      </div>
      
      <!-- FILTERS -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input type="date" id="appt-filter-date" onchange="window.filterAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;">
        <select id="appt-filter-status" onchange="window.filterAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="ongoing">Ongoing</option>
          <option value="done">Done</option>
        </select>
      </div>
      
      <!-- ADD MODAL -->
      <div id="appt-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-weight:700;margin-bottom:12px;">New Appointment</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input id="appt-client-name" placeholder="Client name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="appt-client-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="appt-date" type="date" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="appt-time" type="time" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <select id="appt-stylist" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <option value="">Select Stylist</option>
          </select>
          <input id="appt-style" placeholder="Style/Service" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="appt-notes" placeholder="Notes" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="window.saveAppointment()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
          <button onclick="window.closeAddApptModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
        </div>
      </div>
      
      <!-- APPOINTMENTS LIST -->
      <div id="appt-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div>
    </div>
  `;
  
  // Load stylists for dropdown
  const { data: stylists } = await STATE.supabase
    .from('salon_stylists')
    .select('id,name')
    .eq('business_id', STATE.businessId);
  
  if (stylists) {
    const select = document.getElementById('appt-stylist');
    stylists.forEach(s => {
      const option = document.createElement('option');
      option.value = s.id;
      option.text = s.name;
      select.appendChild(option);
    });
  }
  
  await window.renderAdminAppointments();
}

window.renderAdminAppointments = async function() {
  try {
    const filterDate = document.getElementById('appt-filter-date')?.value || '';
    const filterStatus = document.getElementById('appt-filter-status')?.value || '';
    
    let query = STATE.supabase
      .from('salon_appointments')
      .select('*,salon_stylists(name)')
      .eq('business_id', STATE.businessId);
    
    if (filterDate) query = query.eq('date', filterDate);
    if (filterStatus) query = query.eq('status', filterStatus);
    
    const { data: appointments } = await query.order('date', { ascending: false }).order('time', { ascending: false });
    
    const list = document.getElementById('appt-list');
    if (!list) return;
    
    if (!appointments || appointments.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No appointments found</div>';
      return;
    }
    
    const html = appointments.map(a => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;">${a.client_name}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${a.client_phone || 'N/A'}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:2px;">📅 ${a.date} at ${a.time}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:2px;">✂️ ${a.salon_stylists?.name || 'Unassigned'}</div>
            ${a.style ? `<div style="font-size:12px;color:var(--txt3);margin-top:2px;">💅 ${a.style}</div>` : ''}
            ${a.notes ? `<div style="font-size:12px;color:var(--txt3);margin-top:2px;">📝 ${a.notes}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
            <span style="padding:4px 10px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:4px;font-size:11px;font-weight:700;">${a.status}</span>
            <select onchange="window.updateApptStatus && window.updateApptStatus('${a.id}', this.value)" style="padding:4px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--txt);font-size:11px;">
              <option value="">Status</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="done">Done</option>
            </select>
            <button onclick="window.editAppointment && window.editAppointment('${a.id}')" style="padding:4px 8px;background:var(--gold);color:#000;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Edit</button>
            <button onclick="window.deleteAppointment && window.deleteAppointment('${a.id}')" style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
    
    list.innerHTML = html;
  } catch (err) {
    console.error('Render error:', err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEE APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════

async function loadEmployeeAppointments(container) {
  try {
    const { data: stylist } = await STATE.supabase
      .from('salon_stylists')
      .select('id')
      .eq('user_id', STATE.user.id)
      .eq('business_id', STATE.businessId)
      .single();
    
    if (!stylist) {
      container.innerHTML = '<div style="padding:20px;color:var(--red);">Error: Stylist profile not found</div>';
      return;
    }
    
    window.CURRENT_STYLIST_ID = stylist.id;
    
    container.innerHTML = `
      <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h2 style="font-size:20px;font-weight:800;margin:0;">My Appointments</h2>
          <button onclick="window.openAddEmployeeApptModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ New</button>
        </div>
        
        <!-- FILTERS -->
        <div style="display:flex;gap:8px;">
          <input type="date" id="emp-appt-filter-date" onchange="window.renderEmployeeAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;">
          <select id="emp-appt-filter-status" onchange="window.renderEmployeeAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <!-- ADD MODAL -->
        <div id="emp-appt-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
          <div style="font-weight:700;margin-bottom:12px;">New Appointment</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <input id="emp-appt-client-name" placeholder="Client name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="emp-appt-client-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="emp-appt-date" type="date" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="emp-appt-time" type="time" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="emp-appt-style" placeholder="Style/Service" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button onclick="window.saveEmployeeAppointment()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
            <button onclick="window.closeAddEmployeeApptModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
          </div>
        </div>
        
        <!-- PENDING APPOINTMENTS (with availability toggle) -->
        <div id="pending-appts" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:12px;">⏳ Pending Appointments</div>
          <div id="pending-list" style="display:flex;flex-direction:column;gap:8px;"></div>
        </div>
        
        <!-- ALL APPOINTMENTS -->
        <div id="appt-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div>
      </div>
    `;
    
    await window.renderEmployeeAppointments();
  } catch (err) {
    console.error('Load employee appointments error:', err);
    container.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
  }
}

window.renderEmployeeAppointments = async function() {
  try {
    const filterDate = document.getElementById('emp-appt-filter-date')?.value || '';
    const filterStatus = document.getElementById('emp-appt-filter-status')?.value || '';
    
    let query = STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    if (filterDate) query = query.eq('date', filterDate);
    if (filterStatus) query = query.eq('status', filterStatus);
    
    const { data: appointments } = await query.order('date', { ascending: false });
    
    // Get pending appointments
    const { data: pendingAppts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('status', 'pending');
    
    // Render pending with availability toggle
    const pendingList = document.getElementById('pending-list');
    if (pendingAppts && pendingAppts.length > 0) {
      pendingList.innerHTML = pendingAppts.map(a => `
        <div style="background:var(--bg3);padding:10px;border-radius:6px;border-left:3px solid var(--red);">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-weight:700;font-size:12px;">${a.client_name}</div>
              <div style="font-size:11px;color:var(--txt3);margin-top:2px;">📅 ${a.date} at ${a.time}</div>
            </div>
            <button onclick="window.markAvailable && window.markAvailable('${a.id}')" style="padding:4px 8px;background:var(--green);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">I'm Available</button>
          </div>
        </div>
      `).join('');
    } else {
      pendingList.innerHTML = '<div style="color:var(--txt3);font-size:12px;text-align:center;padding:12px;">No pending appointments</div>';
    }
    
    // Render all appointments (read-only for employees)
    const list = document.getElementById('appt-list');
    if (!list) return;
    
    if (!appointments || appointments.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No appointments</div>';
      return;
    }
    
    const html = appointments.map(a => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div style="flex:1;">
            <div style="font-weight:700;font-size:12px;">${a.client_name}</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:2px;">📞 ${a.client_phone || 'N/A'}</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:2px;">⏰ ${a.date} at ${a.time}</div>
            ${a.style ? `<div style="font-size:11px;color:var(--txt3);margin-top:2px;">💅 ${a.style}</div>` : ''}
          </div>
          <span style="padding:4px 10px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:4px;font-size:10px;font-weight:700;">${a.status}</span>
        </div>
      </div>
    `).join('');
    
    list.innerHTML = html;
  } catch (err) {
    console.error('Render employee appointments error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

window.openAddApptModal = function() {
  const modal = document.getElementById('appt-modal');
  if (modal) {
    modal.style.display = 'block';
    const dateInput = document.getElementById('appt-date');
    if (dateInput) dateInput.valueAsDate = new Date();
  }
};

window.closeAddApptModal = function() {
  const modal = document.getElementById('appt-modal');
  if (modal) modal.style.display = 'none';
};

window.openAddEmployeeApptModal = function() {
  const modal = document.getElementById('emp-appt-modal');
  if (modal) {
    modal.style.display = 'block';
    const dateInput = document.getElementById('emp-appt-date');
    if (dateInput) dateInput.valueAsDate = new Date();
  }
};

window.closeAddEmployeeApptModal = function() {
  const modal = document.getElementById('emp-appt-modal');
  if (modal) modal.style.display = 'none';
};

window.saveAppointment = async function() {
  const name = document.getElementById('appt-client-name')?.value.trim();
  const phone = document.getElementById('appt-client-phone')?.value.trim();
  const date = document.getElementById('appt-date')?.value;
  const time = document.getElementById('appt-time')?.value;
  const stylistId = document.getElementById('appt-stylist')?.value;
  const style = document.getElementById('appt-style')?.value.trim();
  const notes = document.getElementById('appt-notes')?.value.trim();
  
  if (!name || !date || !time) {
    alert('Fill required fields');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .insert([{
        business_id: STATE.businessId,
        stylist_id: stylistId || null,
        client_name: name,
        client_phone: phone || '',
        date,
        time,
        style: style || '',
        notes: notes || '',
        status: 'pending'
      }]);
    
    if (error) throw error;
    
    window.closeAddApptModal();
    document.getElementById('appt-client-name').value = '';
    document.getElementById('appt-client-phone').value = '';
    document.getElementById('appt-style').value = '';
    document.getElementById('appt-notes').value = '';
    document.getElementById('appt-stylist').value = '';
    
    await window.renderAdminAppointments();
    await window.renderDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.saveEmployeeAppointment = async function() {
  const name = document.getElementById('emp-appt-client-name')?.value.trim();
  const phone = document.getElementById('emp-appt-client-phone')?.value.trim();
  const date = document.getElementById('emp-appt-date')?.value;
  const time = document.getElementById('emp-appt-time')?.value;
  const style = document.getElementById('emp-appt-style')?.value.trim();
  
  if (!name || !date || !time) {
    alert('Fill required fields');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .insert([{
        business_id: STATE.businessId,
        stylist_id: window.CURRENT_STYLIST_ID,
        client_name: name,
        client_phone: phone || '',
        date,
        time,
        style: style || '',
        status: 'pending'
      }]);
    
    if (error) throw error;
    
    window.closeAddEmployeeApptModal();
    document.getElementById('emp-appt-client-name').value = '';
    document.getElementById('emp-appt-client-phone').value = '';
    document.getElementById('emp-appt-style').value = '';
    
    await window.renderEmployeeAppointments();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.updateApptStatus = async function(apptId, status) {
  if (!status) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .update({ status })
      .eq('id', apptId);
    
    if (error) throw error;
    await window.renderAdminAppointments();
    await window.renderDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.deleteAppointment = async function(apptId) {
  if (!confirm('Delete this appointment?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .delete()
      .eq('id', apptId);
    
    if (error) throw error;
    await window.renderAdminAppointments();
    await window.renderDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.markAvailable = async function(apptId) {
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .update({ status: 'ongoing' })
      .eq('id', apptId);
    
    if (error) throw error;
    await window.renderEmployeeAppointments();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.filterAppointments = function() {
  window.renderAdminAppointments();
};
    staff.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
  }
};

async function renderStaffPage(container) {
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">Staff Management</h2>
        <button onclick="window.openAddStaffModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ Add Staff</button>
      </div>
      
      <!-- ADD STAFF MODAL -->
      <div id="staff-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-weight:700;margin-bottom:12px;">Add New Staff Member</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input id="staff-name" placeholder="Full name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="staff-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="staff-email" placeholder="Email" type="email" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <select id="staff-agreement" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <option value="">Select Agreement Type</option>
            <option value="commission">Commission Based</option>
            <option value="monthly">Monthly Salary</option>
            <option value="commission+monthly">Commission + Monthly</option>
          </select>
          <input id="staff-commission" placeholder="Commission % (if applicable)" type="number" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="staff-salary" placeholder="Monthly salary (if applicable)" type="number" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <select id="staff-role" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <option value="stylist">Stylist</option>
            <option value="manager">Manager</option>
            <option value="receptionist">Receptionist</option>
            <option value="assistant">Assistant</option>
          </select>
          <div style="display:flex;gap:6px;align-items:center;">
            <input id="staff-can-manage-appts" type="checkbox" style="width:18px;height:18px;cursor:pointer;">
            <label style="font-size:12px;color:var(--txt3);">Can manage appointments</label>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <input id="staff-can-manage-finance" type="checkbox" style="width:18px;height:18px;cursor:pointer;">
            <label style="font-size:12px;color:var(--txt3);">Can manage finance</label>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <input id="staff-can-manage-staff" type="checkbox" style="width:18px;height:18px;cursor:pointer;">
            <label style="font-size:12px;color:var(--txt3);">Can manage staff</label>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="window.saveStaff()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
          <button onclick="window.closeAddStaffModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
        </div>
      </div>
      
      <!-- STAFF LIST BY SHOP -->
      <div id="staff-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;"></div>
    </div>
  `;
  
  await window.renderStaffList();
}

window.renderStaffList = async function() {
  try {
    // Get all stylists with their agreements
    const { data: stylists, error: stylistsError } = await STATE.supabase
      .from('salon_stylists')
      .select('id,name,phone,role')
      .eq('business_id', STATE.businessId);
    
    if (stylistsError) throw stylistsError;
    
    if (!stylists || stylists.length === 0) {
      document.getElementById('staff-list').innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No staff members yet</div>';
      return;
    }
    
    // Get agreements for all stylists
    const { data: agreements } = await STATE.supabase
      .from('salon_agreements')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const agreementMap = {};
    if (agreements) {
      agreements.forEach(a => {
        agreementMap[a.stylist_id] = a;
      });
    }
    
    // Build HTML - permissions will default to empty if column doesn't exist
    const staffHtml = stylists.map(s => {
      const agreement = agreementMap[s.id];
      const agreementText = agreement ? 
        `${agreement.agreement_type}${agreement.commission_percent ? ` (${agreement.commission_percent}%)` : ''}${agreement.monthly_salary ? ` (KES ${agreement.monthly_salary})` : ''}` 
        : 'No agreement';
      
      // Safely handle permissions if column exists
      const permissions = s.permissions ? JSON.parse(s.permissions) : {};
      
      return `
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:13px;">${s.name}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${s.phone || 'N/A'}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:2px;">✂️ ${s.role || 'Stylist'}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:2px;">💼 ${agreementText}</div>
              
              <!-- PERMISSIONS -->
              ${Object.keys(permissions).length > 0 ? `
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
                <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;">Permissions:</div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                  <span style="padding:2px 6px;background:${permissions.can_manage_appts ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;">📅 Appointments</span>
                  <span style="padding:2px 6px;background:${permissions.can_manage_finance ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;">💰 Finance</span>
                  <span style="padding:2px 6px;background:${permissions.can_manage_staff ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;">👥 Staff</span>
                </div>
              </div>
              ` : ''}
            </div>
            
            <div style="display:flex;flex-direction:column;gap:6px;">
              <button onclick="window.editStaff && window.editStaff('${s.id}')" style="padding:4px 8px;background:var(--gold);color:#000;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Edit</button>
              <button onclick="window.deleteStaff && window.deleteStaff('${s.id}')" style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('staff-list').innerHTML = staffHtml;
  } catch (err) {
    console.error('Render staff error:', err);
  }
};

window.openAddStaffModal = function() {
  const modal = document.getElementById('staff-modal');
  if (modal) modal.style.display = 'block';
};

window.closeAddStaffModal = function() {
  const modal = document.getElementById('staff-modal');
  if (modal) modal.style.display = 'none';
};

window.saveStaff = async function() {
  const name = document.getElementById('staff-name')?.value.trim();
  const phone = document.getElementById('staff-phone')?.value.trim();
  const email = document.getElementById('staff-email')?.value.trim();
  const agreement = document.getElementById('staff-agreement')?.value;
  const commission = parseFloat(document.getElementById('staff-commission')?.value) || null;
  const salary = parseFloat(document.getElementById('staff-salary')?.value) || null;
  const role = document.getElementById('staff-role')?.value;
  const canManageAppts = document.getElementById('staff-can-manage-appts')?.checked || false;
  const canManageFinance = document.getElementById('staff-can-manage-finance')?.checked || false;
  const canManageStaff = document.getElementById('staff-can-manage-staff')?.checked || false;
  
  if (!name || !agreement) {
    alert('Fill required fields');
    return;
  }
  
  try {
    // Insert stylist
    const { data: insertedStylist, error: stylistError } = await STATE.supabase
      .from('salon_stylists')
      .insert([{
        business_id: STATE.businessId,
        name,
        phone: phone || '',
        role: role || 'stylist',
        permissions: JSON.stringify({
          can_manage_appts: canManageAppts,
          can_manage_finance: canManageFinance,
          can_manage_staff: canManageStaff
        })
      }])
      .select();
    
    if (stylistError) throw stylistError;
    
    const stylistId = insertedStylist[0].id;
    
    // Insert agreement
    const { error: agreementError } = await STATE.supabase
      .from('salon_agreements')
      .insert([{
        stylist_id: stylistId,
        business_id: STATE.businessId,
        agreement_type: agreement,
        commission_percent: commission,
        monthly_salary: salary
      }]);
    
    if (agreementError) throw agreementError;
    
    // Clear form
    window.closeAddStaffModal();
    document.getElementById('staff-name').value = '';
    document.getElementById('staff-phone').value = '';
    document.getElementById('staff-email').value = '';
    document.getElementById('staff-agreement').value = '';
    document.getElementById('staff-commission').value = '';
    document.getElementById('staff-salary').value = '';
    document.getElementById('staff-role').value = 'stylist';
    document.getElementById('staff-can-manage-appts').checked = false;
    document.getElementById('staff-can-manage-finance').checked = false;
    document.getElementById('staff-can-manage-staff').checked = false;
    
    await window.renderStaffList();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.deleteStaff = async function(stylistId) {
  if (!confirm('Delete this staff member?')) return;
  
  try {
    // Delete agreement first
    await STATE.supabase
      .from('salon_agreements')
      .delete()
      .eq('stylist_id', stylistId);
    
    // Delete stylist
    const { error } = await STATE.supabase
      .from('salon_stylists')
      .delete()
      .eq('id', stylistId);
    
    if (error) throw error;
    
    await window.renderStaffList();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.editStaff = async function(stylistId) {
  alert('Edit feature coming soon! For now, delete and re-add.');
};
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">Services</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${STATE.userRole === 'owner' ? '<button onclick="window.openAddServiceModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ Add Service</button>' : ''}
          <button onclick="window.downloadServices()" style="padding:10px 16px;background:var(--blue);color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;">⬇️ Download</button>
          <button onclick="window.printServices()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">🖨️ Print</button>
        </div>
      </div>
      
      <!-- ADD SERVICE MODAL (ADMIN ONLY) -->
      ${STATE.userRole === 'owner' ? `
        <div id="service-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:700;margin-bottom:12px;">Add New Service</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <input id="service-name" placeholder="Service/Style name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="service-price" placeholder="Price (KES)" type="number" step="100" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="service-duration" placeholder="Duration (minutes)" type="number" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="service-description" placeholder="Description" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button onclick="window.saveService()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
            <button onclick="window.closeAddServiceModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
          </div>
        </div>
      ` : ''}
      
      <!-- SERVICES TABLE -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow-x:auto;">
        <table id="services-table" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg3);border-bottom:2px solid var(--border);">
              <th style="padding:12px;text-align:left;font-weight:700;border-right:1px solid var(--border);">Service</th>
              <th style="padding:12px;text-align:center;font-weight:700;border-right:1px solid var(--border);">Price (KES)</th>
              <th style="padding:12px;text-align:center;font-weight:700;border-right:1px solid var(--border);">Duration</th>
              <th style="padding:12px;text-align:left;font-weight:700;">Description</th>
              ${STATE.userRole === 'owner' ? '<th style="padding:12px;text-align:center;font-weight:700;">Actions</th>' : ''}
            </tr>
          </thead>
          <tbody id="services-tbody">
            <tr><td colspan="5" style="padding:40px;text-align:center;color:var(--txt3);">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  await window.renderServices();
}

window.renderServices = async function() {
  try {
    const { data: services } = await STATE.supabase
      .from('salon_services')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('name', { ascending: true });
    
    const tbody = document.getElementById('services-tbody');
    if (!tbody) return;
    
    if (!services || services.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--txt3);">No services yet</td></tr>';
      return;
    }
    
    const html = services.map(s => `
      <tr style="border-bottom:1px solid var(--border);">
        <td style="padding:12px;border-right:1px solid var(--border);font-weight:700;">${s.name}</td>
        <td style="padding:12px;border-right:1px solid var(--border);text-align:center;color:var(--gold);font-weight:700;">KES ${s.price.toLocaleString()}</td>
        <td style="padding:12px;border-right:1px solid var(--border);text-align:center;color:var(--txt3);">${s.duration || '-'} min</td>
        <td style="padding:12px;color:var(--txt3);font-size:12px;">${s.description || '-'}</td>
        ${STATE.userRole === 'owner' ? `
          <td style="padding:12px;text-align:center;display:flex;gap:6px;justify-content:center;">
            <button onclick="window.editService && window.editService('${s.id}')" style="padding:4px 8px;background:var(--gold);color:#000;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Edit</button>
            <button onclick="window.deleteService && window.deleteService('${s.id}')" style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
          </td>
        ` : ''}
      </tr>
    `).join('');
    
    tbody.innerHTML = html;
  } catch (err) {
    console.error('Render services error:', err);
    document.getElementById('services-tbody').innerHTML = `<tr><td colspan="5" style="padding:20px;color:var(--red);">Error: ${err.message}</td></tr>`;
  }
};

window.openAddServiceModal = function() {
  const modal = document.getElementById('service-modal');
  if (modal) modal.style.display = 'block';
};

window.closeAddServiceModal = function() {
  const modal = document.getElementById('service-modal');
  if (modal) modal.style.display = 'none';
};

window.saveService = async function() {
  const name = document.getElementById('service-name')?.value.trim();
  const price = parseFloat(document.getElementById('service-price')?.value);
  const duration = parseInt(document.getElementById('service-duration')?.value) || null;
  const description = document.getElementById('service-description')?.value.trim();
  
  if (!name || !price) {
    alert('Fill required fields');
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
        description: description || ''
      }]);
    
    if (error) throw error;
    
    window.closeAddServiceModal();
    document.getElementById('service-name').value = '';
    document.getElementById('service-price').value = '';
    document.getElementById('service-duration').value = '';
    document.getElementById('service-description').value = '';
    
    await window.renderServices();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.deleteService = async function(serviceId) {
  if (!confirm('Delete this service?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_services')
      .delete()
      .eq('id', serviceId);
    
    if (error) throw error;
    await window.renderServices();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.editService = function(serviceId) {
  alert('Edit feature coming soon!');
};

// ═══════════════════════════════════════════════════════════════════════════
// DOWNLOAD & PRINT
// ═══════════════════════════════════════════════════════════════════════════

window.downloadServices = async function() {
  try {
    const { data: services } = await STATE.supabase
      .from('salon_services')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('name', { ascending: true });
    
    if (!services || services.length === 0) {
      alert('No services to download');
      return;
    }
    
    // Create CSV
    const headers = ['Service', 'Price (KES)', 'Duration (min)', 'Description'];
    const rows = services.map(s => [
      s.name,
      s.price,
      s.duration || '-',
      s.description || '-'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `salon-services-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.printServices = async function() {
  try {
    const { data: services } = await STATE.supabase
      .from('salon_services')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('name', { ascending: true });
    
    if (!services || services.length === 0) {
      alert('No services to print');
      return;
    }
    
    // Create print-friendly HTML
    const html = `
      <html>
        <head>
          <title>Salon Services</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .price { text-align: right; font-weight: bold; color: #D4AF37; }
            .duration { text-align: center; }
          </style>
        </head>
        <body>
          <h1>💅 Salon Services Price List</h1>
          <p style="text-align: center; color: #666;">Printed on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th class="price">Price (KES)</th>
                <th class="duration">Duration</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${services.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td class="price">KES ${s.price.toLocaleString()}</td>
                  <td class="duration">${s.duration || '-'} min</td>
                  <td>${s.description || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  } catch (err) {
    alert('Error: ' + err.message);
  }
};
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN FINANCE
// ═══════════════════════════════════════════════════════════════════════════

async function loadAdminFinance(container) {
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <h2 style="font-size:20px;font-weight:800;margin:0;">Finance Dashboard</h2>
      
      <!-- TIME PERIOD SELECTOR -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button onclick="window.setFinancePeriod('day')" id="btn-day" style="padding:8px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Today</button>
        <button onclick="window.setFinancePeriod('week')" id="btn-week" style="padding:8px 16px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">This Week</button>
        <button onclick="window.setFinancePeriod('month')" id="btn-month" style="padding:8px 16px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">This Month</button>
      </div>
      
      <!-- MAIN STATS -->
      <div id="finance-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;"></div>
      
      <!-- REVENUE BY SHOP -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:12px;">🏪 Revenue by Shop</div>
        <div id="revenue-by-shop" style="display:flex;flex-direction:column;gap:8px;"></div>
      </div>
      
      <!-- EMPLOYEE REVENUE -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:12px;">👥 Employee Revenue Breakdown</div>
        <div id="employee-revenue" style="display:flex;flex-direction:column;gap:8px;"></div>
      </div>
      
      <!-- EXPENSES -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div style="font-weight:700;font-size:13px;">💸 Expenses</div>
          <button onclick="window.openAddExpenseModal()" style="padding:6px 12px;background:var(--gold);color:#000;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;">+ Add</button>
        </div>
        <div id="expenses-list" style="display:flex;flex-direction:column;gap:8px;"></div>
      </div>
      
      <!-- ADD EXPENSE MODAL -->
      <div id="expense-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-weight:700;margin-bottom:12px;">Add Expense</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input id="expense-amount" placeholder="Amount (KES)" type="number" step="100" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="expense-category" placeholder="Category" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="expense-description" placeholder="Description" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="window.saveExpense()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
          <button onclick="window.closeAddExpenseModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
        </div>
      </div>
    </div>
  `;
  
  window.FINANCE_PERIOD = 'day';
  await window.renderAdminFinance();
}

window.setFinancePeriod = async function(period) {
  window.FINANCE_PERIOD = period;
  ['day', 'week', 'month'].forEach(p => {
    const btn = document.getElementById(`btn-${p}`);
    if (btn) {
      btn.style.background = p === period ? 'var(--gold)' : 'var(--border)';
      btn.style.color = p === period ? '#000' : 'var(--txt)';
    }
  });
  await window.renderAdminFinance();
};

window.renderAdminFinance = async function() {
  try {
    const dateRange = getDateRange(window.FINANCE_PERIOD || 'day');
    
    // Get all finance records
    const { data: financeData } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);
    
    // Get stylists & agreements
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const { data: agreements } = await STATE.supabase
      .from('salon_agreements')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    // Calculate totals
    const income = financeData?.filter(f => f.type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const expenses = financeData?.filter(f => f.type === 'expense').reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const netRevenue = income - expenses;
    
    // Calculate commissions
    let totalCommissions = 0;
    const employeeRevenue = {};
    
    if (stylists && agreements) {
      stylists.forEach(s => {
        const agreement = agreements.find(a => a.stylist_id === s.id);
        const stylistIncome = financeData?.filter(f => f.description && f.description.includes(s.name)).reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
        
        let commission = 0;
        if (agreement?.agreement_type === 'commission' && agreement?.commission_percent) {
          commission = (stylistIncome * agreement.commission_percent) / 100;
        } else if (agreement?.agreement_type === 'commission+monthly' && agreement?.commission_percent) {
          commission = (stylistIncome * agreement.commission_percent) / 100;
        }
        
        totalCommissions += commission;
        employeeRevenue[s.id] = {
          name: s.name,
          revenue: stylistIncome,
          commission: commission,
          agreement: agreement?.agreement_type || 'N/A'
        };
      });
    }
    
    // Render summary
    const summary = document.getElementById('finance-summary');
    summary.innerHTML = `
      <div style="background:var(--green);color:#fff;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:20px;font-weight:800;">KES ${income.toLocaleString()}</div>
        <div style="font-size:12px;margin-top:6px;">Income</div>
      </div>
      <div style="background:var(--red);color:#fff;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:20px;font-weight:800;">KES ${expenses.toLocaleString()}</div>
        <div style="font-size:12px;margin-top:6px;">Expenses</div>
      </div>
      <div style="background:var(--gold);color:#000;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:20px;font-weight:800;">KES ${totalCommissions.toLocaleString()}</div>
        <div style="font-size:12px;margin-top:6px;">Commissions</div>
      </div>
      <div style="background:var(--blue);color:#fff;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:20px;font-weight:800;">KES ${netRevenue.toLocaleString()}</div>
        <div style="font-size:12px;margin-top:6px;">Net Revenue</div>
      </div>
    `;
    
    // Render revenue by shop
    const revenueByShop = document.getElementById('revenue-by-shop');
    revenueByShop.innerHTML = `
      <div style="background:var(--bg3);padding:10px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid var(--gold);">
        <div style="font-weight:700;">Current Shop</div>
        <div style="font-weight:700;color:var(--gold);">KES ${income.toLocaleString()}</div>
      </div>
    `;
    
    // Render employee revenue
    const employeeRev = document.getElementById('employee-revenue');
    if (Object.keys(employeeRevenue).length > 0) {
      employeeRev.innerHTML = Object.entries(employeeRevenue).map(([id, data]) => `
        <div style="background:var(--bg3);padding:10px;border-radius:6px;border-left:3px solid var(--gold);">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-weight:700;font-size:12px;">${data.name}</div>
              <div style="font-size:11px;color:var(--txt3);margin-top:2px;">📊 ${data.revenue.toLocaleString()}</div>
              <div style="font-size:11px;color:var(--txt3);">💼 ${data.agreement}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:700;color:var(--gold);font-size:12px;">Commission: KES ${data.commission.toLocaleString()}</div>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      employeeRev.innerHTML = '<div style="color:var(--txt3);padding:10px;">No employee data</div>';
    }
    
    // Render expenses
    const expensesList = document.getElementById('expenses-list');
    const expenseRecords = financeData?.filter(f => f.type === 'expense') || [];
    if (expenseRecords.length > 0) {
      expensesList.innerHTML = expenseRecords.map(e => `
        <div style="background:var(--bg3);padding:10px;border-radius:6px;border-left:3px solid var(--red);display:flex;justify-content:space-between;">
          <div>
            <div style="font-weight:700;font-size:12px;">${e.category || 'Expense'}</div>
            <div style="font-size:11px;color:var(--txt3);">${e.description || '-'}</div>
          </div>
          <div style="font-weight:700;color:var(--red);">KES ${e.amount.toLocaleString()}</div>
        </div>
      `).join('');
    } else {
      expensesList.innerHTML = '<div style="color:var(--txt3);padding:10px;">No expenses</div>';
    }
  } catch (err) {
    console.error('Render admin finance error:', err);
  }
};

window.openAddExpenseModal = function() {
  const modal = document.getElementById('expense-modal');
  if (modal) modal.style.display = 'block';
};

window.closeAddExpenseModal = function() {
  const modal = document.getElementById('expense-modal');
  if (modal) modal.style.display = 'none';
};

window.saveExpense = async function() {
  const amount = parseFloat(document.getElementById('expense-amount')?.value);
  const category = document.getElementById('expense-category')?.value.trim();
  const description = document.getElementById('expense-description')?.value.trim();
  
  if (!amount || !category) {
    alert('Fill required fields');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_finance')
      .insert([{
        business_id: STATE.businessId,
        type: 'expense',
        amount,
        category,
        description: description || ''
      }]);
    
    if (error) throw error;
    
    window.closeAddExpenseModal();
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-description').value = '';
    
    await window.renderAdminFinance();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEE FINANCE
// ═══════════════════════════════════════════════════════════════════════════

async function loadEmployeeFinance(container) {
  try {
    const { data: stylist } = await STATE.supabase
      .from('salon_stylists')
      .select('id,name')
      .eq('user_id', STATE.user.id)
      .eq('business_id', STATE.businessId)
      .single();
    
    if (!stylist) {
      container.innerHTML = '<div style="padding:20px;color:var(--red);">Error: Stylist profile not found</div>';
      return;
    }
    
    window.CURRENT_STYLIST_ID = stylist.id;
    
    container.innerHTML = `
      <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">My Revenue</h2>
        
        <!-- TIME PERIOD SELECTOR -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="window.setEmpFinancePeriod('day')" id="emp-btn-day" style="padding:8px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Today</button>
          <button onclick="window.setEmpFinancePeriod('week')" id="emp-btn-week" style="padding:8px 16px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">This Week</button>
          <button onclick="window.setEmpFinancePeriod('month')" id="emp-btn-month" style="padding:8px 16px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">This Month</button>
        </div>
        
        <!-- STATS -->
        <div id="emp-finance-summary" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;"></div>
        
        <!-- AGREEMENT INFO -->
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:12px;">💼 Your Agreement</div>
          <div id="emp-agreement" style="color:var(--txt3);"></div>
        </div>
      </div>
    `;
    
    window.EMP_FINANCE_PERIOD = 'day';
    await window.renderEmployeeFinance();
  } catch (err) {
    container.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
  }
}

window.setEmpFinancePeriod = async function(period) {
  window.EMP_FINANCE_PERIOD = period;
  ['day', 'week', 'month'].forEach(p => {
    const btn = document.getElementById(`emp-btn-${p}`);
    if (btn) {
      btn.style.background = p === period ? 'var(--gold)' : 'var(--border)';
      btn.style.color = p === period ? '#000' : 'var(--txt)';
    }
  });
  await window.renderEmployeeFinance();
};

window.renderEmployeeFinance = async function() {
  try {
    const dateRange = getDateRange(window.EMP_FINANCE_PERIOD || 'day');
    
    // Get agreement
    const { data: agreement } = await STATE.supabase
      .from('salon_agreements')
      .select('*')
      .eq('stylist_id', window.CURRENT_STYLIST_ID)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();
    
    // Get personal revenue (assume stored with stylist name or id)
    const { data: financeData } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);
    
    const stylistData = await STATE.supabase.from('salon_stylists').select('name').eq('id', window.CURRENT_STYLIST_ID).single();
    const stylistName = stylistData.data?.name || '';
    
    // Filter by stylist (basic filtering - in production would have stylist_id field)
    const myRevenue = financeData?.filter(f => f.description && f.description.includes(stylistName)).reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    
    let myCommission = 0;
    if (agreement?.agreement_type === 'commission' && agreement?.commission_percent) {
      myCommission = (myRevenue * agreement.commission_percent) / 100;
    } else if (agreement?.agreement_type === 'commission+monthly') {
      myCommission = (myRevenue * agreement.commission_percent) / 100 + (agreement.monthly_salary || 0);
    } else if (agreement?.agreement_type === 'monthly') {
      myCommission = agreement.monthly_salary || 0;
    }
    
    // Render summary
    document.getElementById('emp-finance-summary').innerHTML = `
      <div style="background:var(--green);color:#fff;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:24px;font-weight:800;">KES ${myRevenue.toLocaleString()}</div>
        <div style="font-size:12px;margin-top:6px;">Revenue Generated</div>
      </div>
      <div style="background:var(--gold);color:#000;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:24px;font-weight:800;">KES ${myCommission.toLocaleString()}</div>
        <div style="font-size:12px;margin-top:6px;">Your Earnings</div>
      </div>
    `;
    
    // Render agreement
    const agreementText = agreement ? 
      `${agreement.agreement_type.toUpperCase()}${agreement.commission_percent ? ` - ${agreement.commission_percent}% commission` : ''}${agreement.monthly_salary ? ` - KES ${agreement.monthly_salary} monthly` : ''}` 
      : 'No agreement set';
    
    document.getElementById('emp-agreement').innerHTML = `
      <div style="background:var(--bg3);padding:10px;border-radius:6px;font-size:12px;">
        ${agreementText}
      </div>
    `;
  } catch (err) {
    console.error('Render employee finance error:', err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  
  switch(period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
}
    clients.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
  }
};

async function renderClientsPage(container) {
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">Clients</h2>
        <button onclick="window.openAddClientModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ Add Client</button>
      </div>
      
      <!-- SEARCH -->
      <input id="client-search" placeholder="Search by name or phone..." onkeyup="window.filterClients()" style="padding:10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;">
      
      <!-- ADD CLIENT MODAL -->
      <div id="client-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-weight:700;margin-bottom:12px;">Add New Client</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input id="client-name" placeholder="Full name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="client-phone" placeholder="Phone (+254...)" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="client-email" placeholder="Email" type="email" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <select id="client-favorite-stylist" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <option value="">Select favorite stylist</option>
          </select>
          <select id="client-favorite-service" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <option value="">Select favorite service</option>
          </select>
          <input id="client-notes" placeholder="Notes" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="window.saveClient()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
          <button onclick="window.closeAddClientModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
        </div>
      </div>
      
      <!-- CLIENTS LIST -->
      <div id="clients-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div>
    </div>
  `;
  
  // Load stylists for dropdown
  const { data: stylists } = await STATE.supabase
    .from('salon_stylists')
    .select('id,name')
    .eq('business_id', STATE.businessId);
  
  if (stylists) {
    const select = document.getElementById('client-favorite-stylist');
    stylists.forEach(s => {
      const option = document.createElement('option');
      option.value = s.id;
      option.text = s.name;
      select.appendChild(option);
    });
  }
  
  // Load services for dropdown
  const { data: services } = await STATE.supabase
    .from('salon_services')
    .select('id,name,price')
    .eq('business_id', STATE.businessId);
  
  if (services) {
    const select = document.getElementById('client-favorite-service');
    services.forEach(s => {
      const option = document.createElement('option');
      option.value = s.id;
      option.text = `${s.name} (KES ${s.price})`;
      select.appendChild(option);
    });
  }
  
  await window.renderClients();
}

window.renderClients = async function() {
  try {
    const { data: clients } = await STATE.supabase
      .from('salon_clients')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('name', { ascending: true });
    
    const list = document.getElementById('clients-list');
    if (!list) return;
    
    if (!clients || clients.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No clients yet</div>';
      return;
    }
    
    // Get stylists and services for lookup
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('id,name')
      .eq('business_id', STATE.businessId);
    
    const { data: services } = await STATE.supabase
      .from('salon_services')
      .select('id,name,price')
      .eq('business_id', STATE.businessId);
    
    const stylistMap = {};
    const serviceMap = {};
    
    if (stylists) stylists.forEach(s => stylistMap[s.id] = s.name);
    if (services) services.forEach(s => serviceMap[s.id] = s);
    
    const html = clients.map(c => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;data-client-id='${c.id}' class='client-card'>
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;">${c.name}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${c.phone}</div>
            ${c.email ? `<div style="font-size:12px;color:var(--txt3);">📧 ${c.email}</div>` : ''}
            ${c.stylist_id && stylistMap[c.stylist_id] ? `<div style="font-size:12px;color:var(--txt3);margin-top:2px;">✂️ Stylist: ${stylistMap[c.stylist_id]}</div>` : ''}
            ${c.favorite_service_id && serviceMap[c.favorite_service_id] ? `<div style="font-size:12px;color:var(--txt3);">💅 Service: ${serviceMap[c.favorite_service_id].name} (KES ${serviceMap[c.favorite_service_id].price})</div>` : ''}
            ${c.notes ? `<div style="font-size:12px;color:var(--txt3);margin-top:2px;">📝 ${c.notes}</div>` : ''}
            <div style="font-size:11px;color:var(--txt3);margin-top:4px;">Last visit: ${c.last_visit ? new Date(c.last_visit).toLocaleDateString() : 'Never'}</div>
          </div>
          
          <div style="display:flex;flex-direction:column;gap:6px;">
            <a href="tel:${c.phone}" style="padding:6px 12px;background:var(--green);color:#fff;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none;text-align:center;">📞 Call</a>
            <a href="https://wa.me/${c.phone.replace('+', '')}?text=Hello%20${c.name}%2C%20we%20have%20an%20appointment%20reminder!" target="_blank" style="padding:6px 12px;background:#25D366;color:#fff;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none;text-align:center;">💬 WhatsApp</a>
            <button onclick="window.appointmentFromClient && window.appointmentFromClient('${c.id}', '${c.name}', '${c.phone}')" style="padding:6px 12px;background:var(--gold);color:#000;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;">📅 Appt</button>
            <button onclick="window.deleteClient && window.deleteClient('${c.id}')" style="padding:6px 12px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
    
    list.innerHTML = html;
  } catch (err) {
    console.error('Render clients error:', err);
  }
};

window.filterClients = async function() {
  const searchText = document.getElementById('client-search')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.client-card');
  
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchText) ? 'block' : 'none';
  });
};

window.openAddClientModal = function() {
  const modal = document.getElementById('client-modal');
  if (modal) modal.style.display = 'block';
};

window.closeAddClientModal = function() {
  const modal = document.getElementById('client-modal');
  if (modal) modal.style.display = 'none';
};

window.saveClient = async function() {
  const name = document.getElementById('client-name')?.value.trim();
  const phone = document.getElementById('client-phone')?.value.trim();
  const email = document.getElementById('client-email')?.value.trim();
  const stylistId = document.getElementById('client-favorite-stylist')?.value;
  const serviceId = document.getElementById('client-favorite-service')?.value;
  const notes = document.getElementById('client-notes')?.value.trim();
  
  if (!name || !phone) {
    alert('Fill required fields');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_clients')
      .insert([{
        business_id: STATE.businessId,
        name,
        phone,
        email: email || '',
        stylist_id: stylistId || null,
        favorite_service_id: serviceId || null,
        notes: notes || '',
        last_visit: new Date()
      }]);
    
    if (error) throw error;
    
    window.closeAddClientModal();
    document.getElementById('client-name').value = '';
    document.getElementById('client-phone').value = '';
    document.getElementById('client-email').value = '';
    document.getElementById('client-favorite-stylist').value = '';
    document.getElementById('client-favorite-service').value = '';
    document.getElementById('client-notes').value = '';
    
    await window.renderClients();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.deleteClient = async function(clientId) {
  if (!confirm('Delete this client?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_clients')
      .delete()
      .eq('id', clientId);
    
    if (error) throw error;
    await window.renderClients();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.appointmentFromClient = async function(clientId, clientName, clientPhone) {
  // Set appointment modal values and show it
  const apptNameInput = document.getElementById('appt-client-name');
  const apptPhoneInput = document.getElementById('appt-client-phone');
  const apptModal = document.getElementById('appt-modal');
  
  if (apptNameInput) apptNameInput.value = clientName;
  if (apptPhoneInput) apptPhoneInput.value = clientPhone;
  
  // Show appointments tab and modal
  const apptTab = document.querySelector('[onclick*="showPane"][onclick*="appointments"]');
  if (apptTab) apptTab.click();
  
  if (apptModal) {
    setTimeout(() => apptModal.style.display = 'block', 100);
  }
};
    inventory.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
  }
};

async function renderInventoryPage(container) {
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="font-size:20px;font-weight:800;margin:0;">Inventory</h2>
        <button onclick="window.openAddProductModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ Add Product</button>
      </div>
      
      <!-- LOW STOCK ALERTS -->
      <div id="low-stock-alerts" style="display:flex;flex-direction:column;gap:8px;"></div>
      
      <!-- ADD PRODUCT MODAL -->
      <div id="product-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-weight:700;margin-bottom:12px;">Add New Product</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input id="product-name" placeholder="Product name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="product-category" placeholder="Category" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="product-quantity" placeholder="Quantity" type="number" step="1" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="product-reorder" placeholder="Reorder level" type="number" step="1" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="product-cost" placeholder="Unit cost (KES)" type="number" step="100" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="product-supplier" placeholder="Supplier" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
          <input id="product-notes" placeholder="Notes" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="window.saveProduct()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
          <button onclick="window.closeAddProductModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
        </div>
      </div>
      
      <!-- INVENTORY TABLE -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow-x:auto;">
        <table id="inventory-table" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg3);border-bottom:2px solid var(--border);">
              <th style="padding:12px;text-align:left;font-weight:700;border-right:1px solid var(--border);">Product</th>
              <th style="padding:12px;text-align:center;font-weight:700;border-right:1px solid var(--border);">Quantity</th>
              <th style="padding:12px;text-align:center;font-weight:700;border-right:1px solid var(--border);">Reorder</th>
              <th style="padding:12px;text-align:center;font-weight:700;border-right:1px solid var(--border);">Cost (KES)</th>
              <th style="padding:12px;text-align:left;font-weight:700;border-right:1px solid var(--border);">Supplier</th>
              <th style="padding:12px;text-align:center;font-weight:700;">Actions</th>
            </tr>
          </thead>
          <tbody id="inventory-tbody">
            <tr><td colspan="6" style="padding:40px;text-align:center;color:var(--txt3);">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  await window.renderInventory();
}

window.renderInventory = async function() {
  try {
    const { data: products } = await STATE.supabase
      .from('salon_inventory')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('name', { ascending: true });
    
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;
    
    if (!products || products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:var(--txt3);">No products yet</td></tr>';
      renderLowStockAlerts([]);
      return;
    }
    
    // Show low stock alerts
    const lowStock = products.filter(p => p.quantity <= p.reorder_level);
    renderLowStockAlerts(lowStock);
    
    const html = products.map(p => {
      const isLowStock = p.quantity <= p.reorder_level;
      return `
        <tr style="border-bottom:1px solid var(--border);background:${isLowStock ? 'rgba(239, 68, 68, 0.1)' : ''};">
          <td style="padding:12px;border-right:1px solid var(--border);font-weight:700;">
            ${p.name}
            ${p.category ? `<div style="font-size:11px;color:var(--txt3);">${p.category}</div>` : ''}
          </td>
          <td style="padding:12px;border-right:1px solid var(--border);text-align:center;font-weight:700;color:${isLowStock ? 'var(--red)' : 'var(--gold)'};">${p.quantity}</td>
          <td style="padding:12px;border-right:1px solid var(--border);text-align:center;color:var(--txt3);">${p.reorder_level}</td>
          <td style="padding:12px;border-right:1px solid var(--border);text-align:center;color:var(--txt3);">KES ${p.unit_cost.toLocaleString()}</td>
          <td style="padding:12px;border-right:1px solid var(--border);color:var(--txt3);font-size:12px;">${p.supplier || '-'}</td>
          <td style="padding:12px;text-align:center;display:flex;gap:6px;justify-content:center;">
            <button onclick="window.updateProductQuantity && window.updateProductQuantity('${p.id}')" style="padding:4px 8px;background:var(--gold);color:#000;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Update</button>
            <button onclick="window.deleteProduct && window.deleteProduct('${p.id}')" style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
    
    tbody.innerHTML = html;
  } catch (err) {
    console.error('Render inventory error:', err);
    document.getElementById('inventory-tbody').innerHTML = `<tr><td colspan="6" style="padding:20px;color:var(--red);">Error: ${err.message}</td></tr>`;
  }
};

function renderLowStockAlerts(lowStock) {
  const alertsDiv = document.getElementById('low-stock-alerts');
  if (!alertsDiv) return;
  
  if (lowStock.length === 0) {
    alertsDiv.innerHTML = '';
    return;
  }
  
  alertsDiv.innerHTML = lowStock.map(p => `
    <div style="background:var(--red);color:#fff;padding:12px;border-radius:8px;border-left:4px solid var(--red);">
      <div style="font-weight:700;font-size:13px;">⚠️ LOW STOCK ALERT</div>
      <div style="font-size:12px;margin-top:6px;">
        <strong>${p.name}</strong> is running low!
        <div style="margin-top:4px;">Stock: ${p.quantity} / Reorder Level: ${p.reorder_level}</div>
      </div>
    </div>
  `).join('');
}

window.openAddProductModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.style.display = 'block';
};

window.closeAddProductModal = function() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.style.display = 'none';
};

window.saveProduct = async function() {
  const name = document.getElementById('product-name')?.value.trim();
  const category = document.getElementById('product-category')?.value.trim();
  const quantity = parseInt(document.getElementById('product-quantity')?.value);
  const reorder = parseInt(document.getElementById('product-reorder')?.value);
  const cost = parseFloat(document.getElementById('product-cost')?.value);
  const supplier = document.getElementById('product-supplier')?.value.trim();
  const notes = document.getElementById('product-notes')?.value.trim();
  
  if (!name || !quantity || !reorder || !cost) {
    alert('Fill required fields');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_inventory')
      .insert([{
        business_id: STATE.businessId,
        name,
        category: category || '',
        quantity,
        reorder_level: reorder,
        unit_cost: cost,
        supplier: supplier || '',
        notes: notes || ''
      }]);
    
    if (error) throw error;
    
    window.closeAddProductModal();
    document.getElementById('product-name').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('product-quantity').value = '';
    document.getElementById('product-reorder').value = '';
    document.getElementById('product-cost').value = '';
    document.getElementById('product-supplier').value = '';
    document.getElementById('product-notes').value = '';
    
    await window.renderInventory();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.updateProductQuantity = async function(productId) {
  const newQty = prompt('Enter new quantity:');
  if (!newQty || isNaN(newQty)) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_inventory')
      .update({ quantity: parseInt(newQty) })
      .eq('id', productId);
    
    if (error) throw error;
    await window.renderInventory();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.deleteProduct = async function(productId) {
  if (!confirm('Delete this product?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_inventory')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    await window.renderInventory();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};
    reports.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
  }
};

async function renderReportsPage(container) {
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
      <h2 style="font-size:20px;font-weight:800;margin:0;">Reports & Analytics</h2>
      
      <!-- TIME PERIOD SELECTOR -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button onclick="window.setReportPeriod('day')" id="rep-btn-day" style="padding:8px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Today</button>
        <button onclick="window.setReportPeriod('week')" id="rep-btn-week" style="padding:8px 16px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">This Week</button>
        <button onclick="window.setReportPeriod('month')" id="rep-btn-month" style="padding:8px 16px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">This Month</button>
      </div>
      
      <!-- TOP SHOPS -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:12px;">🏪 Top Performing Shops</div>
        <div id="top-shops" style="display:flex;flex-direction:column;gap:8px;"></div>
      </div>
      
      <!-- TOP STYLISTS -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:12px;">⭐ Top Performing Stylists</div>
        <div id="top-stylists" style="display:flex;flex-direction:column;gap:8px;"></div>
      </div>
      
      <!-- REVENUE CHART -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:12px;">📈 Revenue Trend</div>
        <div id="revenue-chart" style="height:200px;display:flex;align-items:flex-end;gap:4px;padding:10px;background:var(--bg3);border-radius:6px;"></div>
      </div>
      
      <!-- AI INSIGHTS -->
      <div style="background:var(--gold);color:#000;border-radius:8px;padding:16px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:12px;">💡 AI Insights & Recommendations</div>
        <div id="ai-insights" style="font-size:12px;line-height:1.6;color:#222;">
          <div style="text-align:center;color:#444;">Loading insights...</div>
        </div>
        <button onclick="window.refreshAIInsights()" style="margin-top:12px;padding:8px 16px;background:#000;color:var(--gold);border:none;border-radius:4px;font-weight:700;cursor:pointer;font-size:11px;">Refresh Insights</button>
      </div>
    </div>
  `;
  
  window.REPORT_PERIOD = 'day';
  await window.renderReports();
}

window.setReportPeriod = async function(period) {
  window.REPORT_PERIOD = period;
  ['day', 'week', 'month'].forEach(p => {
    const btn = document.getElementById(`rep-btn-${p}`);
    if (btn) {
      btn.style.background = p === period ? 'var(--gold)' : 'var(--border)';
      btn.style.color = p === period ? '#000' : 'var(--txt)';
    }
  });
  await window.renderReports();
};

window.renderReports = async function() {
  try {
    const dateRange = getDateRange(window.REPORT_PERIOD || 'day');
    
    // Get all data
    const { data: financeData } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);
    
    const { data: appointments } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);
    
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    // Calculate shop revenue (for now, just current shop)
    const shopRevenue = financeData?.filter(f => f.type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const shopAppointments = appointments?.length || 0;
    const completedAppointments = appointments?.filter(a => a.status === 'done').length || 0;
    const completionRate = shopAppointments > 0 ? Math.round((completedAppointments / shopAppointments) * 100) : 0;
    
    // Calculate stylist performance
    const stylistPerformance = {};
    if (stylists && appointments) {
      stylists.forEach(s => {
        const stylistAppts = appointments.filter(a => a.stylist_id === s.id);
        const stylistCompleted = stylistAppts.filter(a => a.status === 'done').length;
        const stylistRevenue = financeData?.filter(f => f.description && f.description.includes(s.name)).reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
        
        stylistPerformance[s.id] = {
          name: s.name,
          appointments: stylistAppts.length,
          completed: stylistCompleted,
          revenue: stylistRevenue,
          rate: stylistAppts.length > 0 ? Math.round((stylistCompleted / stylistAppts.length) * 100) : 0
        };
      });
    }
    
    // Render top shops
    const shopsDiv = document.getElementById('top-shops');
    shopsDiv.innerHTML = `
      <div style="background:var(--bg3);padding:12px;border-radius:6px;border-left:3px solid var(--gold);">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div style="font-weight:700;font-size:12px;">Current Shop</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:2px;">Revenue: KES ${shopRevenue.toLocaleString()}</div>
            <div style="font-size:11px;color:var(--txt3);">Appointments: ${shopAppointments} | Completed: ${completedAppointments} (${completionRate}%)</div>
          </div>
        </div>
      </div>
    `;
    
    // Render top stylists
    const stylistsDiv = document.getElementById('top-stylists');
    const sortedStylists = Object.entries(stylistPerformance)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5);
    
    stylistsDiv.innerHTML = sortedStylists.length > 0 ? sortedStylists.map(([id, data], index) => `
      <div style="background:var(--bg3);padding:12px;border-radius:6px;border-left:3px solid var(--gold);display:flex;justify-content:space-between;align-items:start;">
        <div>
          <div style="font-weight:700;font-size:12px;">🥇 #${index + 1} - ${data.name}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px;">Revenue: KES ${data.revenue.toLocaleString()}</div>
          <div style="font-size:11px;color:var(--txt3);">Appointments: ${data.appointments} | Completed: ${data.completed} (${data.rate}%)</div>
        </div>
        <div style="font-weight:700;color:var(--gold);text-align:right;">
          KES ${data.revenue.toLocaleString()}
        </div>
      </div>
    `).join('') : '<div style="color:var(--txt3);">No stylist data</div>';
    
    // Render revenue chart (simple bar chart)
    const chartDiv = document.getElementById('revenue-chart');
    if (financeData) {
      const dailyRevenue = {};
      financeData.filter(f => f.type === 'income').forEach(f => {
        const date = new Date(f.created_at).toLocaleDateString();
        dailyRevenue[date] = (dailyRevenue[date] || 0) + f.amount;
      });
      
      const maxRevenue = Math.max(...Object.values(dailyRevenue), 1);
      chartDiv.innerHTML = Object.entries(dailyRevenue)
        .slice(-7) // Last 7 days
        .map(([date, revenue]) => {
          const height = (revenue / maxRevenue) * 150;
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="background:var(--gold);width:100%;height:${height}px;border-radius:4px;position:relative;">
                <div style="position:absolute;top:-20px;width:100%;text-align:center;font-size:9px;color:var(--txt3);">KES ${Math.round(revenue/1000)}k</div>
              </div>
              <div style="font-size:9px;color:var(--txt3);text-align:center;">${date.split('/')[0]}/${date.split('/')[1]}</div>
            </div>
          `;
        }).join('');
    }
    
    // Generate AI insights
    await window.generateAIInsights(shopRevenue, shopAppointments, completedAppointments, sortedStylists);
    
  } catch (err) {
    console.error('Render reports error:', err);
  }
};

window.generateAIInsights = async function(revenue, totalAppts, completedAppts, topStylists) {
  const insightsDiv = document.getElementById('ai-insights');
  
  const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;
  const topStylist = topStylists.length > 0 ? topStylists[0][1].name : 'No data';
  const topRevenue = topStylists.length > 0 ? topStylists[0][1].revenue : 0;
  
  // Local AI-style insights (no API call needed)
  let insights = [];
  
  if (completionRate < 80) {
    insights.push(`⚠️ Completion rate is ${completionRate}% - target 90%+ to improve customer satisfaction`);
  } else if (completionRate >= 90) {
    insights.push(`✅ Excellent completion rate (${completionRate}%) - keep up the great work!`);
  }
  
  if (topStylists.length > 0) {
    insights.push(`⭐ ${topStylist} is your top performer with KES ${topRevenue.toLocaleString()} in revenue`);
  }
  
  if (totalAppts > 0) {
    const avgRevenuePerAppt = revenue / totalAppts;
    insights.push(`📊 Average revenue per appointment: KES ${Math.round(avgRevenuePerAppt).toLocaleString()}`);
  } else {
    insights.push(`📅 Schedule more appointments to increase revenue`);
  }
  
  if (revenue < 10000) {
    insights.push(`💰 Focus on booking more high-ticket services to boost daily revenue`);
  }
  
  const html = insights.length > 0 
    ? insights.map(i => `<div style="margin-bottom:8px;">• ${i}</div>`).join('')
    : '<div>No insights available yet. Add more data to get recommendations.</div>';
  
  insightsDiv.innerHTML = html;
};

window.refreshAIInsights = async function() {
  const dateRange = getDateRange(window.REPORT_PERIOD || 'day');
  const { data: financeData } = await STATE.supabase
    .from('salon_finance')
    .select('*')
    .eq('business_id', STATE.businessId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);
  
  const { data: appointments } = await STATE.supabase
    .from('salon_appointments')
    .select('*')
    .eq('business_id', STATE.businessId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);
  
  const { data: stylists } = await STATE.supabase
    .from('salon_stylists')
    .select('*')
    .eq('business_id', STATE.businessId);
  
  const shopRevenue = financeData?.filter(f => f.type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
  const shopAppointments = appointments?.length || 0;
  const completedAppointments = appointments?.filter(a => a.status === 'done').length || 0;
  
  const stylistPerformance = {};
  if (stylists && appointments) {
    stylists.forEach(s => {
      const stylistAppts = appointments.filter(a => a.stylist_id === s.id);
      const stylistCompleted = stylistAppts.filter(a => a.status === 'done').length;
      const stylistRevenue = financeData?.filter(f => f.description && f.description.includes(s.name)).reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
      
      stylistPerformance[s.id] = {
        name: s.name,
        appointments: stylistAppts.length,
        completed: stylistCompleted,
        revenue: stylistRevenue
      };
    });
  }
  
  const sortedStylists = Object.entries(stylistPerformance).sort(([,a], [,b]) => b.revenue - a.revenue);
  await window.generateAIInsights(shopRevenue, shopAppointments, completedAppointments, sortedStylists);
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════════════

function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  
  switch(period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
}
    settings.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
  }
};

async function renderSettingsPage(container) {
  container.innerHTML = `
    <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:20px;">
      <h2 style="font-size:20px;font-weight:800;margin:0;">Settings</h2>
      
      <!-- TABS -->
      <div style="display:flex;gap:8px;border-bottom:2px solid var(--border);">
        <button onclick="window.switchSettingsTab('shops')" id="tab-shops" style="padding:12px 16px;background:none;border:none;border-bottom:3px solid var(--gold);color:var(--txt);font-weight:700;cursor:pointer;font-size:13px;">🏪 Shops</button>
        <button onclick="window.switchSettingsTab('employees')" id="tab-employees" style="padding:12px 16px;background:none;border:none;border-bottom:3px solid transparent;color:var(--txt3);font-weight:700;cursor:pointer;font-size:13px;">👥 Employees</button>
      </div>
      
      <!-- SHOPS TAB -->
      <div id="shops-content" style="display:flex;flex-direction:column;gap:16px;">
        <button onclick="window.openAddShopModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;align-self:flex-start;">+ New Shop</button>
        
        <!-- ADD SHOP MODAL -->
        <div id="shop-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:700;margin-bottom:12px;">Add New Shop/Branch</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <input id="shop-name" placeholder="Shop name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="shop-location" placeholder="Location" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="shop-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="shop-manager" placeholder="Manager name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="shop-email" placeholder="Email" type="email" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button onclick="window.saveShop()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
            <button onclick="window.closeAddShopModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
          </div>
        </div>
        
        <!-- SHOPS LIST -->
        <div id="shops-list" style="display:flex;flex-direction:column;gap:10px;"></div>
      </div>
      
      <!-- EMPLOYEES TAB -->
      <div id="employees-content" style="display:none;flex-direction:column;gap:16px;">
        <button onclick="window.openAddEmployeeModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;align-self:flex-start;">+ Add Employee</button>
        
        <!-- ADD EMPLOYEE MODAL -->
        <div id="employee-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:700;margin-bottom:12px;">Add New Employee</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <input id="emp-name" placeholder="Full name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="emp-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="emp-email" placeholder="Email" type="email" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <select id="emp-role" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
              <option value="stylist">Stylist</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="assistant">Assistant</option>
            </select>
          </div>
          
          <div style="margin-bottom:12px;">
            <div style="font-weight:700;font-size:12px;margin-bottom:8px;">Permissions:</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="display:flex;gap:8px;font-size:12px;">
                <input type="checkbox" id="perm-appts" style="width:16px;height:16px;">
                Manage Appointments
              </label>
              <label style="display:flex;gap:8px;font-size:12px;">
                <input type="checkbox" id="perm-finance" style="width:16px;height:16px;">
                Manage Finance
              </label>
              <label style="display:flex;gap:8px;font-size:12px;">
                <input type="checkbox" id="perm-staff" style="width:16px;height:16px;">
                Manage Staff
              </label>
              <label style="display:flex;gap:8px;font-size:12px;">
                <input type="checkbox" id="perm-inventory" style="width:16px;height:16px;">
                Manage Inventory
              </label>
            </div>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button onclick="window.saveEmployee()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
            <button onclick="window.closeAddEmployeeModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
          </div>
        </div>
        
        <!-- EMPLOYEES LIST -->
        <div id="employees-list" style="display:flex;flex-direction:column;gap:10px;"></div>
      </div>
    </div>
  `;
  
  await window.renderShops();
  await window.renderEmployees();
}

window.switchSettingsTab = function(tab) {
  const tabs = ['shops', 'employees'];
  tabs.forEach(t => {
    const content = document.getElementById(`${t}-content`);
    const tabBtn = document.getElementById(`tab-${t}`);
    if (t === tab) {
      if (content) content.style.display = 'flex';
      if (tabBtn) {
        tabBtn.style.borderBottomColor = 'var(--gold)';
        tabBtn.style.color = 'var(--txt)';
      }
    } else {
      if (content) content.style.display = 'none';
      if (tabBtn) {
        tabBtn.style.borderBottomColor = 'transparent';
        tabBtn.style.color = 'var(--txt3)';
      }
    }
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// SHOPS
// ═══════════════════════════════════════════════════════════════════════════

window.renderShops = async function() {
  try {
    const { data: businesses } = await STATE.supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', STATE.user.id);
    
    const list = document.getElementById('shops-list');
    if (!list) return;
    
    if (!businesses || businesses.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No shops yet</div>';
      return;
    }
    
    list.innerHTML = businesses.map(b => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;">${b.name}</div>
            ${b.location ? `<div style="font-size:12px;color:var(--txt3);margin-top:4px;">📍 ${b.location}</div>` : ''}
            ${b.phone ? `<div style="font-size:12px;color:var(--txt3);">📞 ${b.phone}</div>` : ''}
            ${b.manager_name ? `<div style="font-size:12px;color:var(--txt3);">👤 ${b.manager_name}</div>` : ''}
            <div style="font-size:11px;color:var(--txt3);margin-top:4px;">Created: ${new Date(b.created_at).toLocaleDateString()}</div>
          </div>
          <button onclick="window.deleteShop && window.deleteShop('${b.id}')" style="padding:6px 12px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Render shops error:', err);
  }
};

window.openAddShopModal = function() {
  const modal = document.getElementById('shop-modal');
  if (modal) modal.style.display = 'block';
};

window.closeAddShopModal = function() {
  const modal = document.getElementById('shop-modal');
  if (modal) modal.style.display = 'none';
};

window.saveShop = async function() {
  const name = document.getElementById('shop-name')?.value.trim();
  const location = document.getElementById('shop-location')?.value.trim();
  const phone = document.getElementById('shop-phone')?.value.trim();
  const manager = document.getElementById('shop-manager')?.value.trim();
  const email = document.getElementById('shop-email')?.value.trim();
  
  if (!name) {
    alert('Shop name is required');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('businesses')
      .insert([{
        owner_id: STATE.user.id,
        name,
        location: location || '',
        phone: phone || '',
        manager_name: manager || '',
        email: email || ''
      }]);
    
    if (error) throw error;
    
    window.closeAddShopModal();
    document.getElementById('shop-name').value = '';
    document.getElementById('shop-location').value = '';
    document.getElementById('shop-phone').value = '';
    document.getElementById('shop-manager').value = '';
    document.getElementById('shop-email').value = '';
    
    await window.renderShops();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.deleteShop = async function(shopId) {
  if (!confirm('Delete this shop? This cannot be undone.')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('businesses')
      .delete()
      .eq('id', shopId);
    
    if (error) throw error;
    await window.renderShops();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════════════════════════════════════

window.renderEmployees = async function() {
  try {
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId)
      .order('name', { ascending: true });
    
    const list = document.getElementById('employees-list');
    if (!list) return;
    
    if (!stylists || stylists.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No employees yet</div>';
      return;
    }
    
    list.innerHTML = stylists.map(s => {
      const perms = JSON.parse(s.permissions || '{}');
      return `
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:13px;">${s.name}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${s.phone || 'N/A'}</div>
              <div style="font-size:12px;color:var(--txt3);">💼 ${s.role || 'Stylist'}</div>
              
              <!-- PERMISSIONS -->
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
                <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:4px;">Permissions:</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <span style="padding:2px 6px;background:${perms.can_manage_appts ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;">📅 Appts</span>
                  <span style="padding:2px 6px;background:${perms.can_manage_finance ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;">💰 Finance</span>
                  <span style="padding:2px 6px;background:${perms.can_manage_staff ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;">👥 Staff</span>
                  <span style="padding:2px 6px;background:${perms.can_manage_inventory ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;">📦 Inv</span>
                </div>
              </div>
            </div>
            <button onclick="window.deleteEmployee && window.deleteEmployee('${s.id}')" style="padding:6px 12px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Render employees error:', err);
  }
};

window.openAddEmployeeModal = function() {
  const modal = document.getElementById('employee-modal');
  if (modal) modal.style.display = 'block';
};

window.closeAddEmployeeModal = function() {
  const modal = document.getElementById('employee-modal');
  if (modal) modal.style.display = 'none';
};

window.saveEmployee = async function() {
  const name = document.getElementById('emp-name')?.value.trim();
  const phone = document.getElementById('emp-phone')?.value.trim();
  const email = document.getElementById('emp-email')?.value.trim();
  const role = document.getElementById('emp-role')?.value;
  
  const permissions = {
    can_manage_appts: document.getElementById('perm-appts')?.checked || false,
    can_manage_finance: document.getElementById('perm-finance')?.checked || false,
    can_manage_staff: document.getElementById('perm-staff')?.checked || false,
    can_manage_inventory: document.getElementById('perm-inventory')?.checked || false
  };
  
  if (!name) {
    alert('Name is required');
    return;
  }
  
  try {
    const { error } = await STATE.supabase
      .from('salon_stylists')
      .insert([{
        business_id: STATE.businessId,
        name,
        phone: phone || '',
        email: email || '',
        role: role || 'stylist',
        permissions: JSON.stringify(permissions)
      }]);
    
    if (error) throw error;
    
    window.closeAddEmployeeModal();
    document.getElementById('emp-name').value = '';
    document.getElementById('emp-phone').value = '';
    document.getElementById('emp-email').value = '';
    document.getElementById('emp-role').value = 'stylist';
    document.getElementById('perm-appts').checked = false;
    document.getElementById('perm-finance').checked = false;
    document.getElementById('perm-staff').checked = false;
    document.getElementById('perm-inventory').checked = false;
    
    await window.renderEmployees();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

window.deleteEmployee = async function(stylistId) {
  if (!confirm('Delete this employee?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_stylists')
      .delete()
      .eq('id', stylistId);
    
    if (error) throw error;
    await window.renderEmployees();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// EMPTY PANES (all have dedicated functions)
window.loadOtherPanes = async function() {
  // All panes have dedicated load functions
};
