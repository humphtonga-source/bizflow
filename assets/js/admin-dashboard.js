// Admin Dashboard - Complete Functionality

// Sample Data (would come from Supabase in production)
const SAMPLE_BUSINESSES = [
    {
        id: 1,
        name: "Mama Njeri's Restaurant",
        owner: "Njeri Kiprotich",
        category: "restaurant",
        categoryIcon: "🍽️",
        plan: "professional",
        status: "active",
        phone: "+254712345678",
        signupDate: "2026-04-15",
        lastActive: "2026-06-19",
        paymentStatus: "paid",
        notes: "Good customer, pays on time"
    },
    {
        id: 2,
        name: "Beautiful Styles Salon",
        owner: "Grace Kipchoge",
        category: "salon",
        categoryIcon: "💇",
        plan: "starter",
        status: "trial",
        phone: "+254798765432",
        signupDate: "2026-06-05",
        lastActive: "2026-06-18",
        paymentStatus: "trial",
        notes: "Trial expiring in 5 days"
    },
    {
        id: 3,
        name: "Tech Retail Store",
        owner: "John Kamau",
        category: "retail",
        categoryIcon: "🛒",
        plan: "enterprise",
        status: "active",
        phone: "+254701234567",
        signupDate: "2026-02-10",
        lastActive: "2026-06-19",
        paymentStatus: "paid",
        notes: "Multi-location setup in progress"
    },
    {
        id: 4,
        name: "City Chemist",
        owner: "Dr. Omondi",
        category: "chemist",
        categoryIcon: "💊",
        plan: "professional",
        status: "active",
        phone: "+254723456789",
        signupDate: "2026-03-20",
        lastActive: "2026-06-15",
        paymentStatus: "overdue",
        notes: "Payment overdue by 3 days"
    }
];

const SAMPLE_TRANSACTIONS = [
    { id: 1, date: "2026-06-19", business: "Mama Njeri's Restaurant", amount: 2499, plan: "Professional", method: "M-Pesa", status: "paid", mpesa: "✅" },
    { id: 2, date: "2026-06-18", business: "Tech Retail Store", amount: 4999, plan: "Enterprise", method: "M-Pesa", status: "paid", mpesa: "✅" },
    { id: 3, date: "2026-06-17", business: "City Chemist", amount: 2499, plan: "Professional", method: "M-Pesa", status: "failed", mpesa: "❌" },
    { id: 4, date: "2026-06-15", business: "Beautiful Styles Salon", amount: 999, plan: "Starter", method: "M-Pesa", status: "pending", mpesa: "⏳" }
];

const NOTIFICATIONS = [
    "🔔 New signup: Mama Njeri's Restaurant",
    "💰 Payment received: KES 2,499 from Tech Retail",
    "⚠️ Payment failed: City Chemist - KES 2,499",
    "⏰ Trial expiring in 5 days: Beautiful Styles Salon"
];

const ALERTS = [
    { type: "warning", icon: "⏰", title: "3 Trials Expiring Today", action: "Follow Up" },
    { type: "error", icon: "❌", title: "2 Failed Payments", action: "Retry Payment" },
    { type: "info", icon: "📲", title: "5 Inactive (30+ days)", action: "Re-engage" }
];

// Tab Management
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const tabName = item.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update menu active state
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });

    // Load data for the tab
    loadTabData(tabName);

    // Log activity
    logActivity(`Viewed ${tabName} tab`);
}

function loadTabData(tabName) {
    if (tabName === 'businesses') {
        renderBusinessesTable(SAMPLE_BUSINESSES);
    } else if (tabName === 'revenue') {
        renderPaymentsTable(SAMPLE_TRANSACTIONS);
    }
}

// Notification Center
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');

notificationBtn.addEventListener('click', () => {
    notificationDropdown.classList.toggle('hidden');
});

// Populate notifications
const notificationsList = document.getElementById('notificationsList');
NOTIFICATIONS.forEach(notif => {
    const div = document.createElement('div');
    div.className = 'notification-item';
    div.textContent = notif;
    notificationsList.appendChild(div);
});

// Populate alerts
const alertsList = document.getElementById('alertsList');
ALERTS.forEach(alert => {
    const div = document.createElement('div');
    div.className = 'alert-item';
    div.innerHTML = `
        <span class="alert-icon">${alert.icon}</span>
        <div class="alert-content">
            <strong>${alert.title}</strong>
        </div>
        <button class="btn btn-sm btn-primary" style="margin-left: auto;">${alert.action}</button>
    `;
    alertsList.appendChild(div);
});

// Render Businesses Table
function renderBusinessesTable(businesses) {
    const tbody = document.getElementById('businessesTableBody');
    tbody.innerHTML = '';

    businesses.forEach(business => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><strong>${business.name}</strong></td>
            <td>${business.owner}</td>
            <td>${business.categoryIcon} ${business.category}</td>
            <td>${business.plan}</td>
            <td><span class="status-badge status-${business.status}">${business.status}</span></td>
            <td>
                <a href="https://wa.me/${business.phone.replace('+', '')}" target="_blank" title="WhatsApp">
                    ${business.phone}
                </a>
            </td>
            <td>${business.lastActive}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewBusinessModal(${business.id})">View</button>
            </td>
        `;
    });
}

// View Business Modal
function viewBusinessModal(businessId) {
    const business = SAMPLE_BUSINESSES.find(b => b.id === businessId);
    if (!business) return;

    const modal = document.getElementById('businessModal');
    const body = document.getElementById('businessModalBody');

    body.innerHTML = `
        <h3>${business.name}</h3>
        <div style="margin-top: 1.5rem;">
            <div style="margin-bottom: 1rem;">
                <strong>Owner:</strong> ${business.owner}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Phone:</strong> 
                <a href="https://wa.me/${business.phone.replace('+', '')}" target="_blank">
                    ${business.phone} (WhatsApp)
                </a>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Plan:</strong> ${business.plan}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Status:</strong> <span class="status-badge status-${business.status}">${business.status}</span>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Payment:</strong> ${business.paymentStatus}
            </div>
            <div style="margin-bottom: 2rem;">
                <strong>Notes:</strong> ${business.notes}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button class="btn btn-primary">Change Plan</button>
                <button class="btn btn-outline">Suspend Account</button>
                <button class="btn btn-outline">Send Message</button>
                <button class="btn btn-outline">Extend Trial</button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    logActivity(`Viewed business profile: ${business.name}`);
}

// Close Modal
document.getElementById('businessModal').querySelector('.modal-overlay').addEventListener('click', () => {
    document.getElementById('businessModal').classList.add('hidden');
});

document.getElementById('businessModal').querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('businessModal').classList.add('hidden');
});

// Render Payments Table
function renderPaymentsTable(transactions) {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';

    transactions.forEach(txn => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${txn.date}</td>
            <td>${txn.business}</td>
            <td>KES ${txn.amount.toLocaleString()}</td>
            <td>${txn.plan}</td>
            <td>${txn.method}</td>
            <td><span class="status-badge status-${txn.status}">${txn.status}</span></td>
            <td><span class="mpesa-status mpesa-${txn.mpesa === '✅' ? 'confirmed' : txn.mpesa === '❌' ? 'failed' : 'pending'}">${txn.mpesa}</span></td>
            <td>
                ${txn.status === 'failed' ? '<button class="btn btn-sm btn-primary">Retry</button>' : ''}
            </td>
        `;
    });
}

// Quick Actions
document.getElementById('addBusinessBtn').addEventListener('click', () => {
    alert('Add Business modal would open here');
    logActivity('Clicked: Add Business');
});

document.getElementById('sendWhatsappBtn').addEventListener('click', () => {
    alert('Send WhatsApp message form would open here');
    logActivity('Clicked: Send WhatsApp');
});

document.getElementById('issueCouponBtn').addEventListener('click', () => {
    alert('Issue Coupon form would open here');
    logActivity('Clicked: Issue Coupon');
});

document.getElementById('viewLogsBtn').addEventListener('click', () => {
    alert('Activity Log: ' + ACTIVITY_LOG.slice(-5).reverse().join('\n'));
});

// Search & Filter
document.getElementById('searchBusiness').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = SAMPLE_BUSINESSES.filter(b => 
        b.name.toLowerCase().includes(query) || 
        b.owner.toLowerCase().includes(query) ||
        b.phone.includes(query)
    );
    renderBusinessesTable(filtered);
});

document.getElementById('filterCategory').addEventListener('change', (e) => {
    const category = e.target.value;
    const filtered = category ? SAMPLE_BUSINESSES.filter(b => b.category === category) : SAMPLE_BUSINESSES;
    renderBusinessesTable(filtered);
});

document.getElementById('filterPlan').addEventListener('change', (e) => {
    const plan = e.target.value;
    const filtered = plan ? SAMPLE_BUSINESSES.filter(b => b.plan === plan) : SAMPLE_BUSINESSES;
    renderBusinessesTable(filtered);
});

document.getElementById('filterStatus').addEventListener('change', (e) => {
    const status = e.target.value;
    const filtered = status ? SAMPLE_BUSINESSES.filter(b => b.status === status) : SAMPLE_BUSINESSES;
    renderBusinessesTable(filtered);
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to sign out?')) {
        supabase.signOut();
        window.location.href = '../auth/signin.html';
    }
});

// Activity Log
const ACTIVITY_LOG = [
    '2026-06-19 14:30 - Admin logged in',
    '2026-06-19 14:31 - Viewed Overview tab',
    '2026-06-19 14:35 - Viewed Businesses tab'
];

function logActivity(action) {
    const timestamp = new Date().toLocaleString('en-KE');
    ACTIVITY_LOG.push(`${timestamp} - ${action}`);
}

// Populate admin name
document.getElementById('adminName').textContent = supabase.getUser()?.email || 'Admin';

// Initialize
renderBusinessesTable(SAMPLE_BUSINESSES);
renderPaymentsTable(SAMPLE_TRANSACTIONS);
