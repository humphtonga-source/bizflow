/* ============================================
   BizFlow — utils.js
   Shared helpers used across all modules
   ============================================ */

// ── FORMATTING ──
function formatKES(amount) {
  return 'KES ' + Number(amount).toLocaleString('en-KE');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)  return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

// ── TOAST NOTIFICATIONS ──
function showToast(message, type = 'success', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ── NAVIGATION ──
function navTo(page) {
  document.querySelectorAll('.nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

// ── CLOCK ──
function startClock(dateElId, timeElId) {
  function update() {
    const now  = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateEl = document.getElementById(dateElId);
    const timeEl = document.getElementById(timeElId);
    if (dateEl) dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  }
  update();
  setInterval(update, 1000);
}

// ── SIDEBAR TOGGLE ──
function initSidebar() {
  const toggle  = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('mainContent');
  const overlay = document.getElementById('overlay');
  let open = true;

  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    const mobile = window.innerWidth <= 640;
    if (mobile) {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('show');
    } else {
      open = !open;
      sidebar.classList.toggle('hidden', !open);
      main?.classList.toggle('expanded', !open);
    }
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // Nav item clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navTo(item.dataset.page);
      if (window.innerWidth <= 640) {
        sidebar.classList.remove('open');
        overlay?.classList.remove('show');
      }
    });
  });
}

// ── LOADING STATE ──
function showLoading(containerId, message = 'Loading…') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `
    <div style="text-align:center;padding:60px 20px">
      <div class="spinner" style="margin-bottom:14px"></div>
      <p class="text-muted text-sm">${message}</p>
    </div>`;
}
