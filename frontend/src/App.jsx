import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings as SettingsIcon,
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { useSocket } from './context/SocketContext';
import { useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';

function AppShell() {
  const { t, lang, toggleLang } = useLanguage();
  const { connected } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const navItems = [
    { to: '/', label: t.dashboard, Icon: LayoutDashboard, end: true },
    { to: '/workers', label: t.workers, Icon: Users },
    { to: '/reports', label: t.reports, Icon: ClipboardList },
    { to: '/settings', label: t.settings, Icon: SettingsIcon },
    { to: '/privacy', label: t.privacyPolicy, Icon: ShieldCheck }
  ];

  return (
    <div className="app">
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMenuOpen(true)}
            aria-label={t.openMenu}
            aria-expanded={menuOpen}
          >
            <Menu size={20} />
          </button>
          <div className="mobile-brand">
            <img src="/hits-logo.svg" alt="HITS" className="mobile-logo-mark" />
            <span className="mobile-logo-title">HITS</span>
          </div>
        </div>

        <div className="mobile-header-actions">
          <span
            className={`status-dot-pill ${connected ? 'connected' : 'disconnected'}`}
            title={connected ? t.live : t.offline}
          >
            <span className="status-dot" />
            <span>{connected ? t.live : t.offline}</span>
          </span>
          <button
            type="button"
            className="mobile-pill-btn"
            onClick={toggleLang}
            title={t.switchLang}
          >
            <Languages size={14} />
            <span>{lang === 'hi' ? 'EN' : 'हि'}</span>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation Sidebar / Mobile Drawer */}
      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="/hits-logo.svg" alt="HITS" className="logo-mark" />
            <div className="logo-text-wrap">
              <div className="logo-title">HITS</div>
              <div className="logo-sub">{t.schoolName}</div>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn sidebar-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label={t.closeMenu}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Icon size={18} className="nav-icon" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot" />
            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{connected ? t.live : t.offline}</span>
          </div>

          <button type="button" className="sidebar-control-btn" onClick={toggleLang}>
            <Languages size={15} />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>

          <button type="button" className="sidebar-control-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? t.lightMode : t.darkMode}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
