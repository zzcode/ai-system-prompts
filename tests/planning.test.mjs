import test from 'node:test';
import { tileEstimate, concreteEstimate, paintEstimate } from '../src/lib/materials.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loanPayment, compoundBalance, calendarAge } from '../src/lib/planning.js';

function near(actual, expected, tolerance = 0.005) { assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`); }
test('loan zero rate, standard payment and tiny rate remain finite', () => {
  assert.deepEqual(loanPayment(12000, 0, 24), {payment:500,total:12000,interest:0});
  near(loanPayment(25000, 8, 60).payment, 506.9099);
  near(loanPayment(12000, 1e-12, 24).payment, 500);
  for (const values of [[0,8,12],[100,-1,12],[100,8,0],[NaN,8,12],[100,8,1.5]]) assert.equal(loanPayment(...values), null);
});
test('compound balance separates deposits, zero interest and compounding frequencies', () => {
  near(compoundBalance(10000, 0, 7, 20, 1).balance, 38696.8446);
  const zero = compoundBalance(10000, 200, 0, 20, 12);
  assert.equal(zero.balance, 58000);
  assert.equal(zero.rows.at(-1).interest, 0);
  const r = .07 / 12, m = 240;
  near(compoundBalance(10000,200,7,20,12).balance, 10000*(1+r)**m+200*((1+r)**m-1)/r);
  for (const values of [[-1,0,7,20,12],[0,-1,7,20,12],[0,0,7,101,12],[0,0,7,1.5,12],[0,0,7,20,0]]) assert.equal(compoundBalance(...values), null);
});
test('age handles month ends, leap days, birthday today and invalid input', () => {
  const jan = calendarAge('2025-01-31','2025-03-01');
  assert.deepEqual([jan.years,jan.months,jan.days,jan.totalDays],[0,1,1,29]);
  const leap = calendarAge('2000-02-29','2025-02-28');
  assert.deepEqual([leap.years,leap.months,leap.days,leap.birthdayDays],[25,0,0,0]);
  const example=calendarAge('1995-03-15','2026-08-05');
  assert.deepEqual([example.years,example.months,example.days],[31,4,21]);
  assert.equal(calendarAge('2024-03-09','2024-03-11').totalDays,2);
  assert.equal(calendarAge('1900-02-29','2025-01-01'),null);
  assert.equal(calendarAge('2025-02-01','2025-01-01'),null);
});

function mount(file, values) {
  const source=fs.readFileSync(new URL('../src/pages/'+file,import.meta.url),'utf8');
  let script=source.match(/<script(?: is:inline)?>([\s\S]*?)<\/script>/)[1];
  script=script.replace(/import .*? from [^;]+;/g,'');
  const elements={};
  for(const [,id] of source.matchAll(/id="([^"]+)"/g)) elements[id]={value:String(values[id]??''),textContent:'',innerHTML:'',style:{},handlers:{},addEventListener(e,fn){this.handlers[e]=fn;}};
  vm.runInNewContext(script,{tileEstimate,concreteEstimate,paintEstimate,loanPayment,compoundBalance,calendarAge,document:{getElementById:id=>elements[id]}});
  return elements;
}
test('loan UI clears stale results and accepts zero interest',()=>{
  const e=mount('finance/loan-calculator.astro',{'ln-amount':12000,'ln-rate':0,'ln-term':2});
  assert.equal(e['ln-payment'].textContent,'$500.00');
  e['ln-rate'].value='';e['ln-rate'].handlers.input();assert.equal(e['ln-payment'].textContent,'—');
});
test('compound UI clears chart and table after invalid input',()=>{
  const e=mount('finance/compound-interest-calculator.astro',{'ci-principal':10000,'ci-contrib':200,'ci-rate':7,'ci-years':20,'ci-freq':12});
  assert.ok(e['ci-tbody'].innerHTML.includes('<td>20</td>'));
  e['ci-years'].value='1000000';e['ci-years'].handlers.input();
  assert.equal(e['ci-tbody'].innerHTML,'');assert.equal(e['ci-bar-p'].style.width,'0%');
});
test('concrete UI includes allowance and clears invalid dimensions',()=>{
  const e=mount('construction/concrete-calculator.astro',{'cc-length':10,'cc-width':10,'cc-depth':4,'cc-waste':10,'cc-price':''});
  assert.equal(e['cc-yards'].textContent,'1.36 yd³');assert.ok(e['cc-sub'].textContent.startsWith('62 bags'));
  e['cc-waste'].value='0';e['cc-waste'].handlers.input();assert.equal(e['cc-yards'].textContent,'1.23 yd³');
  e['cc-length'].value='';e['cc-length'].handlers.input();assert.equal(e['cc-yards'].textContent,'—');assert.equal(e['cc-rows'].innerHTML,'');
});
test('paint UI respects product coverage and rejects impossible openings',()=>{
  const e=mount('construction/paint-calculator.astro',{'pc-length':12,'pc-width':12,'pc-height':8,'pc-coats':2,'pc-doors':1,'pc-windows':2,'pc-coverage':350,'pc-door-area':20,'pc-window-area':15,'pc-ceiling':0});
  assert.equal(e['pc-gallons'].textContent,'2 gallons');
  e['pc-coverage'].value='250';e['pc-coverage'].handlers.input();assert.equal(e['pc-gallons'].textContent,'3 gallons');
  e['pc-doors'].value='100';e['pc-doors'].handlers.input();assert.equal(e['pc-gallons'].textContent,'—');assert.equal(e['pc-rows'].innerHTML,'');
});

test('tile UI shows actual pack count and clears stale costs',()=>{
  const e=mount('construction/tile-calculator.astro',{'tc-area-len':10,'tc-area-wid':10,'tc-tile-len':12,'tc-tile-wid':24,'tc-waste':10,'tc-per-box':8,'tc-price':30});
  assert.equal(e['tc-tiles'].textContent,'55 tiles');
  assert.ok(e['tc-sub'].textContent.startsWith('7 whole boxes'));
  assert.ok(e['tc-rows'].innerHTML.includes('$210.00'));
  e['tc-per-box'].value='0';e['tc-per-box'].handlers.input();
  assert.equal(e['tc-tiles'].textContent,'—');assert.equal(e['tc-rows'].innerHTML,'');
});
