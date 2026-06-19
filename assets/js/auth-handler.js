// Authentication Handler - Fixed for production

let isSubmitting = false; // Prevent double submission

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;
    isSubmitting = true;

    const ownerName = document.getElementById('ownerName')?.value.trim();
    const businessName = document.getElementById('businessName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const terms = document.getElementById('terms')?.checked;

    // Validation
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

        const signupResult = await supabase.signUp(email, password, {
            full_name: ownerName,
            business_name: businessName,
            phone: formattedPhone
        });

        if (signupResult.success) {
            const userData = {
                id: signupResult.user.id,
                email: signupResult.user.email,
                full_name: ownerName,
                business_name: businessName,
                phone: formattedPhone
            };

            supabase.setUser(userData);

            showMessage('signupMessage', '✓ Account created successfully! Redirecting...', 'success');

            // Single redirect with slight delay to ensure localStorage is set
            setTimeout(() => {
                window.location.href = './select-business.html';
            }, 800);
        } else {
            showMessage('signupMessage', signupResult.error || 'Signup failed. Please try again.', 'error');
            isSubmitting = false;
        }
    } catch (error) {
        console.error('Signup exception:', error);
        showMessage('signupMessage', 'An error occurred. Please try again.', 'error');
        isSubmitting = false;
    }
}

// Handle Signin
async function handleSignin(e) {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;
    isSubmitting = true;

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    // Validation
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
            showMessage('signinMessage', '✓ Signed in successfully! Redirecting...', 'success');

            // Check if user is owner (admin account) - owner email is hardcoded or marked in database
            const isOwner = email === 'owner@bizflow.com' || email === 'admin@bizflow.com'; // Change to your owner email
            
            // Single redirect with slight delay
            setTimeout(() => {
                if (isOwner) {
                    // Owner goes to admin dashboard
                    window.location.href = './dashboard/admin.html';
                } else {
                    // Regular users go to business selection
                    window.location.href = './select-business.html';
                }
            }, 800);
        } else {
            showMessage('signinMessage', result.error || 'Invalid email or password', 'error');
            isSubmitting = false;
        }
    } catch (error) {
        console.error('Signin exception:', error);
        showMessage('signinMessage', 'An error occurred. Please try again.', 'error');
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
        showMessage('resetMessage', 'Please enter your email address', 'error');
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
            showMessage('resetMessage', '✓ Password reset email sent! Check your inbox.', 'success');
            setTimeout(() => {
                window.location.href = './signin.html';
            }, 2000);
        } else {
            showMessage('resetMessage', result.error || 'Failed to send reset email', 'error');
            isSubmitting = false;
        }
    } catch (error) {
        console.error('Reset error:', error);
        showMessage('resetMessage', 'An error occurred. Please try again.', 'error');
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

// Redirect if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = supabase.getUser();
    
    if (user) {
        const currentPage = window.location.pathname;
        if (currentPage.includes('signup') || currentPage.includes('signin') || currentPage.includes('reset')) {
            const isOwner = user.email === 'owner@bizflow.com' || user.email === 'admin@bizflow.com';
            window.location.href = isOwner ? './dashboard/admin.html' : './select-business.html';
        }
    }

    if (!user && (window.location.pathname.includes('setup') || window.location.pathname.includes('select') || window.location.pathname.includes('admin'))) {
        window.location.href = '../auth/signin.html';
    }
});
