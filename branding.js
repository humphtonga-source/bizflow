/* ============================================
   BizFlow — branding.js
   Loads client logo, name & color into the app
   Called once on page load in app.html
   ============================================ */

const BRANDING_DEFAULTS = {
  name:  'BizFlow',
  color: '#f0a500',
  logo:  null
};

// Load branding from Supabase for a given business ID
async function loadBranding(businessId) {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('businesses')
      .select('name, brand_color, logo_url')
      .eq('id', businessId)
      .single();

    if (error || !data) return applyBranding(BRANDING_DEFAULTS);

    applyBranding({
      name:  data.name  || BRANDING_DEFAULTS.name,
      color: data.brand_color || BRANDING_DEFAULTS.color,
      logo:  data.logo_url    || null
    });

  } catch (e) {
    applyBranding(BRANDING_DEFAULTS);
  }
}

// Apply branding to the DOM and CSS variables
function applyBranding({ name, color, logo }) {
  // 1 — CSS accent color (replaces gold everywhere)
  document.documentElement.style.setProperty('--gold', color);
  document.documentElement.style.setProperty('--gold2', lighten(color, 20));
  document.documentElement.style.setProperty('--gold-dim',  hexToRgba(color, 0.12));
  document.documentElement.style.setProperty('--gold-border', hexToRgba(color, 0.25));

  // 2 — Business name in topbar & sidebar footer
  document.querySelectorAll('[data-biz-name]').forEach(el => {
    el.textContent = name;
  });

  // 3 — Logo in topbar (if provided)
  const logoEl = document.getElementById('topbarLogo');
  const nameEl = document.getElementById('topbarName');
  if (logo && logoEl) {
    logoEl.src = logo;
    logoEl.classList.remove('hidden');
    if (nameEl) nameEl.classList.add('hidden');
  }

  // 4 — Page title
  document.title = name + ' — BizFlow';

  // 5 — Sidebar footer
  const footerName = document.getElementById('sidebarBizName');
  if (footerName) footerName.textContent = name;
}

// ── HELPERS ──
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
