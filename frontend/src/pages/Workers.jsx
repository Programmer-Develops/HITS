import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = import.meta.env.VITE_BACKEND_URL || '';

const EMPTY_FORM = { name: '', nameHindi: '', phone: '', assignedBlocks: [] };

// Stored as 91XXXXXXXXXX; show the 10 digits the admin actually types
const toLocalPhone = (phone = '') => (/^91\d{10}$/.test(phone) ? phone.slice(2) : phone);

export default function Workers() {
  const { t, lang } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding a new worker
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const formRef = useRef(null);

  const blockById = useMemo(
    () => Object.fromEntries(blocks.map((b) => [b._id, b])),
    [blocks]
  );
  const blockLabel = (b) => (lang === 'hi' ? b.nameHindi || b.name : b.name);

  const fetchAll = async () => {
    try {
      const [wRes, bRes] = await Promise.all([
        axios.get(`${API}/api/workers`),
        axios.get(`${API}/api/blocks`)
      ]);
      setWorkers(wRes.data.workers || []);
      setBlocks(bRes.data.blocks || []);
      setLoadFailed(false);
    } catch {
      setWorkers([]);
      setLoadFailed(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Bring the form into view when "Edit" is clicked on a row far down the table
  useEffect(() => {
    if (showForm && editingId) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, editingId]);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const openAdd = () => {
    if (showForm && !editingId) return closeForm();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (worker) => {
    setEditingId(worker._id);
    setForm({
      name: worker.name || '',
      nameHindi: worker.nameHindi || '',
      phone: toLocalPhone(worker.phone),
      assignedBlocks: worker.assignedBlocks || []
    });
    setError('');
    setShowForm(true);
  };

  const toggleBlock = (id) =>
    setForm((f) => ({
      ...f,
      assignedBlocks: f.assignedBlocks.includes(id)
        ? f.assignedBlocks.filter((b) => b !== id)
        : [...f.assignedBlocks, id]
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await axios.patch(`${API}/api/workers/${editingId}`, form);
      } else {
        await axios.post(`${API}/api/workers`, form);
      }
      closeForm();
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || (editingId ? 'Error updating worker' : 'Error adding worker'));
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === 'hi' ? 'क्या आप इस कर्मचारी को हटाना चाहते हैं?' : 'Remove this worker?')) return;
    try {
      await axios.delete(`${API}/api/workers/${id}`);
      if (editingId === id) closeForm();
      await fetchAll();
    } catch {}
  };

  const toggleActive = async (worker) => {
    try {
      await axios.patch(`${API}/api/workers/${worker._id}`, { isActive: !worker.isActive });
      await fetchAll();
    } catch {}
  };

  if (loading) return <div className="page"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <div className="toolbar">
        <div>
          <div className="page-title">{t.workers}</div>
          <div className="page-sub">{workers.length} {lang === 'hi' ? 'कर्मचारी पंजीकृत' : 'workers registered'}</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          ➕ {t.addWorker}
        </button>
      </div>

      {loadFailed && <div className="alert-banner alert-dirty">⚠️ {t.loadError}</div>}

      {/* Add / Edit Worker Form */}
      {showForm && (
        <div ref={formRef} style={{margin: '0 32px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px'}}>
          <div className="section-title" style={{marginBottom:'20px'}}>
            {editingId ? `✏️ ${t.editWorker}` : `➕ ${t.addWorker}`}
          </div>
          {error && <div className="alert-banner alert-dirty" style={{margin:'0 0 16px'}}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
              <div className="form-group">
                <label>{lang === 'hi' ? 'नाम (English)' : 'Name (English)'}</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ramesh Kumar" />
              </div>
              <div className="form-group">
                <label>{lang === 'hi' ? 'नाम (हिंदी)' : 'Name (Hindi)'}</label>
                <input value={form.nameHindi} onChange={e => setForm({...form, nameHindi: e.target.value})} placeholder="रमेश कुमार" />
              </div>
              <div className="form-group">
                <label>{t.phoneNumber} (WhatsApp)</label>
                <input required inputMode="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
              </div>

              <div className="form-group" style={{gridColumn: '1 / -1'}} role="group" aria-labelledby="blocks-label">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'6px'}}>
                  <span id="blocks-label" style={{fontSize:'13px', color:'var(--text-secondary)', fontWeight:500}}>
                    {t.assignedBlocks}
                    {form.assignedBlocks.length > 0 && ` (${form.assignedBlocks.length})`}
                  </span>
                  {blocks.length > 0 && (
                    <span style={{display:'flex', gap:'14px'}}>
                      <button type="button" className="link-btn" onClick={() => setForm({...form, assignedBlocks: blocks.map(b => b._id)})}>{t.selectAll}</button>
                      <button type="button" className="link-btn" onClick={() => setForm({...form, assignedBlocks: []})}>{t.clearAll}</button>
                    </span>
                  )}
                </div>

                {blocks.length === 0 ? (
                  <div style={{fontSize:'13px', color:'var(--text-muted)'}}>{t.noBlocksAvailable}</div>
                ) : (
                  <div className="block-picker">
                    {blocks.map(b => {
                      const selected = form.assignedBlocks.includes(b._id);
                      return (
                        <label key={b._id} className={`block-option${selected ? ' selected' : ''}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleBlock(b._id)} />
                          <span>{blockLabel(b)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'8px'}}>{t.assignedBlocksHint}</div>
              </div>
            </div>
            <div style={{display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'8px'}}>
              <button type="button" className="btn btn-ghost" onClick={closeForm}>{t.cancel}</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '...' : t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workers Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t.workerName}</th>
              <th>WhatsApp</th>
              <th>{lang === 'hi' ? 'स्थान' : 'Block'}</th>
              <th>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
              <th>{lang === 'hi' ? 'कार्रवाई' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center', color:'var(--text-muted)', padding:'40px'}}>{lang === 'hi' ? 'कोई कर्मचारी नहीं' : 'No workers added yet'}</td></tr>
            ) : workers.map(w => {
              const assigned = (w.assignedBlocks || []).map(id => blockById[id]).filter(Boolean);
              return (
                <tr key={w._id} style={editingId === w._id ? {background:'rgba(59,130,246,0.06)'} : undefined}>
                  <td>
                    <div style={{fontWeight:600}}>{w.nameHindi || w.name}</div>
                    {w.nameHindi && <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{w.name}</div>}
                  </td>
                  <td style={{fontFamily:'monospace', color:'var(--text-secondary)'}}>+{w.phone}</td>
                  <td>
                    {assigned.length === 0
                      ? <span style={{color:'var(--text-muted)', fontSize:'13px'}}>—</span>
                      : assigned.map(b => <span key={b._id} className="chip">{blockLabel(b)}</span>)}
                  </td>
                  <td>
                    <span className={`status-badge ${w.isActive ? 'clean' : 'dirty'}`} style={{cursor:'pointer'}} onClick={() => toggleActive(w)}>
                      {w.isActive ? (lang === 'hi' ? '✅ सक्रिय' : '✅ Active') : (lang === 'hi' ? '❌ निष्क्रिय' : '❌ Inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button className="btn btn-ghost" style={{padding:'6px 14px', fontSize:'12px'}} onClick={() => openEdit(w)}>
                        ✏️ {t.edit}
                      </button>
                      <button className="btn btn-danger" style={{padding:'6px 14px', fontSize:'12px'}} onClick={() => handleDelete(w._id)}>
                        🗑️ {t.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
