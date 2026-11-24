import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#38;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<[^>]+>/g,'');
const rows=[]; const titles=new Set(),descriptions=new Set();
for(const file of walk('dist').filter(p=>p.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');const route='/'+path.relative('dist',file).replace(/(?:^|\/)index.html$/,'').replace(/\.html$/,'');
 const title=decode(html.match(/<title>(.*?)<\/title>/s)?.[1]||'');
 const description=decode(html.match(/name="description" content="([^"]*)"/)?.[1]||'');
 const h1s=[...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)].map(m=>decode(m[1]));
 const canonical=html.match(/rel="canonical" href="([^"]*)"/)?.[1];
 const schema=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
 assert.ok(title&&description,`Missing metadata: ${route}`);assert.equal(h1s.length,1,`H1 count: ${route}`);
 assert.equal(canonical,'https://www.kodatools.com'+(route==='/404'?'/404.html':route),`Canonical: ${route}`);
 assert.ok(!titles.has(title),`Duplicate title: ${route}`);titles.add(title);
 assert.ok(!descriptions.has(description),`Duplicate description: ${route}`);descriptions.add(description);
 if(route!=='/404')assert.ok(!html.includes('noindex, follow'),`Unexpected noindex: ${route}`);
 rows.push({route,primaryTopic:h1s[0],title,description,structuredData:schema.map(s=>s['@type']),technicalSEO:'pass'});
}
const tools=JSON.parse(fs.readFileSync('src/data/tools.json','utf8'));
const home=fs.readFileSync('dist/index.html','utf8');
const newTools=['/finance/escrow-analysis-checker','/finance/unemployment-benefits-by-state'];
const promoted=new Set(newTools);
for(const href of ['/finance','/health','/math','/date-time','/converters','/everyday','/construction','/tools/excel-to-json','/construction/material-planner']) {
 assert.ok(!home.includes(`href="${href}"`),`Legacy link shown on homepage: ${href}`);
}
const hasLink=(html,href)=>html.includes(`href="${href}"`);
for(const t of tools){
 const category=t.categoryHref || '/'+t.href.split('/')[1];const html=fs.readFileSync(`dist${category}/index.html`,'utf8');
 assert.ok(hasLink(html,t.href),`Missing category entry: ${t.href}`);
 assert.equal(hasLink(home,t.href),promoted.has(t.href),`Incorrect home exposure: ${t.href}`);
}
for(const route of promoted) assert.ok(hasLink(home,route),`Missing homepage link: ${route}`);
for(const name of ['sitemap.xml','sitemap-core.xml']) {
 const xml=fs.readFileSync(`dist/${name}`,'utf8');
 for(const route of newTools) assert.ok(xml.includes(`<loc>https://www.kodatools.com${route}</loc>`),`Missing URL in ${name}: ${route}`);
}
for(const route of newTools) {
 const html=fs.readFileSync(`dist${route}/index.html`,'utf8');
 assert.ok(html.includes('<html lang="en-US"'),`Missing U.S. locale: ${route}`);
}
if(!process.argv.includes('--check-only')) {
 fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/seo-pages.json',JSON.stringify(rows,null,2)+'\n');
 fs.writeFileSync('reports/seo-keywords.md','# 页面关键词与搜索意图清单\n\n以页面实际功能和 H1 为主主题；这是内容映射，不是搜索量、排名或竞争度研究。未添加 meta keywords 或堆砌关键词。\n\n| URL | 主主题 | 页面标题 |\n|---|---|---|\n'+rows.filter(r=>r.route!=='/404').map(r=>`| ${r.route} | ${r.primaryTopic} | ${r.title.replaceAll('|','—')} |`).join('\n')+'\n');
}
console.log(`SEO checks passed for ${rows.length} pages; ${tools.length} tool links retained in categories; focused homepage and both sitemaps verified.`);
