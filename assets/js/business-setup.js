// Business Setup Form Handler - Multi-Step Workflow
// Saves to CORRECT 'businesses' table (not user_businesses)

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

// Form submission - SAVES TO 'businesses' TABLE
setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    showLoadingSpinner(true);

    try {
        // Collect form data
        const formData = {
            owner_id: currentUser.id,
            business_name: document.getElementById('businessName').value.trim(),
            business_phone: formatPhoneNumber(document.getElementById('businessPhone').value),
            business_email: document.getElementById('businessEmail').value.trim() || null,
            business_location: document.getElementById('businessLocation').value.trim(),
            business_category: document.getElementById('businessCategory').value,
            county: document.getElementById('businessLocation').value.trim().split(',')[0], // Extract county
            employee_count: document.getElementById('employeeCount').value,
            status: 'trial', // New businesses start in trial
            setup_completed: true,
            mpesa_integration: document.getElementById('mpesaReady').checked,
            whatsapp_integration: document.getElementById('whatsappReady').checked,
            sms_integration: document.getElementById('smsReady').checked,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // CRITICAL: Save to 'businesses' table (not user_businesses)
        const { data: businessData, error: businessError } = await supabase.client
            .from('businesses')
            .insert([formData], { returning: 'representation' });

        if (businessError) {
            console.error('Business creation error:', businessError);
            showMessage('Failed to save business data. ' + businessError.message, 'error');
            showLoadingSpinner(false);
            return;
        }

        // Get the newly created business ID
        const businessId = businessData?.[0]?.id;

        if (businessId) {
            // Update profile with business_id
            const { error: profileError } = await supabase.client
                .from('profiles')
                .update({ business_id: businessId })
                .eq('id', currentUser.id);

            if (profileError) {
                console.error('Profile update error:', profileError);
                console.log('Warning: business created but profile not linked');
            }

            // Create subscription record for this business
            const planPrices = {
                starter: 999,
                professional: 2499,
                enterprise: 4999
            };

            const selectedPlan = document.querySelector('input[name="planType"]:checked').value;
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

            const { error: subscriptionError } = await supabase.client
                .from('subscriptions')
                .insert([{
                    business_id: businessId,
                    plan_type: selectedPlan,
                    monthly_price: planPrices[selectedPlan],
                    status: 'trial',
                    trial_end_date: trialEndDate.toISOString(),
                    payment_status: 'pending',
                    billing_cycle_start: new Date().toISOString()
                }], { returning: 'minimal' });

            if (subscriptionError) {
                console.error('Subscription creation error:', subscriptionError);
                console.log('Warning: business created but subscription not initialized');
            }
        }

        showMessage('✓ Business setup completed successfully!', 'success');

        // Store business data locally
        localStorage.setItem('bizflow_business', JSON.stringify(formData));

        // Redirect to customer dashboard
        setTimeout(() => {
            window.location.href = './select-business.html';
        }, 1500);
    } catch (error) {
        console.error('Setup error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    } finally {
        showLoadingSpinner(false);
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    supabase.signOut();
    window.location.href = '../auth/signin.html';
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('setupMessage');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.toggle('hidden', !show);
    }
}

// Initialize
goToStep(1);
