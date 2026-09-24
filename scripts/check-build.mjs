import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { allConversionPages } from '../src/data/conversions.js';
import { displayAdSlot } from '../src/config/advertising.js';
const root = path.resolve('dist');
const directory=fs.readFileSync(path.join(root,'converters/index.html'),'utf8');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for (const page of allConversionPages()) {
  const url=`/convert/${page.slug}`;
  assert.ok(directory.includes(`href="${url}"`), `Missing category link: ${url}`);
  assert.ok(sitemap.includes(`https://www.kodatools.com${url}</loc>`),`Missing sitemap URL: ${url}`);
  const html=fs.readFileSync(path.join(root,url,'index.html'),'utf8');
  assert.ok(html.includes('href="/converters/unit-converter"'), `Missing general converter: ${url}`);
}
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
const files=walk(root).filter(f=>f.endsWith('.html'));
for(const file of files) {
  const html=fs.readFileSync(file,'utf8');
  const adSlots = [...html.matchAll(/data-ad-slot="([^"]+)"/g)];
  for (const [, slot] of adSlots) assert.equal(slot, displayAdSlot, `Unverified ad slot in ${file}`);
  if (adSlots.length) {
    assert.equal((html.match(/pagead\/js\/adsbygoogle\.js/g) || []).length, 1, `Ad loader missing or duplicated in ${file}`);
  }
  for(const [,href] of html.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    if(href.startsWith('//'))continue;
    const target=path.join(root,decodeURIComponent(href));
    assert.ok([target,path.join(target,'index.html'),target+'.html'].some(p=>fs.existsSync(p)),`Broken internal link in ${file}: ${href}`);
  }
}
const error=fs.readFileSync(path.join(root,'404.html'),'utf8');
assert.ok(error.includes('noindex, follow'));
assert.ok(!error.includes('pagead2.googlesyndication.com'));
console.log(`Validated ${files.length} HTML pages, all internal link targets, sitemap and ${allConversionPages().length} directory entries.`);
