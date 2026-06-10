<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BizFlow — Restaurant</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:        #12151c;
    --surface:   #1a1f2e;
    --surface2:  #222840;
    --border:    #2a3050;
    --gold:      #f0a500;
    --gold-dim:  #a06f00;
    --text:      #e8eaf0;
    --muted:     #6b7499;
    --green:     #22c55e;
    --red:       #ef4444;
    --yellow:    #eab308;
    --sidebar-w: 260px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── TOP BAR ── */
  .topbar {
    height: 56px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 14px;
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
  }

  .hamburger {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 4px;
  }
  .hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: all 0.25s;
  }

  .brand {
    font-family: 'DM Sans', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .brand span { color: var(--gold); }

  .topbar-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .bell-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    position: relative;
  }
  .bell-badge {
    position: absolute;
    top: -2px; right: -4px;
    width: 8px; height: 8px;
    background: var(--red);
    border-radius: 50%;
    border: 1.5px solid var(--surface);
  }

  .username {
    font-size: 0.85rem;
    color: var(--muted);
    font-weight: 500;
  }

  .signout-btn {
    font-size: 0.8rem;
    font-family: 'DM Sans', sans-serif;
    background: none;
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 5px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .signout-btn:hover { border-color: var(--gold); color: var(--gold); }

  /* ── LAYOUT ── */
  .layout {
    display: flex;
    margin-top: 56px;
    min-height: calc(100vh - 56px);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--surface);
    border-right: 1px solid var(--border);
    position: fixed;
    top: 56px;
    left: 0;
    bottom: 0;
    overflow-y: auto;
    padding: 20px 0 24px;
    transition: transform 0.28s cubic-bezier(.4,0,.2,1);
    z-index: 90;
  }

  .sidebar.hidden {
    transform: translateX(-100%);
  }

  .nav-section {
    margin-bottom: 6px;
  }

  .nav-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--muted);
    padding: 10px 20px 6px;
    text-transform: uppercase;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.18s;
    font-size: 0.92rem;
    font-weight: 400;
    color: var(--text);
    user-select: none;
  }

  .nav-item:hover {
    background: var(--surface2);
    color: var(--text);
  }

  .nav-item.active {
    background: rgba(240,165,0,0.08);
    border-left-color: var(--gold);
    color: var(--gold);
    font-weight: 500;
  }

  .nav-icon { font-size: 1.1rem; width: 22px; text-align: center; }

  .nav-divider {
    height: 1px;
    background: var(--border);
    margin: 8px 16px;
  }

  /* ── MAIN CONTENT ── */
  .main {
    margin-left: var(--sidebar-w);
    flex: 1;
    padding: 32px 28px;
    transition: margin-left 0.28s cubic-bezier(.4,0,.2,1);
  }

  .main.full { margin-left: 0; }

  .page { display: none; }
  .page.active { display: block; }

  /* placeholder page style */
  .page-header {
    margin-bottom: 28px;
  }
  .page-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .page-header p {
    color: var(--muted);
    font-size: 0.88rem;
    margin-top: 4px;
  }

  .coming-soon {
    margin-top: 60px;
    text-align: center;
  }
  .coming-soon .icon {
    font-size: 3.5rem;
    margin-bottom: 16px;
    opacity: 0.4;
  }
  .coming-soon h2 {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .coming-soon p {
    font-size: 0.85rem;
    color: var(--border);
    max-width: 260px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* ── OVERLAY (mobile) ── */
  .overlay {
    display: none;
    position: fixed;
    inset: 56px 0 0 0;
    background: rgba(0,0,0,0.5);
    z-index: 80;
  }
  .overlay.show { display: block; }

  /* ── SIDEBAR FOOTER ── */
  .sidebar-footer {
    padding: 16px 20px 0;
    border-top: 1px solid var(--border);
    margin-top: 12px;
  }
  .sidebar-footer .restaurant-name {
    font-size: 0.78rem;
    color: var(--gold-dim);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .sidebar-footer .version {
    font-size: 0.72rem;
    color: var(--muted);
    margin-top: 2px;
  }

  /* scrollbar */
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── DASHBOARD ── */
  .dash-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .dash-meta h1 {
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .dash-meta .date-time {
    font-size: 0.8rem;
    color: var(--muted);
    text-align: right;
    line-height: 1.5;
  }

  /* KPI TILES */
  .tiles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
  .tile {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 12px;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s;
    position: relative;
    overflow: hidden;
  }
  .tile:hover { border-color: var(--gold); transform: translateY(-1px); }
  .tile-icon { font-size: 1.3rem; margin-bottom: 6px; }
  .tile-value {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 2px;
  }
  .tile-label {
    font-size: 0.7rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .tile-sub {
    font-size: 0.7rem;
    color: var(--muted);
    margin-top: 4px;
  }
  .tile.red   { border-top: 2px solid var(--red); }
  .tile.green { border-top: 2px solid var(--green); }
  .tile.gold  { border-top: 2px solid var(--gold); }
  .tile.blue  { border-top: 2px solid #3b82f6; }
  .tile.purple{ border-top: 2px solid #a855f7; }
  .tile.delivery { border-top: 2px solid #06b6d4; }

  .tile-value.red    { color: var(--red); }
  .tile-value.green  { color: var(--green); }
  .tile-value.gold   { color: var(--gold); }
  .tile-value.blue   { color: #3b82f6; }
  .tile-value.cyan   { color: #06b6d4; }

  /* second row tiles — 3 col */
  .tiles-row2 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  /* SECTION BLOCKS */
  .dash-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  .dash-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }
  .dash-section-header h3 {
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  .view-all {
    font-size: 0.75rem;
    color: var(--gold);
    cursor: pointer;
    background: none;
    border: none;
    font-family: inherit;
  }
  .view-all:hover { text-decoration: underline; }

  /* ALERTS */
  .alert-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 0.84rem;
  }
  .alert-item:last-child { border-bottom: none; }
  .alert-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .alert-dot.red    { background: var(--red); }
  .alert-dot.yellow { background: var(--yellow); }
  .alert-text { flex: 1; color: var(--text); }
  .alert-time { font-size: 0.72rem; color: var(--muted); }

  /* LIVE TABLES */
  .table-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 0.84rem;
    cursor: pointer;
    transition: background 0.15s;
  }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: var(--surface2); }
  .table-badge {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .table-badge.occ  { background: rgba(239,68,68,0.15); color: var(--red); }
  .table-badge.free { background: rgba(34,197,94,0.15); color: var(--green); }
  .table-info { flex: 1; }
  .table-info strong { display: block; font-size: 0.84rem; font-weight: 500; }
  .table-info span { font-size: 0.73rem; color: var(--muted); }
  .table-arrow { color: var(--muted); font-size: 0.8rem; }
  .table-time { font-size: 0.75rem; color: var(--muted); text-align: right; }

  /* ORDERS FEED */
  .order-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 0.83rem;
  }
  .order-row:last-child { border-bottom: none; }
  .order-tag {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 5px;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 7px;
    color: var(--gold);
    flex-shrink: 0;
  }
  .order-detail { flex: 1; color: var(--text); }
  .order-detail .waiter { font-size: 0.72rem; color: var(--muted); }
  .order-amt { font-weight: 600; font-size: 0.82rem; color: var(--green); }

  /* PAYMENT BAR */
  .pay-row {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
  }
  .pay-row:last-child { border-bottom: none; }
  .pay-label-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    margin-bottom: 5px;
  }
  .pay-label-row span:last-child { color: var(--green); font-weight: 600; }
  .pay-bar-bg {
    height: 6px;
    background: var(--surface2);
    border-radius: 3px;
    overflow: hidden;
  }
  .pay-bar-fill {
    height: 100%;
    border-radius: 3px;
  }
  .pay-total {
    display: flex;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--gold);
    border-top: 1px solid var(--border);
  }

  /* HIGHLIGHTS */
  .highlight-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 0.84rem;
  }
  .highlight-row:last-child { border-bottom: none; }
  .highlight-icon { font-size: 1.1rem; width: 24px; text-align: center; }
  .highlight-label { color: var(--muted); font-size: 0.78rem; flex: 1; }
  .highlight-value { font-weight: 600; color: var(--text); }

  @media (max-width: 640px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; padding: 20px 14px; }
    .username { display: none; }
    .tiles { grid-template-columns: repeat(2, 1fr); }
    .tiles-row2 { grid-template-columns: repeat(2, 1fr); }
    .dash-meta { flex-direction: column; align-items: flex-start; gap: 4px; }
    .dash-meta .date-time { text-align: left; }
  }
</style>
</head>
<body>

<!-- TOP BAR -->
<header class="topbar">
  <button class="hamburger" id="menuToggle" aria-label="Toggle menu">
    <span></span><span></span><span></span>
  </button>
  <div class="brand">Biz <span>Flow</span></div>
  <div class="topbar-right">
    <button class="bell-btn" aria-label="Notifications">
      🔔<span class="bell-badge"></span>
    </button>
    <span class="username">james</span>
    <button class="signout-btn">Sign out</button>
  </div>
</header>

<div class="overlay" id="overlay"></div>

<div class="layout">

  <!-- SIDEBAR -->
  <nav class="sidebar" id="sidebar">

    <div class="nav-section">
      <div class="nav-label">Main</div>
      <div class="nav-item active" data-page="dashboard">
        <span class="nav-icon">🏠</span> Dashboard
      </div>
      <div class="nav-item" data-page="tables">
        <span class="nav-icon">🪑</span> Tables
      </div>
      <div class="nav-item" data-page="orders">
        <span class="nav-icon">📋</span> Orders
      </div>
      <div class="nav-item" data-page="menu">
        <span class="nav-icon">🍛</span> Menu
      </div>
    </div>

    <div class="nav-divider"></div>

    <div class="nav-section">
      <div class="nav-label">Operations</div>
      <div class="nav-item" data-page="finance">
        <span class="nav-icon">💰</span> Finance
      </div>
      <div class="nav-item" data-page="inventory">
        <span class="nav-icon">📦</span> Inventory
      </div>
      <div class="nav-item" data-page="staff">
        <span class="nav-icon">👨‍🍳</span> Staff
      </div>
      <div class="nav-item" data-page="suppliers">
        <span class="nav-icon">🚚</span> Suppliers
      </div>
    </div>

    <div class="nav-divider"></div>

    <div class="nav-section">
      <div class="nav-label">Admin</div>
      <div class="nav-item" data-page="clients">
        <span class="nav-icon">👤</span> Clients
      </div>
      <div class="nav-item" data-page="reports">
        <span class="nav-icon">📊</span> Reports
      </div>
      <div class="nav-item" data-page="settings">
        <span class="nav-icon">⚙️</span> Settings
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="restaurant-name">My Restaurant</div>
      <div class="version">BizFlow v1.0 · Kenya</div>
    </div>

  </nav>

  <!-- MAIN CONTENT -->
  <main class="main" id="main">

    <!-- DASHBOARD -->
    <div class="page active" id="page-dashboard">

      <!-- Header -->
      <div class="dash-meta">
        <h1>🏠 Dashboard</h1>
        <div class="date-time">
          <div id="dash-date" style="font-weight:500;color:var(--text)"></div>
          <div id="dash-time" style="color:var(--muted)"></div>
        </div>
      </div>

      <!-- ROW 1 — 6 KPI tiles -->
      <div class="tiles">
        <div class="tile gold">
          <div class="tile-icon">💰</div>
          <div class="tile-value gold">KES 14,500</div>
          <div class="tile-label">Today's Sales</div>
        </div>
        <div class="tile red" onclick="navTo('tables')" title="View occupied tables">
          <div class="tile-icon">🔴</div>
          <div class="tile-value red">7 / 12</div>
          <div class="tile-label">Occupied</div>
          <div class="tile-sub">tap to view →</div>
        </div>
        <div class="tile green" onclick="navTo('tables')" title="View available tables">
          <div class="tile-icon">🟢</div>
          <div class="tile-value green">5 / 12</div>
          <div class="tile-label">Available</div>
          <div class="tile-sub">tap to view →</div>
        </div>
        <div class="tile blue">
          <div class="tile-icon">🛵</div>
          <div class="tile-value blue">3</div>
          <div class="tile-label">Deliveries</div>
          <div class="tile-sub">active now</div>
        </div>
        <div class="tile purple">
          <div class="tile-icon">📋</div>
          <div class="tile-value" style="color:#a855f7">5</div>
          <div class="tile-label">Orders</div>
          <div class="tile-sub">pending</div>
        </div>
        <div class="tile" style="border-top:2px solid #06b6d4">
          <div class="tile-icon">👨‍🍳</div>
          <div class="tile-value cyan">4 / 6</div>
          <div class="tile-label">Staff</div>
          <div class="tile-sub">on shift</div>
        </div>
      </div>

      <!-- ALERTS -->
      <div class="dash-section">
        <div class="dash-section-header">
          <h3>⚠️ Alerts</h3>
          <span style="font-size:0.72rem;color:var(--red);font-weight:600;">2 urgent</span>
        </div>
        <div class="alert-item">
          <div class="alert-dot red"></div>
          <div class="alert-text">Table 6 — order not billed for 45 mins</div>
          <div class="alert-time">45m ago</div>
        </div>
        <div class="alert-item">
          <div class="alert-dot red"></div>
          <div class="alert-text">1 cancelled order pending your review</div>
          <div class="alert-time">just now</div>
        </div>
        <div class="alert-item">
          <div class="alert-dot yellow"></div>
          <div class="alert-text">Beef stock low — 2kg remaining</div>
          <div class="alert-time">today</div>
        </div>
        <div class="alert-item">
          <div class="alert-dot yellow"></div>
          <div class="alert-text">Table 3 — bill requested 8 mins ago</div>
          <div class="alert-time">8m ago</div>
        </div>
        <div class="alert-item">
          <div class="alert-dot yellow"></div>
          <div class="alert-text">Glovo Order #05 — prep taking over 30 mins</div>
          <div class="alert-time">30m ago</div>
        </div>
      </div>

      <!-- LIVE TABLES SNAPSHOT -->
      <div class="dash-section">
        <div class="dash-section-header">
          <h3>🪑 Live Tables</h3>
          <button class="view-all" onclick="navTo('tables')">View all →</button>
        </div>
        <div class="table-row" onclick="navTo('tables')">
          <div class="table-badge occ">T2</div>
          <div class="table-info">
            <strong>Waiter: James &nbsp;·&nbsp; 3 orders</strong>
            <span>Nyama Choma, 2× Tusker, Ugali</span>
          </div>
          <div class="table-time">42 mins<br><span style="color:var(--red);font-size:0.7rem">⚠ long</span></div>
          <div class="table-arrow">›</div>
        </div>
        <div class="table-row" onclick="navTo('tables')">
          <div class="table-badge occ">T5</div>
          <div class="table-info">
            <strong>Waiter: Aisha &nbsp;·&nbsp; 2 orders</strong>
            <span>Pilau × 2, Fresh Juice</span>
          </div>
          <div class="table-time">18 mins</div>
          <div class="table-arrow">›</div>
        </div>
        <div class="table-row" onclick="navTo('tables')">
          <div class="table-badge occ">T7</div>
          <div class="table-info">
            <strong>Waiter: Brian &nbsp;·&nbsp; 1 order</strong>
            <span>Tilapia + Ugali</span>
          </div>
          <div class="table-time">8 mins</div>
          <div class="table-arrow">›</div>
        </div>
        <div class="table-row" onclick="navTo('tables')">
          <div class="table-badge free">T1</div>
          <div class="table-info">
            <strong style="color:var(--green)">Available</strong>
            <span>Free since 1:20 PM</span>
          </div>
          <div class="table-time" style="color:var(--green)">Free</div>
          <div class="table-arrow">›</div>
        </div>
        <div class="table-row" onclick="navTo('tables')">
          <div class="table-badge free">T4</div>
          <div class="table-info">
            <strong style="color:var(--green)">Available</strong>
            <span>Free since 2:05 PM</span>
          </div>
          <div class="table-time" style="color:var(--green)">Free</div>
          <div class="table-arrow">›</div>
        </div>
      </div>

      <!-- RECENT ORDERS -->
      <div class="dash-section">
        <div class="dash-section-header">
          <h3>📋 Recent Orders</h3>
          <button class="view-all" onclick="navTo('orders')">View all →</button>
        </div>
        <div class="order-row">
          <div class="order-tag">T4</div>
          <div class="order-detail">
            Nyama Choma + 2× Tusker
            <div class="waiter">James · Dine-in · 2:38 PM</div>
          </div>
          <div class="order-amt">KES 1,200</div>
        </div>
        <div class="order-row">
          <div class="order-tag">T2</div>
          <div class="order-detail">
            Pilau + Fresh Juice
            <div class="waiter">Aisha · Dine-in · 2:31 PM</div>
          </div>
          <div class="order-amt">KES 650</div>
        </div>
        <div class="order-row">
          <div class="order-tag" style="color:#06b6d4">🛵</div>
          <div class="order-detail">
            Ugali + Tilapia × 2
            <div class="waiter">Glovo · Delivery · 2:25 PM</div>
          </div>
          <div class="order-amt">KES 960</div>
        </div>
        <div class="order-row">
          <div class="order-tag">T9</div>
          <div class="order-detail">
            Chai + Mandazi × 3
            <div class="waiter">Brian · Dine-in · 2:10 PM</div>
          </div>
          <div class="order-amt">KES 150</div>
        </div>
      </div>

      <!-- PAYMENT BREAKDOWN -->
      <div class="dash-section">
        <div class="dash-section-header">
          <h3>💳 Payment Breakdown</h3>
        </div>
        <div class="pay-row">
          <div class="pay-label-row"><span>Cash</span><span>KES 8,200</span></div>
          <div class="pay-bar-bg"><div class="pay-bar-fill" style="width:57%;background:#f0a500"></div></div>
        </div>
        <div class="pay-row">
          <div class="pay-label-row"><span>M-Pesa</span><span>KES 5,100</span></div>
          <div class="pay-bar-bg"><div class="pay-bar-fill" style="width:35%;background:#22c55e"></div></div>
        </div>
        <div class="pay-row">
          <div class="pay-label-row"><span>Card</span><span>KES 1,200</span></div>
          <div class="pay-bar-bg"><div class="pay-bar-fill" style="width:8%;background:#3b82f6"></div></div>
        </div>
        <div class="pay-total"><span>Total Today</span><span>KES 14,500</span></div>
      </div>

      <!-- TODAY'S HIGHLIGHTS -->
      <div class="dash-section">
        <div class="dash-section-header">
          <h3>🏆 Today's Highlights</h3>
        </div>
        <div class="highlight-row">
          <div class="highlight-icon">🍛</div>
          <div class="highlight-label">Best Dish</div>
          <div class="highlight-value">Pilau — 23 portions</div>
        </div>
        <div class="highlight-row">
          <div class="highlight-icon">🧑</div>
          <div class="highlight-label">Top Waiter</div>
          <div class="highlight-value">James — KES 6,400</div>
        </div>
        <div class="highlight-row">
          <div class="highlight-icon">⏱️</div>
          <div class="highlight-label">Avg Table Turnover</div>
          <div class="highlight-value">38 mins</div>
        </div>
        <div class="highlight-row">
          <div class="highlight-icon">🛵</div>
          <div class="highlight-label">Deliveries Completed</div>
          <div class="highlight-value">7 orders</div>
        </div>
      </div>

    </div>

    <!-- TABLES -->
    <div class="page" id="page-tables">
      <div class="page-header">
        <h1>🪑 Tables</h1>
        <p>Manage dine-in tables, status and assignments.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">🪑</div>
        <h2>Tables coming soon</h2>
        <p>Table grid, live occupancy status and waiter assignments will appear here.</p>
      </div>
    </div>

    <!-- ORDERS -->
    <div class="page" id="page-orders">
      <div class="page-header">
        <h1>📋 Orders</h1>
        <p>Track dine-in, takeaway and delivery orders.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">📋</div>
        <h2>Orders coming soon</h2>
        <p>Active orders, kitchen queue and delivery tracking will appear here.</p>
      </div>
    </div>

    <!-- MENU -->
    <div class="page" id="page-menu">
      <div class="page-header">
        <h1>🍛 Menu</h1>
        <p>Manage items, categories, pricing and availability.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">🍛</div>
        <h2>Menu coming soon</h2>
        <p>Menu categories, item cards, KES pricing and daily specials will appear here.</p>
      </div>
    </div>

    <!-- FINANCE -->
    <div class="page" id="page-finance">
      <div class="page-header">
        <h1>💰 Finance</h1>
        <p>Track sales, payments and daily revenue.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">💰</div>
        <h2>Finance coming soon</h2>
        <p>M-Pesa, cash and card breakdowns, billing and receipts will appear here.</p>
      </div>
    </div>

    <!-- INVENTORY -->
    <div class="page" id="page-inventory">
      <div class="page-header">
        <h1>📦 Inventory</h1>
        <p>Monitor stock levels, wastage and low stock alerts.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">📦</div>
        <h2>Inventory coming soon</h2>
        <p>Daily stock-in, ingredient tracking and wastage recording will appear here.</p>
      </div>
    </div>

    <!-- STAFF -->
    <div class="page" id="page-staff">
      <div class="page-header">
        <h1>👨‍🍳 Staff</h1>
        <p>Manage roles, shifts and performance.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">👨‍🍳</div>
        <h2>Staff coming soon</h2>
        <p>Waiter, chef and cashier profiles, shifts and tips tracking will appear here.</p>
      </div>
    </div>

    <!-- SUPPLIERS -->
    <div class="page" id="page-suppliers">
      <div class="page-header">
        <h1>🚚 Suppliers</h1>
        <p>Local supplier contacts and purchase orders.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">🚚</div>
        <h2>Suppliers coming soon</h2>
        <p>Supplier contacts, purchase orders and delivery tracking will appear here.</p>
      </div>
    </div>

    <!-- CLIENTS -->
    <div class="page" id="page-clients">
      <div class="page-header">
        <h1>👤 Clients</h1>
        <p>Manage customer records and loyalty.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">👤</div>
        <h2>Clients coming soon</h2>
        <p>Customer profiles, order history and loyalty tracking will appear here.</p>
      </div>
    </div>

    <!-- REPORTS -->
    <div class="page" id="page-reports">
      <div class="page-header">
        <h1>📊 Reports</h1>
        <p>Daily, weekly and monthly business insights.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">📊</div>
        <h2>Reports coming soon</h2>
        <p>Sales summaries, best-selling dishes and cost vs revenue charts will appear here.</p>
      </div>
    </div>

    <!-- SETTINGS -->
    <div class="page" id="page-settings">
      <div class="page-header">
        <h1>⚙️ Settings</h1>
        <p>Configure your restaurant and app preferences.</p>
      </div>
      <div class="coming-soon">
        <div class="icon">⚙️</div>
        <h2>Settings coming soon</h2>
        <p>Restaurant name, staff roles, service charge and app preferences will appear here.</p>
      </div>
    </div>

  </main>
</div>

<script>
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const mainEl = document.getElementById('main');
  const overlay = document.getElementById('overlay');
  let sidebarOpen = true;

  function toggleSidebar() {
    const isMobile = window.innerWidth <= 640;
    if (isMobile) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    } else {
      sidebarOpen = !sidebarOpen;
      sidebar.classList.toggle('hidden', !sidebarOpen);
      mainEl.classList.toggle('full', !sidebarOpen);
    }
  }

  toggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // Dashboard clock
  function updateClock() {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateEl = document.getElementById('dash-date');
    const timeEl = document.getElementById('dash-time');
    if (dateEl) dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Navigate to a page from dashboard tiles
  function navTo(page) {
    document.querySelectorAll('.nav-item').forEach(i => {
      i.classList.toggle('active', i.dataset.page === page);
    });
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
  }

  // Nav routing
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;

      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');

      // close on mobile after nav
      if (window.innerWidth <= 640) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      }
    });
  });
</script>
</body>
</html>

