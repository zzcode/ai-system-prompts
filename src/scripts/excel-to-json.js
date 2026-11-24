import { parseCSV, rowsToJSON, workbookToJSON, MAX_FILE_BYTES } from '../lib/spreadsheet-json.js';
const $ = id => document.getElementById(id);
let sheets = [], output = '', sequence = 0;
const status = $('xj-status'), error = $('xj-error');
function clearResult() {
  output = ''; $('xj-output').value = ''; $('xj-result').hidden = true;
  error.textContent = ''; $('xj-header-note').textContent = '';
}
function render() {
  clearResult();
  try {
    if (!sheets.length) return;
    const selected = $('xj-sheet').value || '0';
    const headers = $('xj-headers').checked;
    if (selected === 'all') {
      const result = workbookToJSON(sheets, headers);
      output = JSON.stringify(result.data, null, 2);
      $('xj-output').value = output;
      $('xj-result').hidden = false;
      status.textContent = `${sheets.length} worksheets, ${result.rows.toLocaleString('en-US')} data rows. Check the output before using it.`;
      if (result.renamed) $('xj-header-note').textContent = `Blank or duplicate headers were renamed in ${result.renamed} worksheet(s).`;
      return;
    }
    const result = rowsToJSON(sheets[Number(selected)].data, headers);
    output = JSON.stringify(result.data,null,2);
    $('xj-output').value = output; $('xj-result').hidden = false;
    status.textContent = `${result.data.length.toLocaleString('en-US')} data rows, ${result.columns} columns. Check the output before using it.`;
    $('xj-header-note').textContent = result.renamed ? 'Blank or duplicate headers were renamed to unique keys. Output keys: '+result.keys.join(', ') : '';
  } catch (e) {error.textContent = e.message;status.textContent = 'Conversion stopped. No partial result is available.';}
}
function setSheets(next) {
  if (!Array.isArray(next) || !next.length) throw new Error('No worksheets were found. Try saving a fresh XLSX or CSV copy.');
  sheets = next;
  $('xj-sheet').replaceChildren();
  sheets.forEach((sheet,index) => {
    const option = document.createElement('option'); option.value = String(index); option.textContent = sheet.sheet;
    $('xj-sheet').append(option);
  });
  if (sheets.length > 1) {
    const all = document.createElement('option');
    all.value = 'all'; all.textContent = 'All worksheets';
    $('xj-sheet').append(all);
  }
  $('xj-sheet-field').hidden = sheets.length < 2;
  render();
}
async function readWorkbook(file) {
  const {default:readExcelFile} = await import('read-excel-file/browser');
  return readExcelFile(file);
}
$('xj-file').addEventListener('change',async () => {
  const turn = ++sequence; sheets = []; clearResult(); $('xj-sheet-field').hidden = true;
  const file = $('xj-file').files[0];
  if (!file) {status.textContent = 'Select a file or try the sample to begin.';return;}
  try {
    if (file.size > MAX_FILE_BYTES) throw new Error('Choose a file no larger than 10 MB.');
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx','csv'].includes(extension)) throw new Error('Use an XLSX or UTF-8 CSV file. Save legacy XLS files as XLSX first.');
    status.textContent = 'Reading your file on this device…';
    let next;
    if (extension === 'csv') next = [{sheet:'CSV',data:parseCSV(await file.text())}];
    else {
      next = await readWorkbook(file);
    }
    if (turn !== sequence) return;
    setSheets(next);
  } catch (e) {
    if (turn !== sequence) return;
    sheets = []; clearResult(); status.textContent = 'Could not read this file.';
    error.textContent = e.message?.startsWith('Use ') || e.message?.startsWith('Choose ') ? e.message : 'The file may be damaged, encrypted or unsupported. Save a fresh XLSX or UTF-8 CSV copy and try again.';
  }
});
function convertPasted() {
  ++sequence; clearResult(); sheets = []; $('xj-file').value = ''; $('xj-sheet-field').hidden = true;
  try {
    const csv = $('xj-csv').value;
    if (new Blob([csv]).size > MAX_FILE_BYTES) throw new Error('Paste no more than 10 MB of CSV.');
    if (!csv.trim()) throw new Error('Paste CSV text first, or try the sample.');
    setSheets([{sheet:'CSV',data:parseCSV(csv)}]);
  } catch (e) {error.textContent = e.message;status.textContent = 'Conversion stopped. Check your CSV.';}
}
$('xj-convert').addEventListener('click',convertPasted);
$('xj-sample').addEventListener('click',() => {
  $('xj-csv').value = 'Code,Product,Quantity\n0012,Tile,56\n0042,Paint,2';
  convertPasted();
});
$('xj-workbook-sample').addEventListener('click',async () => {
  const turn = ++sequence; sheets = []; clearResult(); $('xj-file').value = ''; $('xj-sheet-field').hidden = true;
  status.textContent = 'Reading the sample workbook…';
  try {
    const response = await fetch('/examples/inventory.xlsx');
    if (!response.ok) throw new Error('Sample unavailable');
    const next = await readWorkbook(await response.blob());
    if (turn !== sequence) return;
    setSheets(next);
  } catch {
    if (turn !== sequence) return;
    clearResult(); status.textContent = 'Could not read the sample.'; error.textContent = 'Try reloading the page or use CSV instead.';
  }
});
$('xj-clear').addEventListener('click',() => {
  ++sequence; sheets = []; $('xj-file').value = ''; $('xj-csv').value = ''; $('xj-sheet').replaceChildren(); $('xj-sheet-field').hidden = true;
  clearResult();status.textContent = 'Cleared. No file contents are saved by this tool.';
});
$('xj-sheet').addEventListener('change',render);
$('xj-headers').addEventListener('change',render);
$('xj-copy').addEventListener('click',async () => {
  if (!output) return;
  try {await navigator.clipboard.writeText(output);status.textContent = 'JSON copied to your clipboard.';}
  catch {$('xj-output').focus();$('xj-output').select();status.textContent = 'Clipboard access is unavailable. The JSON is selected; use your keyboard to copy it.';}
});
$('xj-download').addEventListener('click',() => {
  if (!output) return;
  const url = URL.createObjectURL(new Blob([output],{type:'application/json;charset=utf-8'}));
  const link = document.createElement('a');link.href=url;link.download='kodatools-data.json';document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent = 'JSON file downloaded. Share the file only with people you choose.';
});
