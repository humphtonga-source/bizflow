// Landing Page Interactive Features

const featureData = {
    finance: {
        icon: '💰',
        title: 'Finance Management',
        description: 'Complete control over your business finances with real-time tracking and reporting.',
        benefits: [
            'Track all income and expenses automatically',
            'Generate financial reports in seconds',
            'Monitor cash flow and identify trends',
            'Simplified tax calculations and compliance',
            'Support for M-Pesa and multiple payment methods',
            'Budget planning and forecasting tools',
            'Profit margin analysis by product/service'
        ]
    },
    staff: {
        icon: '👥',
        title: 'Staff Management',
        description: 'Manage your team efficiently with roles, permissions, and performance tracking.',
        benefits: [
            'Create custom staff roles and permissions',
            'Track attendance and work hours',
            'Performance monitoring and reviews',
            'Commission and salary calculations',
            'Staff leave and holiday management',
            'Activity logs and accountability',
            'Team communication dashboard'
        ]
    },
    analytics: {
        icon: '📊',
        title: 'Smart Analytics',
        description: 'Get actionable insights about your business with beautiful, easy-to-understand reports.',
        benefits: [
            'Real-time sales and revenue dashboards',
            'Customer behavior and trends analysis',
            'Identify your best-selling products',
            'Track business performance over time',
            'Comparative analysis (daily, weekly, monthly)',
            'Export reports in multiple formats',
            'Predictive insights for planning'
        ]
    },
    inventory: {
        icon: '📦',
        title: 'Inventory Management',
        description: 'Never run out of stock again with smart inventory tracking.',
        benefits: [
            'Track stock levels in real-time',
            'Automatic low-stock alerts',
            'Supplier management and ordering',
            'Stock valuation and cost analysis',
            'Barcode scanning support',
            'Multiple warehouse/location support',
            'Inventory forecasting and planning'
        ]
    },
    appointments: {
        icon: '📅',
        title: 'Appointments & Scheduling',
        description: 'Manage customer bookings and schedules seamlessly.',
        benefits: [
            'Online booking calendar for customers',
            'Automated reminder notifications',
            'Prevent double-bookings automatically',
            'Resource and staff scheduling',
            'Customer profiles and history',
            'Mobile booking confirmation',
            'Integration with WhatsApp and SMS'
        ]
    },
    mobile: {
        icon: '📱',
        title: 'Mobile Ready',
        description: 'Manage your business from anywhere, anytime.',
        benefits: [
            'Full-featured mobile app for iOS & Android',
            'Works online and offline',
            'Sync automatically when connected',
            'Mobile-optimized interface',
            'Fast, responsive performance',
            'Push notifications for alerts',
            'One-tap actions for common tasks'
        ]
    }
};

// Modal handling
const modal = document.getElementById('featureModal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

document.querySelectorAll('.feature-card.clickable').forEach(card => {
    card.addEventListener('click', () => {
        const feature = card.dataset.feature;
        const data = featureData[feature];
        
        if (data) {
            document.getElementById('modalIcon').textContent = data.icon;
            document.getElementById('modalTitle').textContent = data.title;
            document.getElementById('modalDescription').textContent = data.description;
            
            const benefitsList = document.getElementById('modalBenefits');
            benefitsList.innerHTML = '';
            data.benefits.forEach(benefit => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="benefit-checkmark">✓</span>${benefit}`;
                benefitsList.appendChild(li);
            });
            
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Close modal
function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Add hover effect to feature cards
document.querySelectorAll('.feature-card.clickable').forEach(card => {
    card.style.cursor = 'pointer';
});
