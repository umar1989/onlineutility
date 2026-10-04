import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const s = await serve(4399);
const b = await chromium.launch(); const p = await b.newPage();
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
const eq = (name, got, want) => console.log(JSON.stringify(got) === JSON.stringify(want) ? 'PASS' : `FAIL (${JSON.stringify(got)} != ${JSON.stringify(want)})`, name);

await p.goto('http://localhost:4399/seating-plan-generator/');
await p.fill('#sp-rows', '2'); await p.fill('#sp-cols', '3');
await p.fill('#sp-names', 'A\nB\nC\nD\nE\nF\nG');
await p.click('#sp-go');
const cells = async () => p.$$eval('#sp-plan tbody tr', (rs) => rs.map((r) => [...r.querySelectorAll('td')].map((t) => t.textContent)));
eq('row order, 7 students 6 seats', await cells(), [['A', 'B', 'C'], ['D', 'E', 'F']]);
eq('overflow warning', (await p.textContent('#sp-plan')).includes('1 student could not be seated: G'), true);
await p.selectOption('#sp-order', 'snake'); await p.fill('#sp-names', 'A\nB\nC\nD\nE\nF'); await p.click('#sp-go');
eq('snake', await cells(), [['A', 'B', 'C'], ['F', 'E', 'D']]);
await p.selectOption('#sp-order', 'row'); await p.selectOption('#sp-gap', 'alt-col'); await p.click('#sp-go');
eq('alt-col', await cells(), [['A', '×', 'B'], ['C', '×', 'D']]);
await p.selectOption('#sp-gap', 'none'); await p.selectOption('#sp-order', 'random'); await p.click('#sp-go');
const flat = (await cells()).flat().sort();
eq('random keeps everyone', flat, ['A', 'B', 'C', 'D', 'E', 'F']);
await p.selectOption('#sp-source', 'range'); await p.fill('#sp-from', '1'); await p.fill('#sp-to', '4'); await p.fill('#sp-prefix', '9B-'); await p.selectOption('#sp-order', 'row'); await p.click('#sp-go');
eq('range', (await cells())[0], ['9B-1', '9B-2', '9B-3']);
await p.fill('#sp-from', '9'); await p.click('#sp-go');
eq('bad range message', (await p.textContent('#sp-status')).includes('Enter a roll number range'), true);

await p.goto('http://localhost:4399/random-student-picker/').catch(() => {});
console.log('errors', errors); await b.close(); s.close();
