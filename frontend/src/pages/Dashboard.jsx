import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';

const API = import.meta.env.VITE_BACKEND_URL || '';

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const { socket } = useSocket();
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState({ todayCount: 0, totalCount: 0, activeWorkers: 0 });
  const [feed, setFeed] = useState([]);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dirtyBlocks, setDirtyBlocks] = useState([]);

  const fetchData = async () => {
    try {
      const [blocksRes, statsRes, todayRes] = await Promise.all([
        axios.get(`${API}/api/blocks`),
        axios.get(`${API}/api/reports/stats`),
        axios.get(`${API}/api/reports/today`)
      ]);
      setBlocks(blocksRes.data.blocks || []);
      setStats(statsRes.data);
      setFeed(todayRes.data.reports?.slice(0, 10) || []);
      setDirtyBlocks((blocksRes.data.blocks || []).filter(b => b.status === 'dirty' || b.status === 'unknown'));
    } catch (err) {
      console.log('Backend not connected — showing demo data');
      // Demo data for UI preview
      setBlocks([
        { _id: '1', name: "Boys Toilet - Ground Floor", nameHindi: "लड़कों का शौचालय (भूतल)", status: 'clean', lastCleaned: new Date(), lastCleanedBy: 'रमेश कुमार' },
        { _id: '2', name: "Girls Toilet - Ground Floor", nameHindi: "लड़कियों का शौचालय (भूतल)", status: 'dirty', lastCleaned: null, lastCleanedBy: null },
        { _id: '3', name: "Boys Toilet - First Floor", nameHindi: "लड़कों का शौचालय (प्रथम तल)", status: 'unknown', lastCleaned: null, lastCleanedBy: null },
        { _id: '4', name: "Girls Toilet - First Floor", nameHindi: "लड़कियों का शौचालय (प्रथम तल)", status: 'clean', lastCleaned: new Date(Date.now() - 3600000), lastCleanedBy: 'सुनीता देवी' },
        { _id: '5', name: "Staff Toilet", nameHindi: "स्टाफ शौचालय", status: 'clean', lastCleaned: new Date(Date.now() - 7200000), lastCleanedBy: 'रमेश कुमार' },
        { _id: '6', name: "School Campus", nameHindi: "विद्यालय परिसर", status: 'dirty', lastCleaned: null, lastCleanedBy: null },
      ]);
      setStats({ todayCount: 3, totalCount: 47, activeWorkers: 2 });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Listen for real-time reports
  useEffect(() => {
    if (!socket) return;
    socket.on('new_report', (report) => {
      setFeed(prev => [report, ...prev.slice(0, 9)]);
      setBlocks(prev => prev.map(b => 
        b._id === report.blockId ? { ...b, status: 'clean', lastCleaned: new Date(), lastCleanedBy: report.workerName } : b
      ));
      setStats(prev => ({ ...prev, todayCount: prev.todayCount + 1, totalCount: prev.totalCount + 1 }));
    });
    return () => socket.off('new_report');
  }, [socket]);

  const getTimeSince = (date) => {
    if (!date) return t.neverCleaned;
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    if (mins < 2) return t.justNow;
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)} ${t.hoursAgo}`;
  };

  const getBlockName = (block) => lang === 'hi' ? block.nameHindi : block.name;
  const getWorkerName = (report) => lang === 'hi' ? (report.workerNameHindi || report.workerName) : report.workerName;

  if (loading) return (
    <div className="page">
      <div className="loading"><div className="spinner"></div> Loading...</div>
    </div>
  );

  const cleanCount = blocks.filter(b => b.status === 'clean').length;
  const dirtyCount = blocks.filter(b => b.status === 'dirty').length;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">{t.dashboard} 📊</div>
        <div className="page-sub">
          {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Dirty block alert */}
      {dirtyCount > 0 && (
        <div className="alert-banner alert-dirty" style={{marginTop: '20px'}}>
          ⚠️ {dirtyCount} {lang === 'hi' ? 'ब्लॉक को सफ़ाई चाहिए!' : `blocks need cleaning!`}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{marginTop: dirtyCount > 0 ? 0 : '20px'}}>
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-value">{stats.todayCount}</div>
          <div className="stat-label">{t.todayReports}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value" style={{color: 'var(--clean)'}}>{cleanCount}</div>
          <div className="stat-label">{t.cleanBlocks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-value" style={{color: 'var(--dirty)'}}>{dirtyCount + blocks.filter(b=>b.status==='unknown').length}</div>
          <div className="stat-label">{t.dirtyBlocks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.totalCount}</div>
          <div className="stat-label">{t.totalReports}</div>
        </div>
      </div>

      {/* Block Status Grid */}
      <div style={{padding: '0 32px 8px'}}>
        <div className="section-title">{t.blockStatus}</div>
      </div>
      <div className="blocks-grid">
        {blocks.map(block => (
          <div key={block._id} className={`block-card ${block.status}`}>
            <div className="block-header">
              <div>
                <div className="block-name">{getBlockName(block)}</div>
              </div>
              <span className={`status-badge ${block.status}`}>
                {block.status === 'clean' ? `✅ ${t.clean}` : block.status === 'dirty' ? `🔴 ${t.dirty}` : `⏳ ${t.unknown}`}
              </span>
            </div>
            <div className="block-meta">
              {block.lastCleaned
                ? `${t.lastCleaned}: ${getTimeSince(block.lastCleaned)} ${block.lastCleanedBy ? `• ${t.by} ${block.lastCleanedBy}` : ''}`
                : t.neverCleaned}
            </div>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="live-feed">
        <div className="section-title">
          <span className="live-dot"></span>
          {t.liveUpdates}
        </div>
        {feed.length === 0 ? (
          <div className="feed-empty">
            <div style={{fontSize: '32px', marginBottom: '8px'}}>📭</div>
            {t.noReportsToday}
          </div>
        ) : (
          feed.map((report, i) => (
            <div key={i} className="feed-item">
              <img
                src={report.photoUrl}
                alt="Report"
                className="feed-photo"
                onClick={() => setModalPhoto(report)}
              />
              <div className="feed-info">
                <div className="feed-worker">👤 {getWorkerName(report)}</div>
                <div className="feed-block">📍 {lang === 'hi' ? report.blockNameHindi : report.blockName}</div>
                <div className="feed-time">⏰ {report.timeIST}</div>
              </div>
              <span className="status-badge clean">✅ {t.clean}</span>
            </div>
          ))
        )}
      </div>

      {/* Photo Modal */}
      {modalPhoto && (
        <div className="modal-overlay" onClick={() => setModalPhoto(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalPhoto.photoUrl} alt="Full photo" className="modal-img" />
            <div style={{marginBottom: '12px'}}>
              <strong>{getWorkerName(modalPhoto)}</strong> • {lang === 'hi' ? modalPhoto.blockNameHindi : modalPhoto.blockName}
              <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px'}}>{modalPhoto.timeIST}</div>
            </div>
            <button className="modal-close" onClick={() => setModalPhoto(null)}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
