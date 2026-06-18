// Authentication Handler - Fixed for Supabase

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();

    const ownerName = document.getElementById('ownerName')?.value.trim();
    const businessName = document.getElementById('businessName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const terms = document.getElementById('terms')?.checked;

    const messageDiv = document.getElementById('signupMessage');

    // Validation
    if (!ownerName || !businessName || !email || !phone || !password) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (password.length < 8) {
        showMessage('Password must be at least 8 characters', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    if (!isValidKenyanPhone(phone)) {
        showMessage('Please enter a valid Kenyan phone number', 'error');
        return;
    }

    if (!terms) {
        showMessage('Please accept the terms and conditions', 'error');
        return;
    }

    showMessage('Creating your account...', 'info');

    try {
        // Format phone
        const formattedPhone = formatPhoneNumber(phone);

        // Sign up with Supabase
        const signupResult = await supabase.signUp(email, password, {
            full_name: ownerName,
            business_name: businessName,
            phone: formattedPhone
        });

        if (signupResult.success) {
            // Store user data
            const userData = {
                id: signupResult.user.id,
                email: signupResult.user.email,
                full_name: ownerName,
                business_name: businessName,
                phone: formattedPhone
            };

            supabase.setUser(userData);

            showMessage('✓ Account created successfully! Redirecting...', 'success');

            // Redirect to business setup
            setTimeout(() => {
                window.location.href = './select-business.html';
            }, 1500);
        } else {
            showMessage(signupResult.error || 'Signup failed. Please try again.', 'error');
            console.error('Signup error:', signupResult.error);
        }
    } catch (error) {
        console.error('Signup exception:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

// Handle Signin
async function handleSignin(e) {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    const messageDiv = document.getElementById('signinMessage');

    // Validation
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    showMessage('Signing in...', 'info');

    try {
        const result = await supabase.signIn(email, password);

        if (result.success) {
            showMessage('✓ Signed in successfully! Redirecting...', 'success');

            // Redirect to business selection
            setTimeout(() => {
                window.location.href = './select-business.html';
            }, 1500);
        } else {
            showMessage(result.error || 'Invalid email or password', 'error');
            console.error('Signin error:', result.error);
        }
    } catch (error) {
        console.error('Signin exception:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

// Handle Password Reset
async function handlePasswordReset(e) {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const messageDiv = document.getElementById('resetMessage');

    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    showMessage('Sending reset email...', 'info');

    try {
        const result = await supabase.resetPassword(email);

        if (result.success) {
            showMessage('✓ Password reset email sent! Check your inbox.', 'success');
            setTimeout(() => {
                window.location.href = './signin.html';
            }, 2000);
        } else {
            showMessage(result.error || 'Failed to send reset email', 'error');
        }
    } catch (error) {
        console.error('Reset error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

// Redirect if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = supabase.getUser();
    
    // If on signup/signin/reset page and already logged in, redirect to dashboard
    const currentPage = window.location.pathname;
    if (user && (currentPage.includes('signup') || currentPage.includes('signin') || currentPage.includes('reset'))) {
        window.location.href = './select-business.html';
    }

    // If on dashboard and NOT logged in, redirect to signin
    if (!user && (currentPage.includes('setup') || currentPage.includes('select') || currentPage.includes('admin'))) {
        window.location.href = '../auth/signin.html';
    }
});
