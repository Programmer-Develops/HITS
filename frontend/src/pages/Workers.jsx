import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Languages,
  Info,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import BilingualNameFields from '../components/BilingualNameFields';
import StatusBadge from '../components/StatusBadge';
import { hasHindi, hasLatin, needsNameRepair } from '../utils/textHelpers';

const API = import.meta.env.VITE_BACKEND_URL || '';

const EMPTY_FORM = { name: '', nameHindi: '', phone: '', assignedBlocks: [] };
const toLocalPhone = (phone = '') => (/^91\d{10}$/.test(phone) ? phone.slice(2) : phone);

export default function Workers() {
  const { t, lang } = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const formRef = useRef(null);

  const {
    translatingSide,
    autoFilledSide,
    handleEnglishChange,
    handleHindiChange,
    forceTranslate,
    reset: resetTranslate
  } = useAutoTranslate('name', setForm);

  const blockById = useMemo(
    () => Object.fromEntries(blocks.map((b) => [b._id, b])),
    [blocks]
  );
  const blockLabel = (b) => (lang === 'hi' ? (b.nameHindi || b.name) : (b.name || b.nameHindi));

  const mismatchedCount = useMemo(
    () => workers.filter((w) => needsNameRepair(w)).length,
    [workers]
  );

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

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, editingId]);

  const closeForm = () => {
    resetTranslate();
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const openAdd = () => {
    if (showForm && !editingId) return closeForm();
    resetTranslate();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (worker) => {
    const en = worker.name || '';
    const hi = worker.nameHindi || '';
    setEditingId(worker._id);
    setForm({
      name: en,
      nameHindi: hi,
      phone: toLocalPhone(worker.phone),
      assignedBlocks: worker.assignedBlocks || []
    });
    setError('');
    setShowForm(true);
    resetTranslate({ en, hi });

    // If legacy DB has missing/English-in-Hindi name, auto-suggest the Devanagari fix immediately
    if (en && !hasHindi(hi)) {
      forceTranslate('en', en);
    } else if (hi && !hasLatin(en)) {
      forceTranslate('hi', hi);
    }
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
    if (!form.name.trim() && !form.nameHindi.trim()) {
      setError(t.nameRequiredEither);
      return;
    }

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
      setError(err.response?.data?.error || (editingId ? t.errorUpdatingWorker : t.errorAddingWorker));
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteWorker)) return;
    try {
      await axios.delete(`${API}/api/workers/${id}`);
      if (editingId === id) closeForm();
      await fetchAll();
    } catch { /* ignore */ }
  };

  const toggleActive = async (worker) => {
    try {
      await axios.patch(`${API}/api/workers/${worker._id}`, { isActive: !worker.isActive });
      await fetchAll();
    } catch { /* ignore */ }
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

  return (
    <div className="page">
      <div className="toolbar">
        <div className="page-title-row">
          <span className="title-icon-badge">
            <Users size={20} />
          </span>
          <div>
            <h1 className="page-title">{t.workers}</h1>
            <p className="page-sub">{workers.length} {t.workersRegistered}</p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          {showForm && !editingId ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm && !editingId ? t.cancel : t.addWorker}</span>
        </button>
      </div>

      {loadFailed && (
        <div className="alert-banner alert-dirty">
          <AlertTriangle size={18} />
          <span>{t.loadError}</span>
        </div>
      )}

      {!loadFailed && mismatchedCount > 0 && (
        <div className="alert-banner alert-warn">
          <Languages size={18} />
          <span className="alert-grow">{t.repairMismatchBanner}</span>
          <Link to="/settings" className="banner-link">{t.repairQuickLink}</Link>
        </div>
      )}

      {/* Add / Edit Worker Form */}
      {showForm && (
        <div ref={formRef} className="form-card">
          <div className="form-card-header">
            <div className="section-title">
              {editingId ? <Pencil size={17} /> : <Plus size={17} />}
              <span>{editingId ? t.editWorker : t.addWorker}</span>
            </div>
            <button type="button" className="icon-btn" onClick={closeForm} aria-label={t.close}>
              <X size={16} />
            </button>
          </div>

          <div className="info-note">
            <Info size={15} />
            <span>{t.oneNameHint}</span>
          </div>

          {error && (
            <div className="alert-banner alert-dirty inline-alert">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <BilingualNameFields
                idPrefix="worker"
                name={form.name}
                nameHindi={form.nameHindi}
                onEnglishChange={handleEnglishChange}
                onHindiChange={handleHindiChange}
                onForceTranslate={forceTranslate}
                translatingSide={translatingSide}
                autoFilledSide={autoFilledSide}
                labelEn={t.englishName}
                labelHi={t.hindiName}
                placeholderEn="Ramesh Kumar"
                placeholderHi="रमेश कुमार"
              />

              <div className="form-group">
                <label htmlFor="worker-phone-input">{t.phoneNumber} (WhatsApp)</label>
                <input
                  id="worker-phone-input"
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>

              <div className="form-group grid-span-full" role="group" aria-labelledby="blocks-label">
                <div className="field-label-row">
                  <span id="blocks-label" className="field-group-label">
                    {t.assignedBlocks}
                    {form.assignedBlocks.length > 0 && ` (${form.assignedBlocks.length})`}
                  </span>
                  {blocks.length > 0 && (
                    <span className="inline-actions">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => setForm({ ...form, assignedBlocks: blocks.map((b) => b._id) })}
                      >
                        {t.selectAll}
                      </button>
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => setForm({ ...form, assignedBlocks: [] })}
                      >
                        {t.clearAll}
                      </button>
                    </span>
                  )}
                </div>

                {blocks.length === 0 ? (
                  <div className="hint-text">{t.noBlocksAvailable}</div>
                ) : (
                  <div className="block-picker">
                    {blocks.map((b) => {
                      const selected = form.assignedBlocks.includes(b._id);
                      return (
                        <label key={b._id} className={`block-option${selected ? ' selected' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleBlock(b._id)}
                          />
                          <span>{blockLabel(b)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div className="hint-text">{t.assignedBlocksHint}</div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeForm}>
                {t.cancel}
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? t.saving : t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workers Table */}
      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>{t.workerName}</th>
              <th>WhatsApp</th>
              <th>{t.blockCol}</th>
              <th>{t.statusCol}</th>
              <th>{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={5} className="table-empty-cell">{t.noWorkersYet}</td>
              </tr>
            ) : (
              workers.map((w) => {
                const assigned = (w.assignedBlocks || []).map((id) => blockById[id]).filter(Boolean);
                const primaryName = lang === 'hi' ? (w.nameHindi || w.name) : (w.name || w.nameHindi);
                const secondaryName = lang === 'hi' ? w.name : w.nameHindi;
                const showSecondary = secondaryName && secondaryName !== primaryName;

                return (
                  <tr key={w._id} className={editingId === w._id ? 'row-editing' : undefined}>
                    <td data-label={t.workerName}>
                      <div className="cell-stack">
                        <div className="cell-strong">{primaryName}</div>
                        {showSecondary && <div className="cell-muted">{secondaryName}</div>}
                      </div>
                    </td>
                    <td data-label="WhatsApp" className="cell-mono">+{w.phone}</td>
                    <td data-label={t.blockCol}>
                      {assigned.length === 0 ? (
                        <span className="cell-muted">—</span>
                      ) : (
                        <div className="chips-wrap">
                          {assigned.map((b) => (
                            <span key={b._id} className="chip">{blockLabel(b)}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td data-label={t.statusCol}>
                      <StatusBadge
                        variant={w.isActive ? 'clean' : 'inactive'}
                        label={w.isActive ? t.active : t.inactive}
                        onClick={() => toggleActive(w)}
                      />
                    </td>
                    <td data-label={t.actionsCol}>
                      <div className="table-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(w)}>
                          <Pencil size={13} />
                          <span>{t.edit}</span>
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(w._id)}>
                          <Trash2 size={13} />
                          <span>{t.delete}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
