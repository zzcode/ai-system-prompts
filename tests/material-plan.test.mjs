import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatePlan, validateItem, parseSavedPlan, planCSV } from '../src/lib/material-plan.js';

const tile = (overrides = {}) => ({kind:'tile',label:'Kitchen',product:'Floor tile',values:[10,5,12,24,10,8,30],...overrides});
const concrete = (overrides = {}) => ({kind:'concrete',label:'Slab',product:'Concrete mix',values:[1,1,4,0],bagSize:80,yield:0.6,unitPrice:7,...overrides});
const paint = (overrides = {}) => ({kind:'paint',label:'Room',product:'Wall paint',values:[12,12,8,2,1,2,20,15,350,0],unitPrice:null,...overrides});

test('two 50 sq ft floors buy seven shared boxes instead of eight separately', () => {
  assert.equal(estimatePlan([tile()]).groups[0].quantity,4);
  const plan = estimatePlan([tile(),tile({label:'Hall'})]);
  assert.equal(plan.groups.length,1);
  assert.equal(plan.groups[0].quantity,7);
  assert.equal(plan.groups[0].spare,1);
  assert.equal(plan.quotedTotal,210);
  assert.equal(plan.missingPrices,0);
});
test('products, pack sizes and prices are separated and zero price is not missing', () => {
  const plan = estimatePlan([tile(),tile({product:'Other finish'}),tile({values:[10,5,12,24,10,6,30]}),tile({values:[10,5,12,24,10,8,0]})]);
  assert.equal(plan.groups.length,4);
  assert.equal(plan.groups[3].cost,0);
  assert.equal(plan.missingPrices,0);
});
test('concrete combines cubic volume before rounding and respects product yield', () => {
  assert.equal(estimatePlan([concrete()]).groups[0].quantity,1);
  const shared = estimatePlan([concrete(),concrete({label:'Second slab'})]);
  assert.equal(shared.groups[0].quantity,2);
  const small = concrete({values:[0.5,1,4,0]});
  assert.equal(estimatePlan([small,small]).groups[0].quantity,1);
  assert.equal(estimatePlan([concrete({yield:0.3})]).groups[0].quantity,2);
  assert.equal(estimatePlan([concrete(),concrete({bagSize:60,yield:0.45})]).groups.length,2);
});
test('paint combines before gallon rounding but separates finish and coverage', () => {
  const small = paint({values:[5,5,8,1,0,0,20,15,350,0],unitPrice:20});
  assert.equal(estimatePlan([small,small]).groups[0].quantity,1);
  const mixed = estimatePlan([small,paint(),paint({product:'Ceiling white'}),paint({values:[12,12,8,2,1,2,20,15,300,0]})]);
  assert.equal(mixed.groups.length,4);
  assert.equal(mixed.missingPrices,3);
  assert.equal(mixed.quotedTotal,20);
});
test('invalid and overflow input cannot partly replace a valid plan', () => {
  for (const item of [tile({kind:'__proto__'}),tile({label:''}),tile({values:[null,5,12,24,10,8,30]}),tile({values:[10,5,12,24,10,1.5,30]}),concrete({yield:0}),concrete({bagSize:25}),paint({values:[12,12,8,2,100,2,20,15,350,0]}),paint({unitPrice:-1})]) {
    assert.throws(() => validateItem(item));
  }
  assert.throws(() => estimatePlan(Array.from({length:101},()=>tile())));
  assert.throws(() => estimatePlan([tile({values:[10,5,12,24,10,8,1e308]})]));
});
test('stored plans are versioned, validated and stripped of unrecognized properties', () => {
  const plan = parseSavedPlan(JSON.stringify({version:1,title:' Remodel ',items:[tile({unexpected:'ignore'})],extra:'ignore'}));
  assert.equal(plan.title,'Remodel');
  assert.equal(plan.items[0].unexpected,undefined);
  assert.throws(() => parseSavedPlan('{broken'));
  assert.throws(() => parseSavedPlan(JSON.stringify({version:2,title:'Project',items:[]})));
  assert.throws(() => parseSavedPlan(JSON.stringify({version:1,title:'Project',items:[tile({values:[]})]})));
});
test('CSV preserves quotes and Unicode, marks missing prices and escapes formulas', () => {
  const csv = planCSV('=SUM(1,1)',estimatePlan([tile({product:'瓷砖 "A"',label:'@formula',values:[10,5,12,24,10,8,null]})]));
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"\'=SUM(1,1)"'));
  assert.ok(csv.includes('瓷砖 ""A""'));
  assert.ok(csv.includes('"\'@formula"'));
  assert.ok(csv.includes('Not quoted'));
  assert.ok(csv.includes('1 products without prices'));
});
