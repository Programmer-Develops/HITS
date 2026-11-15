// Ashish watermark: source-only UI refresh; this comment is not rendered.
const visualRefresh = `
:root[data-theme="dark"] {
  --bg-canvas: #08111f;
  --bg-sidebar: #0b1628;
  --bg-card: rgba(16, 29, 51, 0.84);
  --bg-card-hover: rgba(24, 42, 71, 0.92);
  --bg-elevated: #111d33;
  --bg-input: rgba(10, 22, 40, 0.82);
  --bg-thead: rgba(191, 219, 254, 0.05);
  --bg-media: #070e1a;
  --border: rgba(164, 190, 228, 0.17);
  --border-subtle: rgba(164, 190, 228, 0.1);
  --border-focus: rgba(96, 165, 250, 0.62);
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-soft: rgba(59, 130, 246, 0.16);
  --primary-border: rgba(96, 165, 250, 0.34);
  --primary-text: #bfdbfe;
  --primary-glow: rgba(59, 130, 246, 0.3);
  --clean: #4ade80;
  --clean-soft: rgba(74, 222, 128, 0.12);
  --clean-border: rgba(74, 222, 128, 0.25);
  --text-primary: #f1f6ff;
  --text-secondary: #c6d3e8;
  --text-muted: #91a2bd;
  --shadow-card: 0 14px 36px rgba(0, 0, 0, 0.2);
  --shadow-modal: 0 28px 80px rgba(0, 0, 0, 0.62);
  --radius-lg: 22px;
  --radius: 16px;
  --radius-sm: 11px;
}

:root[data-theme="light"] {
  --bg-canvas: #f2f6fc;
  --bg-sidebar: rgba(250, 252, 255, 0.92);
  --bg-card: #ffffff;
  --bg-card-hover: #f5f8fe;
  --bg-elevated: #ffffff;
  --bg-input: #f7f9fd;
  --bg-thead: #f4f7fc;
  --bg-media: #eaf0f9;
  --border: #dce5f2;
  --border-subtle: #e9eef7;
  --border-focus: rgba(37, 99, 235, 0.52);
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-soft: #eaf2ff;
  --primary-border: #c6d9ff;
  --primary-text: #1d4ed8;
  --primary-glow: rgba(37, 99, 235, 0.2);
  --clean: #16803d;
  --clean-soft: #e7f7eb;
  --clean-border: #c3e9cd;
  --text-primary: #17243b;
  --text-secondary: #41516d;
  --text-muted: #71809a;
  --shadow-card: 0 14px 36px rgba(35, 57, 91, 0.08);
  --shadow-modal: 0 28px 80px rgba(24, 42, 73, 0.24);
}

body {
  background:
    radial-gradient(ellipse at 82% 0%, rgba(59, 130, 246, 0.1), transparent 34rem),
    var(--bg-canvas);
}

body::before {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 10% 18%, rgba(59, 130, 246, 0.09), transparent 28rem),
    radial-gradient(ellipse at 88% 78%, rgba(34, 211, 238, 0.06), transparent 30rem);
  content: "";
  pointer-events: none;
  animation: ashish-aurora 24s ease-in-out infinite alternate;
}

body::after {
  position: fixed;
  right: -14rem;
  bottom: -19rem;
  z-index: -1;
  width: 40rem;
  aspect-ratio: 1;
  border: 1px solid rgba(147, 197, 253, 0.08);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.09), transparent 68%);
  box-shadow: 0 0 0 38px rgba(147, 197, 253, 0.018), 0 0 0 78px rgba(147, 197, 253, 0.014);
  content: "";
  pointer-events: none;
}

.sidebar {
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg-sidebar) 92%, transparent), color-mix(in srgb, var(--bg-sidebar) 82%, var(--primary) 18%));
  backdrop-filter: blur(24px) saturate(145%);
  -webkit-backdrop-filter: blur(24px) saturate(145%);
  box-shadow: 12px 0 40px rgba(0, 0, 0, 0.08);
}

.sidebar-header {
  padding: 24px 20px;
}

.logo-mark,
.mobile-logo-mark {
  border-radius: 12px;
  filter: drop-shadow(0 5px 14px rgba(59, 130, 246, 0.3));
  animation: ashish-logo-float 5s ease-in-out infinite;
}

.logo-title {
  letter-spacing: 1.2px;
}

.logo-sub {
  letter-spacing: 0.01em;
}

.sidebar-nav {
  padding: 22px 14px;
  gap: 7px;
}

.nav-item {
  position: relative;
  min-height: 46px;
  padding: 11px 14px;
  border-radius: 12px;
  transition: background-color 180ms ease, color 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.nav-item:hover {
  transform: translateX(3px);
}

.nav-item.active {
  background: linear-gradient(100deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 55%, transparent));
  box-shadow: inset 3px 0 0 var(--primary);
  backdrop-filter: blur(14px) saturate(145%);
  -webkit-backdrop-filter: blur(14px) saturate(145%);
}

.sidebar-footer {
  padding: 16px 14px 20px;
}

.connection-status,
.sidebar-control-btn {
  border-radius: 12px;
}

.connection-status .status-dot {
  box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 14%, transparent);
}

.main-content {
  min-height: 100vh;
}

.page {
  max-width: 1440px;
  padding: 38px clamp(22px, 4vw, 58px) 64px;
  animation: ashish-page-in 420ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
}

.page-header,
.toolbar {
  margin-bottom: 30px;
}

.page-title-row {
  gap: 16px;
}

.title-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: linear-gradient(145deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 45%, transparent));
  border-color: color-mix(in srgb, var(--primary-border) 80%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 8px 22px var(--primary-glow);
  backdrop-filter: blur(14px) saturate(150%);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
}

.page-title {
  font-size: clamp(24px, 2vw, 30px);
  letter-spacing: -0.035em;
}

.page-sub {
  font-size: 13.5px;
}

.page-section {
  margin-top: 34px;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  letter-spacing: -0.01em;
}

.stats-grid {
  gap: 18px;
  margin-bottom: 34px;
}

.stat-card,
.block-card,
.feed-item,
.form-card,
.info-card,
.table-container {
  position: relative;
  border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}

.stat-card {
  min-height: 138px;
  padding: 21px 22px;
  overflow: hidden;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--bg-card) 94%, var(--primary) 6%), var(--bg-card));
  animation: ashish-card-in 520ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.stat-card:nth-child(2) { animation-delay: 55ms; }
.stat-card:nth-child(3) { animation-delay: 110ms; }
.stat-card:nth-child(4) { animation-delay: 165ms; }

.stat-card::after {
  position: absolute;
  right: -24px;
  bottom: -50px;
  width: 130px;
  height: 130px;
  border: 1px solid color-mix(in srgb, var(--primary-border) 72%, transparent);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.stat-card:hover {
  border-color: var(--primary-border);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.13);
  transform: translateY(-4px);
}

.stat-label {
  font-size: 13.5px;
  letter-spacing: 0.01em;
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-subtle);
  border-radius: 13px;
  background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.1), transparent 65%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 7px 16px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
}

.stat-icon-wrap.clean {
  color: var(--primary-text);
  background-color: var(--primary-soft);
}

.stat-card:hover .stat-icon-wrap {
  border-color: var(--primary-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 24px var(--primary-glow);
  transform: translateY(-2px) rotate(3deg);
}

.stat-value {
  font-size: clamp(32px, 3vw, 40px);
  letter-spacing: -0.05em;
}

.blocks-grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 285px), 1fr));
  gap: 16px;
}

.block-card {
  min-height: 132px;
  padding: 19px 20px;
  overflow: hidden;
  background: linear-gradient(145deg, color-mix(in srgb, var(--bg-card) 88%, white 3%), color-mix(in srgb, var(--bg-card) 94%, var(--primary) 6%));
  animation: ashish-card-in 500ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.block-card:hover {
  border-color: var(--border);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

.block-name {
  font-size: 15.5px;
}

.block-meta {
  margin-top: 16px;
  line-height: 1.5;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 999px;
  letter-spacing: 0.01em;
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
}

.status-badge.clean {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.live-dot {
  box-shadow: 0 0 0 4px var(--clean-soft);
}

.feed-item {
  padding: 15px 18px;
  animation: ashish-card-in 420ms ease both;
  background: color-mix(in srgb, var(--bg-card) 86%, transparent);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.feed-item:hover {
  transform: translateX(3px);
}

.photo-thumb-btn {
  border-radius: 12px;
}

.feed-photo,
.report-thumb {
  border-radius: inherit;
}

.feed-empty-card {
  min-height: 190px;
  justify-content: center;
  border-radius: var(--radius);
  background:
    radial-gradient(circle at 50% 20%, var(--primary-soft), transparent 48%),
    color-mix(in srgb, var(--bg-card) 88%, transparent);
  border-color: color-mix(in srgb, var(--primary-border) 62%, var(--border));
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.feed-empty-card svg {
  color: var(--primary-text);
  opacity: 0.82;
}

.btn,
.icon-btn,
.mobile-pill-btn,
.sidebar-control-btn {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  transition: transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 170ms ease, border-color 170ms ease, box-shadow 190ms ease, color 170ms ease;
}

.icon-btn,
.mobile-pill-btn,
.sidebar-control-btn,
.btn-ghost,
.btn-danger {
  background-color: color-mix(in srgb, var(--bg-card) 78%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 5px 14px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(14px) saturate(155%);
  -webkit-backdrop-filter: blur(14px) saturate(155%);
}

.btn::after,
.icon-btn::after,
.mobile-pill-btn::after,
.sidebar-control-btn::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.32), transparent 68%);
  content: "";
  opacity: 0;
  pointer-events: none;
  transform: scale(0.45);
  transition: opacity 160ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.btn:active,
.icon-btn:active,
.mobile-pill-btn:active,
.sidebar-control-btn:active {
  box-shadow: inset 0 2px 7px rgba(0, 0, 0, 0.25), 0 0 0 4px var(--primary-soft);
  transform: translateY(1px) scale(0.94);
}

.btn:active::after,
.icon-btn:active::after,
.mobile-pill-btn:active::after,
.sidebar-control-btn:active::after {
  opacity: 1;
  transform: scale(1.3);
}

.btn-primary:hover {
  box-shadow: 0 10px 24px var(--primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.btn-ghost:hover,
.icon-btn:hover,
.mobile-pill-btn:hover,
.sidebar-control-btn:hover {
  border-color: var(--primary-border);
  box-shadow: 0 8px 20px var(--primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.btn-primary {
  background: linear-gradient(135deg, #60a5fa, var(--primary) 58%, #2563eb);
  box-shadow: 0 7px 18px var(--primary-glow);
  border-color: rgba(191, 219, 254, 0.25);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
}

.btn-primary:hover,
.icon-btn:hover,
.sidebar-control-btn:hover {
  transform: translateY(-2px);
}

.btn:active,
.icon-btn:active,
.sidebar-control-btn:active {
  transform: translateY(1px) scale(0.94);
}

.form-card,
.info-card {
  padding: 24px;
  background: color-mix(in srgb, var(--bg-card) 86%, transparent);
  border-color: color-mix(in srgb, var(--border) 84%, var(--primary) 16%);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
}

.form-card-header {
  margin-bottom: 18px;
}

input,
select {
  min-height: 44px;
  border-radius: 11px;
}

.block-option {
  border-radius: 11px;
}

.table-container {
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-card) 88%, transparent);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

th {
  padding-top: 15px;
  padding-bottom: 15px;
  letter-spacing: 0.07em;
}

tbody tr {
  transition: background-color 160ms ease;
}

td {
  padding-top: 15px;
  padding-bottom: 15px;
}

.filter-bar {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--bg-card) 90%, transparent);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.title-icon-badge svg,
.stat-icon-wrap svg,
.nav-item .nav-icon,
.section-title svg,
button svg {
  transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 200ms ease;
}

.title-icon-badge svg {
  filter: drop-shadow(0 0 8px var(--primary-glow));
  animation: ashish-icon-float 4s ease-in-out infinite;
}

.nav-item:hover .nav-icon,
button:hover svg {
  filter: drop-shadow(0 0 7px var(--primary-glow));
  transform: translateY(-1px) scale(1.08);
}

.nav-item:hover .nav-icon {
  transform: translateX(1px) rotate(-5deg) scale(1.08);
}

.btn:active svg,
.icon-btn:active svg,
.mobile-pill-btn:active svg,
.sidebar-control-btn:active svg {
  transform: scale(0.86);
}

.section-title svg,
.feed-empty-card svg {
  filter: drop-shadow(0 0 9px var(--primary-glow));
}

.photo-thumb-btn:hover {
  box-shadow: 0 0 0 4px var(--primary-soft), 0 8px 20px var(--primary-glow);
}

.block-option,
.chip,
.repair-item,
.info-note,
.status-dot-pill,
.connection-status,
.feed-empty-card,
.modal-header,
.modal-footer {
  backdrop-filter: blur(14px) saturate(145%);
  -webkit-backdrop-filter: blur(14px) saturate(145%);
}

.block-option,
.chip,
.repair-item,
.info-note {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.block-option:hover,
.block-option.selected,
.chip {
  border-color: color-mix(in srgb, var(--primary-border) 82%, transparent);
}

input,
select {
  background-color: color-mix(in srgb, var(--bg-input) 88%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.mobile-header {
  border-color: color-mix(in srgb, var(--border) 76%, transparent);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
}

.sidebar-header,
.sidebar-footer {
  border-color: color-mix(in srgb, var(--border) 76%, transparent);
}

.nav-item[href="/workers"]:hover .nav-icon {
  animation: ashish-workers-turn 560ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.nav-item[href="/reports"]:hover .nav-icon {
  animation: ashish-reports-turn 520ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.nav-item[href="/settings"]:hover .nav-icon {
  animation: ashish-settings-turn 520ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

button:hover svg {
  animation: ashish-icon-pop 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.nav-item:hover .nav-icon {
  animation-fill-mode: both;
}

:root[data-theme="dark"] .lucide-moon {
  color: #dbeafe;
  filter: drop-shadow(0 0 4px #93c5fd) drop-shadow(0 0 10px rgba(96, 165, 250, 0.8));
  animation: ashish-moon-glow 3.2s ease-in-out infinite;
}

:root[data-theme="light"] .lucide-sun {
  color: #f59e0b;
  filter: drop-shadow(0 0 4px #fde68a) drop-shadow(0 0 10px rgba(251, 191, 36, 0.75));
  animation: ashish-sun-glow 3s ease-in-out infinite;
}

.sidebar-control-btn .lucide-moon,
.sidebar-control-btn .lucide-sun {
  flex-shrink: 0;
}

.btn:not(:has(svg))::before {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
}

.btn-primary:not(:has(svg))::before { content: "✓"; }
.btn-ghost:not(:has(svg))::before { content: "↩"; }
.btn-danger:not(:has(svg))::before { content: "×"; }

.link-btn::before {
  margin-right: 5px;
  color: var(--primary-text);
  content: "✦";
  font-size: 10px;
}

.loading {
  position: relative;
  min-height: 240px;
  margin: 20px 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 50% 42%, var(--primary-soft), transparent 38%),
    color-mix(in srgb, var(--bg-card) 82%, transparent);
  box-shadow: var(--shadow-card), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}

.loading span {
  animation: ashish-loading-breathe 1.8s ease-in-out infinite;
}

.spinner {
  position: relative;
  width: 42px;
  height: 42px;
  border: 3px solid color-mix(in srgb, var(--primary-border) 45%, transparent);
  border-top-color: #93c5fd;
  border-right-color: var(--primary);
  box-shadow: 0 0 18px var(--primary-glow);
  animation: ashish-spinner 850ms linear infinite;
}

.spinner::before {
  position: absolute;
  inset: 5px;
  border: 2px solid transparent;
  border-bottom-color: #67e8f9;
  border-left-color: color-mix(in srgb, var(--primary) 55%, transparent);
  border-radius: 50%;
  content: "";
  animation: ashish-spinner 1.35s linear infinite reverse;
}

.spinner::after {
  position: absolute;
  top: -4px;
  left: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e0f2fe;
  box-shadow: 0 0 10px #60a5fa, 0 0 18px #3b82f6;
  content: "";
  transform: translateX(-50%);
}

.connection-status,
.sidebar-control-btn,
.mobile-pill-btn,
.icon-btn,
.filter-bar,
.table-container,
.form-card,
.info-card {
  backdrop-filter: blur(16px) saturate(145%);
  -webkit-backdrop-filter: blur(16px) saturate(145%);
}

.search-box input,
.filter-select {
  min-height: 46px;
  border-radius: 12px;
}

.privacy-section + .privacy-section {
  padding-top: 20px;
  border-top: 1px solid var(--border-subtle);
}

.modal-overlay {
  backdrop-filter: blur(10px);
}

.modal-content.photo-modal {
  border-radius: 22px;
  animation: ashish-modal-in 240ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
}

.alert-banner {
  border-radius: 14px;
  animation: ashish-card-in 300ms ease both;
}

.mobile-header {
  background: color-mix(in srgb, var(--bg-sidebar) 90%, transparent);
  backdrop-filter: blur(18px);
}

button:hover,
.btn:hover {
  animation: ashish-button-pop 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

button:active,
.btn:active {
  animation: ashish-button-press 220ms ease-out;
}

@keyframes ashish-page-in {
  from { opacity: 0; transform: translateY(9px); }
  to { opacity: 1; transform: none; }
}

@keyframes ashish-card-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ashish-modal-in {
  from { opacity: 0; transform: translateY(8px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes ashish-aurora {
  from { background-position: 0% 0%, 100% 100%; }
  to { background-position: 8% 12%, 92% 84%; }
}

@keyframes ashish-logo-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes ashish-icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes ashish-workers-turn {
  0%, 100% { transform: rotate(0) scale(1); }
  45% { transform: rotate(-12deg) scale(1.12); }
  75% { transform: rotate(8deg) scale(1.08); }
}

@keyframes ashish-reports-turn {
  0%, 100% { transform: rotate(0); }
  40% { transform: rotate(-14deg); }
  75% { transform: rotate(10deg); }
}

@keyframes ashish-settings-turn {
  from { transform: rotate(0); }
  to { transform: rotate(90deg); }
}

@keyframes ashish-icon-pop {
  0%, 100% { transform: translateY(-1px) scale(1.08); }
  45% { transform: translateY(-2px) scale(1.2) rotate(-5deg); }
}

@keyframes ashish-button-pop {
  0%, 100% { transform: translateY(-2px) scale(1); }
  45% { transform: translateY(-4px) scale(1.035); }
}

@keyframes ashish-button-press {
  0% { transform: scale(1); }
  45% { transform: translateY(1px) scale(0.92); }
  100% { transform: scale(0.96); }
}

@keyframes ashish-spinner {
  to { transform: rotate(360deg); }
}

@keyframes ashish-loading-breathe {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
}

@keyframes ashish-moon-glow {
  0%, 100% { filter: drop-shadow(0 0 4px #93c5fd) drop-shadow(0 0 10px rgba(96, 165, 250, 0.65)); }
  50% { filter: drop-shadow(0 0 7px #bfdbfe) drop-shadow(0 0 16px rgba(96, 165, 250, 0.9)); }
}

@keyframes ashish-sun-glow {
  0%, 100% { filter: drop-shadow(0 0 4px #fde68a) drop-shadow(0 0 9px rgba(251, 191, 36, 0.6)); }
  50% { filter: drop-shadow(0 0 7px #fef3c7) drop-shadow(0 0 15px rgba(251, 191, 36, 0.9)); }
}

@media (max-width: 960px) {
  .mobile-header {
    min-height: 64px;
    padding-inline: 18px;
  }

  .sidebar {
    border-radius: 0 20px 20px 0;
  }

  .page {
    padding: 28px 24px 48px;
  }

  .stats-grid {
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .page {
    padding: 24px 18px 42px;
  }

  .page-header,
  .toolbar {
    margin-bottom: 24px;
  }

  .page-title-row {
    align-items: flex-start;
  }

  .title-icon-badge {
    width: 43px;
    height: 43px;
    border-radius: 13px;
  }

  .stat-card {
    min-height: 122px;
    padding: 16px;
  }

  .block-card {
    min-height: 120px;
  }

  .form-card,
  .info-card {
    padding: 18px;
  }

  .filter-bar {
    padding: 12px;
  }

  .feed-item:hover {
    transform: none;
  }
}

@media (max-width: 480px) {
  .mobile-header {
    padding-inline: 12px;
  }

  .mobile-header-actions {
    gap: 6px;
  }

  .status-dot-pill {
    padding: 4px 7px;
  }

  .page {
    padding: 20px 14px 36px;
  }

  .page-title {
    font-size: 22px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    min-height: 116px;
    padding: 14px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-icon-wrap {
    width: 34px;
    height: 34px;
  }

  .stat-value {
    font-size: 30px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .logo-mark,
  .mobile-logo-mark,
  .title-icon-badge svg,
  .lucide-moon,
  .lucide-sun,
  .loading span {
    animation: none !important;
  }
}
`;

export default function HitAmVisualRefresh() {
  return <style data-hits-visual-refresh>{visualRefresh}</style>;
}
