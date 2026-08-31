import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = import.meta.env.VITE_BACKEND_URL || '';

export default function Workers() {
  const { t, lang } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', nameHindi: '', phone: '', assignedBlock: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    try {
      const [wRes, bRes] = await Promise.all([
        axios.get(`${API}/api/workers`),
        axios.get(`${API}/api/blocks`)
      ]);
      setWorkers(wRes.data.workers || []);
      setBlocks(bRes.data.blocks || []);
    } catch {
      // Demo data
      setWorkers([
        { _id: '1', name: 'Ramesh Kumar', nameHindi: 'रमेश कुमार', phone: '919876543210', isActive: true },
        { _id: '2', name: 'Sunita Devi', nameHindi: 'सुनीता देवी', phone: '919876543211', isActive: true },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.post(`${API}/api/workers`, form);
      setForm({ name: '', nameHindi: '', phone: '', assignedBlock: '' });
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding worker');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === 'hi' ? 'क्या आप इस कर्मचारी को हटाना चाहते हैं?' : 'Remove this worker?')) return;
    try {
      await axios.delete(`${API}/api/workers/${id}`);
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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ➕ {t.addWorker}
        </button>
      </div>

      {/* Add Worker Form */}
      {showForm && (
        <div style={{margin: '0 32px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px'}}>
          <div className="section-title" style={{marginBottom:'20px'}}>➕ {t.addWorker}</div>
          {error && <div className="alert-banner alert-dirty" style={{marginBottom:'16px'}}>⚠️ {error}</div>}
          <form onSubmit={handleAdd}>
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
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label>{t.assignBlock}</label>
                <select value={form.assignedBlock} onChange={e => setForm({...form, assignedBlock: e.target.value})}>
                  <option value="">{lang === 'hi' ? '-- ब्लॉक चुनें --' : '-- Select Block --'}</option>
                  {blocks.map(b => <option key={b._id} value={b._id}>{lang === 'hi' ? b.nameHindi : b.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'8px'}}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>{t.cancel}</button>
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
            ) : workers.map(w => (
              <tr key={w._id}>
                <td>
                  <div style={{fontWeight:600}}>{w.nameHindi || w.name}</div>
                  {w.nameHindi && <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{w.name}</div>}
                </td>
                <td style={{fontFamily:'monospace', color:'var(--text-secondary)'}}>+{w.phone}</td>
                <td style={{color:'var(--text-secondary)', fontSize:'13px'}}>{w.assignedBlock || '—'}</td>
                <td>
                  <span className={`status-badge ${w.isActive ? 'clean' : 'dirty'}`} style={{cursor:'pointer'}} onClick={() => toggleActive(w)}>
                    {w.isActive ? (lang === 'hi' ? '✅ सक्रिय' : '✅ Active') : (lang === 'hi' ? '❌ निष्क्रिय' : '❌ Inactive')}
                  </span>
                </td>
                <td>
                  <button className="btn btn-danger" style={{padding:'6px 14px', fontSize:'12px'}} onClick={() => handleDelete(w._id)}>
                    🗑️ {t.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
