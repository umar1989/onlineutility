import { $, fmtNum } from './common.js';

const el = { mode: $('#pct-mode'), a: $('#pct-a'), b: $('#pct-b'), la: $('#pct-la'), lb: $('#pct-lb'), out: $('#pct-out'), work: $('#pct-work') };
const n = fmtNum;

const MODES = {
  of: { a: 'Percentage (%)', b: 'Number', run: (a, b) => { const v = (a / 100) * b; return [`${n(v)}`, `${n(a)}% of ${n(b)} = ${n(a)} ÷ 100 × ${n(b)} = ${n(v)}`]; } },
  what: { a: 'Part (for example marks obtained)', b: 'Whole (for example total marks)', run: (a, b) => {
    if (b === 0) return null; const v = (a / b) * 100; return [`${n(v, 2)}%`, `${n(a)} ÷ ${n(b)} × 100 = ${n(v, 4)}%`]; } },
  change: { a: 'Old value', b: 'New value', run: (a, b) => {
    if (a === 0) return null; const v = ((b - a) / Math.abs(a)) * 100;
    return [`${n(Math.abs(v), 2)}% ${v > 0 ? 'increase' : v < 0 ? 'decrease' : 'change'}`, `(${n(b)} − ${n(a)}) ÷ ${n(Math.abs(a))} × 100 = ${n(v, 4)}%`]; } },
  inc: { a: 'Number', b: 'Increase by (%)', run: (a, b) => { const v = a * (1 + b / 100); return [n(v), `${n(a)} + ${n(b)}% of ${n(a)} = ${n(a)} + ${n((a * b) / 100)} = ${n(v)}`]; } },
  dec: { a: 'Number', b: 'Decrease by (%)', run: (a, b) => { const v = a * (1 - b / 100); return [n(v), `${n(a)} − ${n(b)}% of ${n(a)} = ${n(a)} − ${n((a * b) / 100)} = ${n(v)}`]; } },
};

function update() {
  const m = MODES[el.mode.value];
  el.la.textContent = m.a; el.lb.textContent = m.b;
  if (el.a.value === '' || el.b.value === '') { el.out.textContent = '–'; el.work.textContent = 'Enter both numbers to see the answer and the working.'; return; }
  const r = m.run(+el.a.value, +el.b.value);
  if (!r) { el.out.textContent = '–'; el.work.textContent = 'This cannot be worked out because it would divide by zero.'; return; }
  el.out.textContent = r[0]; el.work.textContent = r[1];
}
[el.mode, el.a, el.b].forEach((x) => x.addEventListener('input', update));
update();
