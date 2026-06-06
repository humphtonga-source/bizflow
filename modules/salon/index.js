// BizFlow Salon Module - Dashboard Complete
async function MODULE_INIT() {
  console.log('Salon module loaded');
  
  // Load dashboard data
  await loadDashboardData();
  
  // Load other empty panes
  loadOtherPanes();
  
  // Setup real-time updates
  setupRealtimeUpdates();
  
  console.log('Salon module ready');
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD - COMPLETE
// ═══════════════════════════════════════════════════════════

async function loadDashboardData() {
  try {
    const dashboard = document.getElementById('pane-dashboard');
    if (!dashboard) return;
    
    // Show loading
    dashboard.innerHTML = `<div style="padding:20px;text-align:center;color:var(--txt3);">Loading dashboard...</div>`;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's appointments
    const { data: todayAppts, error: apptError } = await STATE.supabase
      .from('salon_appointments')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('date', today);
    
    if (apptError) console.error('Appointments error:', apptError);
    
    // Get all staff
    const { data: allStaff, error: staffError } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
    if (staffError) console.error('Staff error:', staffError);
    
    // Get today's finance (income only)
    const { data: todayFinance, error: finError } = await STATE.supabase
      .from('salon_finance')
      .select('*')
      .eq('business_id', STATE.businessId)
      .eq('type', 'income')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);
    
    if (finError) console.error('Finance error:', finError);
    
    // Calculate stats
    const totalAppts = todayAppts?.length || 0;
    const completedAppts = todayAppts?.filter(a => a.status === 'done').length || 0;
    const pendingAppts = todayAppts?.filter(a => a.status === 'pending').length || 0;
    const totalRevenue = todayFinance?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const totalStaff = allStaff?.length || 0;
    
    // Build HTML
    let html = `
      <div style="padding:20px;overflow-y:auto;flex:1;">
        <h2 style="margin-bottom:20px;font-size:20px;font-weight:800;">Dashboard</h2>
        
        <!-- STATS GRID -->
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
        
        <!-- TWO COLUMN LAYOUT -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">
          <!-- TODAY'S APPOINTMENTS -->
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:12px;">📅 Today's Appointments</div>
            <div id="dash-appts-list" style="display:flex;flex-direction:column;gap:8px;">
              ${todayAppts && todayAppts.length > 0 ? 
                todayAppts.map(a => `
                  <div style="background:var(--bg3);padding:10px;border-radius:6px;border-left:3px solid var(--gold);font-size:12px;">
                    <div style="font-weight:700;">${a.client_name}</div>
                    <div style="color:var(--txt3);margin-top:2px;">⏰ ${a.time}</div>
                    <div style="color:var(--txt3);margin-top:2px;">📞 ${a.client_phone || 'N/A'}</div>
                    <div style="margin-top:4px;">
                      <span style="display:inline-block;padding:2px 6px;background:${
                        a.status === 'done' ? 'var(--green)' : 
                        a.status === 'ongoing' ? 'var(--gold)' : 
                        'var(--border)'
                      };color:#000;border-radius:3px;font-size:10px;font-weight:700;">${a.status}</span>
                    </div>
                  </div>
                `).join('')
                : '<div style="color:var(--txt3);text-align:center;padding:20px;font-size:12px;">No appointments today</div>'
              }
            </div>
          </div>
          
          <!-- ACTIVITY & SUMMARY -->
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:12px;">📊 Today's Summary</div>
            
            <div style="background:var(--bg3);padding:10px;border-radius:6px;margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);padding-bottom:8px;margin-bottom:8px;">
                <div style="font-size:12px;color:var(--txt3);">Pending</div>
                <div style="font-weight:700;color:var(--gold);">${pendingAppts}</div>
              </div>
              
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);padding-bottom:8px;margin-bottom:8px;">
                <div style="font-size:12px;color:var(--txt3);">Completed</div>
                <div style="font-weight:700;color:var(--green);">${completedAppts}</div>
              </div>
              
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="font-size:12px;color:var(--txt3);">Total Revenue</div>
                <div style="font-weight:700;color:var(--gold);">KES ${totalRevenue.toLocaleString()}</div>
              </div>
            </div>
            
            <div style="background:var(--bg3);padding:10px;border-radius:6px;font-size:12px;color:var(--txt3);">
              <div>✂️ Salon is operational</div>
              <div style="margin-top:8px;">👥 ${totalStaff} staff members</div>
              <div style="margin-top:8px;">📅 ${totalAppts} appointments today</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    dashboard.innerHTML = html;
    
  } catch (err) {
    console.error('Dashboard error:', err);
    const dashboard = document.getElementById('pane-dashboard');
    if (dashboard) {
      dashboard.innerHTML = `<div style="padding:20px;color:var(--red);">Error loading dashboard: ${err.message}</div>`;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// OTHER PANES - PLACEHOLDER
// ═══════════════════════════════════════════════════════════

function loadOtherPanes() {
  const panes = {
    'pane-appointments': '📅 Appointments',
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
  // Subscribe to appointment changes
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
        loadDashboardData(); // Refresh dashboard
      }
    )
    .subscribe();
  
  // Subscribe to finance changes
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
        loadDashboardData(); // Refresh dashboard
      }
    )
    .subscribe();
}
