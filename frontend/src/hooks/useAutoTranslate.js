import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { hasHindi, hasLatin } from '../utils/textHelpers';

const API = import.meta.env.VITE_BACKEND_URL || '';

/**
 * Live bidirectional English <-> Hindi auto-translation helper for forms.
 * Only one field needs to be filled; the paired box populates on debounce
 * unless the admin explicitly customized it.
 */
export function useAutoTranslate(kind, setForm) {
  const [translatingSide, setTranslatingSide] = useState(null); // 'en' | 'hi' | null
  const [autoFilledSide, setAutoFilledSide] = useState(null);   // 'en' | 'hi' | null

  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const reqIdRef = useRef(0);
  const manualRef = useRef({ en: false, hi: false });

  const cancelPending = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, []);

  useEffect(() => () => cancelPending(), [cancelPending]);

  const reset = useCallback(({ en = '', hi = '' } = {}) => {
    cancelPending();
    reqIdRef.current += 1;
    setTranslatingSide(null);
    setAutoFilledSide(null);
    manualRef.current = {
      en: hasLatin(en),
      hi: hasHindi(hi)
    };
  }, [cancelPending]);

  const runTranslate = useCallback(async (sourceLang, text) => {
    const clean = String(text ?? '').trim();
    const targetSide = sourceLang === 'en' ? 'hi' : 'en';
    if (!clean) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myId = ++reqIdRef.current;

    setTranslatingSide(targetSide);
    try {
      const res = await axios.get(`${API}/api/translate`, {
        params: { kind, text: clean },
        signal: controller.signal,
        timeout: 5000
      });
      if (myId !== reqIdRef.current) return;

      const translated = targetSide === 'hi' ? res.data?.hi : res.data?.en;
      if (translated) {
        setForm((prev) => ({
          ...prev,
          [targetSide === 'hi' ? 'nameHindi' : 'name']: translated
        }));
        setAutoFilledSide(targetSide);
        manualRef.current[targetSide] = false;
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        // Silent graceful fallback — backend still handles completeNames on save
      }
    } finally {
      if (myId === reqIdRef.current) setTranslatingSide(null);
    }
  }, [kind, setForm]);

  const scheduleTranslate = useCallback((sourceLang, text, currentOther) => {
    const clean = String(text ?? '').trim();
    const targetSide = sourceLang === 'en' ? 'hi' : 'en';

    cancelPending();
    if (!clean) {
      setTranslatingSide(null);
      if (autoFilledSide === targetSide) {
        setForm((prev) => ({ ...prev, [targetSide === 'hi' ? 'nameHindi' : 'name']: '' }));
        setAutoFilledSide(null);
      }
      return;
    }

    const otherHasCorrectScript = targetSide === 'hi' ? hasHindi(currentOther) : hasLatin(currentOther);
    if (manualRef.current[targetSide] && otherHasCorrectScript) return;

    timerRef.current = setTimeout(() => {
      runTranslate(sourceLang, clean);
    }, 350);
  }, [autoFilledSide, cancelPending, runTranslate, setForm]);

  const handleEnglishChange = useCallback((value, currentHindi) => {
    manualRef.current.en = Boolean(value.trim());
    if (autoFilledSide === 'en') setAutoFilledSide(null);
    setForm((prev) => ({ ...prev, name: value }));
    if (hasLatin(value) && !hasHindi(value)) {
      scheduleTranslate('en', value, currentHindi);
    } else if (!value.trim()) {
      scheduleTranslate('en', '', currentHindi);
    }
  }, [autoFilledSide, scheduleTranslate, setForm]);

  const handleHindiChange = useCallback((value, currentEnglish) => {
    manualRef.current.hi = Boolean(value.trim());
    if (autoFilledSide === 'hi') setAutoFilledSide(null);
    setForm((prev) => ({ ...prev, nameHindi: value }));
    if (hasHindi(value)) {
      scheduleTranslate('hi', value, currentEnglish);
    } else if (!value.trim()) {
      scheduleTranslate('hi', '', currentEnglish);
    }
  }, [autoFilledSide, scheduleTranslate, setForm]);

  const forceTranslate = useCallback((sourceLang, text) => {
    cancelPending();
    const targetSide = sourceLang === 'en' ? 'hi' : 'en';
    manualRef.current[targetSide] = false;
    runTranslate(sourceLang, text);
  }, [cancelPending, runTranslate]);

  return {
    translatingSide,
    autoFilledSide,
    handleEnglishChange,
    handleHindiChange,
    forceTranslate,
    reset
  };
}
