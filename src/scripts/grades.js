import { $, $$, escapeHtml, fmtNum, downloadBlob } from './common.js';

const el = {
  scale: $('#mg-scale'), preset: $('#mg-preset'), add: $('#mg-add'), marks: $('#mg-marks'), max: $('#mg-max'), out: $('#mg-out'), work: $('#mg-work'),
  bulk: $('#mg-bulk'), go: $('#mg-go'), result: $('#mg-result'), csv: $('#mg-csv'), copy: $('#mg-copy'), status: $('#mg-status'),
};
// Illustrative scales only. Every school sets its own boundaries.
const PRESETS = {
  ten: [[90, 'A+'], [80, 'A'], [70, 'B+'], [60, 'B'], [50, 'C'], [40, 'D'], [0, 'E']],
  letter: [[90, 'A'], [80, 'B'], [70, 'C'], [60, 'D'], [0, 'F']],
  simple: [[75, 'Distinction'], [60, 'First class'], [45, 'Second class'], [33, 'Pass'], [0, 'Fail']],
};
let lastRows = [];

function setScale(rows) {
  el.scale.innerHTML = '';
  rows.forEach(([min, grade]) => addRow(min, grade));
  recalc();
}
function addRow(min = '', grade = '') {
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="number" min="0" max="100" step="any" inputmode="decimal" aria-label="Minimum percentage for this grade" value="${min}"></td>
    <td><input type="text" maxlength="20" aria-label="Grade name" value="${escapeHtml(grade)}"></td>
    <td><button type="button" class="btn secondary" style="min-height:36px;padding:2px 10px">Remove</button></td>`;
  tr.querySelector('button').addEventListener('click', () => { tr.remove(); recalc(); });
  tr.querySelectorAll('input').forEach((i) => i.addEventListener('input', recalc));
  el.scale.appendChild(tr);
}
const getScale = () => $$('tr', el.scale).map((tr) => { const [a, b] = tr.querySelectorAll('input'); return { min: +a.value, grade: b.value.trim(), ok: a.value !== '' && b.value.trim() !== '' }; })
  .filter((r) => r.ok).sort((x, y) => y.min - x.min);

function gradeFor(pct, scale) {
  for (const r of scale) if (pct >= r.min) return r.grade;
  return scale.length ? 'Below lowest band' : '–';
}

function recalc() {
  const scale = getScale();
  const marks = el.marks.value, max = +el.max.value;
  if (marks === '' || !(max > 0)) { el.out.textContent = '–'; el.work.textContent = 'Enter the marks obtained and the maximum marks.'; }
  else if (+marks < 0 || +marks > max) { el.out.textContent = '–'; el.work.textContent = 'Marks must be between 0 and the maximum marks.'; }
  else {
    const pct = (+marks / max) * 100;
    el.out.textContent = gradeFor(pct, scale);
    el.work.textContent = `${fmtNum(+marks)} ÷ ${fmtNum(max)} × 100 = ${fmtNum(pct, 2)}%`;
  }
  if (!el.result.hidden) bulk();
}

function bulk() {
  const scale = getScale(), max = +el.max.value;
  if (!(max > 0)) { el.status.textContent = 'Enter the maximum marks above first.'; return; }
  const lines = el.bulk.value.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) { el.status.textContent = 'Paste one student per line, such as: Asha Verma, 78'; return; }
  lastRows = lines.map((l, i) => {
    const m = l.match(/^(.*?)[\s,;:\t]*(-?\d+(?:\.\d+)?)\s*$/);
    if (!m) return { name: l, marks: null, error: 'No marks found' };
    const marks = +m[2], name = m[1].trim() || `Student ${i + 1}`;
    if (marks < 0 || marks > max) return { name, marks, error: `Above ${max} or below 0` };
    const pct = (marks / max) * 100;
    return { name, marks, pct, grade: gradeFor(pct, scale) };
  });
  const good = lastRows.filter((r) => !r.error);
  let html = '<div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Name</th><th>Marks</th><th>Percentage</th><th>Grade</th></tr></thead><tbody>';
  lastRows.forEach((r, i) => { html += r.error ? `<tr><td>${i + 1}</td><td>${escapeHtml(r.name)}</td><td colspan="3" class="bad">${r.error}</td></tr>` : `<tr><td>${i + 1}</td><td>${escapeHtml(r.name)}</td><td>${fmtNum(r.marks)}</td><td>${fmtNum(r.pct, 2)}%</td><td><strong>${escapeHtml(r.grade)}</strong></td></tr>`; });
  html += '</tbody></table></div>';
  const counts = {}; good.forEach((r) => { counts[r.grade] = (counts[r.grade] || 0) + 1; });
  const order = [...scale.map((s) => s.grade), 'Below lowest band'].filter((g, i, a) => a.indexOf(g) === i && counts[g]);
  const avg = good.length ? good.reduce((s, r) => s + r.pct, 0) / good.length : 0;
  html += `<p><strong>Summary:</strong> ${good.length} graded${good.length ? `, class average ${fmtNum(avg, 2)}%, highest ${fmtNum(Math.max(...good.map((r) => r.pct)), 2)}%, lowest ${fmtNum(Math.min(...good.map((r) => r.pct)), 2)}%` : ''}.</p>`;
  html += `<p>${order.map((g) => `${escapeHtml(g)}: ${counts[g]}`).join(' · ')}</p>`;
  el.result.querySelector('#mg-table').innerHTML = html;
  el.result.hidden = false;
  el.status.textContent = lastRows.some((r) => r.error) ? 'Some lines need a look.' : 'Done.';
}

el.preset.addEventListener('change', () => setScale(PRESETS[el.preset.value]));
el.add.addEventListener('click', () => { addRow(); });
[el.marks, el.max].forEach((i) => i.addEventListener('input', recalc));
el.go.addEventListener('click', bulk);
el.csv.addEventListener('click', () => {
  const rows = [['Name', 'Marks', 'Percentage', 'Grade'], ...lastRows.map((r) => [r.name, r.marks ?? '', r.pct != null ? r.pct.toFixed(2) : '', r.grade ?? r.error])];
  downloadBlob(new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' }), 'grades.csv');
});
el.copy.addEventListener('click', async () => {
  const t = lastRows.map((r) => [r.name, r.marks ?? '', r.pct != null ? r.pct.toFixed(2) : '', r.grade ?? r.error].join('\t')).join('\n');
  try { await navigator.clipboard.writeText(t); el.status.textContent = 'Copied. Paste into a spreadsheet.'; } catch { el.status.textContent = 'Copy was blocked. Use Download CSV.'; }
});
setScale(PRESETS.ten);
