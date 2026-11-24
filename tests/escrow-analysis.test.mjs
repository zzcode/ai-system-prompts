import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEscrowAnalysis, MAX_ESCROW_DOLLARS } from '../src/lib/escrow-analysis.js';

const example = {
  previous: { tax: 3600, insurance: 1200, shortage: 15 },
  updated: { tax: 4080, insurance: 1440 },
  shortagePlan: { amount: 600, months: 12 },
  reportedChange: 95,
  cushion: 850,
};

test('separates new annual costs and the change in temporary installments', () => {
  const result = checkEscrowAnalysis(example);
  assert.equal(result.oldMonthly.total, 41500);
  assert.equal(result.newMonthly.total, 51000);
  assert.equal(result.newMonthly.base, 46000);
  assert.equal(result.change.tax, 4000);
  assert.equal(result.change.insurance, 2000);
  assert.equal(result.change.shortage, 3500);
  assert.equal(result.change.total, 9500);
  assert.equal(result.discrepancy, 0);
  assert.deepEqual(result.cushion, { entered: 85000, reference: 92000, difference: -7000 });
});

test('includes other annual bills, allows direct installments and finds a bill discrepancy', () => {
  const result = checkEscrowAnalysis({
    previous: { tax: 2400, other: 120, shortage: 50 },
    updated: { tax: 2400, shortage: 12.34 },
    reportedChange: -50,
  });
  assert.equal(result.change.other, -1000);
  assert.equal(result.change.shortage, -3766);
  assert.equal(result.change.total, -4766);
  assert.equal(result.discrepancy, -234);
  assert.equal(result.cushion, null);
});

test('rounds the summed annual contribution separately from its component rows', () => {
  const result = checkEscrowAnalysis({ previous: {}, updated: { tax: 0.07, insurance: 0.07, other: 0.07 } });
  assert.equal(result.newMonthly.base, 2);
  assert.equal(result.newMonthly.tax, 1);
  assert.equal(result.newMonthly.rounding, -1);
  assert.equal(result.discrepancy, null);
});

test('treats a zero reported change and cushion as supplied and flags only amounts above the reference', () => {
  const check = cushion => checkEscrowAnalysis({ previous: {}, updated: { tax: 3600 }, reportedChange: 0, cushion });
  assert.equal(check(0).discrepancy, -30000);
  assert.deepEqual(check(0).cushion, { entered: 0, reference: 60000, difference: -60000 });
  assert.equal(check(600).cushion.difference, 0);
  assert.equal(check(600.01).cushion.difference, 1);
  assert.equal(check(650).newMonthly.total, 30000);
});

test('uses the repayment term supplied without assuming all plans have exactly 12 months', () => {
  const result = checkEscrowAnalysis({ previous: {}, updated: {}, shortagePlan: { amount: 100, months: 18 } });
  assert.equal(result.newMonthly.shortage, 556);
  assert.equal(result.newMonthly.base, 0);
});

test('rejects negative unsigned values, non-finite values and invalid installment plans', () => {
  for (const updated of [{ tax: -1 }, { insurance: Infinity }, { other: MAX_ESCROW_DOLLARS + 1 }, { shortage: NaN }]) {
    assert.throws(() => checkEscrowAnalysis({ previous: {}, updated }), RangeError);
  }
  for (const months of [0, 3.5, Infinity, 501]) {
    assert.throws(() => checkEscrowAnalysis({ ...example, shortagePlan: { amount: 5, months } }), RangeError);
  }
});
