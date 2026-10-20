import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = import.meta.env.VITE_BACKEND_URL || '';
const PAGE_SIZE = 20;
const EMPTY_DATA = { reports: [], total: 0, pages: 0 };

export default function Reports() {
  const { t, lang } = useLanguage();

  // Filters
  const [search, setSearch] = useState('');            // what the admin is typing
  const [debouncedSearch, setDebouncedSearch] = useState(''); // what we actually query with
  const [blockId, setBlockId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  // Data
  const [data, setData] = useState(EMPTY_DATA);
  const [blocks, setBlocks] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);   // full-page spinner only the very first time
  const [fetching, setFetching] = useState(false);    // later loads just dim the table
  const [hasError, setHasError] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(null);

  // Block dropdown options
  useEffect(() => {
    axios.get(`${API}/api/blocks`)
      .then(res => setBlocks(res.data.blocks || []))
      .catch(() => {});
  }, []);

  // Wait until the admin pauses typing before querying (and go back to page 1)
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // Fetch whenever a filter or the page changes. Older in-flight requests are
  // aborted so a slow response can never overwrite a newer search.
  useEffect(() => {
    const controller = new AbortController();
    setFetching(true);
    setHasError(false);

    const params = { page, limit: PAGE_SIZE };
    if (debouncedSearch) params.search = debouncedSearch;
    if (blockId) params.blockId = blockId;
    if (from) params.from = from;
    if (to) params.to = to;

    axios.get(`${API}/api/reports`, { params, signal: controller.signal })
      .then(res => {
        setData({
          reports: res.data.reports || [],
          total: res.data.total || 0,
          pages: res.data.pages || 0
        });
        // e.g. the last page emptied out: step back instead of showing nothing
        if (res.data.pages > 0 && page > res.data.pages) setPage(res.data.pages);
      })
      .catch(err => {
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

  // Changing a filter always returns to the first page
  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const blockLabel = (b) => (lang === 'hi' ? b.nameHindi || b.name : b.name);

  const handleBlockChange = async (reportId, newBlockId) => {
    if (!newBlockId) return;
    try {
      const res = await axios.patch(`${API}/api/reports/${reportId}`, { blockId: newBlockId });
      const updated = res.data.report;
      if (updated) {
        setData(prev => ({
          ...prev,
          reports: prev.reports.map(r => (r._id === reportId ? updated : r))
        }));
        setModalPhoto(prev => (prev && prev._id === reportId ? updated : prev));
      }
    } catch {}
  };

  if (firstLoad) return <div className="page"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <div className="page-header" style={{paddingBottom:'24px'}}>
        <div className="page-title">{t.reports} 📋</div>
        <div className="page-sub">
          {data.total} {hasFilters ? t.resultsLabel : (lang === 'hi' ? 'कुल रिपोर्ट' : 'total reports')}
        </div>
      </div>

      {/* Search + filters */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchReports}
            aria-label={t.searchReports}
            maxLength={100}
          />
        </div>

        <select value={blockId} onChange={onFilter(setBlockId)} aria-label={t.allBlocks}>
          <option value="">{t.allBlocks}</option>
          {blocks.map(b => <option key={b._id} value={b._id}>{blockLabel(b)}</option>)}
        </select>

        <label className="filter-date">
          {t.dateFrom}
          <input type="date" value={from} max={to || undefined} onChange={onFilter(setFrom)} />
        </label>
        <label className="filter-date">
          {t.dateTo}
          <input type="date" value={to} min={from || undefined} onChange={onFilter(setTo)} />
        </label>

        {hasFilters && (
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>✖ {t.clearFilters}</button>
        )}
      </div>

      {hasError && <div className="alert-banner alert-dirty">⚠️ {t.loadError}</div>}

      <div className="table-container" style={{marginTop:'0', opacity: fetching ? 0.6 : 1, transition:'opacity 0.15s'}}>
        <table>
          <thead>
            <tr>
              <th>{t.photoProof}</th>
              <th>{t.workerName}</th>
              <th>{lang === 'hi' ? 'स्थान' : 'Block'}</th>
              <th>{lang === 'hi' ? 'समय' : 'Time'}</th>
              <th>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {data.reports.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center', color:'var(--text-muted)', padding:'40px'}}>
                {hasFilters ? t.noMatchingReports : (lang === 'hi' ? 'अभी तक कोई रिपोर्ट नहीं' : 'No reports yet')}
              </td></tr>
            ) : data.reports.map(r => (
              <tr key={r._id}>
                <td>
                  <img src={r.photoUrl} alt="Report" style={{width:'56px', height:'56px', borderRadius:'8px', objectFit:'cover', cursor:'pointer', border:'1px solid var(--border)'}}
                    onClick={() => setModalPhoto(r)} />
                </td>
                <td>
                  <div style={{fontWeight:600}}>{lang === 'hi' ? (r.workerNameHindi || r.workerName) : r.workerName}</div>
                  <div style={{fontSize:'12px', color:'var(--text-muted)'}}>+{r.workerPhone}</div>
                </td>
                <td style={{color:'var(--text-secondary)'}}>
                  {blocks.length > 0 ? (
                    <select
                      value={r.blockId || ''}
                      onChange={e => handleBlockChange(r._id, e.target.value)}
                      style={{width:'auto', minWidth:'180px', padding:'6px 10px', fontSize:'13px'}}
                    >
                      {!r.blockId && (
                        <option value="">{lang === 'hi' ? r.blockNameHindi : r.blockName}</option>
                      )}
                      {blocks.map(b => (
                        <option key={b._id} value={b._id}>{blockLabel(b)}</option>
                      ))}
                    </select>
                  ) : (
                    lang === 'hi' ? r.blockNameHindi : r.blockName
                  )}
                </td>
                <td style={{fontSize:'13px', color:'var(--text-secondary)'}}>{r.timeIST}</td>
                <td><span className="status-badge clean">✅ {t.clean}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="pagination-bar">
          <button className="btn btn-ghost" disabled={page <= 1 || fetching} onClick={() => setPage(p => p - 1)}>← {t.previous}</button>
          <span>{t.pageLabel} {page} {t.ofLabel} {data.pages}</span>
          <button className="btn btn-ghost" disabled={page >= data.pages || fetching} onClick={() => setPage(p => p + 1)}>{t.next} →</button>
        </div>
      )}

      {modalPhoto && (
        <div className="modal-overlay" onClick={() => setModalPhoto(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalPhoto.photoUrl} alt="Full" className="modal-img" />
            <div style={{marginBottom:'12px'}}>
              <strong>{lang === 'hi' ? (modalPhoto.workerNameHindi || modalPhoto.workerName) : modalPhoto.workerName}</strong>
              <span style={{color:'var(--text-secondary)'}}> • {lang === 'hi' ? modalPhoto.blockNameHindi : modalPhoto.blockName}</span>
              <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px'}}>{modalPhoto.timeIST}</div>
              {modalPhoto.caption && (
                <div style={{fontSize:'13px', color:'var(--text-secondary)', marginTop:'8px'}}>💬 {modalPhoto.caption}</div>
              )}
            </div>
            <button className="modal-close" onClick={() => setModalPhoto(null)}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
