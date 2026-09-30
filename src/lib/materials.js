// Area/volume estimates, not layout or structural design. Round only at purchase boundaries.
const positive = values => values.every(n => Number.isFinite(n) && n > 0);
const roundUp = n => Math.ceil(n - 8 * Number.EPSILON * Math.abs(n));
export function tileEstimate(length, width, tileLength, tileWidth, waste, perBox, price) {
  if (!positive([length, width, tileLength, tileWidth, perBox]) || !Number.isInteger(perBox) || !Number.isFinite(waste) || waste < 0 || waste > 100 || (price !== null && (!Number.isFinite(price) || price < 0))) return null;
  const area = length * width, tileArea = tileLength * tileWidth / 144;
  const orderArea = area * (1 + waste / 100);
  const tiles = roundUp(orderArea / tileArea), boxes = roundUp(tiles / perBox);
  const purchased = boxes * perBox, cost = price === null ? null : boxes * price;
  if (!positive([area, tileArea, orderArea]) || ![tiles, boxes, purchased].every(Number.isSafeInteger) || (cost !== null && !Number.isFinite(cost))) return null;
  return {area, tileArea, orderArea, baseTiles: roundUp(area / tileArea), tiles, boxes, purchased, cost};
}
export function concreteEstimate(length, width, depth, waste, price = null) {
  if (!positive([length, width, depth]) || !Number.isFinite(waste) || waste < 0 || waste > 100 || (price !== null && (!Number.isFinite(price) || price < 0))) return null;
  const base = length * width * depth / 12, cubicFeet = base * (1 + waste / 100), yards = cubicFeet / 27;
  const bags = Object.fromEntries([[40,.30],[50,.375],[60,.45],[80,.60]].map(([size,yieldPerBag]) => [size,roundUp(cubicFeet/yieldPerBag)]));
  const cost = price === null ? null : yards * price;
  if (!positive([base,cubicFeet,yards]) || !Object.values(bags).every(Number.isSafeInteger) || (cost !== null && !Number.isFinite(cost))) return null;
  return {base, cubicFeet, yards, bags, cost};
}
export function paintEstimate(length, width, height, coats, doors, windows, doorArea, windowArea, coverage, ceiling) {
  if (!positive([length,width,height,coverage]) || ![1,2,3].includes(coats) || ![doors,windows].every(n => Number.isSafeInteger(n) && n >= 0) || ![doorArea,windowArea].every(n => Number.isFinite(n) && n >= 0) || ![0,1].includes(ceiling)) return null;
  const walls = 2 * (length + width) * height, openings = doors * doorArea + windows * windowArea;
  if (openings >= walls) return null;
  const ceilingArea = ceiling ? length * width : 0, net = walls - openings + ceilingArea;
  const coated = net * coats, gallons = coated / coverage, purchase = roundUp(gallons);
  if (!positive([walls,net,coated,gallons]) || !Number.isSafeInteger(purchase)) return null;
  return {walls, openings, ceilingArea, net, coated, gallons, purchase};
}
