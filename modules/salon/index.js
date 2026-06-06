// BizFlow Salon Module - Appointments Complete
async function MODULE_INIT() {
  console.log('Salon module loaded');
  
  // Load dashboard data
  await loadDashboardData();
  
  // Load appointments
  await loadAppointmentsPage();
  
  // Load other empty panes
  loadOtherPanes();
  
  // Setup real-time updates
  setupRealtimeUpdates();
  
  console.log('Salon module ready');
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

async function loadDashboardData() {
  try {
    const dashboard = document.getElementById('pane-dashboard');
    if (!dashboard) return;
    
    dashboard.innerHTML = `<div style="padding:20px;text-align:center;color:var(--txt3);">Loading dashboard...</div>`;
    
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
    
    const { data: todayFinance } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);
    
    const totalAppts = todayAppts?.length || 0;
    const completedAppts = todayAppts?.filter(a => a.status === 'done').length || 0;
    const pendingAppts = todayAppts?.filter(a => a.status === 'pending').length || 0;
    const totalRevenue = todayFinance?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const totalStaff = allStaff?.length || 0;
    
    let html = `
      <div style="padding:20px;overflow-y:auto;flex:1;">
        <h2 style="margin-bottom:20px;font-size:20px;font-weight:800;">Dashboard</h2>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
          <div style="background:var(--bg2);border:1px solid var(--border);padding:16px;border-radius:8px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:var(--gold);">KES ${totalRevenue.toLocaleString()}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Today's Revenue</div>
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
            <div style="font-size:28px;font-weight:800;color:var(--gold);">${totalStaff}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:6px;">Staff</div>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:12px;">📅 Today's Appointments</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${todayAppts && todayAppts.length > 0 ? 
                todayAppts.map(a => `
                  <div style="background:var(--bg3);padding:10px;border-radius:6px;border-left:3px solid var(--gold);font-size:12px;">
                    <div style="font-weight:700;">${a.client_name}</div>
                    <div style="color:var(--txt3);margin-top:2px;">⏰ ${a.time}</div>
                    <span style="display:inline-block;padding:2px 6px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;margin-top:4px;">${a.status}</span>
                  </div>
                `).join('')
                : '<div style="color:var(--txt3);text-align:center;padding:20px;font-size:12px;">No appointments today</div>'
              }
            </div>
          </div>
          
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:12px;">📊 Today's Summary</div>
            <div style="background:var(--bg3);padding:10px;border-radius:6px;">
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:8px;margin-bottom:8px;">
                <div style="font-size:12px;color:var(--txt3);">Pending</div>
                <div style="font-weight:700;color:var(--gold);">${pendingAppts}</div>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:8px;margin-bottom:8px;">
                <div style="font-size:12px;color:var(--txt3);">Completed</div>
                <div style="font-weight:700;color:var(--green);">${completedAppts}</div>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <div style="font-size:12px;color:var(--txt3);">Total Revenue</div>
                <div style="font-weight:700;color:var(--gold);">KES ${totalRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    dashboard.innerHTML = html;
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// APPOINTMENTS - COMPLETE
// ═══════════════════════════════════════════════════════════

async function loadAppointmentsPage() {
  try {
    const appts = document.getElementById('pane-appointments');
    if (!appts) return;
    
    appts.innerHTML = `
      <div style="padding:20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2 style="font-size:20px;font-weight:800;">Appointments</h2>
          ${STATE.userRole === 'owner' ? '<button style="padding:10px 16px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;" onclick="openAddApptModal()">+ New</button>' : ''}
        </div>
        
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
          <input type="date" id="appt-filter-date" style="padding:10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;outline:none;" onchange="filterAppointments()" placeholder="Filter by date">
          <select id="appt-filter-status" style="padding:10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:13px;outline:none;cursor:pointer;" onchange="filterAppointments()">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div id="appt-modal" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="font-weight:700;margin-bottom:12px;">New Appointment</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <input id="appt-client-name" placeholder="Client name" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;outline:none;">
            <input id="appt-client-phone" placeholder="Phone" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;outline:none;">
            <input id="appt-date" type="date" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;outline:none;">
            <input id="appt-time" type="time" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;outline:none;">
            <input id="appt-notes" placeholder="Notes" style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--txt);font-size:12px;outline:none;grid-column:1/-1;">
            <button style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;" onclick="saveAppointment()">Save</button>
            <button style="padding:10px;background:var(--border);color:var(--txt);border:none;border-radius:6px;font-weight:700;cursor:pointer;" onclick="closeAddApptModal()">Cancel</button>
          </div>
        </div>
        
        <div id="appt-list" style="flex:1;overflow-y:auto;"></div>
      </div>
    `;
    
    await renderAppointments();
  } catch (err) {
    console.error('Appointments page error:', err);
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
    
    const { data: appointments } = await query.order('date', { ascending: false }).order('time', { ascending: false });
    
    const html = appointments && appointments.length > 0 ? appointments.map(a => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div style="flex:1;">
            <div style="font-weight:700;font-size:13px;">${a.client_name}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${a.client_phone || 'N/A'}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:2px;">📅 ${a.date} at ${a.time}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:2px;">📝 ${a.notes || 'No notes'}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
            <span style="padding:4px 10px;background:${a.status === 'done' ? 'var(--green)' : a.status === 'ongoing' ? 'var(--gold)' : 'var(--border)'};color:#000;border-radius:4px;font-size:11px;font-weight:700;">${a.status}</span>
            ${STATE.userRole === 'owner' ? `
              <select style="padding:4px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--txt);font-size:11px;cursor:pointer;" onchange="updateApptStatus('${a.id}', this.value)">
                <option value="">Change status</option>
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="done">Done</option>
              </select>
              <button style="padding:4px 8px;background:var(--red);color:#fff;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;" onclick="deleteAppointment('${a.id}')">Delete</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('') : '<div style="color:var(--txt3);text-align:center;padding:40px;">No appointments found</div>';
    
    const list = document.getElementById('appt-list');
    if (list) list.innerHTML = html;
  } catch (err) {
    console.error('Render appointments error:', err);
  }
}

function openAddApptModal() {
  document.getElementById('appt-modal').style.display = 'block';
  document.getElementById('appt-date').valueAsDate = new Date();
}

function closeAddApptModal() {
  document.getElementById('appt-modal').style.display = 'none';
}

async function saveAppointment() {
  const name = document.getElementById('appt-client-name').value.trim();
  const phone = document.getElementById('appt-client-phone').value.trim();
  const date = document.getElementById('appt-date').value;
  const time = document.getElementById('appt-time').value;
  const notes = document.getElementById('appt-notes').value.trim();
  
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
        client_phone: phone,
        date,
        time,
        notes,
        status: 'pending',
        created_at: new Date()
      }]);
    
    if (error) throw error;
    
    closeAddApptModal();
    document.getElementById('appt-client-name').value = '';
    document.getElementById('appt-client-phone').value = '';
    document.getElementById('appt-notes').value = '';
    
    await renderAppointments();
    await loadDashboardData();
    alert('Appointment added!');
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
    await loadDashboardData();
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
    await loadDashboardData();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

function filterAppointments() {
  renderAppointments();
}

// ═══════════════════════════════════════════════════════════
// OTHER PANES - PLACEHOLDER
// ═══════════════════════════════════════════════════════════

function loadOtherPanes() {
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
          <h2 style="margin-bottom:20px;font-size:20px;font-weight:800;">${title}</h2>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:20px;text-align:center;color:var(--txt3);">
            Coming soon... Features will be added here.
          </div>
        </div>
      `;
    }
  });
}

// ═══════════════════════════════════════════════════════════
// REAL-TIME UPDATES
// ═══════════════════════════════════════════════════════════

function setupRealtimeUpdates() {
  STATE.supabase
    .channel(`salon-appointments:${STATE.businessId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'salon_appointments',
        filter: `business_id=eq.${STATE.businessId}`
      },
      (payload) => {
        console.log('Appointment updated:', payload);
        renderAppointments();
        loadDashboardData();
      }
    )
    .subscribe();
  
  STATE.supabase
    .channel(`salon-finance:${STATE.businessId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'salon_finance',
        filter: `business_id=eq.${STATE.businessId}`
      },
      (payload) => {
        console.log('Finance updated:', payload);
        loadDashboardData();
      }
    )
    .subscribe();
}
