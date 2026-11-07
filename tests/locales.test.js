import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const locales=['en','zh-Hant','zh-Hans','es','pt-BR','fr','ru','ja','ar'];
const en=read('public/locales/en.json');
for(const locale of locales) test(`${locale} has complete nonempty translations and distinct research statuses`,()=>{
  const d=read(`public/locales/${locale}.json`);
  assert.deepEqual(Object.keys(d).sort(),Object.keys(en).sort());
  for(const [key,value] of Object.entries(d)) assert.ok(typeof value==='string'&&value.trim(),`${locale}:${key}`);
  const labels=['published','accepted','in_review','awaiting_review'].map(s=>d['status.'+s]);
  assert.equal(new Set(labels).size,4);
  for(const p of read('public/data/publications.json').publications) assert.ok(d[`publication.${p.id}.title`]);
});
test('all static translation hooks reference real dictionary keys',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  for(const match of html.matchAll(/data-(?:i18n(?:-aria-label|-placeholder)?|prompt-key)="([^"]+)"/g)) assert.ok(en[match[1]],match[1]);
  for(const locale of locales) assert.ok(html.includes(`value="${locale}"`));
});
test('bundled English fallback stays synchronized with dictionary',()=>{
  const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  const fallback=JSON.parse(app.match(/const EN_FALLBACK = (\{[\s\S]*?\n  \});/)[1]);
  assert.deepEqual(fallback,en);
});
