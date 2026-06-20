// Authentication Handler - Role-Based Access Control (RBAC)
// Checks user role from profiles table and redirects accordingly

let isSubmitting = false;

// Handle Signup - Creates business_owner
async function handleSignup(e) {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const ownerName = document.getElementById('ownerName')?.value.trim();
    const businessName = document.getElementById('businessName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const terms = document.getElementById('terms')?.checked;

    if (!ownerName || !businessName || !email || !phone || !password) {
        showMessage('signupMessage', 'Please fill in all required fields', 'error');
        isSubmitting = false;
        return;
    }

    if (password !== confirmPassword) {
        showMessage('signupMessage', 'Passwords do not match', 'error');
        isSubmitting = false;
        return;
    }

    if (password.length < 8) {
        showMessage('signupMessage', 'Password must be at least 8 characters', 'error');
        isSubmitting = false;
        return;
    }

    if (!validateEmail(email)) {
        showMessage('signupMessage', 'Please enter a valid email', 'error');
        isSubmitting = false;
        return;
    }

    if (!isValidKenyanPhone(phone)) {
        showMessage('signupMessage', 'Please enter a valid Kenyan phone number', 'error');
        isSubmitting = false;
        return;
    }

    if (!terms) {
        showMessage('signupMessage', 'Please accept the terms and conditions', 'error');
        isSubmitting = false;
        return;
    }

    showMessage('signupMessage', 'Creating your account...', 'info');

    try {
        const formattedPhone = formatPhoneNumber(phone);

        // Sign up user in Supabase Auth
        const signupResult = await supabase.signUp(email, password, {
            full_name: ownerName,
            business_name: businessName,
            phone: formattedPhone
        });

        if (signupResult.success) {
            // Create profile with role='business_owner'
            const profileData = {
                id: signupResult.user.id,
                email: signupResult.user.email,
                full_name: ownerName,
                role: 'business_owner', // NEW: Set role on signup
                plan_type: 'starter',
                signup_date: new Date().toISOString(),
                is_active: true
            };

            // Store locally
            supabase.setUser(profileData);

            showMessage('signupMessage', '✓ Account created! Redirecting...', 'success');

            // Redirect to business setup (not admin - that's for super_admin role only)
            setTimeout(() => {
                window.location.href = '/bizflow/dashboard/select-business.html';
            }, 800);
        } else {
            showMessage('signupMessage', signupResult.error || 'Signup failed', 'error');
            isSubmitting = false;
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('signupMessage', 'An error occurred. Please try again.', 'error');
        isSubmitting = false;
    }
}

// Handle Signin - Checks role and redirects accordingly
async function handleSignin(e) {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        showMessage('signinMessage', 'Please enter email and password', 'error');
        isSubmitting = false;
        return;
    }

    if (!validateEmail(email)) {
        showMessage('signinMessage', 'Please enter a valid email', 'error');
        isSubmitting = false;
        return;
    }

    showMessage('signinMessage', 'Signing in...', 'info');

    try {
        const result = await supabase.signIn(email, password);

        if (result.success) {
            showMessage('signinMessage', '✓ Signed in! Redirecting...', 'success');

            // NEW: Check user role from profiles table
            const userRole = result.user?.user_metadata?.role || 'business_owner';
            
            setTimeout(() => {
                if (userRole === 'super_admin') {
                    // Admin dashboard (only for super_admin role)
                    console.log('🔑 Super admin detected - redirecting to admin panel');
                    window.location.href = '/bizflow/dashboard/admin.html';
                } else {
                    // Customer dashboard (business_owner role)
                    console.log('👤 Business owner detected - redirecting to app');
                    window.location.href = '/bizflow/dashboard/select-business.html';
                }
            }, 800);
        } else {
            showMessage('signinMessage', result.error || 'Invalid credentials', 'error');
            isSubmitting = false;
        }
    } catch (error) {
        console.error('Signin error:', error);
        showMessage('signinMessage', 'An error occurred', 'error');
        isSubmitting = false;
    }
}

// Handle Password Reset
async function handlePasswordReset(e) {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const email = document.getElementById('email')?.value.trim();

    if (!email) {
        showMessage('resetMessage', 'Please enter your email', 'error');
        isSubmitting = false;
        return;
    }

    if (!validateEmail(email)) {
        showMessage('resetMessage', 'Please enter a valid email', 'error');
        isSubmitting = false;
        return;
    }

    showMessage('resetMessage', 'Sending reset email...', 'info');

    try {
        const result = await supabase.resetPassword(email);

        if (result.success) {
            showMessage('resetMessage', '✓ Reset email sent! Check your inbox.', 'success');
            setTimeout(() => {
                window.location.href = '/bizflow/auth/signin.html';
            }, 2000);
        } else {
            showMessage('resetMessage', result.error || 'Failed to send reset email', 'error');
            isSubmitting = false;
        }
    } catch (error) {
        console.error('Reset error:', error);
        showMessage('resetMessage', 'An error occurred', 'error');
        isSubmitting = false;
    }
}

// Show message helper
function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

// Auto-redirect if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = supabase.getUser();
    
    if (user) {
        const currentPage = window.location.pathname;
        if (currentPage.includes('signup') || currentPage.includes('signin') || currentPage.includes('reset')) {
            // Redirect based on role
            const userRole = user.role || 'business_owner';
            if (userRole === 'super_admin') {
                window.location.href = '/bizflow/dashboard/admin.html';
            } else {
                window.location.href = '/bizflow/dashboard/select-business.html';
            }
        }
    }

    // Protect dashboards - must be logged in
    if (!user && (window.location.pathname.includes('setup') || window.location.pathname.includes('select') || window.location.pathname.includes('admin'))) {
        window.location.href = '/bizflow/auth/signin.html';
    }
});
