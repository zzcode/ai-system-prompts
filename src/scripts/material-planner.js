import { FIELD_SETS, BAG_YIELDS, PLAN_KEY, PENDING_KEY, DRAFT_KEY, estimatePlan, parseSavedPlan, validateItem, planCSV } from '../lib/material-plan.js';

const $ = id => document.getElementById(id);
const form = $('area-form');
const status = $('plan-status');
let items = [], editIndex = null, currentPlan = estimatePlan([]);
function keepDraft() {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({version:1,title:$('plan-title').value.trim() || 'My material list',items})); } catch { /* Storage is optional. */ }
}
const defaults = {tile: 'Floor tile', concrete: 'Concrete mix', paint: 'Wall paint'};
const money = n => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(n);
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
function measure(action, kind = 'mixed') {
  // Fixed event labels only: no names, quantities, prices, storage or input values.
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  if (typeof window.gtag === 'function') window.gtag('event', 'material_plan_action', {action, material_type:kind});
}
function setKind(kind) {
  $('plan-kind').value = kind;
  document.querySelectorAll('[data-kind-fields]').forEach(fieldset => {
    fieldset.hidden = fieldset.dataset.kindFields !== kind;
    fieldset.disabled = fieldset.hidden;
  });
}
function resetEditor() {
  editIndex = null;
  $('area-form-heading').textContent = 'Add an area';
  $('area-add').textContent = 'Add area to list';
  $('area-cancel').hidden = true;
  $('area-label').value = `Area ${items.length+1}`;
  $('area-error').textContent = '';
}
function loadEditor(item, index = null) {
  setKind(item.kind);
  $('area-label').value = item.label;
  $('area-product').value = item.product;
  item.values.forEach((value,i) => { $(`plan-${item.kind}-${i}`).value = value ?? ''; });
  if (item.kind === 'concrete') {
    $('plan-bag-size').value = item.bagSize;
    $('plan-bag-yield').value = item.yield;
  }
  if (item.kind !== 'tile') $(`plan-${item.kind}-price`).value = item.unitPrice ?? '';
  editIndex = index;
  $('area-form-heading').textContent = index === null ? 'Add an area' : 'Edit area';
  $('area-add').textContent = index === null ? 'Add area to list' : 'Update area';
  $('area-cancel').hidden = index === null;
  $('area-error').textContent = '';
}
function render() {
  currentPlan = estimatePlan(items);
  $('area-count').textContent = `${items.length} ${items.length === 1 ? 'area' : 'areas'}`;
  $('plan-empty').hidden = items.length > 0;
  $('plan-results').hidden = items.length === 0;
  $('plan-save').disabled = items.length === 0;
  const groups = $('plan-groups'); groups.replaceChildren();
  currentPlan.groups.forEach(group => {
    const line = element('article', undefined, 'purchase-line');
    line.append(element('h3', group.product), element('div',`${group.quantity.toLocaleString('en-US')} ${group.unit}`, 'purchase-quantity'), element('div',group.cost === null ? 'Not quoted' : money(group.cost), 'purchase-price'), element('p', group.details), element('p', `Areas: ${group.labels.join(', ')}`));
    groups.append(line);
  });
  $('plan-total').textContent = currentPlan.groups.length && currentPlan.missingPrices === currentPlan.groups.length ? 'Not quoted' : money(currentPlan.quotedTotal);
  $('plan-price-note').textContent = currentPlan.missingPrices ? `${currentPlan.missingPrices} product ${currentPlan.missingPrices === 1 ? 'group has' : 'groups have'} no price and ${currentPlan.missingPrices === 1 ? 'is' : 'are'} excluded from this subtotal.` : 'All product groups have a price. Includes only the material quantities listed above.';
  const areas = $('plan-areas'); areas.replaceChildren();
  items.forEach((item,index) => {
    const li = element('li');
    li.append(element('strong',item.label), element('p', `${item.product} · ${item.kind}`));
    const edit = element('button','Edit area','text-button'); edit.type = 'button'; edit.setAttribute('aria-label',`Edit ${item.label}`);
    edit.addEventListener('click',() => { loadEditor(item,index); $('area-label').focus(); });
    const remove = element('button','Remove area','text-button'); remove.type = 'button'; remove.setAttribute('aria-label',`Remove ${item.label}`);
    remove.addEventListener('click',() => {
      items.splice(index,1); resetEditor(); render(); status.textContent = 'Area removed from this draft. Your saved copy is unchanged until you save again.';
      $('area-label').focus();
    });
    li.append(edit,remove); areas.append(li);
  });
  keepDraft();
}
form.addEventListener('submit',event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  try {
    const kind = $('plan-kind').value;
    const values = FIELD_SETS[kind].map((_,i) => {
      const value = $(`plan-${kind}-${i}`).value.trim();
      return value === '' ? null : Number(value);
    });
    const item = {kind, values, label:$('area-label').value, product:$('area-product').value};
    if (kind !== 'tile') {
      const price = $(`plan-${kind}-price`).value.trim();
      item.unitPrice = price === '' ? null : Number(price);
    }
    if (kind === 'concrete') Object.assign(item, {bagSize:Number($('plan-bag-size').value), yield:Number($('plan-bag-yield').value)});
    const normalized = validateItem(item).item;
    const updated = [...items];
    if (editIndex === null) updated.push(normalized); else updated[editIndex] = normalized;
    estimatePlan(updated); // Validate the entire replacement before mutating the draft.
    const editing = editIndex !== null;
    items = updated; resetEditor(); render();
    status.textContent = editing ? 'Area updated. Save again to update your saved copy.' : 'Area added. Matching products are combined before rounding. Save your list to keep it on this browser.';
    measure(editing ? 'update_area' : 'add_area', kind);
  } catch (error) { $('area-error').textContent = error.message; }
});
$('plan-kind').addEventListener('change',() => {
  setKind($('plan-kind').value);
  $('area-product').value = defaults[$('plan-kind').value];
  $('area-error').textContent = '';
});
$('plan-title').addEventListener('input',keepDraft);
$('plan-bag-size').addEventListener('change',() => { $('plan-bag-yield').value = BAG_YIELDS[$('plan-bag-size').value]; });
$('area-cancel').addEventListener('click',resetEditor);
$('plan-save').addEventListener('click',() => {
  try {
    const title = $('plan-title').value.trim();
    const serialized = JSON.stringify({version:1,title,items});
    parseSavedPlan(serialized);
    localStorage.setItem(PLAN_KEY, serialized);
    $('plan-forget').hidden = false;
    status.textContent = 'Saved on this browser. Use Load saved plan to restore this copy. Clearing browser storage removes it.';
    measure('save');
  } catch { status.textContent = 'Could not save. Enter a project name and allow browser storage, or export a CSV instead.'; }
});
$('plan-load').addEventListener('click',() => {
  try {
    const serialized = localStorage.getItem(PLAN_KEY);
    if (!serialized) {status.textContent = 'No saved plan on this browser yet. Add an area, then choose Save on this browser.';return;}
    // Keep an existing draft rather than silently overwriting it.
    if (items.length && !window.confirm('Replace your current draft with the saved plan? Export the current list first if you need a copy.')) return;
    const restored = parseSavedPlan(serialized);
    items = restored.items; $('plan-title').value = restored.title;
    resetEditor(); render(); $('plan-forget').hidden = false;
    status.textContent = 'Saved plan loaded. Changes stay in this draft until you save again.';
    measure('load');
  } catch { status.textContent = 'Could not load the saved plan. Browser storage may be unavailable or the copy may be damaged. Your current draft is unchanged.'; }
});
$('plan-forget').addEventListener('click',() => {
  try {
    localStorage.removeItem(PLAN_KEY); $('plan-forget').hidden = true;
    status.textContent = 'Saved copy removed from this browser. Your current draft is still available to export or save again.';
  } catch { status.textContent = 'Browser storage is unavailable. Use your browser settings to remove the saved copy.'; }
});
$('plan-export').addEventListener('click',() => {
  const url = URL.createObjectURL(new Blob([planCSV($('plan-title').value.trim() || 'Material list',currentPlan)], {type:'text/csv;charset=utf-8'}));
  const link = element('a'); link.href = url; link.download = 'kodatools-material-list.csv';
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'CSV exported. The file contains your project and product names; share it only with people you choose.';
  measure('export_csv');
});
$('plan-print').addEventListener('click',() => { measure('print'); window.print(); });
try {
  const draft = sessionStorage.getItem(DRAFT_KEY);
  if (draft) {
    const restored = parseSavedPlan(draft);
    items = restored.items; $('plan-title').value = restored.title;
    resetEditor();
    if (items.length) status.textContent = 'Your draft from this tab is restored. Save on this browser to keep it after closing the tab.';
  }
} catch { status.textContent = 'The previous tab draft could not be restored. You can still load your saved copy.'; }
render();
try { $('plan-forget').hidden = !localStorage.getItem(PLAN_KEY); } catch { /* The planner still works without storage. */ }
try {
  const pending = sessionStorage.getItem(PENDING_KEY);
  if (pending) {
    const item = validateItem(JSON.parse(pending)).item;
    sessionStorage.removeItem(PENDING_KEY);
    loadEditor({...item,label:`Area ${items.length+1}`});
    status.textContent = 'Calculator measurements loaded. Name the area and product, then add it to your list.';
  }
} catch { status.textContent = 'The transferred estimate could not be loaded. Enter your measurements below.'; }
