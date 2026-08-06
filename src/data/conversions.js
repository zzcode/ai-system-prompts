// Conversion definitions for programmatic /convert/[value]-[slug] pages.
// Each definition produces many pages: one per value in `values`.
// factor: multiply from-value by factor to get to-value (linear conversions).
// type 'temp': temperature uses special formulas.

function range(start, end, step) {
  const out = [];
  for (let v = start; v <= end; v += step) out.push(v);
  return out;
}

export const conversions = [
  {
    baseSlug: 'cm-to-inches',
    from: 'cm', to: 'in', fromLabel: 'Centimeters', toLabel: 'Inches',
    fromUnit: 'cm', toUnit: 'in', category: 'Length', factor: 1 / 2.54,
    formula: 'inches = cm ÷ 2.54',
    values: [1,2,3,5,10,15,20,25,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200]
  },
  {
    baseSlug: 'inches-to-cm',
    from: 'in', to: 'cm', fromLabel: 'Inches', toLabel: 'Centimeters',
    fromUnit: 'in', toUnit: 'cm', category: 'Length', factor: 2.54,
    formula: 'cm = inches × 2.54',
    values: [1,2,3,4,5,6,7,8,10,12,15,20,24,30,36,40,48,50,60,72]
  },
  {
    baseSlug: 'cm-to-feet',
    from: 'cm', to: 'ft', fromLabel: 'Centimeters', toLabel: 'Feet',
    fromUnit: 'cm', toUnit: 'ft', category: 'Length', factor: 1 / 30.48,
    formula: 'feet = cm ÷ 30.48',
    values: [100,120,130,140,150,152,155,157,160,162,165,167,170,172,175,177,180,182,185,188,190,193,195,198,200]
  },
  {
    baseSlug: 'feet-to-cm',
    from: 'ft', to: 'cm', fromLabel: 'Feet', toLabel: 'Centimeters',
    fromUnit: 'ft', toUnit: 'cm', category: 'Length', factor: 30.48,
    formula: 'cm = feet × 30.48',
    values: [4,4.5,5,5.1,5.2,5.3,5.4,5.5,5.6,5.7,5.8,5.9,6,6.1,6.2,6.5,7]
  },
  {
    baseSlug: 'm-to-feet',
    from: 'm', to: 'ft', fromLabel: 'Meters', toLabel: 'Feet',
    fromUnit: 'm', toUnit: 'ft', category: 'Length', factor: 3.28084,
    formula: 'feet = meters × 3.28084',
    values: [1,1.5,1.6,1.7,1.8,2,2.5,3,4,5,10,15,20,25,30,50,100]
  },
  {
    baseSlug: 'feet-to-m',
    from: 'ft', to: 'm', fromLabel: 'Feet', toLabel: 'Meters',
    fromUnit: 'ft', toUnit: 'm', category: 'Length', factor: 0.3048,
    formula: 'meters = feet × 0.3048',
    values: [1,2,3,4,5,6,7,8,10,12,15,20,25,30,50,100]
  },
  {
    baseSlug: 'kg-to-lbs',
    from: 'kg', to: 'lbs', fromLabel: 'Kilograms', toLabel: 'Pounds',
    fromUnit: 'kg', toUnit: 'lb', category: 'Weight', factor: 2.20462,
    formula: 'pounds = kg × 2.20462',
    values: [1,2,5,10,15,20,25,30,40,45,50,55,60,65,70,75,80,85,90,95,100,110,120]
  },
  {
    baseSlug: 'lbs-to-kg',
    from: 'lbs', to: 'kg', fromLabel: 'Pounds', toLabel: 'Kilograms',
    fromUnit: 'lb', toUnit: 'kg', category: 'Weight', factor: 0.453592,
    formula: 'kg = pounds × 0.453592',
    values: [5,10,15,20,25,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,200]
  },
  {
    baseSlug: 'fahrenheit-to-celsius',
    from: 'f', to: 'c', fromLabel: 'Fahrenheit', toLabel: 'Celsius',
    fromUnit: '°F', toUnit: '°C', category: 'Temperature', type: 'temp',
    formula: '°C = (°F − 32) × 5/9',
    values: [32,50,60,65,68,70,72,75,77,80,85,90,95,98.6,100,200,212,350,375,400]
  },
  {
    baseSlug: 'celsius-to-fahrenheit',
    from: 'c', to: 'f', fromLabel: 'Celsius', toLabel: 'Fahrenheit',
    fromUnit: '°C', toUnit: '°F', category: 'Temperature', type: 'temp',
    formula: '°F = °C × 9/5 + 32',
    values: [0,5,10,15,18,20,22,25,28,30,32,35,37,38,40,100,180,200,220]
  }
];

// Convert a value for a given definition (build-time + shared logic).
export function convertValue(def, v) {
  if (def.type === 'temp') {
    if (def.from === 'f' && def.to === 'c') return (v - 32) * 5 / 9;
    if (def.from === 'c' && def.to === 'f') return v * 9 / 5 + 32;
  }
  return v * def.factor;
}

export function formatNum(n) {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  const rounded = Math.round(n * 10000) / 10000;
  if (abs >= 1000) return rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return String(rounded);
}

// All generated page entries: { slug, def, value }
export function allConversionPages() {
  const pages = [];
  for (const def of conversions) {
    for (const value of def.values) {
      pages.push({
        slug: `${value}-${def.baseSlug}`,
        def,
        value
      });
    }
  }
  return pages;
}
