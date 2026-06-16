/* ============================================
   BizFlow — auth.js
   Session management — used on every page
   ============================================ */

// Require login — call at top of every protected page
async function requireAuth(redirectTo = '/bizflow/auth.html') {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

// Get current session (no redirect)
async function getSession() {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

// Sign out and redirect
async function signOut(redirectTo = '/bizflow/auth.html') {
  const sb = getSupabase();
  await sb.auth.signOut();
  window.location.href = redirectTo;
}

// Get business ID from URL params
function getBusinessId() {
  return new URLSearchParams(window.location.search).get('bid');
}

// Get profession from URL params
function getProfession() {
  return new URLSearchParams(window.location.search).get('prof');
}

// Populate topbar username
function setTopbarUser(session) {
  const el = document.getElementById('topbarUser');
  if (el && session?.user?.email) {
    el.textContent = session.user.email.split('@')[0];
  }
}
