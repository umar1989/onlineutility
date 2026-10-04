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

await p.goto('http://localhost:4399/cgpa-to-percentage-calculator/');
await p.fill('#cg-val', '8.2');
eq('cgpa 8.2 x 9.5', await p.textContent('#cg-out'), '77.9%');
await p.selectOption('#cg-method', 'prop');
eq('prop 8.2/10', await p.textContent('#cg-out'), '82%');
await p.selectOption('#cg-dir', 'toCgpa'); await p.selectOption('#cg-method', 'mult'); await p.fill('#cg-val', '77.9');
eq('77.9 -> cgpa', await p.textContent('#cg-out'), '8.2 CGPA');

await p.goto('http://localhost:4399/age-calculator-for-cut-off-date/');
await p.fill('#ag-dob', '2000-05-15'); await p.fill('#ag-cut', '2026-01-01');
eq('age 2000-05-15 -> 2026-01-01', await p.textContent('#ag-out'), '25 years, 7 months, 17 days');
await p.fill('#ag-dob', '1999-12-31'); await p.fill('#ag-cut', '2026-01-01');
eq('age NYE', await p.textContent('#ag-out'), '26 years, 0 months, 1 day');
await p.fill('#ag-dob', '2000-02-29'); await p.fill('#ag-cut', '2001-03-01');
eq('leap dob', await p.textContent('#ag-out'), '1 year, 0 months, 0 days');
await p.locator('summary').click();
await p.fill('#ag-dob', '1999-01-01'); await p.fill('#ag-cut', '2026-01-01'); await p.fill('#ag-max', '27'); await p.fill('#ag-min', '18');
eq('exact limit ok', (await p.textContent('#ag-elig')).includes('Within the maximum age'), true);
await p.fill('#ag-dob', '1998-12-31');
eq('exact limit over', (await p.textContent('#ag-elig')).includes('Over the maximum'), true);
await p.selectOption('#ag-rule', 'completed');
eq('completed limit ok', (await p.textContent('#ag-elig')).includes('Within the maximum'), true);
console.log((await p.textContent('#ag-elig')));
await p.fill('#ag-cut', '1990-01-01');
eq('cut before dob', (await p.textContent('#ag-detail')).includes('before'), true);

console.log('errors', errors); await b.close(); s.close();
