import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ClipboardList,
  Search,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import PhotoModal from '../components/PhotoModal';
import StatusBadge from '../components/StatusBadge';

const API = import.meta.env.VITE_BACKEND_URL || '';
const PAGE_SIZE = 20;
const EMPTY_DATA = { reports: [], total: 0, pages: 0 };

export default function Reports() {
  const { t, lang } = useLanguage();

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [blockId, setBlockId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  // Data
  const [data, setData] = useState(EMPTY_DATA);
  const [blocks, setBlocks] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/blocks`)
      .then((res) => setBlocks(res.data.blocks || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setFetching(true);
    setHasError(false);

    const params = { page, limit: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;
    if (blockId) params.blockId = blockId;
    if (from) params.from = from;
    if (to) params.to = to;

    axios
      .get(`${API}/api/reports`, { params, signal: controller.signal })
      .then((res) => {
        setData({
          reports: res.data.reports || [],
          total: res.data.total || 0,
          pages: res.data.pages || 0
        });
        if (res.data.pages > 0 && page > res.data.pages) setPage(res.data.pages);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setData(EMPTY_DATA);
        setHasError(true);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setFetching(false);
        setFirstLoad(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, blockId, from, to, page]);

  const hasFilters = Boolean(search || blockId || from || to);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setBlockId('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const blockLabel = (b) => (lang === 'hi' ? (b.nameHindi || b.name) : (b.name || b.nameHindi));

  const handleBlockChange = async (reportId, newBlockId) => {
    if (!newBlockId) return;
    try {
      const res = await axios.patch(`${API}/api/reports/${reportId}`, { blockId: newBlockId });
      const updated = res.data.report;
      if (updated) {
        setData((prev) => ({
          ...prev,
          reports: prev.reports.map((r) => (r._id === reportId ? updated : r))
        }));
        setModalPhoto((prev) => (prev && prev._id === reportId ? updated : prev));
      }
    } catch { /* ignore */ }
  };

  if (firstLoad) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner" />
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <span className="title-icon-badge">
            <ClipboardList size={20} />
          </span>
          <div>
            <h1 className="page-title">{t.reports}</h1>
            <p className="page-sub">
              {data.total} {hasFilters ? t.resultsLabel : t.totalReportsLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchReports}
            aria-label={t.searchReports}
            maxLength={100}
          />
        </div>

        <select
          className="filter-select"
          value={blockId}
          onChange={onFilter(setBlockId)}
          aria-label={t.allBlocks}
        >
          <option value="">{t.allBlocks}</option>
          {blocks.map((b) => (
            <option key={b._id} value={b._id}>{blockLabel(b)}</option>
          ))}
        </select>

        <div className="filter-dates-row">
          <label className="filter-date">
            <span>{t.dateFrom}</span>
            <input type="date" value={from} max={to || undefined} onChange={onFilter(setFrom)} />
          </label>
          <label className="filter-date">
            <span>{t.dateTo}</span>
            <input type="date" value={to} min={from || undefined} onChange={onFilter(setTo)} />
          </label>
        </div>

        {hasFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={15} />
            <span>{t.clearFilters}</span>
          </button>
        )}
      </div>

      {hasError && (
        <div className="alert-banner alert-dirty">
          <AlertTriangle size={18} />
          <span>{t.loadError}</span>
        </div>
      )}

      <div className={`table-container${fetching ? ' table-fetching' : ''}`}>
        <table className="responsive-table">
          <thead>
            <tr>
              <th>{t.photoProof}</th>
              <th>{t.workerName}</th>
              <th>{t.blockSingleCol}</th>
              <th>{t.timeCol}</th>
              <th>{t.statusCol}</th>
            </tr>
          </thead>
          <tbody>
            {data.reports.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={5} className="table-empty-cell">
                  {hasFilters ? t.noMatchingReports : t.noReportsYet}
                </td>
              </tr>
            ) : (
              data.reports.map((r) => {
                const workerName = lang === 'hi' ? (r.workerNameHindi || r.workerName) : (r.workerName || r.workerNameHindi);
                return (
                  <tr key={r._id}>
                    <td data-label={t.photoProof} className="thumb-cell">
                      <button
                        type="button"
                        className="photo-thumb-btn"
                        onClick={() => setModalPhoto(r)}
                        aria-label={t.viewPhoto}
                      >
                        <img src={r.photoUrl} alt={workerName} className="report-thumb" />
                      </button>
                    </td>
                    <td data-label={t.workerName}>
                      <div className="cell-stack">
                        <div className="cell-strong">{workerName}</div>
                        <div className="cell-muted cell-mono">+{r.workerPhone}</div>
                        {r.caption && (
                          <div className="cell-caption">
                            <MessageSquare size={12} aria-hidden="true" />
                            <span>{r.caption}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td data-label={t.blockSingleCol}>
                      {blocks.length > 0 ? (
                        <select
                          className="inline-select"
                          value={r.blockId || ''}
                          onChange={(e) => handleBlockChange(r._id, e.target.value)}
                          aria-label={t.blockSingleCol}
                        >
                          {!r.blockId && (
                            <option value="">
                              {lang === 'hi' ? (r.blockNameHindi || r.blockName) : (r.blockName || r.blockNameHindi)}
                            </option>
                          )}
                          {blocks.map((b) => (
                            <option key={b._id} value={b._id}>{blockLabel(b)}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{lang === 'hi' ? (r.blockNameHindi || r.blockName) : (r.blockName || r.blockNameHindi)}</span>
                      )}
                    </td>
                    <td data-label={t.timeCol} className="cell-secondary">{r.timeIST}</td>
                    <td data-label={t.statusCol}>
                      <StatusBadge variant="clean" label={t.clean} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="pagination-bar">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page <= 1 || fetching}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
            <span>{t.previous}</span>
          </button>
          <span className="pagination-info">
            {t.pageLabel} {page} {t.ofLabel} {data.pages}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page >= data.pages || fetching}
            onClick={() => setPage((p) => p + 1)}
          >
            <span>{t.next}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <PhotoModal report={modalPhoto} onClose={() => setModalPhoto(null)} />
    </div>
  );
}
