// BIZFLOW SALON MODULE - CONSOLIDATED
// Includes: Dashboard + Appointments + Staff

async function MODULE_INIT() {
  console.log('[Salon] module initializing...');
  try {
    await initSalonDashboard();
    setupSalonMenu();
    await loadAppointments();
    console.log('[Salon] module ready');
  } catch (err) {
    console.error('[Salon] init error:', err);
  }
}

// DASHBOARD
window.initSalonDashboard = async function() {
  try {
    const container = document.getElementById('pane-dashboard');
    if (!container) return;
    
    const { data: appts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const todayAppts = appts ? appts.filter(a => a.date === new Date().toISOString().split('T')[0]).length : 0;
    
    container.innerHTML = `
      <div style="padding:20px;">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:20px;">Salon Dashboard</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:var(--gold);">${todayAppts}</div>
            <div style="font-size:13px;color:var(--txt3);margin-top:8px;">Today Appointments</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:var(--gold);">KES 0</div>
            <div style="font-size:13px;color:var(--txt3);margin-top:8px;">Today Revenue</div>
          </div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:var(--gold);">${stylists ? stylists.length : 0}</div>
            <div style="font-size:13px;color:var(--txt3);margin-top:8px;">Staff Members</div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Dashboard error:', err);
  }
};

// MENU SETUP
window.setupSalonMenu = function() {
  const navMenu = document.getElementById('nav-menu');
  if (!navMenu) return;
  
  const items = [
    { name: 'Dashboard', id: 'dashboard', icon: '📊' },
    { name: 'Appointments', id: 'appointments', icon: '📅' },
    { name: 'Staff', id: 'staff', icon: '👥' },
    { name: 'Finance', id: 'finance', icon: '💰' },
    { name: 'Settings', id: 'settings', icon: '⚙️' }
  ];
  
  navMenu.innerHTML = items.map(item => `
    <button onclick="window.selectSalonPane('${item.id}')" 
      style="width:100%;text-align:left;padding:12px 16px;background:none;border:none;color:var(--text);cursor:pointer;font-size:14px;transition:all 0.2s;"
      onmouseover="this.style.background='var(--bg3)'"
      onmouseout="this.style.background='none'">
      ${item.icon} ${item.name}
    </button>
  `).join('');
};

window.selectSalonPane = async function(paneId) {
  document.querySelectorAll('[id^="pane-"]').forEach(pane => pane.style.display = 'none');
  const pane = document.getElementById('pane-' + paneId);
  if (pane) {
    pane.style.display = 'block';
    if (paneId === 'dashboard') await initSalonDashboard();
    else if (paneId === 'appointments') await loadAppointments();
    else if (paneId === 'staff') await loadStaff();
  }
};

// APPOINTMENTS (from appointments.js)
window.loadAppointments = async function() {
  const appts = document.getElementById('pane-appointments');
  if (!appts) return;
  try {
    if (STATE.userRole === 'owner') await loadAdminAppointments(appts);
    else await loadEmployeeAppointments(appts);
  } catch (err) {
    appts.innerHTML = '<div style="padding:20px;color:var(--red);">Error: ' + err.message + '</div>';
  }
};

async function loadAdminAppointments(container) {
  container.innerHTML = '<div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;"><div style="display:flex;justify-content:space-between;align-items:center;"><h2 style="font-size:20px;font-weight:800;margin:0;">Appointments</h2><button onclick="window.openAddApptModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ New</button></div><div style="display:flex;gap:8px;flex-wrap:wrap;"><input type="date" id="appt-filter-date" onchange="window.filterAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;"><select id="appt-filter-status" onchange="window.filterAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;"><option value="">All Status</option><option value="pending">Pending</option><option value="ongoing">Ongoing</option><option value="done">Done</option></select></div><div id="appt-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;"><div style="font-weight:700;margin-bottom:12px;">New Appointment</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;"><input id="appt-client-name" placeholder="Client name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><input id="appt-client-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><input id="appt-date" type="date" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><input id="appt-time" type="time" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><select id="appt-stylist" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><option value="">Select Stylist</option></select><input id="appt-style" placeholder="Style/Service" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><input id="appt-notes" placeholder="Notes" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;grid-column:1/-1;"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><button onclick="window.saveAppointment()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button><button onclick="window.closeAddApptModal()" style="padding:10px;background:var(--border);color:var(--text);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button></div></div><div id="appt-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div></div>';
  const stylists = await STATE.supabase.from('salon_stylists').select('id,name').eq('business_id', STATE.businessId);
  if (stylists.data) stylists.data.forEach(s => { const opt = document.createElement('option'); opt.value = s.id; opt.text = s.name; document.getElementById('appt-stylist').appendChild(opt); });
  await window.renderAdminAppointments();
}

window.renderAdminAppointments = async function() {
  const filterDate = document.getElementById('appt-filter-date')?.value || '';
  const filterStatus = document.getElementById('appt-filter-status')?.value || '';
  let query = STATE.supabase.from('salon_appointments').select('*,salon_stylists(name)').eq('business_id', STATE.businessId);
  if (filterDate) query = query.eq('date', filterDate);
  if (filterStatus) query = query.eq('status', filterStatus);
  const appts = await query.order('date', { ascending: false });
  const list = document.getElementById('appt-list');
  if (!list) return;
  if (!appts.data || appts.data.length === 0) { list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No appointments</div>'; return; }
  const html = appts.data.map(a => '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;"><div style="display:flex;justify-content:space-between;align-items:start;gap:12px;"><div style="flex:1;"><div style="font-weight:700;font-size:13px;">' + a.client_name + '</div><div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ' + (a.client_phone || 'N/A') + '</div><div style="font-size:12px;color:var(--txt3);margin-top:2px;">📅 ' + a.date + ' at ' + a.time + '</div><div style="font-size:12px;color:var(--txt3);margin-top:2px;">✂️ ' + (a.salon_stylists?.name || 'Unassigned') + '</div>' + (a.style ? '<div style="font-size:12px;color:var(--txt3);margin-top:2px;">💅 ' + a.style + '</div>' : '') + '</div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;"><span style="padding:4px 10px;background:' + (a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)') + ';color:#000;border-radius:4px;font-size:11px;font-weight:700;">' + a.status + '</span><button onclick="window.deleteAppointment && window.deleteAppointment(\'' + a.id + '\')" style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;">Delete</button></div></div></div>').join('');
  list.innerHTML = html;
};

window.openAddApptModal = function() { const m = document.getElementById('appt-modal'); if (m) { m.style.display = 'block'; document.getElementById('appt-date').valueAsDate = new Date(); } };
window.closeAddApptModal = function() { const m = document.getElementById('appt-modal'); if (m) m.style.display = 'none'; };
window.saveAppointment = async function() {
  const name = document.getElementById('appt-client-name')?.value.trim();
  const phone = document.getElementById('appt-client-phone')?.value.trim();
  const date = document.getElementById('appt-date')?.value;
  const time = document.getElementById('appt-time')?.value;
  if (!name || !date || !time) { alert('Fill required fields'); return; }
  try {
    await STATE.supabase.from('salon_appointments').insert([{ business_id: STATE.businessId, client_name: name, client_phone: phone || '', date, time, status: 'pending' }]);
    window.closeAddApptModal();
    document.getElementById('appt-client-name').value = '';
    document.getElementById('appt-client-phone').value = '';
    await window.renderAdminAppointments();
    await initSalonDashboard();
  } catch (err) { alert('Error: ' + err.message); }
};
window.deleteAppointment = async function(id) {
  if (!confirm('Delete?')) return;
  try {
    await STATE.supabase.from('salon_appointments').delete().eq('id', id);
    await window.renderAdminAppointments();
    await initSalonDashboard();
  } catch (err) { alert('Error: ' + err.message); }
};
window.filterAppointments = function() { window.renderAdminAppointments(); };

async function loadEmployeeAppointments(container) {
  container.innerHTML = '<div style="padding:20px;color:var(--txt3);">Employee view coming soon</div>';
}

// STAFF (from staff.js)
window.loadStaff = async function() {
  const staff = document.getElementById('pane-staff');
  if (!staff) return;
  if (STATE.userRole !== 'owner') { staff.innerHTML = '<div style="padding:20px;color:var(--red);">Access denied</div>'; return; }
  try {
    staff.innerHTML = '<div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;"><div style="display:flex;justify-content:space-between;align-items:center;"><h2 style="font-size:20px;font-weight:800;margin:0;">Staff</h2><button onclick="window.openAddStaffModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ Add</button></div><div id="staff-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;"><div style="font-weight:700;margin-bottom:12px;">Add Staff</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;"><input id="staff-name" placeholder="Name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><input id="staff-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><select id="staff-role" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;"><option value="stylist">Stylist</option><option value="manager">Manager</option></select></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><button onclick="window.saveStaff()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button><button onclick="window.closeAddStaffModal()" style="padding:10px;background:var(--border);color:var(--text);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button></div></div><div id="staff-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;"></div></div>';
    await window.renderStaffList();
  } catch (err) { staff.innerHTML = '<div style="padding:20px;color:var(--red);">Error: ' + err.message + '</div>'; }
};

window.renderStaffList = async function() {
  const stylists = await STATE.supabase.from('salon_stylists').select('*').eq('business_id', STATE.businessId);
  const list = document.getElementById('staff-list');
  if (!list) return;
  if (!stylists.data || stylists.data.length === 0) { list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No staff</div>'; return; }
  const html = stylists.data.map(s => '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;"><div style="font-weight:700;font-size:13px;">' + s.name + '</div><div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ' + (s.phone || 'N/A') + '</div><div style="font-size:12px;color:var(--txt3);margin-top:2px;">' + (s.role || 'Stylist') + '</div><button onclick="window.deleteStaff && window.deleteStaff(\'' + s.id + '\')" style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;margin-top:8px;">Delete</button></div>').join('');
  list.innerHTML = html;
};

window.openAddStaffModal = function() { const m = document.getElementById('staff-modal'); if (m) m.style.display = 'block'; };
window.closeAddStaffModal = function() { const m = document.getElementById('staff-modal'); if (m) m.style.display = 'none'; };
window.saveStaff = async function() {
  const name = document.getElementById('staff-name')?.value.trim();
  const phone = document.getElementById('staff-phone')?.value.trim();
  const role = document.getElementById('staff-role')?.value;
  if (!name) { alert('Enter name'); return; }
  try {
    await STATE.supabase.from('salon_stylists').insert([{ business_id: STATE.businessId, name, phone: phone || '', role: role || 'stylist' }]);
    window.closeAddStaffModal();
    document.getElementById('staff-name').value = '';
    document.getElementById('staff-phone').value = '';
    await window.renderStaffList();
  } catch (err) { alert('Error: ' + err.message); }
};
window.deleteStaff = async function(id) {
  if (!confirm('Delete?')) return;
  try {
    await STATE.supabase.from('salon_stylists').delete().eq('id', id);
    await window.renderStaffList();
  } catch (err) { alert('Error: ' + err.message); }
};

// STUBS
window.loadFinance = async function() { console.log('Finance coming soon'); };
window.loadSettings = async function() { console.log('Settings coming soon'); };
window.loadOtherPanes = async function() { };
