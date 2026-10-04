// Creates test images and PDFs in tests/fixtures (git-ignored).
import sharp from 'sharp';
import { PDFDocument, rgb } from 'pdf-lib';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('tests/fixtures', { recursive: true });
// noisy photo so it compresses poorly
const w = 1600, h = 1200;
const buf = Buffer.alloc(w * h * 3);
for (let i = 0; i < buf.length; i++) buf[i] = (Math.sin(i / 997) * 60 + 128 + Math.random() * 12) & 255;
await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 95 }).toFile('tests/fixtures/photo.jpg');
await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).png().toFile('tests/fixtures/photo.png');
// multi-page PDF with images and text
const pdf = await PDFDocument.create();
const img = await pdf.embedJpg(await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 95 }).toBuffer());
for (let i = 1; i <= 3; i++) {
  const p = pdf.addPage([595, 842]);
  p.drawText(`Test page ${i}`, { x: 50, y: 780, size: 28, color: rgb(0, 0, 0) });
  p.drawImage(img, { x: 40, y: 200, width: 515, height: 386 });
}
writeFileSync('tests/fixtures/sample.pdf', await pdf.save());
console.log('fixtures ready');
