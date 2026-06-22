// Authentication Handler - RBAC with Profile Creation
let isSubmitting = false;

// Handle Signup
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
        const signupResult = await supabase.signUp(email, password);

        if (signupResult.success) {
            // Create profile in profiles table with role='business_owner'
            const profileData = {
                id: signupResult.user.id,
                email: email,
                full_name: ownerName,
                role: 'business_owner', // CRITICAL: Set role on profile creation
                plan_type: 'starter',
                is_active: true,
                signup_date: new Date().toISOString()
            };

            // Insert into profiles table (with RLS allowing user to create their own profile)
            const profileInsert = await supabase.from('profiles')
                .insert([profileData], { returning: 'minimal' });

            if (profileInsert.error) {
                console.error('Profile creation error:', profileInsert.error);
                showMessage('signupMessage', 'Account created but profile setup failed. Please contact support.', 'error');
                isSubmitting = false;
                return;
            }

            // Store user info locally
            supabase.setUser({
                id: signupResult.user.id,
                email: email,
                full_name: ownerName,
                role: 'business_owner'
            });

            showMessage('signupMessage', '✓ Account created! Redirecting...', 'success');

            // Redirect to business setup (3-step process before dashboard)
            setTimeout(() => {
                window.location.href = '/bizflow/dashboard/setup-business.html';
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

// Handle Signin - Checks role from database
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
            // CRITICAL: Fetch user's role from profiles table
            const { data: profileData, error: profileError } = await supabase.from('profiles')
                .select('role')
                .eq('id', result.user.id)
                .single();

            if (profileError) {
                console.error('Profile fetch error:', profileError);
                showMessage('signinMessage', 'Could not determine user role. Please try again.', 'error');
                isSubmitting = false;
                return;
            }

            const userRole = profileData?.role || 'business_owner';

            showMessage('signinMessage', '✓ Signed in! Redirecting...', 'success');

            setTimeout(() => {
                if (userRole === 'super_admin') {
                    console.log('🔑 Super admin signin - redirecting to admin');
                    window.location.href = '/bizflow/dashboard/admin.html';
                } else {
                    console.log('👤 Business owner signin - redirecting to app');
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

function showMessage(elementId, message, type) {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

// Auto-redirect if already logged in
document.addEventListener('DOMContentLoaded', async () => {
    const user = supabase.getUser();
    
    if (user) {
        const currentPage = window.location.pathname;
        if (currentPage.includes('signup') || currentPage.includes('signin') || currentPage.includes('reset')) {
            // Fetch role from database
            const { data: profileData } = await supabase.from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const userRole = profileData?.role || 'business_owner';

            if (userRole === 'super_admin') {
                window.location.href = '/bizflow/dashboard/admin.html';
            } else {
                window.location.href = '/bizflow/dashboard/select-business.html';
            }
        }
    }

    // Protect dashboards
    if (!user && (window.location.pathname.includes('setup') || window.location.pathname.includes('select') || window.location.pathname.includes('admin'))) {
        window.location.href = '/bizflow/auth/signin.html';
    }
});
