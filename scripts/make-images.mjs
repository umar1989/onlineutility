// One-off: renders the PNG icons and default share image from SVG. Run: node scripts/make-images.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
const fav = readFileSync('public/favicon.svg');
await sharp(fav).resize(180, 180).png().toFile('public/apple-touch-icon.png');
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#1d4ed8"/>
<rect x="80" y="80" width="130" height="130" rx="28" fill="#fff"/><path d="M110 148l28 28 52-60" fill="none" stroke="#1d4ed8" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
<text x="80" y="340" font-family="DejaVu Sans, Arial, sans-serif" font-size="84" font-weight="700" fill="#fff">Online Utility</text>
<text x="80" y="420" font-family="DejaVu Sans, Arial, sans-serif" font-size="40" fill="#dbe7ff">Free exam-form and classroom tools</text>
<text x="80" y="480" font-family="DejaVu Sans, Arial, sans-serif" font-size="40" fill="#dbe7ff">that run in your browser</text></svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og-default.png');
