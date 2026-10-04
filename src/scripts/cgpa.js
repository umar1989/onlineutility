import { $, $$, fmtNum } from './common.js';

const el = { dir: $('#cg-dir'), method: $('#cg-method'), val: $('#cg-val'), vlabel: $('#cg-vlabel'), k: $('#cg-k'), klabel: $('#cg-klabel'), out: $('#cg-out'), work: $('#cg-work'), chips: $('#cg-chips') };
const n = fmtNum;

function update() {
  const toPct = el.dir.value === 'toPct';
  const mult = el.method.value === 'mult';
  el.vlabel.textContent = toPct ? 'Your CGPA' : 'Your percentage (%)';
  el.klabel.textContent = mult ? 'Multiplier (factor)' : 'Maximum CGPA on your scale';
  el.chips.hidden = !mult;
  if (el.val.value === '' || el.k.value === '') { el.out.textContent = '–'; el.work.textContent = 'Enter your value to see the answer and the working.'; return; }
  const v = +el.val.value, k = +el.k.value;
  if (!(k > 0) || v < 0) { el.out.textContent = '–'; el.work.textContent = 'Enter positive numbers.'; return; }
  let r, w, warn = '';
  if (toPct) {
    r = mult ? v * k : (v / k) * 100;
    w = mult ? `${n(v)} × ${n(k)} = ${n(r, 4)}` : `${n(v)} ÷ ${n(k)} × 100 = ${n(r, 4)}`;
    if (!mult && v > k) warn = ' Your CGPA is higher than the maximum of the scale, please check it.';
    if (mult && r > 100) warn = ' This is above 100%, so please check the CGPA and multiplier.';
    el.out.textContent = `${n(r, 2)}%`;
  } else {
    r = mult ? v / k : (v / 100) * k;
    w = mult ? `${n(v)} ÷ ${n(k)} = ${n(r, 4)}` : `${n(v)} ÷ 100 × ${n(k)} = ${n(r, 4)}`;
    if (v > 100) warn = ' A percentage above 100 is unusual, please check it.';
    el.out.textContent = `${n(r, 2)} CGPA`;
  }
  el.work.textContent = w + warn;
}
$$('[data-k]').forEach((b) => b.addEventListener('click', () => { el.k.value = b.dataset.k; $$('[data-k]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); update(); }));
el.method.addEventListener('change', () => { el.k.value = el.method.value === 'mult' ? '9.5' : '10'; $$('[data-k]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === el.k.value))); update(); });
[el.dir, el.val, el.k].forEach((x) => x.addEventListener('input', update));
el.k.addEventListener('input', () => $$('[data-k]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === el.k.value))));
update();
