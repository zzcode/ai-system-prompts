// Deterministic estimates shared by the tools and their worked examples.
export function loanPayment(principal, annualRate, months) {
  if (![principal, annualRate, months].every(Number.isFinite) || principal <= 0 || annualRate < 0 || months < 1 || !Number.isInteger(months)) return null;
  const r = annualRate / 1200;
  const payment = r === 0 ? principal / months : principal * r / -Math.expm1(-months * Math.log1p(r));
  return Number.isFinite(payment) ? { payment, total: payment * months, interest: payment * months - principal } : null;
}

export function compoundBalance(principal, contribution, annualRate, years, frequency) {
  if (![principal, contribution, annualRate, years, frequency].every(Number.isFinite) || principal < 0 || contribution < 0 || annualRate < 0 || years < 1 || years > 100 || !Number.isInteger(years) || ![1, 4, 12, 365].includes(frequency)) return null;
  const monthly = Math.expm1(frequency / 12 * Math.log1p(annualRate / 100 / frequency));
  let balance = principal;
  const rows = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) balance = balance * (1 + monthly) + contribution;
    const deposits = principal + contribution * y * 12;
    rows.push({ year: y, deposits, interest: balance - deposits, balance });
  }
  return Number.isFinite(balance) ? { balance, deposits: principal + contribution * years * 12, rows } : null;
}

function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value ? date : null;
}
function monthAnniversary(date, months) {
  const result = new Date(date);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const end = new Date(result);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  result.setUTCDate(Math.min(date.getUTCDate(), end.getUTCDate()));
  return result;
}
export function calendarAge(birth, target) {
  const dob = calendarDate(birth), at = calendarDate(target);
  if (!dob || !at || at < dob) return null;
  let months = (at.getUTCFullYear() - dob.getUTCFullYear()) * 12 + at.getUTCMonth() - dob.getUTCMonth();
  if (monthAnniversary(dob, months) > at) months--;
  const anchor = monthAnniversary(dob, months);
  let birthday = monthAnniversary(dob, (at.getUTCFullYear() - dob.getUTCFullYear()) * 12);
  if (birthday < at) birthday = monthAnniversary(dob, (at.getUTCFullYear() - dob.getUTCFullYear() + 1) * 12);
  return { years: Math.floor(months / 12), months: months % 12, days: (at - anchor) / 86400000, totalMonths: months, totalDays: (at - dob) / 86400000, birthdayDays: (birthday - at) / 86400000 };
}
