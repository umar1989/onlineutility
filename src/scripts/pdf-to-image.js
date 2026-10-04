import { $, fmtBytes, canvasToBlob, downloadBlob, baseName } from './common.js';
import { loadPdfLibs, renderPage } from './pdf-libs.js';

const el = {
  file: $('#pi-file'), fmt: $('#pi-fmt'), dpi: $('#pi-dpi'), pages: $('#pi-pages'), go: $('#pi-go'),
  status: $('#pi-status'), prog: $('#pi-prog'), list: $('#pi-list'), result: $('#pi-result'), zip: $('#pi-zip'),
};
let file = null;
let outputs = []; // { name, blob, url }

// "1-3, 5" -> [1,2,3,5]; blank = all pages
function parsePages(text, total) {
  if (!text.trim()) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set();
  for (const part of text.split(',')) {
    const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(`"${part.trim()}" is not a valid page or range.`);
    const a = +m[1], b = m[2] ? +m[2] : a;
    if (a < 1 || b < a || b > total) throw new Error(`Pages must be between 1 and ${total}.`);
    for (let i = a; i <= b; i++) set.add(i);
  }
  return [...set].sort((x, y) => x - y);
}

function clearOutputs() { outputs.forEach((o) => URL.revokeObjectURL(o.url)); outputs = []; el.list.innerHTML = ''; el.result.hidden = true; }

el.file.addEventListener('change', () => {
  file = el.file.files[0] || null;
  clearOutputs();
  if (file && file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { el.status.textContent = 'Please choose a PDF file.'; file = null; }
  el.go.disabled = !file;
  if (file) el.status.textContent = `${file.name}: ${fmtBytes(file.size)}. Choose options and press Convert.`;
});

el.go.addEventListener('click', async () => {
  if (!file) return;
  el.go.disabled = true; clearOutputs();
  let task;
  try {
    el.status.textContent = 'Loading PDF library…';
    const { pdfjs } = await loadPdfLibs();
    try {
      task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
      var doc = await task.promise;
    } catch (e) {
      throw new Error(e?.name === 'PasswordException' ? 'This PDF is password protected. Remove the password first.' : 'This file could not be read as a PDF.');
    }
    const pages = parsePages(el.pages.value, doc.numPages);
    if (pages.length > 60) throw new Error('Please convert 60 pages or fewer at a time.');
    const type = el.fmt.value === 'png' ? 'image/png' : 'image/jpeg';
    const ext = el.fmt.value === 'png' ? 'png' : 'jpg';
    const scale = +el.dpi.value / 72;
    el.prog.hidden = false; el.prog.max = pages.length; el.prog.value = 0;
    for (const n of pages) {
      el.status.textContent = `Converting page ${n} (${el.prog.value + 1} of ${pages.length})…`;
      const page = await doc.getPage(n);
      const { canvas } = await renderPage(page, scale, 5000);
      const blob = await canvasToBlob(canvas, type, 0.92);
      canvas.width = canvas.height = 0; page.cleanup();
      const name = `${baseName(file.name)}-page-${n}.${ext}`;
      outputs.push({ name, blob, url: URL.createObjectURL(blob) });
      el.prog.value += 1;
    }
    outputs.forEach((o, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<img width="140" height="110" alt="" loading="lazy" /><span></span><div class="btn-row"><button type="button" class="btn secondary">Download</button></div>';
      const img = li.querySelector('img'); img.src = o.url; img.alt = `Preview of ${o.name}`;
      li.querySelector('span').textContent = `${o.name} (${fmtBytes(o.blob.size)})`;
      li.querySelector('button').addEventListener('click', () => downloadBlob(o.blob, o.name));
      el.list.appendChild(li);
    });
    el.result.hidden = false;
    el.zip.hidden = outputs.length < 2;
    el.status.textContent = `Done: ${outputs.length} image${outputs.length > 1 ? 's' : ''} created.`;
  } catch (e) {
    console.error(e);
    el.status.textContent = e.message || 'Something went wrong. Try another PDF.';
  } finally {
    task?.destroy(); el.prog.hidden = true; el.go.disabled = !file;
  }
});

el.zip.addEventListener('click', async () => {
  el.zip.disabled = true;
  try {
    const { zipSync } = await import('fflate');
    const files = {};
    for (const o of outputs) files[o.name] = new Uint8Array(await o.blob.arrayBuffer());
    downloadBlob(new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' }), `${baseName(file.name)}-images.zip`);
  } finally { el.zip.disabled = false; }
});
