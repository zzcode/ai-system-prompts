export const MAX_ESCROW_DOLLARS = 100_000_000;

function toCents(value, label, { signed = false } = {}) {
  if (value === undefined || value === null) return 0;
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > MAX_ESCROW_DOLLARS || (!signed && value < 0)) {
    throw new RangeError(`Enter a valid amount for ${label}.`);
  }
  return Math.round(value * 100) || 0;
}

function annualEscrow({ tax, insurance, other }) {
  return {
    tax: toCents(tax, 'property taxes'),
    insurance: toCents(insurance, 'insurance'),
    other: toCents(other, 'other escrowed bills'),
  };
}

function monthlyEscrow(annual, shortage) {
  const tax = Math.round(annual.tax / 12);
  const insurance = Math.round(annual.insurance / 12);
  const other = Math.round(annual.other / 12);
  const base = Math.round((annual.tax + annual.insurance + annual.other) / 12);
  return { tax, insurance, other, base, shortage, total: base + shortage, rounding: base - tax - insurance - other };
}

export function checkEscrowAnalysis({ previous, updated, shortagePlan, reportedChange, cushion }) {
  const previousAnnual = annualEscrow(previous);
  const updatedAnnual = annualEscrow(updated);
  let updatedShortage;
  if (shortagePlan) {
    const shortage = toCents(shortagePlan.amount, 'total shortage');
    const { months } = shortagePlan;
    if (!Number.isSafeInteger(months) || months < 1 || (shortage > 0 && months > shortage)) {
      throw new RangeError('Enter a whole number of months that gives a payment of at least one cent.');
    }
    updatedShortage = Math.round(shortage / months);
  } else {
    updatedShortage = toCents(updated.shortage, 'new shortage installment');
  }
  const oldMonthly = monthlyEscrow(previousAnnual, toCents(previous.shortage, 'previous shortage installment'));
  const newMonthly = monthlyEscrow(updatedAnnual, updatedShortage);
  const change = Object.fromEntries(Object.keys(oldMonthly).map(key => [key, newMonthly[key] - oldMonthly[key]]));
  const reported = reportedChange == null ? null : toCents(reportedChange, 'reported change', { signed: true });
  const reserve = cushion == null ? null : toCents(cushion, 'reported cushion');
  const cushionReference = Math.round((updatedAnnual.tax + updatedAnnual.insurance + updatedAnnual.other) / 6);

  return {
    oldMonthly,
    newMonthly,
    change,
    discrepancy: reported === null ? null : reported - change.total,
    cushion: reserve === null ? null : { entered: reserve, reference: cushionReference, difference: reserve - cushionReference },
  };
}
