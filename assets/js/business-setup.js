// Business Setup Form Handler - Multi-Step Workflow

const setupForm = document.getElementById('setupForm');
const currentUser = supabase.getUser();

// Check authentication
if (!currentUser) {
    window.location.href = '../auth/signin.html';
}

// Display user email
document.getElementById('userEmail').textContent = currentUser.email;

// Multi-step form handling
const formSteps = document.querySelectorAll('.form-step');
const totalSteps = formSteps.length;
let currentStep = 1;

const nextButtons = document.querySelectorAll('.next-step');
const prevButtons = document.querySelectorAll('.prev-step');

// Navigate to next step
nextButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (validateCurrentStep()) {
            goToStep(currentStep + 1);
        }
    });
});

// Navigate to previous step
prevButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        goToStep(currentStep - 1);
    });
});

function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Hide all steps
    formSteps.forEach(s => s.classList.remove('active'));

    // Show target step
    document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');

    // Update progress
    updateProgress(step);
    currentStep = step;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(step) {
    const percentage = (step / totalSteps) * 100;
    document.querySelector('.progress-fill').style.width = percentage + '%';
    document.querySelector('.step-current').textContent = step;

    const stepNames = [
        'Business Info',
        'Location & Category',
        'Choose Plan',
        'Integrations'
    ];
    document.querySelector('.step-name').textContent = stepNames[step - 1];
}

function validateCurrentStep() {
    const currentSection = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentSection.querySelectorAll('input[required], select[required]');

    for (let input of inputs) {
        if (!input.value.trim()) {
            showMessage(`Please fill in all required fields in this step`, 'error');
            input.focus();
            return false;
        }

        // Email validation
        if (input.type === 'email' && input.value && !validateEmail(input.value)) {
            showMessage('Please enter a valid email address', 'error');
            input.focus();
            return false;
        }

        // Phone validation
        if (input.type === 'tel' && input.value && !isValidKenyanPhone(input.value)) {
            showMessage('Please enter a valid Kenyan phone number (+254...)', 'error');
            input.focus();
            return false;
        }
    }

    return true;
}

// Form submission
setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    showLoadingSpinner(true);

    try {
        // Collect form data
        const formData = {
            user_id: currentUser.id,
            business_name: document.getElementById('businessName').value.trim(),
            business_phone: formatPhoneNumber(document.getElementById('businessPhone').value),
            business_email: document.getElementById('businessEmail').value.trim() || null,
            business_location: document.getElementById('businessLocation').value.trim(),
            business_category: document.getElementById('businessCategory').value,
            employee_count: document.getElementById('employeeCount').value,
            plan_type: document.querySelector('input[name="planType"]:checked').value,
            mpesa_integration: document.getElementById('mpesaReady').checked,
            whatsapp_integration: document.getElementById('whatsappReady').checked,
            sms_integration: document.getElementById('smsReady').checked,
            setup_completed: true,
            created_at: new Date().toISOString()
        };

        // Save to Supabase
        const result = await supabase.insert('user_businesses', formData);

        if (result.success) {
            showMessage('✓ Business setup completed successfully!', 'success');
            
            // Store business data locally
            localStorage.setItem('bizflow_business', JSON.stringify(formData));

            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                window.location.href = './admin.html';
            }, 1500);
        } else {
            showMessage('Failed to save business data. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Setup error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        showLoadingSpinner(false);
    }
}

);

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    supabase.signOut();
    window.location.href = '../auth/signin.html';
});

// Initialize
goToStep(1);
