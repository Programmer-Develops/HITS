// Automatic English <-> Hindi for the two kinds of text the admin types:
//
//   kind "name"  — a PERSON'S name. Names are transliterated (sound-for-sound),
//                  never translated:  "Ved Prakash" <-> "वेद प्रकाश".
//   kind "block" — a PLACE name ("Girls Toilet - Ground Floor"). Translated
//                  using a built-in school vocabulary first (instant, offline,
//                  consistent), then a free web translator as a fallback.
//
// Everything here degrades gracefully: if a network provider is down the
// function returns null and the caller keeps what the admin typed. Saving a
// worker or block must never fail because a translator is unavailable.

/* ----------------------------- script detection ---------------------------- */

const HAS_DEVANAGARI = /[\u0900-\u097F]/;
const HAS_LATIN = /[A-Za-z]/;

// 'hi' | 'en' | 'mixed' | 'none'
const detectScript = (text) => {
  const s = String(text ?? '');
  const dev = HAS_DEVANAGARI.test(s);
  const lat = HAS_LATIN.test(s);
  if (dev && lat) return 'mixed';
  if (dev) return 'hi';
  if (lat) return 'en';
  return 'none';
};

/* ------------------------ Devanagari -> Latin (offline) -------------------- */

const CONS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l'
};
const NUKTA_CONS = { 'क': 'q', 'ख': 'kh', 'ग': 'g', 'ज': 'z', 'ड': 'r', 'ढ': 'rh', 'फ': 'f', 'य': 'y' };
const MATRAS = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'े': 'e', 'ै': 'ai',
  'ो': 'o', 'ौ': 'au', 'ृ': 'ri', 'ॅ': 'e', 'ॉ': 'o'
};
const INDEPENDENT_VOWELS = {
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऑ': 'o', 'ऍ': 'e'
};
const HALANT = '\u094D';
const NUKTA = '\u093C';
const ANUSVARA = new Set(['\u0902', '\u0901']); // ं ँ
const VISARGA = '\u0903';
const LABIALS = new Set(['p', 'ph', 'b', 'bh', 'm']);

const devanagariWordToLatin = (word) => {
  // units: { c: consonant sounds, v: vowel ('inh' = inherent 'a', '' = none), nasal }
  const units = [];
  const chars = [...word];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (CONS[ch]) {
      let c = CONS[ch];
      if (chars[i + 1] === NUKTA) {
        c = NUKTA_CONS[ch] || c;
        i++;
      }
      // ज्ञ is pronounced "gya", not "jny"
      if (ch === 'ज' && chars[i + 1] === HALANT && chars[i + 2] === 'ञ') {
        units.push({ c: 'gy', v: 'inh', nasal: false });
        i += 2;
        continue;
      }
      // व right after a conjunct is "w": स्वाति -> Swati, सरस्वती -> Saraswati, द्वारका -> Dwarka
      if (ch === 'व' && units.length && units[units.length - 1].v === '' && units[units.length - 1].c) c = 'w';
      units.push({ c, v: 'inh', nasal: false });
    } else if (ch === HALANT) {
      if (units.length) units[units.length - 1].v = '';
    } else if (MATRAS[ch]) {
      if (units.length) units[units.length - 1].v = MATRAS[ch];
    } else if (INDEPENDENT_VOWELS[ch]) {
      units.push({ c: '', v: INDEPENDENT_VOWELS[ch], nasal: false });
    } else if (ANUSVARA.has(ch)) {
      if (units.length) units[units.length - 1].nasal = true;
    } else if (ch === VISARGA) {
      units.push({ c: 'h', v: '', nasal: false });
    } else if (ch >= '\u0966' && ch <= '\u096F') {
      units.push({ c: String(ch.charCodeAt(0) - 0x0966), v: '', nasal: false });
    }
    // anything else (avagraha, stray marks) is ignored
  }

  // Schwa deletion, right to left: "Ram" not "Rama", "Kamla" not "Kamala",
  // but "Raman" (the middle 'a' stays because the last one is dropped).
  for (let i = units.length - 1; i >= 0; i--) {
    const u = units[i];
    if (u.v !== 'inh' || u.nasal) continue;
    if (i === units.length - 1) {
      u.v = '';
    } else if (i > 0 && !units[i - 1].nasal && units[i - 1].v !== '' && units[i + 1].v !== '') {
      // (not after a nasal syllable: शांतनु stays "Shantanu", not "Shantnu")
      u.v = '';
    }
  }

  let out = '';
  units.forEach((u, i) => {
    out += u.c + (u.v === 'inh' ? 'a' : u.v);
    if (u.nasal) {
      const next = units[i + 1];
      out += next && LABIALS.has(next.c) ? 'm' : 'n';
    }
  });
  return out;
};

// "वेद प्रकाश" -> "Ved Prakash". Non-Devanagari characters pass through.
const devanagariToLatin = (text) => {
  const normalised = String(text ?? '').normalize('NFC');
  return normalised
    .replace(/[\u0900-\u097F]+/g, (run) => devanagariWordToLatin(run))
    .replace(/(^|[\s(\-])([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
};

/* -------------------- school vocabulary (offline, en <-> hi) ---------------- */

// Longest phrases are matched first, so order inside this list does not matter.
const VOCAB = [
  ['Boys Toilet', 'लड़कों का शौचालय'],
  ['Girls Toilet', 'लड़कियों का शौचालय'],
  ['Staff Toilet', 'स्टाफ शौचालय'],
  ['Teachers Toilet', 'शिक्षकों का शौचालय'],
  ['Divyang Toilet', 'दिव्यांग शौचालय'],
  ['Boys Washroom', 'लड़कों का शौचालय'],
  ['Girls Washroom', 'लड़कियों का शौचालय'],
  ['Toilet', 'शौचालय'],
  ['Washroom', 'शौचालय'],
  ['Admin Block', 'प्रशासनिक ब्लॉक'],
  ['Senior Secondary', 'वरिष्ठ माध्यमिक'],
  ['Secondary', 'माध्यमिक'],
  ['Primary', 'प्राथमिक'],
  ['Middle', 'मिडिल'],
  ['School Campus', 'विद्यालय परिसर'],
  ['Campus', 'परिसर'],
  ['Principal Office', 'प्रधानाचार्य कार्यालय'],
  ['Staff Room', 'स्टाफ कक्ष'],
  ['Office', 'कार्यालय'],
  ['Playground', 'खेल का मैदान'],
  ['Assembly Ground', 'प्रार्थना स्थल'],
  ['Library', 'पुस्तकालय'],
  ['Canteen', 'कैंटीन'],
  ['Science Lab', 'विज्ञान प्रयोगशाला'],
  ['Computer Lab', 'कंप्यूटर प्रयोगशाला'],
  ['Laboratory', 'प्रयोगशाला'],
  ['Classroom', 'कक्षा'],
  ['Class', 'कक्षा'],
  ['Corridor', 'गलियारा'],
  ['Staircase', 'सीढ़ियाँ'],
  ['Hall', 'हॉल'],
  ['Block', 'ब्लॉक'],
  ['Wing', 'विंग'],
  ['Ground Floor', 'भूतल'],
  ['First Floor', 'प्रथम तल'],
  ['Second Floor', 'द्वितीय तल'],
  ['Third Floor', 'तृतीय तल'],
  ['Fourth Floor', 'चतुर्थ तल'],
  ['Basement', 'तहखाना'],
  ['Terrace', 'छत']
];

const words = (s) => s.trim().split(/\s+/).filter(Boolean);

const buildIndex = (side) => {
  // side 0 = English keys, 1 = Hindi keys. Value = the other language.
  const map = new Map();
  // First entry wins, so "शौचालय" maps back to "Toilet" (not "Washroom").
  for (const pair of VOCAB) {
    const key = words(pair[side]).map((w) => w.toLowerCase()).join(' ');
    if (!map.has(key)) map.set(key, pair[1 - side]);
  }
  const maxLen = Math.max(...VOCAB.map((p) => words(p[side]).length));
  return { map, maxLen };
};
const INDEX = { en: buildIndex(0), hi: buildIndex(1) };

// Translate one fragment ("Girls Toilet") with the vocabulary. Returns null if any
// word is unknown (single letters and numbers such as "Block A" / "Class 6" are fine).
const translateFragment = (fragment, from) => {
  const { map, maxLen } = INDEX[from];
  const tokens = words(fragment);
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    let hit = null;
    for (let len = Math.min(maxLen, tokens.length - i); len >= 1; len--) {
      const key = tokens.slice(i, i + len).join(' ').toLowerCase();
      if (map.has(key)) { hit = { len, value: map.get(key) }; break; }
    }
    if (hit) {
      out.push(hit.value);
      i += hit.len;
    } else if (/^[A-Za-z]$/.test(tokens[i]) || /^\d+$/.test(tokens[i])) {
      out.push(tokens[i]);
      i += 1;
    } else {
      return null;
    }
  }
  return out.join(' ');
};

// "Boys Toilet - Ground Floor"  <->  "लड़कों का शौचालय (भूतल)"
const translateBlockWithVocab = (text, from) => {
  const src = String(text).trim();
  const fragments = [];
  // Split on " - " or "( ... )"; the capture group keeps the bracketed text.
  const parts = src.split(/\s+-\s+|\s*\(([^)]*)\)\s*/).filter((p) => p && p.trim());
  if (!parts.length) return null;

  for (const p of parts) {
    const t = translateFragment(p, from);
    if (t === null) return null;
    fragments.push(t);
  }
  const [main, ...rest] = fragments;
  if (from === 'en') return rest.length ? `${main} (${rest.join(', ')})` : main;
  return rest.length ? `${main} - ${rest.join(', ')}` : main;
};

/* ------------------------------ network providers -------------------------- */

const cache = new Map();
const cacheGet = (k) => cache.get(k);
const cacheSet = (k, v) => {
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  cache.set(k, v);
};

const fetchJson = async (url, ms = 4000) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// Google Input Tools: sound-for-sound Latin -> Devanagari. Ideal for names.
const transliterateToHindiOnline = async (text) => {
  const url =
    'https://inputtools.google.com/request?itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage&text=' +
    encodeURIComponent(text);
  const json = await fetchJson(url);
  if (json?.[0] !== 'SUCCESS') return null;
  const out = (json[1] || []).map((seg) => seg?.[1]?.[0] || '').join('').trim();
  return HAS_DEVANAGARI.test(out) ? out : null;
};

// MyMemory: free translation memory, fine for short place names.
const translateOnline = async (text, from) => {
  const pair = from === 'en' ? 'en|hi' : 'hi|en';
  let url = `https://api.mymemory.translated.net/get?langpair=${pair}&q=${encodeURIComponent(text)}`;
  if (process.env.MYMEMORY_EMAIL) url += `&de=${encodeURIComponent(process.env.MYMEMORY_EMAIL)}`;
  const json = await fetchJson(url);
  // MyMemory mixes machine translation ("MT!") with crowd-sourced memory, and the
  // crowd entries are sometimes plain wrong ("खेल कक्ष" -> "maths lab" at 0.98).
  // Only trust the machine translation entry.
  const mt = (json?.matches || []).find((m) => m?.['created-by'] === 'MT!');
  const out = String(mt?.translation || '').trim();
  if (!out || /MYMEMORY WARNING|INVALID/i.test(out)) return null;
  if (out.toLowerCase() === text.toLowerCase()) return null;
  const script = detectScript(out);
  if (from === 'en' && script !== 'hi' && script !== 'none') return null;
  if (from === 'hi' && script !== 'en') return null;
  return out;
};

const safely = async (fn) => {
  try { return await fn(); } catch { return null; }
};

/* ----------------------------------- API ----------------------------------- */

// Returns { text, via } or null.  `from` is the language of `text` ('en' | 'hi').
const convert = async (kind, text, from) => {
  const clean = String(text ?? '').trim().slice(0, 120);
  if (!clean) return null;

  const key = `${kind}|${from}|${clean.toLowerCase()}`;
  const hit = cacheGet(key);
  if (hit) return hit;

  let result = null;

  if (kind === 'name') {
    if (from === 'hi') {
      const out = devanagariToLatin(clean);
      if (out) result = { text: out, via: 'transliteration' };
    } else {
      const out = await safely(() => transliterateToHindiOnline(clean));
      if (out) result = { text: out, via: 'transliteration' };
    }
  } else {
    const vocab = translateBlockWithVocab(clean, from);
    if (vocab) {
      result = { text: vocab, via: 'dictionary' };
    } else {
      const out = await safely(() => translateOnline(clean, from));
      if (out) result = { text: out, via: 'online' };
    }
  }

  if (result) cacheSet(key, result);
  return result;
};

// Does this value belong in the Hindi / English field?
const isHindiText = (s) => detectScript(s) === 'hi';
const isEnglishText = (s) => detectScript(s) === 'en';

// Given whatever the admin typed into the English and/or Hindi box, return a clean
// pair. Handles: only one box filled, the wrong language typed into a box, and
// legacy records where English was saved in the Hindi field.
//
//   -> { name, nameHindi, generated: 'hindi' | 'english' | null, ok }
const completeNames = async (kind, { name, nameHindi } = {}) => {
  let en = String(name ?? '').trim();
  let hi = String(nameHindi ?? '').trim();

  // Wrong language in the wrong box -> swap/move it.
  if (detectScript(en) === 'hi' && !isHindiText(hi)) { hi = en; en = ''; }
  if (detectScript(hi) === 'en' && !isEnglishText(en)) { en = hi; hi = ''; }
  // English text sitting in the Hindi box although a proper English name exists:
  // the Hindi box is wrong, regenerate it.
  if (hi && detectScript(hi) === 'en') hi = '';
  if (en && detectScript(en) === 'hi') en = '';

  let generated = null;
  let ok = true;

  if (en && !hi) {
    const r = await convert(kind, en, 'en');
    if (r) { hi = r.text; generated = 'hindi'; } else { hi = en; ok = false; }
  } else if (hi && !en) {
    const r = await convert(kind, hi, 'hi');
    if (r) { en = r.text; generated = 'english'; } else { en = hi; ok = false; }
  }

  return { name: en, nameHindi: hi, generated, ok };
};

module.exports = {
  detectScript,
  devanagariToLatin,
  translateBlockWithVocab,
  convert,
  completeNames,
  isHindiText,
  isEnglishText
};
