// Loads pdf.js and pdf-lib on demand so pages that don't need them stay light.
let libs;
export async function loadPdfLibs() {
  if (!libs) {
    const [pdfjs, worker, pdflib] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      import('pdf-lib'),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    libs = { pdfjs, PDFDocument: pdflib.PDFDocument };
  }
  return libs;
}

// Render one pdf.js page to a canvas at the given scale, capped so huge pages do not exhaust memory.
export async function renderPage(page, scale, maxSide = 4000) {
  const base = page.getViewport({ scale: 1 });
  const s = Math.min(scale, maxSide / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale: s });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
  return { canvas, width: base.width, height: base.height };
}
