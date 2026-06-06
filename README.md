# BizFlow — Multi-Profession Business Management Platform

A modular, multi-tenant SaaS platform that serves different business types (Salon, Restaurant, Bookshop, Chemist, Law Firm, Betting Shop) with profession-specific tools and dashboards.

## Architecture

```
├── index.html          → Auth + Profession Selector (Entry point)
├── app.html            → Main app shell (Loads profession modules)
├── admin.html          → Admin console (Manage businesses)
├── modules/
│   ├── salon/          → Salon-specific features
│   ├── restaurant/     → Restaurant-specific features
│   ├── bookshop/       → Bookshop features (placeholder)
│   ├── chemist/        → Chemist features (placeholder)
│   ├── law-firm/       → Law Firm features (placeholder)
│   └── betting-shop/   → Betting Shop features (SwiftStake integration)
└── SUPABASE_SCHEMA.sql → Database schema
```

## How It Works

1. **Authentication** (`index.html`)
   - User signs up and selects their profession
   - Profession + Business stored in Supabase
   - User redirected to app with query params: `app.html?prof=salon&bid=xyz`

2. **Module Loading** (`app.html`)
   - Dynamically loads profession module (e.g., `/modules/salon/index.js`)
   - Module defines `MODULE_INIT()` function
   - Builds profession-specific HTML + navigation
   - All modules share global `STATE` object with auth/Supabase access

3. **Data Isolation** (Supabase RLS)
   - Each business owns its own data
   - RLS policies ensure users only see their business data
   - No cross-business data leakage

4. **Admin Console** (`admin.html`)
   - View all businesses, users, modules
   - Manage platform settings
   - Future: approve businesses, handle billing

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get your `Project URL` and `Anon Key`

### 2. Setup Database
1. Go to SQL Editor in Supabase
2. Copy entire `SUPABASE_SCHEMA.sql`
3. Run all queries
4. Verify tables are created

### 3. Update API Keys
Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in:
- `index.html` (line ~180)
- `app.html` (line ~310)
- `admin.html` (line ~275)

Example:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-key...xyz';
```

### 4. Deploy to GitHub Pages
```bash
# Clone this repo
git clone https://github.com/humphtonga-source/bizflow.git
cd bizflow

# Push to GitHub (master branch)
git add .
git commit -m "Initial setup"
git push origin main

# Enable GitHub Pages: Settings → Pages → Deploy from main branch
```

Your app will be live at: `https://yourusername.github.io/bizflow/`

### 5. Test Flow
1. Open `index.html` (or your GitHub Pages URL)
2. Sign up with email + profession
3. App loads → redirects to profession dashboard
4. Create test data (stylists, services, appointments)
5. Verify real-time sync works

## Module Development

### Creating a New Module

Create `/modules/profession-name/index.js`:

```javascript
async function MODULE_INIT() {
  // 1. Build HTML
  buildProfessionHTML();
  
  // 2. Setup navigation
  buildNavMenu([
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'section2', label: 'Section 2', icon: '🛒' }
  ]);
  
  // 3. Load data
  await loadDashboard();
  await loadSection2();
  
  // 4. Setup realtime
  setupRealtimeSubscriptions();
}

function buildProfessionHTML() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="section active" id="sec-dashboard">
      <!-- Dashboard HTML -->
    </div>
    <div class="section" id="sec-section2">
      <!-- Section 2 HTML -->
    </div>
  `;
}

async function loadDashboard() {
  const { data, error } = await STATE.supabase
    .from('profession_table_name')
    .select('*')
    .eq('business_id', STATE.businessId);
  
  // Render data...
}

function setupRealtimeSubscriptions() {
  STATE.supabase
    .channel(`profession_table:business_id=eq.${STATE.businessId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profession_table_name' }, () => {
      loadDashboard();
    })
    .subscribe();
}
```

### Global STATE Object
All modules have access to:
```javascript
STATE = {
  profession: 'salon',           // Current profession
  businessId: 'uuid',            // Current business ID
  userId: 'uuid',                // Current user ID
  supabase: client               // Supabase instance
}
```

### Using Global Functions
```javascript
showToast(msg, type)             // Show notification
switchSection(sectionId)         // Switch active section
buildNavMenu(modules)            // Build sidebar navigation
showModal(title, content, cb)    // Show modal
```

## Data Structure

### Core Tables
- `businesses` — Business registrations
- `user_profiles` — User-to-business mapping with roles

### Profession Tables (Example: Salon)
- `salon_stylists` — Team members
- `salon_services` — Services offered
- `salon_appointments` — Bookings
- `salon_clients` — Customer database
- `salon_inventory` — Product stock

**Pattern**: Each profession has its own set of tables prefixed with profession name.

## RLS Security

All profession tables have RLS enabled:
```sql
CREATE POLICY "profession_data_isolation"
  ON profession_table FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
```

This ensures:
- Users only see their own business data
- No cross-business data leakage
- Data encrypted at rest in Supabase

## Features

### ✅ Implemented
- [x] Multi-tenant auth with profession selection
- [x] Salon module (stylists, appointments, services, inventory)
- [x] Restaurant module (skeleton)
- [x] Dynamic module loading
- [x] Real-time Supabase sync
- [x] Admin console
- [x] RLS data isolation
- [x] PWA ready (add to home screen)

### 🚧 In Progress
- [ ] Complete Restaurant module
- [ ] Bookshop module
- [ ] Chemist module
- [ ] Law Firm module
- [ ] SwiftStake integration for Betting Shop
- [ ] Billing/subscription system

### 📋 Roadmap
- [ ] Mobile app (React Native wrapper)
- [ ] Payment integration (M-Pesa, Stripe)
- [ ] SMS notifications
- [ ] WhatsApp integration
- [ ] Advanced analytics
- [ ] Team management per business
- [ ] Audit logs

## Troubleshooting

### "Failed to load module"
- Check console for errors
- Verify module file exists at `/modules/profession/index.js`
- Check Supabase tables exist

### "Auth error"
- Clear browser localStorage
- Check Supabase URL + key are correct
- Verify auth is enabled in Supabase

### "No data showing"
- Check RLS policies are configured
- Verify business_id is correct
- Check Supabase query in browser console

### "Realtime not working"
- Check Supabase realtime is enabled
- Verify channel name matches table
- Check network tab for connection errors

## Testing

### Test Account
```
Email: test@bizflow.com
Password: TestPassword123!
Profession: Salon
```

### Manual Testing Checklist
- [ ] Sign up with new profession
- [ ] Create stylists
- [ ] Create services
- [ ] Book appointment
- [ ] Verify data persists on page reload
- [ ] Check admin console shows business
- [ ] Test logout/login
- [ ] Test on mobile device

## Deployment Checklist

- [ ] Update Supabase URL + API keys
- [ ] Run SUPABASE_SCHEMA.sql
- [ ] Test auth flow locally
- [ ] Test each profession module
- [ ] Push to GitHub
- [ ] Enable GitHub Pages
- [ ] Test PWA install (mobile)
- [ ] Create privacy policy page
- [ ] Create support email

## File Structure for Deployment

```
yourrepo/
├── index.html
├── app.html
├── admin.html
├── modules/
│   ├── salon/index.js
│   ├── restaurant/index.js
│   ├── bookshop/index.js
│   ├── chemist/index.js
│   ├── law-firm/index.js
│   └── betting-shop/index.js
├── SUPABASE_SCHEMA.sql
└── README.md
```

## Support

Email: support@bizflow.com
Docs: https://docs.bizflow.com

---

**Built with ❤️ for African businesses**

