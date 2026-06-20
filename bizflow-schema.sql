-- BizFlow Supabase Schema with RBAC & RLS
-- One backend for admin + customers

-- 1. PROFILES TABLE - Core user accounts with roles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'business_owner', -- 'super_admin' or 'business_owner'
    business_id UUID, -- For business_owners, links to their business
    plan_type TEXT DEFAULT 'starter', -- starter, professional, enterprise
    signup_date TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL
);

-- 2. BUSINESSES TABLE - Customer businesses
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_category TEXT NOT NULL, -- restaurant, salon, chemist, etc
    business_phone TEXT,
    business_email TEXT,
    business_location TEXT,
    county TEXT, -- Nairobi, Mombasa, etc
    employee_count INT DEFAULT 1,
    status TEXT DEFAULT 'trial', -- trial, active, suspended, churned
    setup_completed BOOLEAN DEFAULT false,
    mpesa_integration BOOLEAN DEFAULT false,
    whatsapp_integration BOOLEAN DEFAULT false,
    sms_integration BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. SUBSCRIPTIONS TABLE - Billing & payment tracking
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL, -- starter, professional, enterprise
    monthly_price INT NOT NULL, -- in KES
    status TEXT DEFAULT 'active', -- active, trial, past_due, cancelled
    trial_end_date TIMESTAMP,
    billing_cycle_start TIMESTAMP DEFAULT NOW(),
    billing_cycle_end TIMESTAMP,
    payment_status TEXT DEFAULT 'pending', -- pending, paid, overdue, failed
    last_payment_date TIMESTAMP,
    churn_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. ACTIVITY_LOGS TABLE - Track logins & module usage
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- login, module_access, report_view, etc
    module_name TEXT, -- finance, staff, inventory, appointments
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. FINANCIALS TABLE - Revenue tracking (scoped to business_id)
CREATE TABLE IF NOT EXISTS financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    revenue_kes INT DEFAULT 0,
    expenses_kes INT DEFAULT 0,
    net_kes INT GENERATED ALWAYS AS (revenue_kes - expenses_kes) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials ENABLE ROW LEVEL SECURITY;

-- PROFILES - Business owners only see themselves
CREATE POLICY "Business owners see own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admin sees all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- BUSINESSES - Business owners only see their own business
CREATE POLICY "Business owners see own business" ON businesses
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Super admin sees all businesses" ON businesses
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- SUBSCRIPTIONS - Business owners see their own, admin sees all
CREATE POLICY "Business owners see own subscription" ON subscriptions
    FOR SELECT USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    );

CREATE POLICY "Super admin sees all subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- ACTIVITY_LOGS - Business owners see their own, admin sees all
CREATE POLICY "Business owners see own activity" ON activity_logs
    FOR SELECT USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    );

CREATE POLICY "Super admin sees all activity" ON activity_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- FINANCIALS - Business owners see their own, admin sees all
CREATE POLICY "Business owners see own financials" ON financials
    FOR SELECT USING (
        business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    );

CREATE POLICY "Super admin sees all financials" ON financials
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_business_id ON profiles(business_id);
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_activity_logs_business_id ON activity_logs(business_id);
CREATE INDEX idx_financials_business_id ON financials(business_id);
