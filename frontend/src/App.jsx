import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useLanguage } from './context/LanguageContext';
import { useSocket } from './context/SocketContext';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';

function App() {
  const { t, lang, toggleLang } = useLanguage();
  const { connected } = useSocket();

  return (
    <BrowserRouter>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">🏫</span>
              <div>
                <div className="logo-title">HITS</div>
                <div className="logo-sub">{t.schoolName}</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">📊</span>
              <span>{t.dashboard}</span>
            </NavLink>
            <NavLink to="/workers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">👥</span>
              <span>{t.workers}</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">📋</span>
              <span>{t.reports}</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">⚙️</span>
              <span>{t.settings}</span>
            </NavLink>
            <NavLink to="/privacy" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">🔒</span>
              <span>Privacy Policy</span>
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            {/* Connection status */}
            <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              <span>{connected ? 'Live' : 'Offline'}</span>
            </div>
            {/* Language toggle */}
            <button className="lang-toggle" onClick={toggleLang}>
              {lang === 'hi' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
            </button>
          </div>
        </aside>

        {/* Main content */}
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
    </BrowserRouter>
  );
}

export default App;
