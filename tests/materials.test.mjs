import test from 'node:test';
import assert from 'node:assert/strict';
import { tileEstimate, concreteEstimate, paintEstimate } from '../src/lib/materials.js';
test('tile allowance is applied before rounding, pack size and zero price respected',()=>{
  const r=tileEstimate(10,10,12,24,10,8,30);
  assert.deepEqual([r.tiles,r.boxes,r.purchased,r.cost],[55,7,56,210]);
  assert.equal(tileEstimate(10,10,12,12,10,10,null).tiles,110);
  assert.equal(tileEstimate(1,1,18,18,10,5,0).tiles,1);
  assert.equal(tileEstimate(1,1,18,18,10,5,0).cost,0);
  const splash=tileEstimate(8,2,3,6,15,40,null);
  assert.deepEqual([splash.tiles,splash.boxes,splash.purchased],[148,4,160]);
  for(const pack of [0,-1,1.5,Infinity]) assert.equal(tileEstimate(10,10,12,24,10,pack,null),null);
  assert.equal(tileEstimate(10,10,12,24,101,8,null),null);
  assert.equal(tileEstimate(10,10,12,24,10,8,-1),null);
  assert.equal(tileEstimate(1e308,10,12,24,10,8,null),null);
});
test('concrete bag yields and exact counts do not add phantom bags',()=>{
  const r=concreteEstimate(10,10,4,10);
  assert.deepEqual(r.bags,{40:123,50:98,60:82,80:62});
  assert.equal(concreteEstimate(10,10,4,0).bags[80],56);
  assert.equal(concreteEstimate(12,12,4,0).bags[80],80);
  assert.equal(concreteEstimate(12,12,4,10).bags[80],88);
  assert.equal(concreteEstimate(10,10,4,10,0).cost,0);
  assert.equal(concreteEstimate(10,10,4,10).cost,null);
  for(const depth of [0,-1,NaN,Infinity]) assert.equal(concreteEstimate(10,10,depth,10),null);
});
test('paint ceiling, custom openings and coverage change purchase quantity',()=>{
  const walls=paintEstimate(12,12,8,2,1,2,20,15,350,0);
  const ceiling=paintEstimate(12,12,8,2,1,2,20,15,350,1);
  assert.equal(walls.purchase,2);assert.equal(ceiling.purchase,3);assert.equal(ceiling.ceilingArea,144);
  assert.equal(paintEstimate(12,12,8,2,1,2,30,20,350,0).openings,70);
  assert.equal(paintEstimate(12,12,8,2,100,2,20,15,350,0),null);
  assert.equal(paintEstimate(12,12,8,2,1.5,2,20,15,350,0),null);
  assert.equal(paintEstimate(12,12,8,2,1,2,20,15,0,0),null);
  assert.equal(paintEstimate(1e308,12,8,2,1,2,20,15,350,0),null);
});
