// ═══════════════════════════════════════════════════════════════════════════
// BIZFLOW SALON - STAFF MANAGEMENT (ADMIN ONLY)
// SwiftStake Method: Modular, Real-time, Simple
// ═══════════════════════════════════════════════════════════════════════════

window.loadStaff = async function() {
  const staff = document.getElementById('pane-staff');
  if (!staff) return;
  
  // Admin only
  if (STATE.userRole !== 'owner') {
    staff.innerHTML = '<div style="padding:20px;color:var(--red);">❌ Access denied. Admin only.</div>';
    return;
  }
  
  try {
    await renderStaffPage(staff);
  } catch (err) {
    console.error('Load staff error:', err);
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
    const { data: stylists } = await STATE.supabase
      .from('salon_stylists')
      .select('*')
      .eq('business_id', STATE.businessId);
    
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
    
    // Build HTML grouped by shop (or just list if single shop)
    const staffHtml = stylists.map(s => {
      const agreement = agreementMap[s.id];
      const agreementText = agreement ? 
        `${agreement.agreement_type}${agreement.commission_percent ? ` (${agreement.commission_percent}%)` : ''}${agreement.monthly_salary ? ` (KES ${agreement.monthly_salary})` : ''}` 
        : 'No agreement';
      
      const permissions = JSON.parse(s.permissions || '{}');
      
      return `
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:13px;">${s.name}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:4px;">📞 ${s.phone || 'N/A'}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:2px;">✂️ ${s.role || 'Stylist'}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:2px;">💼 ${agreementText}</div>
              
              <!-- PERMISSIONS -->
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
                <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;">Permissions:</div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                  <span style="padding:2px 6px;background:${permissions.can_manage_appts ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;">📅 Appointments</span>
                  <span style="padding:2px 6px;background:${permissions.can_manage_finance ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;">💰 Finance</span>
                  <span style="padding:2px 6px;background:${permissions.can_manage_staff ? 'var(--green)' : 'var(--border)'};color:#000;border-radius:3px;font-size:10px;font-weight:700;">👥 Staff</span>
                </div>
              </div>
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
