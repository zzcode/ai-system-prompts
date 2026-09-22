import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
for(const file of walk('src').filter(p=>p.endsWith('.astro'))){
 const source=fs.readFileSync(file,'utf8');
 const scripts=[...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>m[1].includes('is:inline'));
 for(const [i,match] of scripts.entries())test(`${file} inline script ${i+1} parses`,()=>{new vm.Script(match[2],{filename:file});});
}
