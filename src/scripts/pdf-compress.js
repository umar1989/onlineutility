import { $, $$, fmtBytes, canvasToBlob, downloadBlob, baseName } from './common.js';
import { loadPdfLibs, renderPage } from './pdf-libs.js';

const el = {
  file: $('#pc-file'), size: $('#pc-size'), unit: $('#pc-unit'), go: $('#pc-go'), status: $('#pc-status'),
  prog: $('#pc-prog'), result: $('#pc-result'), out: $('#pc-out'), dl: $('#pc-dl'),
};
// 24 steps from best quality to smallest. Each step renders pages at a lower resolution and JPEG quality.
const LADDER = Array.from({ length: 24 }, (_, i) => {
  const t = i / 23;
  return { scale: 2.0 * Math.pow(0.35 / 2.0, t), q: 0.85 - 0.5 * t };
});
let file = null;
let outBlob = null;
let busy = false;

const targetBytes = () => Math.round((+el.size.value || 0) * (el.unit.value === 'MB' ? 1048576 : 1024));

async function build(doc, PDFDocument, level, label) {
  const out = await PDFDocument.create();
  for (let i = 1; i <= doc.numPages; i++) {
    el.status.textContent = `${label}: page ${i} of ${doc.numPages}`;
    el.prog.value += 1;
    const page = await doc.getPage(i);
    const { canvas, width, height } = await renderPage(page, level.scale);
    const blob = await canvasToBlob(canvas, 'image/jpeg', level.q);
    canvas.width = canvas.height = 0; // free memory
    const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    out.addPage([width, height]).drawImage(img, { x: 0, y: 0, width, height });
    page.cleanup();
  }
  return new Blob([await out.save()], { type: 'application/pdf' });
}

async function compress() {
  if (!file || busy) return;
  const target = targetBytes();
  if (!(target > 0)) { el.status.textContent = 'Enter the size you need.'; return; }
  busy = true; el.go.disabled = true; el.result.hidden = true; el.dl.disabled = true;
  try {
    if (file.size <= target) {
      el.out.innerHTML = '<p class="big ok"></p><p></p>';
      $('.big', el.out).textContent = `Already ${fmtBytes(file.size)}`;
      el.out.lastChild.textContent = 'Your PDF is already within the target, so no compression is needed. You can upload it as it is.';
      el.result.hidden = false; el.status.textContent = 'No change needed.';
      return;
    }
    el.status.textContent = 'Loading libraries…';
    const { pdfjs, PDFDocument } = await loadPdfLibs();
    let doc, task;
    try {
      task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
      doc = await task.promise;
    } catch (e) {
      el.status.textContent = e?.name === 'PasswordException' ? 'This PDF is password protected. Remove the password first.' : 'This file could not be read as a PDF.';
      return;
    }
    el.prog.hidden = false; el.prog.value = 0;
    el.prog.max = doc.numPages * 7; // about 7 passes at most
    let tries = 0;
    const attempt = async (i) => { tries++; return { i, blob: await build(doc, PDFDocument, LADDER[i], `Pass ${tries}`) }; };
    let best = await attempt(0);
    if (best.blob.size > target) {
      let last = await attempt(LADDER.length - 1);
      if (last.blob.size > target) {
        best = { ...last, ok: false };
      } else {
        let lo = 0, hi = LADDER.length - 1; best = last; // lo fails, hi succeeds
        while (hi - lo > 1) {
          const mid = (lo + hi) >> 1;
          const r = await attempt(mid);
          if (r.blob.size <= target) { hi = mid; best = r; } else { lo = mid; }
        }
      }
    }
    outBlob = best.blob;
    const ok = best.ok !== false;
    el.out.innerHTML = `<p class="big ${ok ? 'ok' : 'bad'}"></p><p></p>`;
    $('.big', el.out).textContent = ok ? `${fmtBytes(outBlob.size)} (target ${fmtBytes(target)})` : `${fmtBytes(outBlob.size)}: still above ${fmtBytes(target)}`;
    el.out.lastChild.textContent = ok
      ? `Original ${fmtBytes(file.size)}, ${doc.numPages} page${doc.numPages > 1 ? 's' : ''}. Pages are now images, so the text can no longer be selected.`
      : 'This is the smallest the tool can make it. Try removing pages, or raise the target.';
    el.result.hidden = false; el.dl.disabled = false;
    el.status.textContent = ok ? 'Done.' : 'Target not reached.';
    task.destroy();
  } catch (e) {
    console.error(e);
    el.status.textContent = 'Something went wrong while compressing. Try another PDF.';
  } finally {
    busy = false; el.go.disabled = !file; el.prog.hidden = true;
  }
}

el.file.addEventListener('change', () => {
  file = el.file.files[0] || null;
  el.result.hidden = true;
  if (!file) { el.go.disabled = true; return; }
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { el.status.textContent = 'Please choose a PDF file.'; file = null; el.go.disabled = true; return; }
  el.go.disabled = false;
  el.status.textContent = `${file.name}: ${fmtBytes(file.size)}. Set the target size and press Compress.`;
});
$$('[data-pc]').forEach((b) => b.addEventListener('click', () => {
  el.size.value = b.dataset.size; el.unit.value = b.dataset.unit;
  $$('[data-pc]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
}));
el.go.addEventListener('click', compress);
el.dl.addEventListener('click', () => outBlob && downloadBlob(outBlob, `${baseName(file?.name || 'document')}-compressed.pdf`));
