import { $, escapeHtml, fmtBytes, canvasToBlob, downloadBlob } from './common.js';

const el = {
  file: $('#ip-file'), list: $('#ip-list'), size: $('#ip-size'), quality: $('#ip-quality'), margin: $('#ip-margin'),
  go: $('#ip-go'), status: $('#ip-status'), result: $('#ip-result'), out: $('#ip-out'), dl: $('#ip-dl'), clear: $('#ip-clear'),
};
const A4 = [595.28, 841.89];
const QUALITY = { small: { max: 1600, q: 0.75 }, balanced: { max: 2200, q: 0.85 }, best: { max: 6000, q: 0.95 } };
let items = []; // { file, url }
let outBlob = null;

function render() {
  el.list.innerHTML = '';
  items.forEach((it, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<img width="140" height="110" alt="" /><div><strong>Page ${i + 1}</strong><br><span></span></div>
      <div class="btn-row"><button type="button" class="btn secondary" data-act="up">Move up</button><button type="button" class="btn secondary" data-act="down">Move down</button><button type="button" class="btn secondary" data-act="del">Remove</button></div>`;
    const img = li.querySelector('img');
    img.src = it.url;
    img.alt = `Preview of page ${i + 1}: ${it.file.name}`;
    img.loading = 'lazy';
    li.querySelector('span').textContent = `${it.file.name} (${fmtBytes(it.file.size)})`;
    li.querySelector('[data-act=up]').disabled = i === 0;
    li.querySelector('[data-act=down]').disabled = i === items.length - 1;
    li.addEventListener('click', (e) => {
      const act = e.target?.dataset?.act;
      if (!act) return;
      if (act === 'del') { URL.revokeObjectURL(it.url); items.splice(i, 1); }
      if (act === 'up') [items[i - 1], items[i]] = [items[i], items[i - 1]];
      if (act === 'down') [items[i + 1], items[i]] = [items[i], items[i + 1]];
      el.result.hidden = true;
      render();
    });
    el.list.appendChild(li);
  });
  el.go.disabled = items.length === 0;
  el.clear.hidden = items.length === 0;
  el.status.textContent = items.length ? `${items.length} image${items.length > 1 ? 's' : ''} ready. Reorder if needed, then press Create PDF.` : 'Choose one or more images to begin.';
}

el.file.addEventListener('change', () => {
  for (const f of el.file.files) {
    if (f.type.startsWith('image/')) items.push({ file: f, url: URL.createObjectURL(f) });
  }
  el.file.value = '';
  el.result.hidden = true;
  render();
});
el.clear.addEventListener('click', () => { items.forEach((i) => URL.revokeObjectURL(i.url)); items = []; el.result.hidden = true; render(); });

async function toJpeg(file, { max, q }) {
  const bmp = await createImageBitmap(file); // applies EXIF rotation
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, w, h);
  const blob = await canvasToBlob(c, 'image/jpeg', q);
  c.width = c.height = 0; bmp.close?.();
  return { bytes: new Uint8Array(await blob.arrayBuffer()), w, h };
}

el.go.addEventListener('click', async () => {
  if (!items.length) return;
  el.go.disabled = true; el.result.hidden = true;
  try {
    el.status.textContent = 'Loading PDF library…';
    const { PDFDocument } = await import('pdf-lib');
    const pdf = await PDFDocument.create();
    const margin = +el.margin.value;
    const mode = el.size.value;
    for (let i = 0; i < items.length; i++) {
      el.status.textContent = `Adding image ${i + 1} of ${items.length}…`;
      let img;
      try { const r = await toJpeg(items[i].file, QUALITY[el.quality.value]); img = { ...r, pdfImg: await pdf.embedJpg(r.bytes) }; }
      catch { throw new Error(`Could not read ${items[i].file.name}`); }
      let [pw, ph] = mode === 'a4-l' ? [A4[1], A4[0]] : mode === 'a4-p' ? A4 : mode === 'fit' ? [img.w * 0.75 + margin * 2, img.h * 0.75 + margin * 2]
        : img.w > img.h ? [A4[1], A4[0]] : A4;
      const page = pdf.addPage([pw, ph]);
      const bw = pw - margin * 2, bh = ph - margin * 2;
      const s = Math.min(bw / img.w, bh / img.h);
      const dw = img.w * s, dh = img.h * s;
      page.drawImage(img.pdfImg, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
    }
    outBlob = new Blob([await pdf.save()], { type: 'application/pdf' });
    el.out.innerHTML = '<p class="big ok"></p><p></p>';
    el.out.querySelector('.big').textContent = `PDF ready: ${fmtBytes(outBlob.size)}`;
    el.out.lastChild.textContent = `${items.length} page${items.length > 1 ? 's' : ''}. If it is too large for your form, use the compress PDF tool or choose "Smaller file".`;
    el.result.hidden = false;
    el.status.textContent = 'Done.';
  } catch (e) {
    console.error(e);
    el.status.textContent = e.message || 'Something went wrong. Try different images.';
  } finally { el.go.disabled = items.length === 0; }
});
el.dl.addEventListener('click', () => outBlob && downloadBlob(outBlob, 'images.pdf'));
