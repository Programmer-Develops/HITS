import { Languages, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { hasHindi, hasLatin } from '../utils/textHelpers';

export default function BilingualNameFields({
  name,
  nameHindi,
  onEnglishChange,
  onHindiChange,
  onForceTranslate,
  translatingSide,
  autoFilledSide,
  labelEn,
  labelHi,
  placeholderEn,
  placeholderHi,
  idPrefix = 'bilingual'
}) {
  const { t } = useLanguage();

  const canTranslateToHi = hasLatin(name) && !hasHindi(name);
  const canTranslateToEn = hasHindi(nameHindi);

  return (
    <>
      <div className="form-group">
        <div className="field-label-row">
          <label htmlFor={`${idPrefix}-en-input`}>{labelEn}</label>
          <span className="field-label-meta">
            {translatingSide === 'en' ? (
              <span className="field-pill translating">
                <Loader2 size={12} className="spin-icon" />
                <span>{t.translating}</span>
              </span>
            ) : autoFilledSide === 'en' ? (
              <span className="field-pill auto">
                <Sparkles size={11} />
                <span>{t.autoFilledTag}</span>
              </span>
            ) : canTranslateToEn ? (
              <button
                type="button"
                className="field-action-btn"
                onClick={() => onForceTranslate('hi', nameHindi)}
                title={t.autoFillBtn}
              >
                <Languages size={12} />
                <span>{t.autoFillBtn}</span>
              </button>
            ) : null}
          </span>
        </div>
        <input
          id={`${idPrefix}-en-input`}
          value={name}
          onChange={(e) => onEnglishChange(e.target.value, nameHindi)}
          placeholder={placeholderEn}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <div className="field-label-row">
          <label htmlFor={`${idPrefix}-hi-input`}>{labelHi}</label>
          <span className="field-label-meta">
            {translatingSide === 'hi' ? (
              <span className="field-pill translating">
                <Loader2 size={12} className="spin-icon" />
                <span>{t.translating}</span>
              </span>
            ) : autoFilledSide === 'hi' ? (
              <span className="field-pill auto">
                <Sparkles size={11} />
                <span>{t.autoFilledTag}</span>
              </span>
            ) : canTranslateToHi ? (
              <button
                type="button"
                className="field-action-btn"
                onClick={() => onForceTranslate('en', name)}
                title={t.autoFillBtn}
              >
                <Languages size={12} />
                <span>{t.autoFillBtn}</span>
              </button>
            ) : null}
          </span>
        </div>
        <input
          id={`${idPrefix}-hi-input`}
          value={nameHindi}
          onChange={(e) => onHindiChange(e.target.value, name)}
          placeholder={placeholderHi}
          autoComplete="off"
        />
      </div>
    </>
  );
}
