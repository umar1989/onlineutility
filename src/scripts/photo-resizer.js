import { $, $$, debounce, fmtBytes, canvasToBlob, downloadBlob, baseName } from './common.js';

const el = {
  file: $('#pr-file'), w: $('#pr-w'), h: $('#pr-h'), kb: $('#pr-kb'), fit: $('#pr-fit'),
  out: $('#pr-out'), status: $('#pr-status'), result: $('#pr-result'), dl: $('#pr-dl'),
  canvas: $('#pr-canvas'), preview: $('#pr-preview'),
};
let bitmap = null;
let name = 'photo';
let outBlob = null;
let run = 0;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function draw(w, h, mode) {
  const c = el.canvas;
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = 'high';
  const sw = bitmap.width, sh = bitmap.height;
  if (mode === 'stretch') {
    ctx.drawImage(bitmap, 0, 0, w, h);
  } else {
    const s = mode === 'crop' ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh);
    const dw = sw * s, dh = sh * s;
    ctx.drawImage(bitmap, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
}

// Find the highest JPEG quality whose file is not bigger than the target.
async function encodeUnder(targetBytes) {
  const hi = await canvasToBlob(el.canvas, 'image/jpeg', 0.95);
  if (hi.size <= targetBytes) return { blob: hi, q: 0.95, ok: true };
  let lo = 0.02, top = 0.95, best = null;
  const floor = await canvasToBlob(el.canvas, 'image/jpeg', lo);
  if (floor.size > targetBytes) return { blob: floor, q: lo, ok: false };
  best = { blob: floor, q: lo, ok: true };
  for (let i = 0; i < 9; i++) {
    const mid = (lo + top) / 2;
    const b = await canvasToBlob(el.canvas, 'image/jpeg', mid);
    if (b.size <= targetBytes) { best = { blob: b, q: mid, ok: true }; lo = mid; } else { top = mid; }
  }
  return best;
}

async function process() {
  if (!bitmap) return;
  const id = ++run;
  const w = clamp(Math.round(+el.w.value) || 0, 10, 6000);
  const h = clamp(Math.round(+el.h.value) || 0, 10, 6000);
  const kb = +el.kb.value;
  if (!w || !h || !(kb > 0)) { el.status.textContent = 'Enter a width, a height and a size in KB.'; return; }
  el.status.textContent = 'Working…';
  draw(w, h, el.fit.value);
  const r = await encodeUnder(kb * 1024);
  if (id !== run) return;
  outBlob = r.blob;
  el.preview.hidden = false;
  el.result.hidden = false;
  el.dl.disabled = false;
  const size = fmtBytes(r.blob.size);
  if (r.ok) {
    el.out.innerHTML = `<p class="big ok"></p><p></p>`;
    $('.big', el.out).textContent = `${size} (target ${kb} KB)`;
    el.out.lastChild.textContent = `${w} × ${h} pixels, JPEG quality about ${Math.round(r.q * 100)}%.`;
    el.status.textContent = 'Done. Check the preview, then download.';
  } else {
    el.out.innerHTML = `<p class="big bad"></p><p></p>`;
    $('.big', el.out).textContent = `${size}: still above ${kb} KB`;
    el.out.lastChild.textContent = `Even at the lowest quality this pixel size is too big. Raise the target or reduce the width and height.`;
    el.status.textContent = 'Target not reached.';
  }
}
const schedule = debounce(process, 250);

el.file.addEventListener('change', async () => {
  const f = el.file.files[0];
  if (!f) return;
  if (!f.type.startsWith('image/')) { el.status.textContent = 'Please choose an image file (JPG, PNG or WebP).'; return; }
  try {
    bitmap = await createImageBitmap(f);
  } catch {
    el.status.textContent = 'This image could not be opened. Try a JPG or PNG.';
    return;
  }
  name = baseName(f.name);
  // Start from the original size so the pixels only change if you change them.
  el.w.value = bitmap.width; el.h.value = bitmap.height;
  process();
});

[el.w, el.h, el.kb, el.fit].forEach((i) => i.addEventListener('input', schedule));

$$('[data-kb]').forEach((b) => b.addEventListener('click', () => {
  el.kb.value = b.dataset.kb;
  $$('[data-kb]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  schedule();
}));
$$('[data-size]').forEach((b) => b.addEventListener('click', () => {
  const [w, h] = b.dataset.size.split('x');
  el.w.value = w; el.h.value = h;
  schedule();
}));
el.kb.addEventListener('input', () => $$('[data-kb]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.kb === el.kb.value))));

el.dl.addEventListener('click', () => {
  if (outBlob) downloadBlob(outBlob, `${name}-${el.w.value}x${el.h.value}.jpg`);
});
