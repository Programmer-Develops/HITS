import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Settings as SettingsIcon,
  Plus,
  Pencil,
  Trash2,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  X,
  ArrowRight,
  Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import BilingualNameFields from '../components/BilingualNameFields';
import StatusBadge from '../components/StatusBadge';
import { hasHindi, hasLatin, needsNameRepair } from '../utils/textHelpers';

const API = import.meta.env.VITE_BACKEND_URL || '';
const EMPTY_FORM = { name: '', nameHindi: '', location: '' };

export default function Settings() {
  const { t } = useLanguage();
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'ok' | 'err', text: string }

  // DB name-pair cleanup tool
  const [scanning, setScanning] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairPreview, setRepairPreview] = useState(null); // null | { changed: number, changes: [] }
  const formRef = useRef(null);

  const {
    translatingSide,
    autoFilledSide,
    handleEnglishChange,
    handleHindiChange,
    forceTranslate,
    reset: resetTranslate
  } = useAutoTranslate('block', setForm);

  const showToast = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchBlocks = () =>
    axios
      .get(`${API}/api/blocks`)
      .then((r) => setBlocks(r.data.blocks || []))
      .catch(() => {});

  useEffect(() => {
    fetchBlocks();
  }, []);

  const cancelEdit = () => {
    resetTranslate();
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (block) => {
    const en = block.name || '';
    const hi = block.nameHindi || '';
    setEditingId(block._id);
    setForm({ name: en, nameHindi: hi, location: block.location || '' });
    resetTranslate({ en, hi });

    if (en && !hasHindi(hi)) {
      forceTranslate('en', en);
    } else if (hi && !hasLatin(en)) {
      forceTranslate('hi', hi);
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() && !form.nameHindi.trim()) {
      showToast('err', t.nameRequiredEither);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axios.patch(`${API}/api/blocks/${editingId}`, form);
        showToast('ok', t.blockUpdated);
      } else {
        await axios.post(`${API}/api/blocks`, form);
        showToast('ok', t.blockAdded);
      }
      cancelEdit();
      await fetchBlocks();
    } catch (err) {
      showToast('err', err.response?.data?.error || 'Error saving block');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteBlock)) return;
    try {
      await axios.delete(`${API}/api/blocks/${id}`);
      if (editingId === id) cancelEdit();
      await fetchBlocks();
    } catch { /* ignore */ }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await axios.post(`${API}/api/blocks/seed`);
      showToast('ok', t.defaultBlocksAdded);
      await fetchBlocks();
    } catch {
      showToast('err', 'Error seeding blocks');
    }
    setSeeding(false);
  };

  const handleScanRepair = async () => {
    setScanning(true);
    try {
      const res = await axios.post(`${API}/api/translate/repair?dryRun=1`);
      setRepairPreview({
        changed: res.data.changed || 0,
        changes: res.data.changes || []
      });
    } catch {
      showToast('err', t.loadError);
    }
    setScanning(false);
  };

  const handleApplyRepair = async () => {
    setRepairing(true);
    try {
      const res = await axios.post(`${API}/api/translate/repair`);
      const count = res.data.changed || 0;
      setRepairPreview(null);
      showToast('ok', `${count} ${t.repairComplete}`);
      await fetchBlocks();
    } catch {
      showToast('err', t.loadError);
    }
    setRepairing(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <span className="title-icon-badge">
            <SettingsIcon size={20} />
          </span>
          <div>
            <h1 className="page-title">{t.settings}</h1>
            <p className="page-sub">
              {t.settingsSub} • {blocks.length} {t.blocksConfigured}
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`alert-banner ${feedback.type === 'ok' ? 'alert-clean' : 'alert-dirty'}`}>
          {feedback.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Add / Edit Block Card */}
      <div ref={formRef} className="form-card">
        <div className="form-card-header">
          <div className="section-title">
            {editingId ? <Pencil size={17} /> : <Plus size={17} />}
            <span>{editingId ? t.editBlock : t.addNewBlock}</span>
          </div>
          {editingId && (
            <button type="button" className="icon-btn" onClick={cancelEdit} aria-label={t.cancel}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="info-note">
          <Info size={15} />
          <span>{t.oneNameHint}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-3">
            <BilingualNameFields
              idPrefix="block"
              name={form.name}
              nameHindi={form.nameHindi}
              onEnglishChange={handleEnglishChange}
              onHindiChange={handleHindiChange}
              onForceTranslate={forceTranslate}
              translatingSide={translatingSide}
              autoFilledSide={autoFilledSide}
              labelEn={t.blockNameEn}
              labelHi={t.blockNameHi}
              placeholderEn="Boys Toilet - Ground Floor"
              placeholderHi="लड़कों का शौचालय (भूतल)"
            />

            <div className="form-group">
              <label htmlFor="block-location-input">{t.locationCol}</label>
              <input
                id="block-location-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder={t.locationPlaceholder}
              />
            </div>
          </div>

          <div className="form-actions">
            {editingId ? (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                {t.cancel}
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={handleSeed} disabled={seeding}>
                <Building2 size={16} />
                <span>{seeding ? t.saving : t.addDefaultBlocks}</span>
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>

      {/* Repair Missing or Wrong-Script Names Card */}
      <div className="form-card repair-card">
        <div className="repair-header">
          <div>
            <div className="section-title">
              <Sparkles size={17} />
              <span>{t.repairTitle}</span>
            </div>
            <p className="repair-desc">{t.repairDesc}</p>
          </div>
          <div className="repair-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleScanRepair}
              disabled={scanning || repairing}
            >
              <Search size={14} />
              <span>{scanning ? t.loading : t.repairPreview}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleApplyRepair}
              disabled={repairing || scanning}
            >
              <Sparkles size={14} />
              <span>{repairing ? t.saving : t.repairApply}</span>
            </button>
          </div>
        </div>

        {repairPreview && (
          <div className="repair-preview-box">
            {repairPreview.changed === 0 ? (
              <div className="repair-empty">
                <CheckCircle2 size={16} />
                <span>{t.repairNone}</span>
              </div>
            ) : (
              <ul className="repair-list">
                {repairPreview.changes.map((c) => (
                  <li key={c.id} className="repair-item">
                    <span className="repair-type-tag">{c.type}</span>
                    <span className="repair-diff-before">
                      {c.before.name || '—'} / {c.before.nameHindi || '—'}
                    </span>
                    <ArrowRight size={13} className="repair-arrow" />
                    <span className="repair-diff-after">
                      {c.after.name} / {c.after.nameHindi}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Blocks List */}
      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>{t.blockNameCol}</th>
              <th>{t.hindiNameCol}</th>
              <th>{t.locationCol}</th>
              <th>{t.statusCol}</th>
              <th>{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody>
            {blocks.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={5} className="table-empty-cell">{t.noBlocksSettings}</td>
              </tr>
            ) : (
              blocks.map((b) => {
                const badgeLabel =
                  b.status === 'clean' ? t.clean : b.status === 'dirty' ? t.dirty : t.unknown;
                const mismatched = needsNameRepair(b);
                return (
                  <tr key={b._id} className={editingId === b._id ? 'row-editing' : undefined}>
                    <td data-label={t.blockNameCol} className="cell-strong">{b.name}</td>
                    <td data-label={t.hindiNameCol}>
                      <span className={mismatched ? 'text-warn' : 'cell-secondary'}>
                        {b.nameHindi || '—'}
                      </span>
                    </td>
                    <td data-label={t.locationCol} className="cell-muted">{b.location || '—'}</td>
                    <td data-label={t.statusCol}>
                      <StatusBadge variant={b.status} label={badgeLabel} />
                    </td>
                    <td data-label={t.actionsCol}>
                      <div className="table-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>
                          <Pencil size={13} />
                          <span>{t.edit}</span>
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>
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
