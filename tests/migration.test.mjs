import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
test('the restored Excel tool keeps its canonical route and its HTML alias is permanent', () => {
  assert.deepEqual(config.redirects.find(r=>r.source==='/tools/excel-to-json.html'),{source:'/tools/excel-to-json.html',destination:'/tools/excel-to-json',permanent:true});
  assert.ok(fs.existsSync(new URL('../src/pages/tools/excel-to-json.astro',import.meta.url)));
  assert.ok(!config.redirects.some(r=>r.source==='/tools/:path*'));
});
test('legacy date and terms pages retain matching destinations; removed content is not sent to the homepage', () => {
  for (const suffix of ['', '.html']) {
    assert.equal(config.redirects.find(r=>r.source==='/time-tools-index'+suffix).destination,'/date-time');
    assert.equal(config.redirects.find(r=>r.source==='/terms-of-service'+suffix).destination,'/terms');
  }
  assert.ok(!config.redirects.some(r=>r.destination==='/' && r.source!=='/index.html'));
});
