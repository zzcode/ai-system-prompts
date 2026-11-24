import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import readExcelFile from 'read-excel-file/node';
import { parseCSV, rowsToJSON, workbookToJSON, MAX_ROWS } from '../src/lib/spreadsheet-json.js';

test('CSV preserves identifiers, commas, quotes and multiline values', () => {
  const rows = parseCSV('Code,Note\r\n0012,"A, B"\r\n0042,"line 1\nline ""2"""');
  const {data} = rowsToJSON(rows);
  assert.deepEqual(data,[{Code:'0012',Note:'A, B'},{Code:'0042',Note:'line 1\nline "2"'}]);
  assert.deepEqual(rowsToJSON(parseCSV('Code\n0012')).data,[{Code:'0012'}]);
  assert.throws(() => parseCSV('A,B\n"unclosed,2'));
});
test('duplicate and empty headers never discard a column, including special property names', () => {
  const result = rowsToJSON([['Name','Name','','Name (2)','__proto__'],['A','B','C','D','E']]);
  assert.equal(result.renamed,true);
  assert.equal(new Set(result.keys).size,5);
  assert.deepEqual(Object.values(result.data[0]),['A','B','C','D','E']);
  assert.equal(Object.getPrototypeOf(result.data[0]),Object.prototype);
  assert.equal(result.data[0].__proto__,'E');
});
test('missing cells are null, blank rows skipped, dates and booleans preserved', () => {
  const result = rowsToJSON([['Code','Date','Enabled'],[],['0012',new Date('2026-11-17T00:00:00Z'),false],['0042']]);
  assert.deepEqual(result.data,[{Code:'0012',Date:'2026-11-17T00:00:00.000Z',Enabled:false},{Code:'0042',Date:null,Enabled:null}]);
  assert.deepEqual(rowsToJSON([['A','B'],['0012',3]],false).data,[['A','B'],['0012',3]]);
  assert.deepEqual(rowsToJSON([]).data,[]);
});
test('row, column and unsupported cell limits fail explicitly', () => {
  assert.throws(() => rowsToJSON(Array.from({length:10002},()=>['A'])));
  assert.throws(() => rowsToJSON([Array.from({length:201},()=>1)]));
  assert.throws(() => rowsToJSON([['A'],[Infinity]]));
  assert.throws(() => rowsToJSON([['A'],[{}]]));
});
test('the actual XLSX parser reads multiple worksheets and retains typed values', async () => {
  const sheets = await readExcelFile(fileURLToPath(new URL('./fixtures/two-sheets.xlsx',import.meta.url)));
  assert.equal(sheets.length,2);
  assert.equal(sheets[0].sheet,'Inventory');
  assert.deepEqual(rowsToJSON(sheets[0].data).data,[{Code:'0012',Quantity:3,Enabled:true}]);
  assert.deepEqual(rowsToJSON(sheets[1].data).data,[]);
  const result = workbookToJSON(sheets);
  assert.deepEqual(Object.values(result.data),[[{Code:'0012',Quantity:3,Enabled:true}],[]]);
  assert.deepEqual(Object.keys(result.data),sheets.map(({sheet}) => sheet));
  assert.equal(result.rows,1);
});
test('workbook export preserves special worksheet names and respects the aggregate row limit', () => {
  const workbook = workbookToJSON([{sheet:'__proto__',data:[['A','A'],[1,2]]},{sheet:'Empty',data:[]}]);
  assert.equal(Object.getPrototypeOf(workbook.data),Object.prototype);
  assert.deepEqual(workbook.data.__proto__,[{A:1,'A (2)':2}]);
  assert.equal(workbook.renamed,1);
  assert.deepEqual(workbookToJSON([{sheet:'Raw',data:[['0012',3]]}],false).data,{Raw:[['0012',3]]});
  const fullSheet = Array.from({length:MAX_ROWS + 1},()=>['A']);
  assert.equal(workbookToJSON([{sheet:'Full',data:fullSheet}]).rows,MAX_ROWS);
  assert.throws(() => workbookToJSON([{sheet:'Full',data:fullSheet},{sheet:'Extra',data:[['A'],[1]]}]),/All worksheets together/);
});
