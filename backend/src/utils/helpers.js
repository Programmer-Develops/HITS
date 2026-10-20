// Small pure helpers shared by the routes.
// No DB / Express imports on purpose, so they are easy to test in isolation.

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

// "१" (Devanagari) -> "1", so workers typing on a Hindi keyboard still work
const toAsciiDigits = (s) =>
  String(s ?? '').replace(/[\u0966-\u096F]/g, (d) => String(d.charCodeAt(0) - 0x0966));

const normalise = (s) => toAsciiDigits(s).trim().toLowerCase();

/* ---------------------------------- phone --------------------------------- */

// Normalise an Indian mobile number to the 12-digit "91XXXXXXXXXX" form Meta uses.
// Accepts "9876543210", "09876543210", "+91 98765 43210", "919876543210".
const formatPhone = (raw) => {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = '91' + digits;
  return digits;
};

const isValidPhone = (phone) => /^91\d{10}$/.test(phone);

/* ---------------------------------- blocks -------------------------------- */

// Accepts an array, a single id string, or nothing. Returns unique, valid
// ObjectId strings in the order given (the order is the number the bot shows).
const sanitizeBlockIds = (input) => {
  const list = Array.isArray(input) ? input : input ? [input] : [];
  return [...new Set(list.map(String).filter((id) => OBJECT_ID_RE.test(id)))];
};

// Workers created before multi-block support only have the legacy single
// `assignedBlock`. Read both so old records keep working without a migration.
const getAssignedBlockIds = (worker) => {
  const multi = Array.isArray(worker.assignedBlocks) ? worker.assignedBlocks : [];
  if (multi.length > 0) return sanitizeBlockIds(multi);
  return sanitizeBlockIds(worker.assignedBlock);
};

// Decide which of the worker's blocks a photo is for, from the photo caption.
// `blocks` must be in the same order as the numbered list sent to the worker.
// Returns the block, or null if the caption is missing / ambiguous.
const matchBlockFromCaption = (caption, blocks) => {
  const text = normalise(caption);
  if (!text || !Array.isArray(blocks) || blocks.length === 0) return null;

  const namesOf = (b) => [b.name, b.nameHindi].filter(Boolean).map(normalise).filter(Boolean);

  // 1. Exact block name (English or Hindi)
  const exact = blocks.filter((b) => namesOf(b).includes(text));
  if (exact.length === 1) return exact[0];

  // 2. Just a number: "2", "2.", "(2)", "२"
  const num = text.match(/^[\s.,:;#()\-]*(\d{1,2})[\s.,:;#()\-]*$/);
  if (num) {
    const index = parseInt(num[1], 10);
    return index >= 1 && index <= blocks.length ? blocks[index - 1] : null;
  }

  // 3. Partial name, only if it points to exactly one block
  if (text.length >= 2) {
    const partial = blocks.filter((b) => namesOf(b).some((n) => n.includes(text) || text.includes(n)));
    if (partial.length === 1) return partial[0];
  }

  return null;
};

/* --------------------------------- reports -------------------------------- */

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const asTrimmedString = (v) => (typeof v === 'string' ? v.trim() : '');

// "YYYY-MM-DD" from <input type="date">, interpreted as an India (IST) calendar day
const parseISTDate = (value, endOfDay) => {
  const s = asTrimmedString(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const SEARCH_FIELDS = [
  'workerName',
  'workerNameHindi',
  'workerPhone',
  'blockName',
  'blockNameHindi',
  'caption',
  'timeIST'
];

// Turn the query string of GET /api/reports into a Mongo filter.
// Every value is coerced to a string and regex-escaped, so a crafted query
// (e.g. ?search[$ne]=x or a regex bomb) can't inject operators.
const buildReportFilter = (query = {}) => {
  const filter = {};

  const search = asTrimmedString(query.search).slice(0, 100);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const clauses = SEARCH_FIELDS.map((field) => ({ [field]: rx }));

    // "+91 98765 43210" should still find the stored "919876543210"
    const digits = search.replace(/\D/g, '');
    if (digits.length >= 3 && /^[\d\s+\-()]+$/.test(search)) {
      clauses.push({ workerPhone: new RegExp(escapeRegex(digits)) });
    }
    filter.$or = clauses;
  }

  const blockId = asTrimmedString(query.blockId);
  if (OBJECT_ID_RE.test(blockId)) filter.blockId = blockId;

  const from = parseISTDate(query.from, false);
  const to = parseISTDate(query.to, true);
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = from;
    if (to) filter.timestamp.$lte = to;
  }

  return filter;
};

const isObjectId = (v) => typeof v === 'string' && OBJECT_ID_RE.test(v);

module.exports = {
  isObjectId,
  formatPhone,
  isValidPhone,
  sanitizeBlockIds,
  getAssignedBlockIds,
  matchBlockFromCaption,
  escapeRegex,
  buildReportFilter
};
