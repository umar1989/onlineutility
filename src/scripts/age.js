import { $, fmtNum } from './common.js';

const el = { dob: $('#ag-dob'), cut: $('#ag-cut'), today: $('#ag-today'), min: $('#ag-min'), max: $('#ag-max'), relax: $('#ag-relax'), rule: $('#ag-rule'), out: $('#ag-out'), detail: $('#ag-detail'), elig: $('#ag-elig') };

const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); // m is 0-based
const addYears = (d, k) => { const r = new Date(d); r.setUTCFullYear(r.getUTCFullYear() + k); return r; };
const addDays = (d, k) => new Date(d.getTime() + k * 86400000);
const show = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function diff(from, to) {
  let y = to.getUTCFullYear() - from.getUTCFullYear();
  let m = to.getUTCMonth() - from.getUTCMonth();
  let d = to.getUTCDate() - from.getUTCDate();
  if (d < 0) { m--; const pm = to.getUTCMonth() - 1; d += daysIn(pm < 0 ? to.getUTCFullYear() - 1 : to.getUTCFullYear(), (pm + 12) % 12); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}

function update() {
  el.elig.innerHTML = '';
  if (!el.dob.value || !el.cut.value) { el.out.textContent = '–'; el.detail.textContent = 'Enter your date of birth and the cut-off date.'; return; }
  const dob = parse(el.dob.value), cut = parse(el.cut.value);
  if (cut < dob) { el.out.textContent = '–'; el.detail.textContent = 'The cut-off date is before the date of birth. Please check both dates.'; return; }
  const a = diff(dob, cut);
  const days = Math.round((cut - dob) / 86400000);
  el.out.textContent = `${plural(a.y, 'year')}, ${plural(a.m, 'month')}, ${plural(a.d, 'day')}`;
  el.detail.textContent = `Born ${show(dob)}. Age on ${show(cut)}. That is ${fmtNum(days, 0)} days in total.`;

  const lines = [];
  const min = el.min.value === '' ? null : +el.min.value;
  const maxBase = el.max.value === '' ? null : +el.max.value;
  const relax = +el.relax.value || 0;
  if (min !== null) {
    const ok = cut >= addYears(dob, min);
    lines.push(`<p class="${ok ? 'ok' : 'bad'}">${ok ? 'Meets' : 'Below'} the minimum age of ${plural(min, 'year')}.</p><p class="hint">To meet it, you must be born on or before ${show(addYears(cut, -min))}.</p>`);
  }
  if (maxBase !== null) {
    const max = maxBase + relax;
    const strict = el.rule.value === 'exact';
    const ok = strict ? cut <= addYears(dob, max) : cut < addYears(dob, max + 1);
    const earliest = strict ? addYears(cut, -max) : addDays(addYears(cut, -(max + 1)), 1);
    const rule = strict ? `not more than ${plural(max, 'year')} 0 months 0 days` : `within ${plural(max, 'completed year')} (up to ${max} years 11 months 30 days)`;
    lines.push(`<p class="${ok ? 'ok' : 'bad'}">${ok ? 'Within' : 'Over'} the maximum age${relax ? ` (including ${plural(relax, 'year')} extra)` : ''}: ${rule}.</p><p class="hint">To be within it, you must be born on or after ${show(earliest)}.</p>`);
  }
  if (lines.length) lines.push('<p class="hint">Rules are worded differently in each notification. Confirm how yours counts age before relying on this.</p>');
  el.elig.innerHTML = lines.join('');
}
el.today.addEventListener('click', () => { const t = new Date(); el.cut.value = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; update(); });
document.querySelectorAll('#ag-tool input, #ag-tool select').forEach((x) => x.addEventListener('input', update));
update();
