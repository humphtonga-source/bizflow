// Authentication Handlers - Enhanced

async function handleSignup(e) {
    e.preventDefault();

    const businessName = document.getElementById('businessName').value.trim();
    const ownerName = document.getElementById('ownerName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('signupMessage');

    // Clear previous messages
    hideMessage(messageDiv);

    // Validation
    if (!businessName || !ownerName || !email || !phone) {
        showMessage(messageDiv, 'Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }

    if (password.length < 8) {
        showMessage(messageDiv, 'Password must be at least 8 characters', 'error');
        return;
    }

    if (!email.includes('@')) {
        showMessage(messageDiv, 'Please enter a valid email address', 'error');
        return;
    }

    try {
        showMessage(messageDiv, 'Creating your account...', 'info');

        // Format phone to +254
        const formattedPhone = formatPhoneNumber(phone);

        const result = await supabase.signUp(email, password, {
            business_name: businessName,
            owner_name: ownerName,
            phone: formattedPhone
        });

        if (result.user) {
            supabase.setUser(result.user);
            if (result.session) {
                supabase.setSession(result.session);
            }

            showMessage(messageDiv, '✅ Account created! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = '../dashboard/select-business.html';
            }, 1500);
        } else if (result.error) {
            const errorMsg = result.error.message || 'Signup failed. Please try again.';
            showMessage(messageDiv, errorMsg, 'error');
        } else {
            showMessage(messageDiv, 'Signup failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        
        if (error.message.includes('already registered')) {
            showMessage(messageDiv, 'Email already registered. Try signing in instead.', 'error');
        } else if (error.message.includes('Invalid email')) {
            showMessage(messageDiv, 'Please enter a valid email address', 'error');
        } else {
            showMessage(messageDiv, 'An error occurred. Please check your connection and try again.', 'error');
        }
    }
}

async function handleSignin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('signinMessage');

    // Clear previous messages
    hideMessage(messageDiv);

    // Validation
    if (!email || !password) {
        showMessage(messageDiv, 'Please enter your email and password', 'error');
        return;
    }

    try {
        showMessage(messageDiv, 'Signing you in...', 'info');

        const result = await supabase.signIn(email, password);

        if (result.access_token) {
            supabase.setSession({
                access_token: result.access_token,
                refresh_token: result.refresh_token
            });

            if (result.user) {
                supabase.setUser(result.user);
            }

            showMessage(messageDiv, '✅ Sign in successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = '../dashboard/select-business.html';
            }, 1500);
        } else if (result.error) {
            const errorMsg = result.error.message || 'Invalid email or password';
            showMessage(messageDiv, errorMsg, 'error');
        } else {
            showMessage(messageDiv, 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Signin error:', error);
        showMessage(messageDiv, 'An error occurred. Please try again.', 'error');
    }
}

async function handlePasswordReset(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const messageDiv = document.getElementById('resetMessage');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');

    if (!email) {
        showMessage(messageDiv, 'Please enter your email address', 'error');
        return;
    }

    try {
        showMessage(messageDiv, 'Sending reset link...', 'info');

        // In production, call Supabase password reset API
        // const result = await supabase.resetPassword(email);
        
        // Simulate sending reset email
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Show success message
        step1.classList.add('hidden');
        step2.classList.remove('hidden');

    } catch (error) {
        console.error('Reset error:', error);
        showMessage(messageDiv, 'An error occurred. Please try again.', 'error');
    }
}

async function handleResendEmail(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const messageDiv = document.getElementById('resetMessage');

    try {
        showMessage(messageDiv, 'Resending email...', 'info');

        // Simulate resending email
        await new Promise(resolve => setTimeout(resolve, 1000));

        showMessage(messageDiv, '✅ Email resent! Check your inbox.', 'success');

    } catch (error) {
        console.error('Resend error:', error);
        showMessage(messageDiv, 'An error occurred. Please try again.', 'error');
    }
}

function showMessage(element, message, type = 'info') {
    if (!element) return;
    element.textContent = message;
    element.className = `message show ${type}`;
}

function hideMessage(element) {
    if (!element) return;
    element.textContent = '';
    element.className = 'message';
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = supabase.getUser();
    const currentPath = window.location.pathname;
    
    // If user is logged in and on auth pages, redirect to dashboard
    if (user && (currentPath.includes('/auth/'))) {
        // Check if business has been selected
        const business = localStorage.getItem('bizflow_business');
        if (business) {
            window.location.href = '../dashboard/select-business.html';
        } else {
            window.location.href = '../dashboard/select-business.html';
        }
    }

    // If user is NOT logged in and trying to access protected pages
    if (!user && (currentPath.includes('/dashboard/'))) {
        window.location.href = '../auth/signin.html';
    }
});
