/**
 * Parses district nominee CSV exports (Excel, Google Sheets, template download).
 * Handles UTF-8 BOM, comma/semicolon/tab delimiters, and quoted fields.
 */

/** Required columns (canonical names used in API + DB) */
export const DISTRICT_CSV_REQUIRED = [
  'Student First Name',
  'Student Last Name',
  'Grade Level or Graduation Year',
  'Parent First Name',
  'Parent Last Name',
  'Parent Email'
];

export const DISTRICT_CSV_OPTIONAL = ['High School Name'];

export function stripBom(text) {
  if (!text) return '';
  let s = text;
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  // UTF-8 BOM as literal bytes if mis-decoded (rare)
  if (s.startsWith('\u00ef\u00bb\u00bf')) s = s.slice(3);
  return s;
}

export function normalizeHeaderToken(raw) {
  if (raw == null) return '';
  let s = String(raw).trim();
  s = s.replace(/^\uFEFF/, '');
  s = s.replace(/^["']|["']$/g, '').trim();
  s = s.replace(/\s+/g, ' ').toLowerCase();
  return s;
}

/** Map normalized header text -> canonical column name */
function buildAliasMap() {
  const m = new Map();
  const add = (alias, canonical) => {
    m.set(normalizeHeaderToken(alias), canonical);
  };

  for (const col of [...DISTRICT_CSV_REQUIRED, ...DISTRICT_CSV_OPTIONAL]) {
    add(col, col);
  }

  // Common spreadsheet / export variants
  add('StudentFirstName', 'Student First Name');
  add('Student LastName', 'Student Last Name');
  add('StudentLastName', 'Student Last Name');
  add('First Name (Student)', 'Student First Name');
  add('Last Name (Student)', 'Student Last Name');
  add('Student First', 'Student First Name');
  add('Student Last', 'Student Last Name');
  add('Grade', 'Grade Level or Graduation Year');
  add('Graduation Year', 'Grade Level or Graduation Year');
  add('Grade Level', 'Grade Level or Graduation Year');
  add('Year', 'Grade Level or Graduation Year');
  add('HS', 'High School Name');
  add('School', 'High School Name');
  add('School Name', 'High School Name');
  add('High School', 'High School Name');
  add('Parent/Guardian First Name', 'Parent First Name');
  add('Guardian First Name', 'Parent First Name');
  add('Parent First', 'Parent First Name');
  add('Parent/Guardian Last Name', 'Parent Last Name');
  add('Guardian Last Name', 'Parent Last Name');
  add('Parent Last', 'Parent Last Name');
  add('Parent/Guardian Email', 'Parent Email');
  add('Guardian Email', 'Parent Email');
  add('Parent E-mail', 'Parent Email');
  add('Parent Email Address', 'Parent Email');

  return m;
}

const ALIAS_MAP = buildAliasMap();

export function detectDelimiter(line) {
  if (!line) return ',';
  const tabs = (line.match(/\t/g) || []).length;
  const semis = (line.match(/;/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  if (tabs > 0 && tabs >= commas && tabs >= semis) return '\t';
  if (semis > commas) return ';';
  return ',';
}

/**
 * Split one CSV line respecting quotes and escaped "".
 */
export function parseCsvLine(line, delimiter) {
  const out = [];
  let field = '';
  let inQuotes = false;
  const delim = delimiter === '\t' ? '\t' : delimiter;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        field += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (c === delim && !inQuotes) {
      out.push(field);
      field = '';
      continue;
    }
    field += c;
  }
  out.push(field);
  return out.map((cell) =>
    String(cell)
      .trim()
      .replace(/^"|"$/g, '')
      .trim()
  );
}

/**
 * @param {string} text - full file contents
 * @returns {{ headersCanonical: string[], rows: Record<string,string>[], missingRequired: string[], rawHeaderCells: string[] }}
 */
export function parseDistrictNomineeCsv(text) {
  const body = stripBom(text);
  const lines = body.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      headersCanonical: [],
      rows: [],
      missingRequired: [...DISTRICT_CSV_REQUIRED],
      rawHeaderCells: []
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaderCells = parseCsvLine(lines[0], delimiter);
  const indexToCanonical = rawHeaderCells.map((cell) => {
    const n = normalizeHeaderToken(cell);
    return ALIAS_MAP.get(n) || null;
  });

  const presentCanonical = new Set(indexToCanonical.filter(Boolean));
  const missingRequired = DISTRICT_CSV_REQUIRED.filter((h) => !presentCanonical.has(h));

  const rows = [];
  for (let li = 1; li < lines.length; li++) {
    const cells = parseCsvLine(lines[li], delimiter);
    if (!cells.some((c) => String(c).trim())) continue;

    const row = {};
    cells.forEach((val, idx) => {
      const canon = indexToCanonical[idx];
      if (canon) row[canon] = val == null ? '' : String(val).trim();
    });
    rows.push(row);
  }

  return {
    headersCanonical: [...presentCanonical],
    rows,
    missingRequired,
    rawHeaderCells
  };
}
