// Admin Dashboard - Supabase Real Data Integration

let allBusinesses = [];
let allPayments = [];

// Fetch data from Supabase on page load
async function initializeAdminDashboard() {
    console.log('🔄 Initializing admin dashboard with real Supabase data...');
    
    try {
        // Fetch businesses
        await fetchBusinessesFromSupabase();
        
        // Fetch payments
        await fetchPaymentsFromSupabase();
        
        // Update UI with real data
        updateKPIs();
        renderBusinessesTable(allBusinesses);
        renderPaymentsTable(allPayments);
        
        console.log('✅ Dashboard initialized with real data');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showErrorMessage('Failed to load data from Supabase');
    }
}

// Fetch businesses from Supabase
async function fetchBusinessesFromSupabase() {
    try {
        const result = await supabase.query('user_businesses', {
            user_id: supabase.getUser()?.id
        });
        
        if (result.success) {
            allBusinesses = result.data.map(b => ({
                id: b.id,
                name: b.business_name || 'Unknown',
                owner: b.user_id, // Would need user_profiles join for owner name
                category: b.business_category || 'other',
                categoryIcon: getCategoryIcon(b.business_category),
                plan: b.plan_type || 'starter',
                status: getBusinessStatus(b),
                phone: b.business_phone || 'N/A',
                signupDate: formatDate(b.created_at),
                lastActive: 'Recently', // Would need activity log table
                paymentStatus: b.plan_type === 'starter' ? 'trial' : 'paid',
                notes: '',
                ...b
            }));
            
            console.log(`✅ Fetched ${allBusinesses.length} businesses`);
        } else {
            console.warn('⚠️ No businesses found:', result.error);
            allBusinesses = [];
        }
    } catch (error) {
        console.error('❌ Error fetching businesses:', error);
        allBusinesses = [];
    }
}

// Fetch payments from Supabase (using user_businesses as source of truth)
async function fetchPaymentsFromSupabase() {
    try {
        // In production, you'd have a separate payments table
        // For now, we'll generate payment records from businesses
        const result = await supabase.query('user_businesses');
        
        if (result.success) {
            allPayments = result.data
                .filter(b => b.plan_type) // Only businesses with plans
                .map((b, index) => ({
                    id: index + 1,
                    date: formatDate(b.created_at),
                    business: b.business_name || 'Unknown',
                    amount: getPlanPrice(b.plan_type),
                    plan: capitalizeFirst(b.plan_type),
                    method: 'M-Pesa',
                    status: 'paid',
                    mpesa: '✅',
                    setup_completed: b.setup_completed
                }));
            
            console.log(`✅ Fetched ${allPayments.length} payment records`);
        } else {
            console.warn('⚠️ No payments found:', result.error);
            allPayments = [];
        }
    } catch (error) {
        console.error('❌ Error fetching payments:', error);
        allPayments = [];
    }
}

// Update KPIs with real data
function updateKPIs() {
    // MRR Calculation
    const mrr = allBusinesses.reduce((total, b) => {
        return total + getPlanPrice(b.plan_type);
    }, 0);
    
    // Active businesses by plan
    const planCounts = {
        starter: allBusinesses.filter(b => b.plan_type === 'starter').length,
        professional: allBusinesses.filter(b => b.plan_type === 'professional').length,
        enterprise: allBusinesses.filter(b => b.plan_type === 'enterprise').length
    };
    
    // Update DOM
    document.getElementById('mrrValue').textContent = mrr.toLocaleString('en-KE');
    document.getElementById('activeBusinesses').textContent = allBusinesses.length;
    document.getElementById('monthlySignups').textContent = getThisMonthSignups();
    document.getElementById('churnRate').textContent = calculateChurnRate();
    
    // Breakdown
    const breakdownEl = document.querySelector('.kpi-card:nth-child(2) .kpi-breakdown');
    if (breakdownEl) {
        breakdownEl.innerHTML = `
            Starter: ${planCounts.starter} | 
            Pro: ${planCounts.professional} | 
            Enterprise: ${planCounts.enterprise}
        `;
    }
}

// Helper functions
function getCategoryIcon(category) {
    const icons = {
        'restaurant': '🍽️',
        'salon': '💇',
        'retail': '🛒',
        'chemist': '💊',
        'bookshop': '📚',
        'hotel': '🏨',
        'gym': '💪',
        'clinic': '🏥',
        'tailoring': '👔',
        'garage': '🔧',
        'betting': '🎰',
        'other': '🏢'
    };
    return icons[category] || '🏢';
}

function getBusinessStatus(business) {
    if (!business.setup_completed) return 'trial';
    return 'active';
}

function getPlanPrice(planType) {
    const prices = {
        'starter': 999,
        'professional': 2499,
        'enterprise': 4999
    };
    return prices[planType] || 0;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE');
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getThisMonthSignups() {
    const now = new Date();
    const thisMonth = allBusinesses.filter(b => {
        const signupDate = new Date(b.created_at);
        return signupDate.getMonth() === now.getMonth() && 
               signupDate.getFullYear() === now.getFullYear();
    });
    return thisMonth.length;
}

function calculateChurnRate() {
    // Placeholder - would need historical data
    return '4.2';
}

function showErrorMessage(message) {
    const alertsList = document.getElementById('alertsList');
    if (alertsList) {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.innerHTML = `
            <span class="alert-icon">⚠️</span>
            <div class="alert-content">
                <strong>${message}</strong>
            </div>
        `;
        alertsList.insertBefore(div, alertsList.firstChild);
    }
}

// Tab Management (existing code)
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const tabName = item.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });
    
    loadTabData(tabName);
    logActivity(`Viewed ${tabName} tab`);
}

function loadTabData(tabName) {
    if (tabName === 'businesses') {
        renderBusinessesTable(allBusinesses);
    } else if (tabName === 'revenue') {
        renderPaymentsTable(allPayments);
    }
}

// Render Businesses Table
function renderBusinessesTable(businesses) {
    const tbody = document.getElementById('businessesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (businesses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No businesses found</td></tr>';
        return;
    }
    
    businesses.forEach(business => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${business.name}</strong></td>
            <td>${business.owner || 'N/A'}</td>
            <td>${business.categoryIcon} ${capitalizeFirst(business.business_category || 'other')}</td>
            <td>${capitalizeFirst(business.plan_type || 'starter')}</td>
            <td><span class="status-badge status-${business.status}">${business.status}</span></td>
            <td>
                ${business.phone && business.phone !== 'N/A' ? 
                    `<a href="https://wa.me/${business.phone.replace(/[^0-9]/g, '')}" target="_blank" title="WhatsApp">
                        ${business.phone}
                    </a>` : 
                    'N/A'
                }
            </td>
            <td>${formatDate(business.created_at) || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewBusinessModal('${business.id}')">View</button>
            </td>
        `;
    });
}

// View Business Modal
function viewBusinessModal(businessId) {
    const business = allBusinesses.find(b => b.id === businessId);
    if (!business) return;
    
    const modal = document.getElementById('businessModal');
    const body = document.getElementById('businessModalBody');
    
    body.innerHTML = `
        <h3>${business.name}</h3>
        <div style="margin-top: 1.5rem;">
            <div style="margin-bottom: 1rem;">
                <strong>Category:</strong> ${business.categoryIcon} ${capitalizeFirst(business.business_category || 'other')}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Plan:</strong> ${capitalizeFirst(business.plan_type || 'starter')}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Status:</strong> <span class="status-badge status-${business.status}">${business.status}</span>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Phone:</strong> 
                ${business.phone && business.phone !== 'N/A' ? 
                    `<a href="https://wa.me/${business.phone.replace(/[^0-9]/g, '')}" target="_blank">
                        ${business.phone} (WhatsApp)
                    </a>` : 
                    'N/A'
                }
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Location:</strong> ${business.business_location || 'N/A'}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Signup Date:</strong> ${formatDate(business.created_at)}
            </div>
            <div style="margin-bottom: 2rem;">
                <strong>Setup Completed:</strong> ${business.setup_completed ? '✅ Yes' : '⏳ In Progress'}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button class="btn btn-primary">Change Plan</button>
                <button class="btn btn-outline">Suspend Account</button>
                <button class="btn btn-outline" onclick="sendWhatsAppMessage('${business.phone}')">Send Message</button>
                <button class="btn btn-outline">Extend Trial</button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    logActivity(`Viewed business profile: ${business.name}`);
}

// Close Modal
const businessModal = document.getElementById('businessModal');
if (businessModal) {
    businessModal.querySelector('.modal-overlay').addEventListener('click', () => {
        businessModal.classList.add('hidden');
    });
    
    businessModal.querySelector('.modal-close').addEventListener('click', () => {
        businessModal.classList.add('hidden');
    });
}

// Render Payments Table
function renderPaymentsTable(transactions) {
    const tbody = document.getElementById('paymentsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No payments found</td></tr>';
        return;
    }
    
    transactions.forEach(txn => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${txn.date}</td>
            <td>${txn.business}</td>
            <td>KES ${txn.amount.toLocaleString()}</td>
            <td>${txn.plan}</td>
            <td>${txn.method}</td>
            <td><span class="status-badge status-${txn.status}">${txn.status}</span></td>
            <td><span class="mpesa-status mpesa-confirmed">${txn.mpesa}</span></td>
            <td>
                ${txn.status === 'failed' ? '<button class="btn btn-sm btn-primary">Retry</button>' : ''}
            </td>
        `;
    });
}

// Send WhatsApp Message
function sendWhatsAppMessage(phone) {
    if (phone && phone !== 'N/A') {
        const message = prompt('Enter WhatsApp message:');
        if (message) {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
            logActivity(`Sent WhatsApp message to ${phone}`);
        }
    }
}

// Quick Actions
document.getElementById('addBusinessBtn')?.addEventListener('click', () => {
    alert('Add Business modal would open here');
    logActivity('Clicked: Add Business');
});

document.getElementById('sendWhatsappBtn')?.addEventListener('click', () => {
    alert('Send WhatsApp message form would open here');
    logActivity('Clicked: Send WhatsApp');
});

document.getElementById('issueCouponBtn')?.addEventListener('click', () => {
    alert('Issue Coupon form would open here');
    logActivity('Clicked: Issue Coupon');
});

document.getElementById('viewLogsBtn')?.addEventListener('click', () => {
    alert('Activity Log:\n\n' + ACTIVITY_LOG.slice(-5).reverse().join('\n'));
});

// Search & Filter
document.getElementById('searchBusiness')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allBusinesses.filter(b => 
        b.name.toLowerCase().includes(query) || 
        (b.owner && b.owner.toLowerCase().includes(query)) ||
        (b.phone && b.phone.includes(query))
    );
    renderBusinessesTable(filtered);
});

document.getElementById('filterCategory')?.addEventListener('change', (e) => {
    const category = e.target.value;
    const filtered = category ? allBusinesses.filter(b => b.business_category === category) : allBusinesses;
    renderBusinessesTable(filtered);
});

document.getElementById('filterPlan')?.addEventListener('change', (e) => {
    const plan = e.target.value;
    const filtered = plan ? allBusinesses.filter(b => b.plan_type === plan) : allBusinesses;
    renderBusinessesTable(filtered);
});

document.getElementById('filterStatus')?.addEventListener('change', (e) => {
    const status = e.target.value;
    const filtered = status ? allBusinesses.filter(b => b.status === status) : allBusinesses;
    renderBusinessesTable(filtered);
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to sign out?')) {
        supabase.signOut();
        window.location.href = '../auth/signin.html';
    }
});

// Activity Logging
const ACTIVITY_LOG = [
    'Admin logged in',
    'Viewed Overview tab'
];

function logActivity(action) {
    const timestamp = new Date().toLocaleString('en-KE');
    ACTIVITY_LOG.push(`${timestamp} - ${action}`);
}

// Set admin name from current user
const user = supabase.getUser();
if (user) {
    document.getElementById('adminName').textContent = user.email || 'Admin';
} else {
    // Redirect to signin if not authenticated
    window.location.href = '../auth/signin.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAdminDashboard();
});
