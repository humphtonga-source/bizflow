// Dashboard - Business Selection Page (Enhanced)

const BUSINESS_CATEGORIES = [
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️', description: 'Cafes, restaurants & bars' },
    { id: 'betting', name: 'Betting Shop', icon: '🎰', description: 'Sports betting & gaming' },
    { id: 'chemist', name: 'Chemist', icon: '💊', description: 'Pharmacy & medicine shop' },
    { id: 'bookshop', name: 'Bookshop', icon: '📚', description: 'Books, stationery & supplies' },
    { id: 'salon', name: 'Salon & Spa', icon: '💇', description: 'Hair, beauty & spa services' },
    { id: 'supermarket', name: 'Supermarket', icon: '🛒', description: 'Retail & groceries' },
    { id: 'hotel', name: 'Hotel', icon: '🏨', description: 'Hotel & accommodation' },
    { id: 'gym', name: 'Gym & Fitness', icon: '💪', description: 'Fitness center & gym' },
    { id: 'clinic', name: 'Clinic', icon: '🏥', description: 'Medical & healthcare' },
    { id: 'tailoring', name: 'Tailoring Shop', icon: '👔', description: 'Tailoring & alterations' },
    { id: 'garage', name: 'Garage', icon: '🔧', description: 'Car repairs & mechanics' },
    { id: 'other', name: 'Other Business', icon: '🏢', description: 'Any other business type' }
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading spinner
        showLoadingSpinner(true);

        const user = supabase.getUser();
        
        if (!user) {
            // No user found, redirect to signin
            window.location.href = '../auth/signin.html';
            return;
        }

        // Display user email
        document.getElementById('userEmail').textContent = user.email;

        // Render business categories
        renderBusinessCategories();

        // Handle logout
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);

        // Check if user already selected a business
        const existingBusiness = localStorage.getItem('bizflow_business');
        if (existingBusiness) {
            const businessData = JSON.parse(existingBusiness);
            // Auto-highlight if user comes back
            const selectedItem = document.querySelector(`[data-business-id="${businessData.businessType}"]`);
            if (selectedItem) {
                selectedItem.classList.add('active');
            }
        }

        showLoadingSpinner(false);

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showMessage('Failed to load dashboard. Please refresh the page.', 'error');
        showLoadingSpinner(false);
    }
});

function renderBusinessCategories() {
    const grid = document.getElementById('businessGrid');
    
    if (!grid) {
        console.error('Business grid element not found');
        return;
    }

    grid.innerHTML = '';

    BUSINESS_CATEGORIES.forEach(category => {
        const item = document.createElement('div');
        item.className = 'business-item';
        item.setAttribute('data-business-id', category.id);
        item.innerHTML = `
            <div class="business-icon">${category.icon}</div>
            <div class="business-name">${category.name}</div>
            <div class="business-description">${category.description}</div>
        `;

        item.addEventListener('click', () => selectBusiness(category, item));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectBusiness(category, item);
            }
        });

        grid.appendChild(item);
    });
}

function selectBusiness(category, element) {
    try {
        const user = supabase.getUser();
        
        if (!user) {
            showMessage('Session expired. Please sign in again.', 'error');
            window.location.href = '../auth/signin.html';
            return;
        }

        // Remove active class from all items
        document.querySelectorAll('.business-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected item
        element.classList.add('active');

        // Store selected business
        const businessData = {
            userId: user.id,
            businessType: category.id,
            businessName: category.name,
            businessIcon: category.icon,
            selectedAt: new Date().toISOString()
        };

        localStorage.setItem('bizflow_business', JSON.stringify(businessData));

        // Show loading and redirect
        showLoadingSpinner(true);
        showMessage('Business selected! Setting up your dashboard...', 'success');

        // In production, save to Supabase here
        // await supabase.insert('user_businesses', businessData);

        // Redirect to business setup
        setTimeout(() => {
            window.location.href = './setup-business.html';
        }, 1500);

    } catch (error) {
        console.error('Business selection error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

function handleLogout() {
    try {
        showLoadingSpinner(true);
        supabase.signOut();
        localStorage.removeItem('bizflow_business');
        localStorage.removeItem('bizflow_business_setup');
        
        showMessage('Signing you out...', 'info');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Error logging out. Please try again.', 'error');
        showLoadingSpinner(false);
    }
}

function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    if (container) {
        container.textContent = message;
        container.className = `message show ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.className = 'message';
        }, 5000);
    }
}

// Session recovery - check if session exists in localStorage
function recoverSession() {
    const session = localStorage.getItem('bizflow_session');
    const user = localStorage.getItem('bizflow_user');
    
    if (session && user) {
        try {
            supabase.setSession(JSON.parse(session));
            supabase.setUser(JSON.parse(user));
            return true;
        } catch (error) {
            console.error('Session recovery error:', error);
            localStorage.removeItem('bizflow_session');
            localStorage.removeItem('bizflow_user');
            return false;
        }
    }
    return false;
}

// Call session recovery on page load
recoverSession();
