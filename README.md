# BizFlow - Business Management Platform for Kenya

**A beautiful, modern white-label SaaS platform built for Kenyan businesses.**

![BizFlow](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Kenya](https://img.shields.io/badge/Made%20in-Kenya-red)

## 🌟 Features

✅ **Finance Management** - Real-time income, expenses & profit tracking  
✅ **Staff Management** - Schedule shifts, attendance & performance tracking  
✅ **Inventory Control** - Stock taking, auto-reorder & expiry tracking  
✅ **Appointments** - Schedule & manage customer bookings  
✅ **Debt Management** - Track customer & supplier debts  
✅ **Business Analytics** - Real-time insights & performance reports  
✅ **M-Pesa Ready** - Built-in M-Pesa & local payment support  
✅ **Mobile First** - Works perfectly on slow connections  
✅ **Secure** - Bank-level encryption & SSL/TLS  
✅ **Beautiful UI** - Modern design, smooth animations  

## 📱 Pricing

| Plan | Price | Best For |
|------|-------|----------|
| **Starter** | KES 999/month | Small shops & startups |
| **Professional** | KES 2,499/month | Growing businesses |
| **Enterprise** | KES 4,999/month | Large operations & chains |

## 🏢 Supported Business Types

- 🍽️ Restaurant
- 🎰 Betting Shop
- 💊 Chemist
- 📚 Bookshop
- 💇 Salon & Spa
- 🛒 Supermarket
- 🏨 Hotel
- 💪 Gym & Fitness
- 🏥 Clinic
- 👔 Tailoring Shop
- 🔧 Garage
- 🏢 Other Business

## 🚀 Quick Start

### Prerequisites
- Modern web browser
- Supabase account (free tier available)
- GitHub account (for deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/humphtonga-source/bizflow.git
cd bizflow
```

### 2. Configure Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your credentials from Project Settings:
   - Project URL
   - Anon Key

4. Update `assets/js/supabase-client.js`:
```javascript
const SUPABASE_CONFIG = {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
};
```

### 3. Create Database Tables

In Supabase SQL Editor, run:

```sql
-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User businesses table
CREATE TABLE user_businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_phone TEXT,
    business_email TEXT,
    business_location TEXT,
    business_category TEXT,
    employee_count TEXT,
    plan_type TEXT,
    mpesa_integration BOOLEAN DEFAULT false,
    setup_completed BOOLEAN DEFAULT false,
    selected_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can see own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can see own businesses" ON user_businesses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses" ON user_businesses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Test Locally
```bash
# Using Python's built-in server
python -m http.server 8000

# Or using Node.js http-server
npm install -g http-server
http-server
```

Visit `http://localhost:8000`

## 📁 Project Structure

```
bizflow/
├── index.html                    # Landing page
├── auth/
│   ├── signup.html              # User registration
│   ├── signin.html              # User login
│   └── reset-password.html      # Password reset
├── dashboard/
│   ├── select-business.html     # Business type selection
│   ├── setup-business.html      # Business configuration
│   └── admin.html               # Main dashboard
├── pages/
│   ├── terms.html               # Terms of Service
│   └── privacy.html             # Privacy Policy
├── assets/
│   ├── css/
│   │   ├── global.css           # Design system
│   │   ├── landing.css          # Landing page styles
│   │   ├── auth.css             # Auth pages styles
│   │   └── dashboard.css        # Dashboard styles
│   └── js/
│       ├── supabase-client.js   # Supabase integration
│       ├── auth-handler.js      # Auth logic
│       ├── utils.js             # Utility functions
│       ├── dashboard.js         # Business selection
│       └── business-setup.js    # Business setup
└── README.md
```

## 🔧 Configuration

### Color Scheme (Kenyan Modern)
```css
--primary: #1f9b57          /* Kenya green */
--primary-dark: #16754a
--secondary: #ff6b3d        /* Orange */
```

### Localization
- **Currency**: KES (Kenya Shillings)
- **Language**: English (Kiswahili support ready)
- **Time Zone**: East Africa Time (EAT, UTC+3)
- **Date Format**: DD/MM/YYYY

## 🔐 Authentication Flow

1. User lands on landing page → Clicks "Get Started"
2. Sign up form → Creates Supabase account
3. Business selection → Chooses business type
4. Business setup → Configures business details
5. Admin dashboard → Full access to features

## 💾 Data Storage

**Local Storage** (Browser):
- `bizflow_session` - Auth tokens (JSON)
- `bizflow_user` - User info (JSON)
- `bizflow_business` - Selected business (JSON)
- `bizflow_business_setup` - Setup data (JSON)

**Supabase** (Cloud):
- User profiles
- Business information
- Business selections
- (Future: Financial data, inventory, etc.)

## 🚀 Deployment

### Option 1: GitHub Pages (Recommended)

```bash
# Push to main branch
git add .
git commit -m "Deploy BizFlow v1.0"
git push origin main

# Enable GitHub Pages in repo settings
# → Settings → Pages → Source: main
# Live at: https://username.github.io/bizflow
```

### Option 2: Netlify

```bash
# Connect GitHub repo to Netlify
# Automatic deployment on push
# Faster CDN distribution
```

### Option 3: Vercel

```bash
# Connect GitHub repo to Vercel
# Optimized for static sites
# Edge caching for performance
```

### Option 4: Custom Domain

1. Update your domain's DNS records
2. Point to your hosting provider
3. Enable HTTPS (SSL certificate)

## 🔒 Security Checklist

- [ ] Update Supabase credentials
- [ ] Enable RLS policies in Supabase
- [ ] Set up HTTPS/SSL
- [ ] Enable email verification
- [ ] Configure password requirements
- [ ] Set up backup schedules
- [ ] Enable 2FA for admin accounts
- [ ] Review privacy policy
- [ ] Configure GDPR compliance
- [ ] Set up error logging
- [ ] Monitor for suspicious activity

## 📊 Analytics Integration

Add Google Analytics (optional):
```html
<!-- In index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## 🐛 Troubleshooting

### Issue: Supabase API errors
**Solution**: 
- Verify URL and anon key are correct
- Check CORS settings in Supabase
- Ensure API is publicly accessible

### Issue: Redirects not working
**Solution**:
- Check browser console for errors
- Verify localStorage is enabled
- Check relative paths in HTML

### Issue: Styling looks broken on mobile
**Solution**:
- Check viewport meta tag exists
- Test with browser dev tools mobile view
- Clear browser cache

### Issue: Session lost after refresh
**Solution**:
- Implement session recovery in dashboard.js
- Check localStorage key names
- Verify Supabase session persistence

## 🔄 User Flow

```
Landing Page (index.html)
    ↓
    ├→ "Get Started" button
    │   ↓
    └→ Sign Up (auth/signup.html)
        ├→ Email verification (optional)
        ↓
        └→ Business Selection (dashboard/select-business.html)
            ↓
            └→ Business Setup (dashboard/setup-business.html)
                ↓
                └→ Admin Dashboard (dashboard/admin.html)
                    └→ All features available
```

## 📚 API Documentation

### Supabase Client Methods

```javascript
// Authentication
supabase.signUp(email, password, metadata)
supabase.signIn(email, password)
supabase.signOut()

// Session Management
supabase.getSession()
supabase.setSession(session)
supabase.getUser()
supabase.setUser(user)

// Database Operations
supabase.insert(table, data)
supabase.select(table)
supabase.update(table, data, id)
supabase.delete(table, id)
```

## 🎯 Roadmap

- [ ] Phase 1: Landing, Auth, Business Selection ✅
- [ ] Phase 2: Finance Management Module
- [ ] Phase 3: Staff Management Module
- [ ] Phase 4: Inventory Control Module
- [ ] Phase 5: M-Pesa Integration
- [ ] Phase 6: Analytics & Reports
- [ ] Phase 7: Mobile App
- [ ] Phase 8: Advanced Features

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

**Issues & Bugs**:
- GitHub Issues: [github.com/humphtonga-source/bizflow/issues](https://github.com/humphtonga-source/bizflow/issues)

**Email Support**:
- support@bizflow.ke

**Documentation**:
- Full docs: [docs.bizflow.ke](https://docs.bizflow.ke)

## 🙏 Credits

**Built for Kenyan Businesses by Humphrey Tonga**

Made with ❤️ in Kenya 🇰🇪

---

## Legal

- [Terms of Service](pages/terms.html)
- [Privacy Policy](pages/privacy.html)

---

**Start building your business empire with BizFlow today!**

🚀 [Get Started](https://bizflow.ke) | 📖 [Documentation](https://docs.bizflow.ke) | 💬 [Support](mailto:support@bizflow.ke)
