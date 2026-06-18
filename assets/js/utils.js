// Utility Functions

function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    if (container) {
        container.textContent = message;
        container.className = `message show ${type}`;
        
        setTimeout(() => {
            container.className = 'message';
        }, 5000);
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

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= 8;
}

function formatPhoneNumber(phone) {
    // Remove all non-digits
    let digits = phone.replace(/\D/g, '');
    
    // Handle Kenya phone numbers
    if (digits.startsWith('254')) {
        return `+${digits}`;
    } else if (digits.startsWith('0')) {
        return `+254${digits.substring(1)}`;
    } else if (digits.length === 9) {
        return `+254${digits}`;
    }
    
    return `+${digits}`;
}

function isValidKenyanPhone(phone) {
    const formatted = formatPhoneNumber(phone);
    return /^\+254[17]\d{8}$/.test(formatted);
}

function redirectIfNotAuthenticated(redirectTo = '../auth/signin.html') {
    const user = supabase.getUser();
    if (!user) {
        window.location.href = redirectTo;
    }
    return user;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-KE').format(new Date(date));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
        return false;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
        return false;
    }
}

// Event tracking stub (for future analytics)
function trackEvent(eventName, properties = {}) {
    console.log(`Event: ${eventName}`, properties);
    // TODO: Integrate with Google Analytics or Mixpanel
}

// Network status checker
function isOnline() {
    return navigator.onLine;
}

window.addEventListener('online', () => {
    showMessage('You are back online', 'success');
});

window.addEventListener('offline', () => {
    showMessage('You are offline. Some features may be unavailable.', 'warning');
});
