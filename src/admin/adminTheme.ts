// Scoped admin styles. Mirrors the consumer-side palette/typography exactly
// so we don't touch global tokens or affect the homepage.

export const adminCss = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

.ts-admin, .ts-admin *, .ts-admin *::before, .ts-admin *::after {
  box-sizing: border-box;
}
.ts-admin {
  --bg: #06140d;
  --bg-deep: #03100a;
  --surface: #0a1d13;
  --card: #0d2418;
  --card-h: #12301f;
  --border: rgba(255,255,255,0.07);
  --border-h: rgba(201,168,76,0.35);
  --gold: #C9A84C;
  --gold-bright: #E2C06A;
  --gold-dim: rgba(201,168,76,0.6);
  --gold-bg: rgba(201,168,76,0.07);
  --green: #3CAF72;
  --green-bg: rgba(60,175,114,0.1);
  --green-border: rgba(60,175,114,0.28);
  --red: #E05252;
  --red-bg: rgba(224,82,82,0.1);
  --amber: #E8A040;
  --white: #F5F5F0;
  --dim: rgba(245,245,240,0.45);
  --dimmer: rgba(245,245,240,0.22);
  --serif: 'Cormorant Garamond', Georgia, serif;
  --mono: 'DM Mono', monospace;
  --sans: 'DM Sans', system-ui, sans-serif;

  min-height: 100vh;
  background: var(--bg);
  color: var(--white);
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.5;
}

.ts-admin a { color: inherit; text-decoration: none; }
.ts-admin button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
.ts-admin input, .ts-admin textarea, .ts-admin select { font-family: inherit; color: inherit; }

@keyframes ts-flip {
  0% { transform: translateY(-6px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes ts-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes ts-toast-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ts-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.ts-admin .num-flip { animation: ts-flip 0.25s ease forwards; }

/* Layout shell */
.ts-admin .shell { display: flex; flex-direction: column; min-height: 100vh; }
.ts-admin .topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 32px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-deep);
  position: sticky; top: 0; z-index: 30;
}
.ts-admin .topbar::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-dim) 20%, var(--gold-dim) 80%, transparent);
  opacity: 0.5;
}
.ts-admin .wordmark {
  font-family: var(--serif); font-size: 22px; font-weight: 500;
  color: var(--gold); letter-spacing: 0.18em; text-transform: uppercase;
}
.ts-admin .course-tag {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em;
  color: var(--dim); text-transform: uppercase;
}

.ts-admin .body { display: flex; flex: 1; }
.ts-admin .sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--bg-deep);
  border-right: 1px solid var(--border);
  padding: 28px 0;
  display: flex; flex-direction: column;
}
.ts-admin .sidebar nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ts-admin .nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px; position: relative;
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--dim);
  transition: color 0.15s, background 0.15s;
}
.ts-admin .nav-link:hover { color: var(--white); background: rgba(255,255,255,0.02); }
.ts-admin .nav-link.active { color: var(--gold); background: var(--gold-bg); }
.ts-admin .nav-link.active::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: var(--gold);
}
.ts-admin .sidebar .logout {
  margin: 24px 24px 0;
  padding: 11px 16px; border: 1px solid var(--border);
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--dim);
  transition: all 0.15s;
}
.ts-admin .sidebar .logout:hover { color: var(--red); border-color: var(--red); }

.ts-admin .main { flex: 1; padding: 40px 48px 80px; max-width: 1280px; }
.ts-admin .main > * { animation: ts-fade-in 0.3s ease both; }

.ts-admin .hamburger {
  display: none; padding: 8px 12px; border: 1px solid var(--border);
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.15em;
  color: var(--white); text-transform: uppercase;
}

@media (max-width: 860px) {
  .ts-admin .main { padding: 28px 20px 60px; }
  .ts-admin .topbar { padding: 16px 20px; }
  .ts-admin .hamburger { display: inline-block; }
  .ts-admin .sidebar {
    position: fixed; inset: 60px 0 0 0; width: 100%; z-index: 25;
    transform: translateX(-100%); transition: transform 0.2s ease;
  }
  .ts-admin .sidebar.open { transform: translateX(0); }
}

/* Typography */
.ts-admin h1.serif {
  font-family: var(--serif); font-weight: 400;
  font-size: 44px; line-height: 1.1; letter-spacing: -0.01em;
}
.ts-admin h1.serif em { font-style: italic; color: var(--gold); }
.ts-admin .subtitle-mono {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--dim); margin-top: 10px;
}
.ts-admin .section-label {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.25em;
  text-transform: uppercase; color: var(--dim); margin-bottom: 14px;
}
.ts-admin h2.serif {
  font-family: var(--serif); font-weight: 500; font-size: 30px; line-height: 1.15;
}

/* Stat cards */
.ts-admin .stat-grid {
  display: grid; gap: 16px; margin: 32px 0 48px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.ts-admin .stat-card {
  background: var(--card); border: 1px solid var(--border);
  padding: 22px 22px 20px; transition: all 0.2s;
}
.ts-admin .stat-card:hover { background: var(--card-h); border-color: var(--border-h); }
.ts-admin .stat-label {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--dim); margin-bottom: 12px;
}
.ts-admin .stat-value {
  font-family: var(--serif); font-size: 38px; font-weight: 500;
  line-height: 1; color: var(--white);
}
.ts-admin .stat-value.gold { color: var(--gold); }
.ts-admin .stat-value.green { color: var(--green); }
.ts-admin .stat-sub {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--dimmer); margin-top: 10px;
}

/* Activity */
.ts-admin .activity {
  background: var(--card); border: 1px solid var(--border);
  padding: 8px 0;
}
.ts-admin .activity-row {
  display: grid; grid-template-columns: 140px 14px 1fr;
  align-items: center; gap: 16px;
  padding: 14px 24px; border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.ts-admin .activity-row:last-child { border-bottom: none; }
.ts-admin .activity-row:hover { background: var(--card-h); }
.ts-admin .activity-time {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--dim);
}
.ts-admin .activity-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--gold);
}
.ts-admin .activity-dot.green { background: var(--green); }
.ts-admin .activity-dot.dim { background: var(--dim); }
.ts-admin .activity-text { color: var(--white); font-size: 14px; }
.ts-admin .activity-text strong { color: var(--gold); font-weight: 500; }

/* Tables */
.ts-admin .table-wrap {
  background: var(--card); border: 1px solid var(--border);
  overflow-x: auto;
}
.ts-admin table.t {
  width: 100%; border-collapse: collapse;
}
.ts-admin .t thead th {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--dim);
  text-align: left; padding: 16px 20px;
  border-bottom: 1px solid var(--border); font-weight: 400;
}
.ts-admin .t tbody td {
  padding: 18px 20px; border-bottom: 1px solid var(--border);
  font-size: 14px; vertical-align: middle;
}
.ts-admin .t tbody tr { transition: background 0.15s; cursor: pointer; }
.ts-admin .t tbody tr:hover { background: var(--card-h); }
.ts-admin .t tbody tr:last-child td { border-bottom: none; }
.ts-admin .mono { font-family: var(--mono); }
.ts-admin .gold { color: var(--gold); }
.ts-admin .green { color: var(--green); }
.ts-admin .red { color: var(--red); }
.ts-admin .dim { color: var(--dim); }

/* Pills */
.ts-admin .pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 2px;
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase;
}
.ts-admin .pill.live { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
.ts-admin .pill.closing { background: var(--gold-bg); color: var(--gold); border: 1px solid var(--border-h); }
.ts-admin .pill.scheduled { background: rgba(255,255,255,0.04); color: var(--dim); border: 1px solid var(--border); }
.ts-admin .pill.paid { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
.ts-admin .pill.pending { background: var(--gold-bg); color: var(--gold); border: 1px solid var(--border-h); }
.ts-admin .pill.failed { background: var(--red-bg); color: var(--red); border: 1px solid rgba(224,82,82,0.3); }
.ts-admin .pill .dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor;
}
.ts-admin .pill.closing .dot { animation: ts-pulse 1s ease-in-out infinite; }

/* Tabs */
.ts-admin .tabs {
  display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--border);
}
.ts-admin .tab {
  padding: 12px 18px; font-family: var(--mono); font-size: 11px;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim);
  border-bottom: 2px solid transparent; transition: all 0.15s;
}
.ts-admin .tab:hover { color: var(--white); }
.ts-admin .tab.active { color: var(--gold); border-bottom-color: var(--gold); }
.ts-admin .tab .count {
  margin-left: 8px; padding: 2px 6px; background: var(--gold-bg);
  color: var(--gold); border-radius: 2px; font-size: 9px;
}

/* Forms */
.ts-admin .form { max-width: 480px; }
.ts-admin .form-card {
  background: var(--card); border: 1px solid var(--border);
  padding: 36px 32px;
}
.ts-admin .field { margin-bottom: 22px; }
.ts-admin .field-label {
  display: block; font-family: var(--mono); font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--dim);
  margin-bottom: 8px;
}
.ts-admin .field input[type="text"],
.ts-admin .field input[type="email"],
.ts-admin .field input[type="password"],
.ts-admin .field input[type="number"],
.ts-admin .field input[type="date"],
.ts-admin .field input[type="time"],
.ts-admin .field input[type="datetime-local"],
.ts-admin .field textarea,
.ts-admin .field select {
  width: 100%; padding: 12px 14px;
  background: var(--bg-deep); border: 1px solid var(--border);
  color: var(--white); font-size: 14px;
  transition: border-color 0.15s;
}
.ts-admin .field input:focus,
.ts-admin .field textarea:focus,
.ts-admin .field select:focus {
  outline: none; border-color: var(--gold);
}
.ts-admin .field textarea { min-height: 80px; resize: vertical; }
.ts-admin .field-error {
  margin-top: 6px; font-family: var(--mono); font-size: 10px;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--red);
}

.ts-admin .radio-group { display: flex; gap: 8px; }
.ts-admin .radio-pill {
  flex: 1; padding: 11px; text-align: center;
  background: var(--bg-deep); border: 1px solid var(--border);
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.15em;
  color: var(--dim); transition: all 0.15s;
}
.ts-admin .radio-pill:hover { color: var(--white); border-color: var(--gold-dim); }
.ts-admin .radio-pill.selected { background: var(--gold-bg); border-color: var(--gold); color: var(--gold); }

.ts-admin .btn-primary {
  width: 100%; padding: 14px; background: var(--gold);
  color: var(--bg-deep); font-family: var(--mono); font-size: 12px;
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 500;
  transition: all 0.2s; border: 1px solid var(--gold);
}
.ts-admin .btn-primary:hover {
  background: var(--gold-bright); box-shadow: 0 0 24px rgba(201,168,76,0.35);
}
.ts-admin .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.ts-admin .btn-secondary {
  padding: 10px 16px; border: 1px solid var(--border);
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--white); transition: all 0.15s;
}
.ts-admin .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }
.ts-admin .btn-danger { color: var(--red); }
.ts-admin .btn-danger:hover { border-color: var(--red); color: var(--red); }

.ts-admin .helper-card {
  margin-top: 24px; padding: 20px; background: var(--surface);
  border: 1px solid var(--border); border-left: 2px solid var(--gold);
}
.ts-admin .helper-card .h-label {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--gold); margin-bottom: 12px;
}
.ts-admin .helper-card .h-row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 6px 0; font-size: 13px;
}
.ts-admin .helper-card .h-row .num {
  font-family: var(--mono); color: var(--white);
}

/* Toast */
.ts-admin .toast {
  position: fixed; bottom: 32px; right: 32px; z-index: 100;
  padding: 16px 22px; background: var(--card-h);
  border: 1px solid var(--gold); border-left: 3px solid var(--gold);
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--white);
  animation: ts-toast-in 0.25s ease both;
  max-width: 360px;
}
.ts-admin .toast.error { border-color: var(--red); border-left-color: var(--red); }

/* Drawer */
.ts-admin .drawer-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.65);
  z-index: 90; animation: ts-fade-in 0.2s ease both;
}
.ts-admin .drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 480px; max-width: 100%; background: var(--bg-deep);
  border-left: 1px solid var(--border); z-index: 91;
  padding: 32px; overflow-y: auto;
  animation: ts-fade-in 0.25s ease both;
}
.ts-admin .drawer-close {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em;
  color: var(--dim); text-transform: uppercase;
}
.ts-admin .drawer-close:hover { color: var(--gold); }

/* Login */
.ts-admin .login-shell {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 40px 20px; background: var(--bg);
  background-image: radial-gradient(circle at 30% 20%, rgba(60,175,114,0.06), transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(201,168,76,0.05), transparent 50%);
}
.ts-admin .login-card {
  width: 100%; max-width: 420px;
  background: var(--card); border: 1px solid var(--border);
  padding: 40px 36px;
}
.ts-admin .login-brand {
  font-family: var(--serif); font-size: 26px; font-weight: 500;
  color: var(--gold); letter-spacing: 0.18em; text-transform: uppercase;
  text-align: center; margin-bottom: 6px;
}
.ts-admin .login-tag {
  text-align: center; font-family: var(--mono); font-size: 10px;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--dim);
  margin-bottom: 32px;
}
.ts-admin .login-fill {
  display: block; text-align: center; margin-top: 14px;
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--dim);
}
.ts-admin .login-fill:hover { color: var(--gold); }

/* Settings */
.ts-admin .settings-section { margin-bottom: 48px; }
.ts-admin .settings-card {
  background: var(--card); border: 1px solid var(--border);
  padding: 28px 32px;
}
.ts-admin .stripe-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 24px; background: var(--surface);
  border: 1px solid var(--border); margin-bottom: 16px;
}
.ts-admin .stripe-status {
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--dim);
}

/* Modal */
.ts-admin .modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 95; animation: ts-fade-in 0.2s ease both; padding: 20px;
}
.ts-admin .modal {
  background: var(--card); border: 1px solid var(--border);
  padding: 32px; max-width: 460px; width: 100%;
}

/* Bid history list */
.ts-admin .bid-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.ts-admin .bid-row:last-child { border-bottom: none; }
.ts-admin .bid-row .leader { color: var(--gold); }
`;
