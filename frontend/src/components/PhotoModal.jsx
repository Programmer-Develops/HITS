import { useEffect, useState } from 'react';
import { X, Clock, MessageSquare, ImageOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PhotoModal({ report, onClose }) {
  const { t, lang } = useLanguage();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [report?.photoUrl]);

  useEffect(() => {
    if (!report) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [report, onClose]);

  if (!report) return null;

  const workerName = lang === 'hi'
    ? (report.workerNameHindi || report.workerName)
    : (report.workerName || report.workerNameHindi);
  const blockName = lang === 'hi'
    ? (report.blockNameHindi || report.blockName)
    : (report.blockName || report.blockNameHindi);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
      onClick={onClose}
    >
      <div className="modal-content photo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 id="photo-modal-title" className="modal-title">{workerName}</h3>
            <p className="modal-subtitle">{blockName}</p>
          </div>
          <button
            type="button"
            className="icon-btn modal-icon-close"
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-media-wrap">
          {imgError || !report.photoUrl ? (
            <div className="modal-img-fallback">
              <ImageOff size={36} />
              <span>{t.photoUnavailable}</span>
            </div>
          ) : (
            <img
              src={report.photoUrl}
              alt={`${workerName} — ${blockName}`}
              className="modal-img"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-meta">
            {report.timeIST && (
              <span className="modal-meta-item">
                <Clock size={14} />
                <span>{report.timeIST}</span>
              </span>
            )}
            {report.caption && (
              <span className="modal-meta-item">
                <MessageSquare size={14} />
                <span>{report.caption}</span>
              </span>
            )}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={15} />
            <span>{t.close}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
