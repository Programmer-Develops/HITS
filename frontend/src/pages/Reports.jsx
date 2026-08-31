import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = import.meta.env.VITE_BACKEND_URL || '';

export default function Reports() {
  const { t, lang } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPhoto, setModalPhoto] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/reports`)
      .then(res => setReports(res.data.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <div className="page-header" style={{paddingBottom:'24px'}}>
        <div className="page-title">{t.reports} 📋</div>
        <div className="page-sub">{reports.length} {lang === 'hi' ? 'कुल रिपोर्ट' : 'total reports'}</div>
      </div>

      <div className="table-container" style={{marginTop:'0'}}>
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
            {reports.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center', color:'var(--text-muted)', padding:'40px'}}>
                {lang === 'hi' ? 'अभी तक कोई रिपोर्ट नहीं' : 'No reports yet'}
              </td></tr>
            ) : reports.map(r => (
              <tr key={r._id}>
                <td>
                  <img src={r.photoUrl} alt="Report" style={{width:'56px', height:'56px', borderRadius:'8px', objectFit:'cover', cursor:'pointer', border:'1px solid var(--border)'}}
                    onClick={() => setModalPhoto(r)} />
                </td>
                <td>
                  <div style={{fontWeight:600}}>{lang === 'hi' ? (r.workerNameHindi || r.workerName) : r.workerName}</div>
                  <div style={{fontSize:'12px', color:'var(--text-muted)'}}>+{r.workerPhone}</div>
                </td>
                <td style={{color:'var(--text-secondary)'}}>{lang === 'hi' ? r.blockNameHindi : r.blockName}</td>
                <td style={{fontSize:'13px', color:'var(--text-secondary)'}}>{r.timeIST}</td>
                <td><span className="status-badge clean">✅ {t.clean}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalPhoto && (
        <div className="modal-overlay" onClick={() => setModalPhoto(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalPhoto.photoUrl} alt="Full" className="modal-img" />
            <div style={{marginBottom:'12px'}}>
              <strong>{lang === 'hi' ? (modalPhoto.workerNameHindi || modalPhoto.workerName) : modalPhoto.workerName}</strong>
              <span style={{color:'var(--text-secondary)'}}> • {lang === 'hi' ? modalPhoto.blockNameHindi : modalPhoto.blockName}</span>
              <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px'}}>{modalPhoto.timeIST}</div>
            </div>
            <button className="modal-close" onClick={() => setModalPhoto(null)}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
