import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { conversions, convertValue } from '../src/data/conversions.js';
const source = fs.readFileSync(new URL('../src/pages/convert/[slug].astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline define:vars=[^>]+>([\s\S]*?)<\/script>/)[1];
function mount(def, value) {
  const elements = {};
  for (const id of ['cv-value', 'cv-result', 'cv-rows', 'cv-swap', 'cv-answer', 'cv-answer-label', 'cv-formula']) {
    elements[id] = { value: id === 'cv-value' ? String(value) : '', textContent: '', innerHTML: '', handlers: {}, addEventListener(event, callback) { this.handlers[event] = callback; } };
  }
  const labels = [{textContent:def.fromUnit}, {textContent:def.toUnit}];
  vm.runInNewContext(script, { factor:def.factor ?? null, type:def.type ?? 'linear', from:def.from, to:def.to, fromUnit:def.fromUnit, toUnit:def.toUnit, document:{getElementById:id=>elements[id],querySelector:selector=>labels[selector.includes('cv-value') ? 0 : 1]} });
  return elements;
}
function close(actual, expected) { assert.ok(Math.abs(Number(actual)-expected) < 0.00011, `${actual} should equal ${expected}`); }
for (const def of conversions) {
  test(`${def.baseSlug}: forward, reverse editing, swap and clearing`, () => {
    const el = mount(def, 10);
    close(el['cv-result'].value, convertValue(def,10));
    el['cv-result'].value = String(convertValue(def,25));
    el['cv-result'].handlers.input();
    close(el['cv-value'].value,25);
    assert.ok(el['cv-answer-label'].textContent.startsWith('25 '));
    el['cv-swap'].handlers.click();
    close(el['cv-result'].value,25);
    el['cv-result'].value='12';
    el['cv-result'].handlers.input();
    close(el['cv-value'].value,convertValue(def,12));
    el['cv-value'].value=''; el['cv-value'].handlers.input();
    assert.equal(el['cv-result'].value,'');
    assert.equal(el['cv-answer'].textContent,'—');
    el['cv-value'].value='Infinity'; el['cv-value'].handlers.input();
    assert.equal(el['cv-result'].value,'');
  });
}
test('one inch entered on the right produces 2.54 centimeters',()=>{
  const el=mount(conversions[0],10); el['cv-result'].value='1'; el['cv-result'].handlers.input(); close(el['cv-value'].value,2.54);
});

test('tiny inputs retain a nonzero result and survive swapping',()=>{
  const el=mount(conversions[0],0.00001);
  assert.ok(Number(el['cv-result'].value)>0);
  assert.ok(Math.abs(Number(el['cv-result'].value)-0.00001/2.54)<1e-16);
  el['cv-swap'].handlers.click();
  assert.ok(Math.abs(Number(el['cv-result'].value)-0.00001)<1e-15);
});
test('large finite results do not overflow during display rounding',()=>{
  const el=mount(conversions[0],1e305);
  assert.ok(Number.isFinite(Number(el['cv-result'].value)));
  assert.ok(!el['cv-answer'].textContent.includes('Infinity'));
});
test('temperature fixed points and negative values',()=>{
  const def=conversions.find(d=>d.baseSlug==='fahrenheit-to-celsius');
  close(mount(def,32)['cv-result'].value,0);
  close(mount(def,212)['cv-result'].value,100);
  close(mount(def,-40)['cv-result'].value,-40);
});
