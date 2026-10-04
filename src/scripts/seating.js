import { $, shuffle, escapeHtml, downloadBlob } from './common.js';

const el = {
  title: $('#sp-title'), rows: $('#sp-rows'), cols: $('#sp-cols'), source: $('#sp-source'), names: $('#sp-names'), from: $('#sp-from'), to: $('#sp-to'), prefix: $('#sp-prefix'),
  order: $('#sp-order'), gap: $('#sp-gap'), go: $('#sp-go'), status: $('#sp-status'), result: $('#sp-result'), plan: $('#sp-plan'), heading: $('#sp-heading'),
  print: $('#sp-print'), copy: $('#sp-copy'), csv: $('#sp-csv'), nameBox: $('#sp-namebox'), rangeBox: $('#sp-rangebox'), shuffle: $('#sp-shuffle'),
};
let grid = []; // rows of strings ('' = empty seat)

const clampInt = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(+v) || lo));

function students() {
  if (el.source.value === 'range') {
    const a = Math.round(+el.from.value), b = Math.round(+el.to.value);
    if (!(a <= b) || b - a > 499) throw new Error('Enter a roll number range of up to 500 students, with "from" not above "to".');
    return Array.from({ length: b - a + 1 }, (_, i) => `${el.prefix.value.trim()}${a + i}`);
  }
  const list = el.names.value.split('\n').map((s) => s.trim()).filter(Boolean);
  if (!list.length) throw new Error('Add at least one name, one per line.');
  if (list.length > 500) throw new Error('Please use 500 names or fewer.');
  return list;
}

function build() {
  el.result.hidden = false;
  let list;
  try { list = students(); } catch (e) { el.status.textContent = e.message; el.result.hidden = true; return; }
  const R = clampInt(el.rows.value, 1, 30), C = clampInt(el.cols.value, 1, 30);
  const gap = el.gap.value;
  const usable = (r, c) => gap === 'none' || (gap === 'alt-col' ? c % 2 === 0 : gap === 'alt-row' ? r % 2 === 0 : (r + c) % 2 === 0);
  const order = [];
  for (let r = 0; r < R; r++) {
    const cs = [...Array(C).keys()];
    if (el.order.value === 'snake' && r % 2 === 1) cs.reverse();
    for (const c of cs) if (usable(r, c)) order.push([r, c]);
  }
  const seq = el.order.value === 'random' ? shuffle(list) : list;
  grid = Array.from({ length: R }, () => Array(C).fill(''));
  const usableCount = order.length;
  order.forEach(([r, c], i) => { if (i < seq.length) grid[r][c] = seq[i]; });
  // mark unusable seats with null so they render as blocked
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!usable(r, c)) grid[r][c] = null;
  const placed = Math.min(seq.length, usableCount);
  const left = seq.slice(placed);
  el.heading.textContent = el.title.value.trim() || 'Seating plan';
  let html = `<div class="board">Front of the room</div><div class="table-wrap"><table class="data seat-table"><thead><tr><th scope="col"><span class="sr-only">Row</span></th>`;
  for (let c = 0; c < C; c++) html += `<th scope="col">Col ${c + 1}</th>`;
  html += '</tr></thead><tbody>';
  grid.forEach((row, r) => {
    html += `<tr><th scope="row">Row ${r + 1}</th>`;
    row.forEach((cell) => { html += cell === null ? '<td class="seat empty" aria-label="Not used">×</td>' : cell === '' ? '<td class="seat empty">empty</td>' : `<td class="seat">${escapeHtml(cell)}</td>`; });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  if (left.length) html += `<p class="bad">${left.length} student${left.length > 1 ? 's' : ''} could not be seated: ${escapeHtml(left.join(', '))}. Add rows or columns.</p>`;
  el.plan.innerHTML = html;
  el.status.textContent = `${placed} of ${list.length} students seated in ${usableCount} usable seats.`;
  el.shuffle.hidden = el.order.value !== 'random';
}

const text = () => grid.map((r) => r.map((c) => c ?? '').join('\t')).join('\n');
el.go.addEventListener('click', build);
el.shuffle.addEventListener('click', build);
el.source.addEventListener('change', () => { const r = el.source.value === 'range'; el.rangeBox.hidden = !r; el.nameBox.hidden = r; });
el.print.addEventListener('click', () => window.print());
el.copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(text()); el.status.textContent = 'Copied. Paste it into a spreadsheet or document.'; } catch { el.status.textContent = 'Copy was blocked by the browser. Use Download CSV instead.'; }
});
el.csv.addEventListener('click', () => {
  const csv = grid.map((r) => r.map((c) => `"${(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv' }), 'seating-plan.csv');
});
