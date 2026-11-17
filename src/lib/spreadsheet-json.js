import Papa from 'papaparse';

export const MAX_ROWS = 10000;
export const MAX_COLUMNS = 200;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function parseCSV(text) {
  const parsed = Papa.parse(text, {skipEmptyLines:'greedy',dynamicTyping:false});
  // A one-column CSV is valid, even if the delimiter cannot be inferred.
  const errors = parsed.errors.filter(error => error.code !== 'UndetectableDelimiter');
  if (errors.length) throw new Error('The CSV has an unmatched quote or malformed row. Check its quoting and try again.');
  return parsed.data;
}
const empty = value => value === null || value === undefined || value === '';
const jsonValue = value => {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw new Error('The sheet contains an invalid date.');
    return value.toISOString();
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('The sheet contains a non-finite number.');
  if (!['string','number','boolean'].includes(typeof value)) throw new Error('The sheet contains an unsupported cell value.');
  return value;
};

export function rowsToJSON(rows, useHeaders = true) {
  if (!Array.isArray(rows) || rows.some(row => !Array.isArray(row))) throw new Error('The worksheet could not be read as a table.');
  if (rows.length > MAX_ROWS + (useHeaders ? 1 : 0)) throw new Error('Use a sheet with no more than 10,000 data rows.');
  const width = rows.reduce((max,row) => Math.max(max,row.length),0);
  if (width > MAX_COLUMNS) throw new Error('Use a sheet with no more than 200 columns.');
  const nonempty = rows.filter(row => row.some(value => !empty(value)));
  if (!nonempty.length) return {data:[],keys:[],renamed:false,columns:width};
  const used = new Set(); let renamed = false;
  const keys = useHeaders ? Array.from({length:width},(_,i) => {
    const original = nonempty[0][i];
    const base = empty(original) ? `Column ${i+1}` : String(jsonValue(original)).trim() || `Column ${i+1}`;
    let key = base, suffix = 2;
    while (used.has(key)) key = `${base} (${suffix++})`;
    if (key !== base || empty(original) || String(original).trim() === '') renamed = true;
    used.add(key); return key;
  }) : [];
  const data = (useHeaders ? nonempty.slice(1) : nonempty).map(row => {
    const cells = Array.from({length:width},(_,i) => jsonValue(row[i]));
    // Object.fromEntries preserves even __proto__ as a data property.
    return useHeaders ? Object.fromEntries(keys.map((key,i) => [key,cells[i]])) : cells;
  });
  return {data,keys,renamed,columns:width};
}
