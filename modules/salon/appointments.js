// ═══════════════════════════════════════════════════════════════════════════
// BIZFLOW SALON - APPOINTMENTS (ADMIN & EMPLOYEE)
// SwiftStake Method: Modular, Real-time, Simple
// ═══════════════════════════════════════════════════════════════════════════

window.loadAppointments = async function() {
  const appts = document.getElementById('pane-appointments');
  if (!appts) return;
  
  try {
    if (STATE.userRole === 'owner') {
      await loadAdminAppointments(appts);
    } else {
      await loadEmployeeAppointments(appts);
    }
  } catch (err) {
    console.error('Load appointments error:', err);
    appts.innerHTML = `<div style="padding:20px;color:var(--red);">Error: ${err.message}</div>`;
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
