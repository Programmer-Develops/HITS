const HAS_DEVANAGARI = /[\u0900-\u097F]/;
const HAS_LATIN = /[A-Za-z]/;

export const hasHindi = (s) => HAS_DEVANAGARI.test(String(s ?? ''));
export const hasLatin = (s) => HAS_LATIN.test(String(s ?? ''));

// Checks whether a DB entity has a missing or wrong-script bilingual name pair
export const needsNameRepair = (item) => {
  if (!item) return false;
  const en = String(item.name || '').trim();
  const hi = String(item.nameHindi || '').trim();
  if (!en || !hi) return true;
  if (hasLatin(hi) && !hasHindi(hi)) return true;
  if (hasHindi(en) && !hasLatin(en)) return true;
  return false;
};

export const displayName = (item, lang, fallback = '') => {
  if (!item) return fallback;
  if (lang === 'hi') return item.nameHindi || item.name || fallback;
  return item.name || item.nameHindi || fallback;
};

export const formatTimeSince = (date, t) => {
  if (!date) return t.neverCleaned;
  const mins = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 2) return t.justNow;
  if (mins < 60) return `${mins} ${t.minsAgo}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${t.hoursAgo}`;
  const days = Math.floor(hours / 24);
  return `${days} ${t.daysAgo}`;
};
