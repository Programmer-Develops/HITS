import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  AlertTriangle,
  Camera,
  CheckCircle2,
  BarChart3,
  Clock,
  Inbox,
  User,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import PhotoModal from '../components/PhotoModal';
import StatusBadge from '../components/StatusBadge';
import { formatTimeSince, hasHindi } from '../utils/textHelpers';

const API = import.meta.env.VITE_BACKEND_URL || '';

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const socket = useSocket();
  const [blocks, setBlocks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({ todayCount: 0, totalCount: 0, activeWorkers: 0 });
  const [feed, setFeed] = useState([]);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  const workerHindiByName = useMemo(() => {
    const map = {};
    for (const w of workers) {
      if (w.name && w.nameHindi && hasHindi(w.nameHindi)) {
        map[w.name.trim().toLowerCase()] = w.nameHindi;
      }
    }
    return map;
  }, [workers]);

  const fetchData = async () => {
    try {
      const [blocksRes, statsRes, todayRes, workersRes] = await Promise.all([
        axios.get(`${API}/api/blocks`),
        axios.get(`${API}/api/reports/stats`),
        axios.get(`${API}/api/reports/today`),
        axios.get(`${API}/api/workers`).catch(() => ({ data: { workers: [] } }))
      ]);
      setBlocks(blocksRes.data.blocks || []);
      setStats(statsRes.data);
      setFeed(todayRes.data.reports?.slice(0, 10) || []);
      setWorkers(workersRes.data.workers || []);
    } catch {
      // Demo fallback when backend is disconnected during local preview
      setBlocks([
        { _id: '1', name: 'Boys Toilet - Ground Floor', nameHindi: 'लड़कों का शौचालय (भूतल)', status: 'clean', lastCleaned: new Date(), lastCleanedBy: 'Ramesh Kumar', lastCleanedByHindi: 'रमेश कुमार' },
        { _id: '2', name: 'Girls Toilet - Ground Floor', nameHindi: 'लड़कियों का शौचालय (भूतल)', status: 'dirty', lastCleaned: null, lastCleanedBy: null },
        { _id: '3', name: 'Boys Toilet - First Floor', nameHindi: 'लड़कों का शौचालय (प्रथम तल)', status: 'unknown', lastCleaned: null, lastCleanedBy: null },
        { _id: '4', name: 'Girls Toilet - First Floor', nameHindi: 'लड़कियों का शौचालय (प्रथम तल)', status: 'clean', lastCleaned: new Date(Date.now() - 3600000), lastCleanedBy: 'Sunita Devi', lastCleanedByHindi: 'सुनीता देवी' },
        { _id: '5', name: 'Staff Toilet', nameHindi: 'स्टाफ शौचालय', status: 'clean', lastCleaned: new Date(Date.now() - 7200000), lastCleanedBy: 'Ramesh Kumar', lastCleanedByHindi: 'रमेश कुमार' },
        { _id: '6', name: 'School Campus', nameHindi: 'विद्यालय परिसर', status: 'dirty', lastCleaned: null, lastCleanedBy: null }
      ]);
      setStats({ todayCount: 3, totalCount: 47, activeWorkers: 2 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    socket.on('new_report', (report) => {
      setFeed((prev) => [report, ...prev.slice(0, 9)]);
      setBlocks((prev) =>
        prev.map((b) =>
          b._id === report.blockId
            ? {
                ...b,
                status: 'clean',
                lastCleaned: new Date(),
                lastCleanedBy: report.workerName,
                lastCleanedByHindi: report.workerNameHindi || report.workerName
              }
            : b
        )
      );
      setStats((prev) => ({
        ...prev,
        todayCount: prev.todayCount + 1,
        totalCount: prev.totalCount + 1
      }));
    });
    return () => socket.off('new_report');
  }, [socket]);

  const getBlockName = (block) =>
    lang === 'hi' ? (block.nameHindi || block.name) : (block.name || block.nameHindi);

  const getWorkerName = (report) =>
    lang === 'hi'
      ? (report.workerNameHindi || report.workerName)
      : (report.workerName || report.workerNameHindi);

  const getLastCleaner = (block) => {
    if (!block.lastCleanedBy) return null;
    if (lang === 'hi') {
      if (block.lastCleanedByHindi && hasHindi(block.lastCleanedByHindi)) {
        return block.lastCleanedByHindi;
      }
      const mapped = workerHindiByName[String(block.lastCleanedBy).trim().toLowerCase()];
      if (mapped) return mapped;
    }
    return block.lastCleanedBy;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner" />
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  const cleanCount = blocks.filter((b) => b.status === 'clean').length;
  const dirtyCount = blocks.filter((b) => b.status === 'dirty').length;
  const attentionCount = dirtyCount + blocks.filter((b) => b.status === 'unknown').length;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <span className="title-icon-badge">
            <LayoutDashboard size={20} />
          </span>
          <div>
            <h1 className="page-title">{t.dashboard}</h1>
            <p className="page-sub">
              {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {dirtyCount > 0 && (
        <div className="alert-banner alert-dirty">
          <AlertTriangle size={18} />
          <span>
            {dirtyCount === 1 ? t.dirtyBannerOne : `${dirtyCount} ${t.dirtyBannerMany}`}
          </span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">{t.todayReports}</span>
            <span className="stat-icon-wrap primary">
              <Camera size={18} />
            </span>
          </div>
          <div className="stat-value">{stats.todayCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">{t.cleanBlocks}</span>
            <span className="stat-icon-wrap clean">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="stat-value tone-clean">{cleanCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">{t.dirtyBlocks}</span>
            <span className="stat-icon-wrap dirty">
              <AlertTriangle size={18} />
            </span>
          </div>
          <div className="stat-value tone-dirty">{attentionCount}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">{t.totalReports}</span>
            <span className="stat-icon-wrap info">
              <BarChart3 size={18} />
            </span>
          </div>
          <div className="stat-value">{stats.totalCount}</div>
        </div>
      </div>

      {/* Block Status Grid */}
      <section className="page-section">
        <div className="section-title">{t.blockStatus}</div>
        <div className="blocks-grid">
          {blocks.map((block) => {
            const cleaner = getLastCleaner(block);
            const badgeLabel =
              block.status === 'clean' ? t.clean : block.status === 'dirty' ? t.dirty : t.unknown;
            return (
              <div key={block._id} className={`block-card ${block.status}`}>
                <div className="block-header">
                  <div>
                    <div className="block-name">{getBlockName(block)}</div>
                    {block.location && <div className="block-sub-loc">{block.location}</div>}
                  </div>
                  <StatusBadge variant={block.status} label={badgeLabel} />
                </div>
                <div className="block-meta">
                  <Clock size={13} aria-hidden="true" />
                  <span>
                    {block.lastCleaned
                      ? `${t.lastCleaned}: ${formatTimeSince(block.lastCleaned, t)}${cleaner ? ` • ${t.by} ${cleaner}` : ''}`
                      : t.neverCleaned}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Feed */}
      <section className="page-section">
        <div className="section-title">
          <span className="live-dot" />
          <span>{t.liveUpdates}</span>
        </div>

        {feed.length === 0 ? (
          <div className="feed-empty-card">
            <Inbox size={32} />
            <div>{t.noReportsToday}</div>
          </div>
        ) : (
          <div className="feed-list">
            {feed.map((report, i) => (
              <div key={report._id || i} className="feed-item">
                <button
                  type="button"
                  className="photo-thumb-btn"
                  onClick={() => setModalPhoto(report)}
                  aria-label={t.viewPhoto}
                >
                  <img src={report.photoUrl} alt={getWorkerName(report)} className="feed-photo" />
                </button>
                <div className="feed-info">
                  <div className="feed-worker">
                    <User size={14} aria-hidden="true" />
                    <span>{getWorkerName(report)}</span>
                  </div>
                  <div className="feed-block">
                    <MapPin size={13} aria-hidden="true" />
                    <span>
                      {lang === 'hi'
                        ? (report.blockNameHindi || report.blockName)
                        : (report.blockName || report.blockNameHindi)}
                    </span>
                  </div>
                  <div className="feed-time">
                    <Clock size={12} aria-hidden="true" />
                    <span>{report.timeIST}</span>
                  </div>
                </div>
                <StatusBadge variant="clean" label={t.clean} />
              </div>
            ))}
          </div>
        )}
      </section>

      <PhotoModal report={modalPhoto} onClose={() => setModalPhoto(null)} />
    </div>
  );
}
