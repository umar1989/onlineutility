// Audits the built site in dist/: titles, descriptions, headings, canonical, links, images, word counts, sitemap.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html') && !/(^|[\\/])google[0-9a-f]+\.html$/.test(f)); // skip Search Console verification file
const urlOf = (f) => '/' + relative(DIST, f).replace(/index\.html$/, '').replace(/^404\.html$/, '404.html');
const known = new Set(files.map((f) => '/' + relative(DIST, f)));
const pageUrls = new Set(pages.map(urlOf));
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const words = (h) => strip(h).split(/\s+/).filter(Boolean).length;

const problems = [];
const info = [];
const titles = new Map(), descs = new Map();
const inbound = new Map([...pageUrls].map((u) => [u, new Set()]));
let internalLinks = 0;

for (const f of pages) {
  const u = urlOf(f);
  const html = readFileSync(f, 'utf8');
  const bad = (m) => problems.push(`${u}: ${m}`);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) bad('missing <title>'); else {
    if (title.length >= 60 && !/\/$/.test('') && u !== '/') bad(`title is ${title.length} chars (limit < 60): ${title}`);
    if (titles.has(title)) bad(`duplicate title with ${titles.get(title)}`); titles.set(title, u);
  }
  if (!desc) bad('missing meta description'); else {
    if (desc.length < 70 || desc.length > 165) bad(`description is ${desc.length} chars`);
    if (descs.has(desc)) bad(`duplicate description with ${descs.get(desc)}`); descs.set(desc, u);
  }
  if (u !== '/404.html') {
    if (!/<link rel="canonical" href="https?:\/\/[^"]+\/"/.test(html) && !/<link rel="canonical"/.test(html)) bad('missing canonical');
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image']) if (!html.includes(`property="${p}"`)) bad(`missing ${p}`);
  }
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) bad(`${h1s} h1 elements`);
  // heading order
  let prev = 0;
  for (const m of html.matchAll(/<h([1-6])[\s>]/g)) { const l = +m[1]; if (l > prev + 1) bad(`heading jump h${prev} -> h${l}`); prev = l; }
  if (!/<html lang="en-IN"/.test(html)) bad('html lang is not en-IN');
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="/.test(m[0])) bad('img without alt');
    if (!/\bwidth="/.test(m[0]) || !/\bheight="/.test(m[0])) bad('img without width/height');
  }
  const ads = (html.match(/class="ad-slot"/g) || []).length;
  if (u !== '/404.html' && ads !== 2) bad(`${ads} ad slots (expected 2)`);
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    let h = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(h)) continue;
    internalLinks++;
    h = h.split('#')[0].split('?')[0];
    if (!h) continue;
    if (!h.startsWith('/')) { bad(`relative link ${h}`); continue; }
    if (!(known.has(h) || known.has(h + 'index.html'))) bad(`broken link ${h}`);
    else if (!h.endsWith('/') && !/\.[a-z]+$/.test(h)) bad(`link without trailing slash ${h}`);
    if (inbound.has(h)) inbound.get(h).add(u);
  }
  // word counts
  const lead = (html.match(/<div class="lead">([\s\S]*?)<\/div>/) || [])[1];
  const prose = (html.match(/<div class="prose">([\s\S]*?)<\/div>\s*<section class="faq"/) || [])[1];
  const faq = (html.match(/<section class="faq"[\s\S]*?<\/section>/) || [])[0];
  if (lead && prose !== undefined) {
    const n = words(lead) + words(prose) + (faq ? words(faq) : 0);
    info.push(`${u}: tool text ${n} words`);
    if (n < 300 || n > 500) bad(`tool text is ${n} words (target 300-500)`);
    const fq = (faq?.match(/<h3/g) || []).length;
    if (fq < 4 || fq > 5) bad(`${fq} FAQs (target 4-5)`);
  }
  if (u.startsWith('/guides/') && u !== '/guides/') {
    const body = (html.match(/<div class="prose">([\s\S]*?)<\/div>\s*<aside/) || [])[1] || '';
    const n = words(body);
    info.push(`${u}: guide ${n} words`);
    if (n < 600 || n > 900) bad(`guide is ${n} words (target 600-900)`);
    if (!/class="byline"/.test(html) || !/<time datetime=/.test(html)) bad('guide missing byline/date');
  }
}
for (const [u, from] of inbound) if (u !== '/' && u !== '/404.html' && from.size === 0) problems.push(`${u}: orphan page (no inbound links)`);
// home must reach everything in <= 2 clicks
const home = new Set(); for (const [u, from] of inbound) if (from.has('/')) home.add(u);
const two = new Set(home); for (const [u, from] of inbound) for (const h of home) if (from.has(h)) two.add(u);
for (const u of pageUrls) if (u !== '/' && u !== '/404.html' && !two.has(u)) problems.push(`${u}: not reachable within 2 clicks of home`);
// sitemap + robots
const sm = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
for (const u of pageUrls) if (u !== '/404.html' && !locs.includes(u)) problems.push(`${u}: missing from sitemap`);
for (const l of locs) if (!pageUrls.has(l)) problems.push(`sitemap lists ${l} which does not exist`);
if (!/<lastmod>/.test(sm)) problems.push('sitemap has no lastmod');
if (!/Sitemap:/.test(readFileSync(join(DIST, 'robots.txt'), 'utf8'))) problems.push('robots.txt has no Sitemap line');

console.log(info.join('\n'));
console.log(`\n${pages.length} pages, ${internalLinks} internal links checked`);
const uniq = [...new Set(problems)];
if (uniq.length) { console.log(`\n${uniq.length} PROBLEMS:`); uniq.forEach((p) => console.log(' - ' + p)); process.exitCode = 1; } else console.log('No problems found.');
