// BizFlow Salon Module - Simple & Tested
async function MODULE_INIT() {
  console.log('Salon module loaded');
  
  // Load all data
  await loadDashboard();
  await loadAppointments();
  await loadOtherPanes();
  
  // Real-time updates
  setupRealtimeUpdates();
  
  console.log('Salon module ready');
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

async function loadDashboard() {
  try {
    const dashboard = document.getElementById('pane-dashboard');
    if (!dashboard) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayAppts } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    const { data: allStaff } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    const totalAppts = todayAppts?.length || 0;
    const completedAppts = todayAppts?.filter(a => a.status === 'done').length || 0;
    const totalStaff = allStaff?.length || 0;
    
    dashboard.innerHTML = `
      <div style="padding:20px;overflow-y:auto;flex:1;">
        <h2 style="margin-bottom:20px;">Dashboard</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
          <div style="background:var(--bg2);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:var(--gold);">${totalAppts}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Today</div>
          </div>
          <div style="background:var(--bg2);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:var(--gold);">${completedAppts}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Completed</div>
          </div>
          <div style="background:var(--bg2);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:var(--gold);">${totalStaff}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Staff</div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════

async function loadAppointments() {
  try {
    const appts = document.getElementById('pane-appointments');
    if (!appts) {
      console.log('pane-appointments not found');
      return;
    }
    
    console.log('Loading appointments page');
    
    appts.innerHTML = `
      <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h2 style="font-size:20px;font-weight:800;margin:0;">Appointments</h2>
          ${STATE.userRole === 'owner' ? '<button onclick="openAddApptModal()" style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">+ New</button>' : ''}
        </div>
        
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <input type="date" id="appt-filter-date" onchange="filterAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;outline:none;">
          <select id="appt-filter-status" onchange="filterAppointments()" style="padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;outline:none;">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div id="appt-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:700;margin-bottom:12px;">New Appointment</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <input id="appt-client-name" placeholder="Client name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="appt-client-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="appt-date" type="date" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="appt-time" type="time" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;">
            <input id="appt-notes" placeholder="Notes (optional)" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;grid-column:1/-1;">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button onclick="saveAppointment()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Save</button>
            <button onclick="closeAddApptModal()" style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;">Cancel</button>
          </div>
        </div>
        
        <div id="appt-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
          <div style="color:var(--txt3);text-align:center;padding:40px;">Loading...</div>
        </div>
      </div>
    `;
    
    console.log('Appointments HTML set, now rendering');
    await renderAppointments();
  } catch (err) {
    console.error('Load appointments error:', err);
  }
}

async function renderAppointments() {
  try {
    const filterDate = document.getElementById('appt-filter-date')?.value || '';
    const filterStatus = document.getElementById('appt-filter-status')?.value || '';
    
    let query = STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    if (filterDate) query = query.eq('date', filterDate);
    if (filterStatus) query = query.eq('status', filterStatus);
    
    const { data: appointments, error } = await query.order('date', { ascending: false });
    
    if (error) {
      console.error('Query error:', error);
      throw error;
    }
    
    console.log('Appointments loaded:', appointments);
    
    const list = document.getElementById('appt-list');
    if (!list) return;
    
    if (!appointments || appointments.length === 0) {
      list.innerHTML = '<div style="color:var(--txt3);text-align:center;padding:40px;">No appointments yet</div>';
      return;
    }
    
    const html = appointments.map(a => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
          <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;">${a.client_name}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${a.client_phone || 'N/A'}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:2px;">📅 ${a.date} at ${a.time}</div>
            ${a.notes ? `<div style="font-size:12px;color:var(--txt3);margin-top:2px;">📝 ${a.notes}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
            <span style="padding:4px 10px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:4px;font-size:11px;font-weight:700;">${a.status}</span>
            ${STATE.userRole === 'owner' ? `
              <select onchange="updateApptStatus('${a.id}', this.value)" style="padding:4px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--txt);font-size:11px;cursor:pointer;">
                <option value="">Status</option>
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="done">Done</option>
              </select>
              <button onclick="deleteAppointment('${a.id}')" style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;">Delete</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
    
    list.innerHTML = html;
  } catch (err) {
    console.error('Render appointments error:', err);
    const list = document.getElementById('appt-list');
    if (list) list.innerHTML = `<div style="color:var(--red);">Error: ${err.message}</div>`;
  }
}

function openAddApptModal() {
  const modal = document.getElementById('appt-modal');
  if (modal) {
    modal.style.display = 'block';
    document.getElementById('appt-date').valueAsDate = new Date();
  }
}

function closeAddApptModal() {
  const modal = document.getElementById('appt-modal');
  if (modal) modal.style.display = 'none';
}

async function saveAppointment() {
  const name = document.getElementById('appt-client-name')?.value.trim();
  const phone = document.getElementById('appt-client-phone')?.value.trim();
  const date = document.getElementById('appt-date')?.value;
  const time = document.getElementById('appt-time')?.value;
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
        client_name: name,
        client_phone: phone || '',
        date,
        time,
        notes: notes || '',
        status: 'pending'
      }]);
    
    if (error) throw error;
    
    closeAddApptModal();
    document.getElementById('appt-client-name').value = '';
    document.getElementById('appt-client-phone').value = '';
    document.getElementById('appt-notes').value = '';
    
    await renderAppointments();
    await loadDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function updateApptStatus(apptId, status) {
  if (!status) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .update({ status })
      .eq('id', apptId);
    
    if (error) throw error;
    await renderAppointments();
    await loadDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function deleteAppointment(apptId) {
  if (!confirm('Delete this appointment?')) return;
  
  try {
    const { error } = await STATE.supabase
      .from('salon_appointments')
      .delete()
      .eq('id', apptId);
    
    if (error) throw error;
    await renderAppointments();
    await loadDashboard();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function filterAppointments() {
  renderAppointments();
}

// ═══════════════════════════════════════════════════════════
// OTHER PANES
// ═══════════════════════════════════════════════════════════

async function loadOtherPanes() {
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
    if (el) {
      el.innerHTML = `
        <div style="padding:20px;overflow-y:auto;flex:1;">
          <h2 style="font-size:20px;font-weight:800;margin-bottom:20px;">${title}</h2>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;color:var(--txt3);">
            Coming soon...
          </div>
        </div>
      `;
    }
  });
}

// ═══════════════════════════════════════════════════════════
// REAL-TIME
// ═══════════════════════════════════════════════════════════

function setupRealtimeUpdates() {
  STATE.supabase
    .channel(`salon:${STATE.businessId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'salon_appointments' }, () => {
      renderAppointments();
      loadDashboard();
    })
    .subscribe();
}
