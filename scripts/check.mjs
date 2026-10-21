import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {content,languages} from '../src/content.mjs';
const root=process.argv.includes('--preview')?'preview_html':'public_html';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(p,x.name)):[path.join(p,x.name)]);
const keys=o=>Object.keys(o).sort().join('|');for(const l of languages){assert.equal(keys(content[l]),keys(content.ro),`Translation keys: ${l}`);assert.equal(content[l].services.length,4);assert.equal(content[l].steps.length,4);for(const s of content[l].services)assert.equal(s.items.length,3);}
let html=0,links=0;for(const file of walk(root)){
 if(!file.endsWith('.html'))continue;html++;const text=fs.readFileSync(file,'utf8');
 assert(!/clarified|formsubmit\.co|G-KZYPDK2SWB|yxk3rvlwak/i.test(text),`Foreign branding/tracking: ${file}`);
 assert.equal((text.match(/<h1[ >]/g)||[]).length,1,`H1: ${file}`);
 if(!file.endsWith('/404.html')){assert.equal((text.match(/hreflang=/g)||[]).length,11);assert.match(text,/<meta name="description" content="[^"\n]+">/);assert.match(text,/<html lang="(ro|en|fr|de|es)">/);}
 for(const match of text.matchAll(/(?:href|src)="([^"]+)"/g)){const url=match[1].replaceAll('&amp;','&');if(/^(?:https?:|tel:|mailto:|data:|#)/.test(url))continue;const target=path.resolve(path.dirname(file),url.split(/[?#]/)[0]);assert(fs.existsSync(target),`Broken reference ${file}: ${url}`);links++;}
}
assert.equal(html,51);for(const name of ['hero.mp4','hero-mobile.mp4','hero.webm','hero-poster.webp','logo.webp'])assert(fs.statSync(`${root}/assets/${name}`).size>1000,`Empty asset: ${name}`);
const app=fs.readFileSync(`${root}/assets/app.js`,'utf8');assert(!/formsubmit|clarity|googletagmanager|smtp-password/i.test(app));
console.log(JSON.stringify({result:'PASS',pages:html,localReferences:links,languages,root}));
