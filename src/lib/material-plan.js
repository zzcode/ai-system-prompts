import { tileEstimate, concreteEstimate, paintEstimate } from './materials.js';

export const PLAN_KEY = 'kodatools.material-plan.v1';
export const PENDING_KEY = 'kodatools.material-plan.pending.v1';
export const DRAFT_KEY = 'kodatools.material-plan.draft.v1';
export const BAG_YIELDS = {40: 0.30, 50: 0.375, 60: 0.45, 80: 0.60};
export const FIELD_SETS = {
  tile: [
    ['Area length (ft)', 10, 0.001], ['Area width (ft)', 10, 0.001],
    ['Tile length (in)', 12, 0.001], ['Tile width (in)', 24, 0.001],
    ['Extra allowance (%)', 10, 0, 100], ['Tiles per box', 8, 1, null, 1],
    ['Price per box (USD, optional)', '', 0]
  ],
  concrete: [
    ['Length (ft)', 10, 0.001], ['Width (ft)', 10, 0.001],
    ['Thickness (in)', 4, 0.001], ['Extra allowance (%)', 10, 0, 100]
  ],
  paint: [
    ['Room length (ft)', 12, 0.001], ['Room width (ft)', 12, 0.001],
    ['Wall height (ft)', 8, 0.001], ['Coats', 2, 1, 3, 1],
    ['Doors', 1, 0, null, 1], ['Windows', 2, 0, null, 1],
    ['Average door area (sq ft)', 20, 0], ['Average window area (sq ft)', 15, 0],
    ['Coverage per US gallon, one coat (sq ft)', 350, 0.001],
    ['Surfaces to paint', 0, 0, 1, 1]
  ]
};
const text = value => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 80;
const priceOK = n => n === null || (Number.isFinite(n) && n >= 0);
const roundUp = n => Math.ceil(n - 8 * Number.EPSILON * Math.abs(n));

export function validateItem(item) {
  if (!item || !Object.hasOwn(FIELD_SETS, item.kind) || !text(item.label) || !text(item.product)) throw new Error('Enter an area name and product name (up to 80 characters each).');
  const {kind, values} = item;
  if (!Array.isArray(values) || values.length !== FIELD_SETS[kind].length || !values.every((n, i) => Number.isFinite(n) || (kind === 'tile' && i === 6 && n === null))) throw new Error('Complete all dimensions and product details. Prices may be left blank.');
  const normalized = {kind, label: item.label.trim(), product: item.product.trim(), values: [...values]};
  let result;
  if (kind === 'tile') result = tileEstimate(...values);
  if (kind === 'concrete') {
    result = concreteEstimate(...values);
    if (!Object.hasOwn(BAG_YIELDS, item.bagSize) || !Number.isFinite(item.yield) || item.yield <= 0 || !priceOK(item.unitPrice)) throw new Error('Choose a bag size, positive yield and a non-negative price, or leave the price blank.');
    Object.assign(normalized, {bagSize: Number(item.bagSize), yield: item.yield, unitPrice: item.unitPrice});
  }
  if (kind === 'paint') {
    result = paintEstimate(...values);
    if (!priceOK(item.unitPrice)) throw new Error('Paint price must be non-negative, or blank.');
    normalized.unitPrice = item.unitPrice;
  }
  if (!result) throw new Error('Check positive dimensions, allowance from 0 to 100%, whole counts and product coverage. Paint openings must be smaller than the walls.');
  return {item: normalized, result};
}

export function estimatePlan(items) {
  if (!Array.isArray(items) || items.length > 100) throw new Error('A plan can contain up to 100 areas.');
  const groups = new Map();
  for (const raw of items) {
    const {item, result} = validateItem(raw);
    const v = item.values;
    // Different products, package sizes, coverage or prices must not share rounding.
    const specs = item.kind === 'tile' ? [v[2],v[3],v[5],v[6]] : item.kind === 'concrete' ? [item.bagSize,item.yield,item.unitPrice] : [v[8],item.unitPrice];
    const key = JSON.stringify([item.kind, item.product.toLowerCase(), ...specs]);
    if (!groups.has(key)) groups.set(key, {kind: item.kind, product: item.product, labels: [], area: 0, required: 0, specs});
    const group = groups.get(key);
    group.labels.push(item.label);
    group.area += item.kind === 'tile' ? result.area : item.kind === 'paint' ? result.net : v[0]*v[1];
    group.required += item.kind === 'tile' ? result.orderArea : item.kind === 'paint' ? result.gallons : result.cubicFeet;
  }
  const summary = [...groups.values()].map(group => {
    const s = group.specs;
    let quantity, unit, price, details, spare;
    if (group.kind === 'tile') {
      const tileArea = s[0]*s[1]/144, tiles = roundUp(group.required/tileArea);
      quantity = roundUp(tiles/s[2]); unit = 'boxes'; price = s[3];
      spare = quantity*s[2]-tiles;
      details = `${tiles} tiles needed including allowance; ${quantity*s[2]} tiles purchased; ${spare} above requirement. ${s[0]} × ${s[1]} in, ${s[2]} tiles/box.`;
    } else if (group.kind === 'concrete') {
      quantity = roundUp(group.required/s[1]); unit = `${s[0]} lb bags`; price = s[2];
      spare = quantity*s[1]-group.required;
      details = `${(group.required/27).toFixed(3)} yd³ including allowance; ${s[1]} ft³/bag; ${spare.toFixed(3)} ft³ above requirement.`;
    } else {
      quantity = roundUp(group.required); unit = 'US gallons'; price = s[1];
      spare = quantity-group.required;
      details = `${group.required.toFixed(3)} US gal before rounding; ${s[0]} sq ft/US gal per coat; ${spare.toFixed(3)} US gal above requirement.`;
    }
    const cost = price === null ? null : quantity*price;
    if (!Number.isFinite(group.area) || !Number.isFinite(group.required) || !Number.isSafeInteger(quantity) || quantity <= 0 || (cost !== null && !Number.isFinite(cost))) throw new Error('These dimensions produce an estimate that is too large. Check your units.');
    return {...group, quantity, unit, cost, details, spare};
  });
  const quotedTotal = summary.reduce((sum, group) => sum + (group.cost ?? 0), 0);
  if (!Number.isFinite(quotedTotal)) throw new Error('The combined cost is too large. Check your prices.');
  return {groups: summary, quotedTotal, missingPrices: summary.filter(group => group.cost === null).length};
}

export function parseSavedPlan(serialized) {
  if (typeof serialized !== 'string' || serialized.length > 200000) throw new Error('This saved plan is too large or cannot be read.');
  const data = JSON.parse(serialized);
  if (!data || data.version !== 1 || !text(data.title) || !Array.isArray(data.items)) throw new Error('This saved plan has an unsupported format.');
  estimatePlan(data.items);
  return {version: 1, title: data.title.trim(), items: data.items.map(item => validateItem(item).item)};
}

export function planCSV(title, plan) {
  // Treat all user-supplied text as text even when opened in a spreadsheet.
  const cell = value => {
    const raw = String(value);
    const safe = /^(?:\s*[=+\-@]|[\t\r\n])/.test(raw) ? "'"+raw : raw;
    return '"'+safe.replaceAll('"','""')+'"';
  };
  const rows = [
    ['Project','Product','Material','Areas','Quantity to buy','Unit','Material cost (USD)','Calculation notes'],
    ...plan.groups.map(g => [title,g.product,g.kind,g.labels.join('; '),g.quantity,g.unit,g.cost === null ? 'Not quoted' : g.cost.toFixed(2),g.details]),
    [title,'Quoted subtotal','','','','',plan.quotedTotal.toFixed(2),`${plan.missingPrices} products without prices. Excludes tax, delivery, labor, primer, grout and adhesive.`]
  ];
  return '\uFEFF'+rows.map(row => row.map(cell).join(',')).join('\r\n');
}
