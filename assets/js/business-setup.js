// Business Setup Handler

document.addEventListener('DOMContentLoaded', async () => {
    const user = supabase.getUser();
    const businessData = JSON.parse(localStorage.getItem('bizflow_business'));
    
    if (!user) {
        window.location.href = '../auth/signin.html';
        return;
    }

    if (!businessData) {
        window.location.href = './select-business.html';
        return;
    }

    // Pre-fill business type
    document.getElementById('businessType').value = businessData.businessName;

    // Handle form submission
    document.getElementById('setupForm').addEventListener('submit', handleBusinessSetup);
    
    // Handle skip button
    document.getElementById('skipBtn').addEventListener('click', () => {
        // Go directly to dashboard
        window.location.href = './admin.html';
    });

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        supabase.signOut();
        localStorage.removeItem('bizflow_business');
        window.location.href = '../index.html';
    });
});

async function handleBusinessSetup(e) {
    e.preventDefault();

    const businessName = document.getElementById('businessName').value;
    const businessPhone = document.getElementById('businessPhone').value;
    const businessEmail = document.getElementById('businessEmail').value;
    const businessLocation = document.getElementById('businessLocation').value;
    const businessCategory = document.getElementById('businessCategory').value;
    const employeeCount = document.getElementById('employeeCount').value;
    const planType = document.getElementById('planType').value;
    const mpesaReady = document.getElementById('mpesaReady').checked;
    const messageDiv = document.getElementById('setupMessage');
    const spinner = document.getElementById('loadingSpinner');

    // Validation
    if (!businessName || !businessPhone || !businessLocation || !businessCategory || !employeeCount || !planType) {
        showMessage(messageDiv, 'Please fill in all required fields', 'error');
        return;
    }

    try {
        showMessage(messageDiv, 'Setting up your business...', 'info');
        spinner.classList.remove('hidden');

        const user = supabase.getUser();
        const businessData = JSON.parse(localStorage.getItem('bizflow_business'));

        // Prepare business setup data
        const setupData = {
            user_id: user.id,
            business_id: businessData.userId,
            business_type: businessData.businessType,
            business_name: businessName,
            business_phone: formatPhone(businessPhone),
            business_email: businessEmail,
            business_location: businessLocation,
            business_category: businessCategory,
            employee_count: employeeCount,
            plan_type: planType,
            mpesa_integration: mpesaReady,
            setup_completed: true,
            setup_date: new Date().toISOString()
        };

        // Save to localStorage (in production, save to Supabase)
        localStorage.setItem('bizflow_business_setup', JSON.stringify(setupData));

        // Simulate API call (in production, insert into Supabase)
        await new Promise(resolve => setTimeout(resolve, 1000));

        showMessage(messageDiv, 'Business setup complete! Redirecting...', 'success');
        spinner.classList.add('hidden');

        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = './admin.html';
        }, 1500);

    } catch (error) {
        spinner.classList.add('hidden');
        showMessage(messageDiv, 'An error occurred. Please try again.', 'error');
        console.error('Setup error:', error);
    }
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message show ${type}`;
}
