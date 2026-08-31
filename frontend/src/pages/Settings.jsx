import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = import.meta.env.VITE_BACKEND_URL || '';

export default function Settings() {
  const { t, lang } = useLanguage();
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState({ name: '', nameHindi: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchBlocks = () =>
    axios.get(`${API}/api/blocks`).then(r => setBlocks(r.data.blocks || [])).catch(() => {});

  useEffect(() => { fetchBlocks(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API}/api/blocks`, form);
      setForm({ name: '', nameHindi: '', location: '' });
      setMsg(lang === 'hi' ? 'ब्लॉक जोड़ा गया!' : 'Block added!');
      await fetchBlocks();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === 'hi' ? 'क्या आप इस ब्लॉक को हटाना चाहते हैं?' : 'Remove this block?')) return;
    await axios.delete(`${API}/api/blocks/${id}`).catch(() => {});
    await fetchBlocks();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await axios.post(`${API}/api/blocks/seed`);
      setMsg(lang === 'hi' ? 'डिफ़ॉल्ट ब्लॉक बनाए गए!' : 'Default blocks created!');
      await fetchBlocks();
    } catch { setMsg('Error seeding blocks'); }
    setSeeding(false);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="page">
      <div className="page-header" style={{paddingBottom:'24px'}}>
        <div className="page-title">{t.settings} ⚙️</div>
        <div className="page-sub">{lang === 'hi' ? 'शौचालय ब्लॉक प्रबंधित करें' : 'Manage toilet blocks and configuration'}</div>
      </div>

      {msg && <div className="alert-banner" style={{margin:'0 32px 16px', background:'var(--clean-bg)', border:'1px solid var(--clean)', color:'var(--clean)'}}>✅ {msg}</div>}

      {/* Add Block Form */}
      <div style={{margin: '0 32px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px'}}>
        <div className="section-title" style={{marginBottom:'20px'}}>
          ➕ {lang === 'hi' ? 'नया ब्लॉक जोड़ें' : 'Add New Block'}
        </div>
        <form onSubmit={handleAdd}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px'}}>
            <div className="form-group">
              <label>{lang === 'hi' ? 'नाम (English)' : 'Block Name (English)'}</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Boys Toilet - Ground Floor" />
            </div>
            <div className="form-group">
              <label>{lang === 'hi' ? 'नाम (हिंदी)' : 'Block Name (Hindi)'}</label>
              <input required value={form.nameHindi} onChange={e => setForm({...form, nameHindi: e.target.value})} placeholder="लड़कों का शौचालय (भूतल)" />
            </div>
            <div className="form-group">
              <label>{lang === 'hi' ? 'स्थान' : 'Location'}</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Ground Floor, Block A" />
            </div>
          </div>
          <div style={{display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'8px'}}>
            <button type="button" className="btn btn-ghost" onClick={handleSeed} disabled={seeding}>
              {seeding ? '...' : (lang === 'hi' ? '🏫 डिफ़ॉल्ट ब्लॉक' : '🏫 Add Default Blocks')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '...' : t.save}
            </button>
          </div>
        </form>
      </div>

      {/* Blocks List */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{lang === 'hi' ? 'नाम' : 'Block Name'}</th>
              <th>{lang === 'hi' ? 'हिंदी नाम' : 'Hindi Name'}</th>
              <th>{lang === 'hi' ? 'स्थान' : 'Location'}</th>
              <th>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
              <th>{lang === 'hi' ? 'कार्रवाई' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {blocks.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center', color:'var(--text-muted)', padding:'40px'}}>
                {lang === 'hi' ? 'कोई ब्लॉक नहीं — ऊपर से जोड़ें या डिफ़ॉल्ट ब्लॉक बनाएं' : 'No blocks — add above or click "Add Default Blocks"'}
              </td></tr>
            ) : blocks.map(b => (
              <tr key={b._id}>
                <td style={{fontWeight:600}}>{b.name}</td>
                <td style={{color:'var(--text-secondary)'}}>{b.nameHindi}</td>
                <td style={{color:'var(--text-muted)', fontSize:'13px'}}>{b.location || '—'}</td>
                <td><span className={`status-badge ${b.status}`}>{b.status === 'clean' ? `✅ ${t.clean}` : b.status === 'dirty' ? `🔴 ${t.dirty}` : `⏳ ${t.unknown}`}</span></td>
                <td>
                  <button className="btn btn-danger" style={{padding:'6px 14px', fontSize:'12px'}} onClick={() => handleDelete(b._id)}>
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
