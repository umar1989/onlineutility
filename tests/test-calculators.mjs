// Quick browser checks for the calculators. Usage: node tests/test-calculators.mjs
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const s = await serve(4399);
const b = await chromium.launch(); const p = await b.newPage();
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
const eq = (name, got, want) => console.log(got === want ? 'PASS' : `FAIL (${got} != ${want})`, name);

await p.goto('http://localhost:4399/percentage-calculator/');
await p.selectOption('#pct-mode', 'what'); await p.fill('#pct-a', '432'); await p.fill('#pct-b', '600');
eq('marks 432/600', await p.textContent('#pct-out'), '72%');
await p.selectOption('#pct-mode', 'change'); await p.fill('#pct-a', '60'); await p.fill('#pct-b', '72');
eq('change 60->72', await p.textContent('#pct-out'), '20% increase');
await p.selectOption('#pct-mode', 'of'); await p.fill('#pct-a', '45'); await p.fill('#pct-b', '80');
eq('45% of 80', await p.textContent('#pct-out'), '36');
await p.selectOption('#pct-mode', 'dec'); await p.fill('#pct-a', '200'); await p.fill('#pct-b', '15');
eq('200 -15%', await p.textContent('#pct-out'), '170');
await p.selectOption('#pct-mode', 'what'); await p.fill('#pct-a', '5'); await p.fill('#pct-b', '0');
eq('div by zero', (await p.textContent('#pct-work')).includes('zero'), true);

console.log('errors', errors); await b.close(); s.close();
