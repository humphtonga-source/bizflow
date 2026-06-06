# BizFlow Setup — Existing Supabase + New GitHub

Since you already have SwiftStake in Supabase, here's the quickest path:

## Step 1: Add New Tables to Supabase (5 min)

1. Open your **existing Supabase project**
2. Go to **SQL Editor**
3. Open file: `SUPABASE_SCHEMA_ADD.sql`
4. Copy entire content → Paste in SQL Editor
5. Click **Run** (green button)
6. Done ✅ (Your SwiftStake tables stay untouched)

## Step 2: Get Your Supabase Credentials

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **Anon Key** (long string starting with `eyJ...`)

## Step 3: Update BizFlow Files

Replace in three files:

**index.html** (search for line ~180):
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';          // ← Your Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ← Your Anon Key
```

**app.html** (search for line ~310):
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

**admin.html** (search for line ~275):
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

## Step 4: Create New GitHub Repo

```bash
# Create repo on GitHub called: bizflow
# Then:

git clone https://github.com/yourusername/bizflow.git
cd bizflow

# Copy all these files here:
# - index.html
# - app.html
# - admin.html
# - QUICK_START.md
# - README.md
# - modules/ (entire folder)

git add .
git commit -m "Initial BizFlow setup"
git push -u origin main
```

## Step 5: Enable GitHub Pages

1. Go to repo → **Settings**
2. Scroll to **Pages** (left sidebar)
3. Select: **Deploy from main branch**
4. Wait 2-3 minutes
5. Your site is live at: `https://yourusername.github.io/bizflow/`

## Step 6: Test

1. Open your GitHub Pages URL
2. Sign up:
   - Email: test@example.com
   - Password: anything
   - Business: "Test Salon"
   - Profession: **Salon** ✂️
3. Click "Create Account"
4. You should see Salon Dashboard
5. Try adding a stylist

## File Organization

```
bizflow/ (new repo)
├── index.html
├── app.html
├── admin.html
├── QUICK_START.md
├── README.md
├── modules/
│   ├── salon/
│   │   └── index.js
│   └── restaurant/
│       └── index.js
└── .gitignore (optional)
```

## Important: Keep Them Separate

- **swiftstake-v2** repo → Betting Shop (existing)
- **bizflow** repo → Multi-profession platform (new)

When you're ready to integrate betting shop:
- Add `modules/betting-shop/index.js` to BizFlow
- Either iframe SwiftStake, or migrate features into the module

## Your Supabase Now Has

✅ **Existing (unchanged):**
- All SwiftStake tables (shops, games, floats, debts, etc.)
- All your betting data

✅ **New (just added):**
- `businesses` table
- `user_profiles` table
- `salon_*` tables
- `restaurant_*` tables
- `bookshop_*` tables
- `chemist_*` tables
- `law_firm_*` tables

✅ **RLS policies** prevent data leakage

## Credentials You Need

Copy these from your Supabase project settings:

```
Project URL:    https://xxx.supabase.co
Anon Key:       eyJhbGc...xyz
```

Then paste into the 3 HTML files above.

## Quick Troubleshooting

**"Table already exists"** in SQL Editor
→ Don't worry, it skipped that table. Continue.

**"Auth error" when signing up**
→ Check Supabase URL + key are correct in HTML files

**"Module not found"**
→ Make sure `modules/` folder exists in repo root

**"No data showing"**
→ Check browser DevTools → Network tab for Supabase errors

## Done! 🚀

You now have:
- ✅ Multi-profession platform (Salon, Restaurant, Bookshop, etc.)
- ✅ Existing SwiftStake data safe + untouched
- ✅ Live on GitHub Pages
- ✅ Ready to add more professions

Next: When you want betting shop integrated, just create `modules/betting-shop/` following the salon/restaurant pattern.
