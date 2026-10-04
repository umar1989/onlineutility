import { $, $$, randInt, shuffle, escapeHtml } from './common.js';

const el = {
  names: $('#rp-names'), count: $('#rp-count'), norepeat: $('#rp-norepeat'), pick: $('#rp-pick'), reset: $('#rp-reset'),
  shown: $('#rp-shown'), status: $('#rp-status'), history: $('#rp-history'), remain: $('#rp-remain'),
  gmode: $('#rp-gmode'), gsize: $('#rp-gsize'), gmake: $('#rp-gmake'), groups: $('#rp-groups'),
};
let picked = []; // names already picked (in order)
let timer = null;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const names = () => el.names.value.split('\n').map((s) => s.trim()).filter(Boolean);
const remaining = () => {
  const left = names();
  for (const p of picked) { const i = left.indexOf(p); if (i >= 0) left.splice(i, 1); }
  return left;
};

function refresh() {
  const all = names();
  // forget picked names that no longer exist in the list
  const left = [...all]; picked = picked.filter((p) => { const i = left.indexOf(p); if (i >= 0) { left.splice(i, 1); return true; } return false; });
  el.remain.textContent = el.norepeat.checked ? `${remaining().length} of ${all.length} students left to pick` : `${all.length} students in the list`;
  el.history.innerHTML = picked.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
  el.history.parentElement.hidden = picked.length === 0;
}

function finish(chosen) {
  el.shown.textContent = chosen.join(', ');
  picked.push(...(el.norepeat.checked ? chosen : []));
  el.status.textContent = chosen.length > 1 ? `${chosen.length} students picked.` : 'Picked!';
  el.pick.disabled = false;
  refresh();
}

el.pick.addEventListener('click', () => {
  const all = names();
  if (!all.length) { el.status.textContent = 'Add some names first, one per line.'; return; }
  const n = Math.max(1, Math.min(50, Math.round(+el.count.value) || 1));
  let pool = el.norepeat.checked ? remaining() : all;
  if (!pool.length) { el.status.textContent = 'Everyone has been picked. Press "Start over" to begin again.'; return; }
  const chosen = el.norepeat.checked ? shuffle(pool).slice(0, n) : Array.from({ length: Math.min(n, 50) }, () => all[randInt(all.length)]);
  el.pick.disabled = true;
  if (reduce) { finish(chosen); return; }
  let ticks = 0;
  clearInterval(timer);
  timer = setInterval(() => {
    el.shown.textContent = all[randInt(all.length)];
    if (++ticks >= 12) { clearInterval(timer); finish(chosen); }
  }, 60);
});
el.reset.addEventListener('click', () => { picked = []; el.shown.textContent = '–'; el.status.textContent = 'List reset. Everyone can be picked again.'; refresh(); });
el.names.addEventListener('input', refresh);
el.norepeat.addEventListener('change', refresh);

el.gmake.addEventListener('click', () => {
  const all = names();
  if (all.length < 2) { el.groups.innerHTML = '<p class="bad">Add at least two names to make groups.</p>'; return; }
  const v = Math.max(1, Math.round(+el.gsize.value) || 1);
  const k = el.gmode.value === 'count' ? Math.min(v, all.length) : Math.ceil(all.length / v);
  const buckets = Array.from({ length: k }, () => []);
  shuffle(all).forEach((name, i) => buckets[i % k].push(name));
  el.groups.innerHTML = `<div class="group-grid">${buckets.map((g, i) => `<div class="group"><h4>Group ${i + 1} (${g.length})</h4><ul>${g.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`).join('')}</div>`;
});
$$('#rp-gmode').forEach((s) => s.addEventListener('change', () => { $('#rp-glabel').textContent = s.value === 'count' ? 'Number of groups' : 'Students per group'; }));
refresh();
