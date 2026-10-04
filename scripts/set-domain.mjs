// Usage: npm run set-domain -- mytools.in
// Sets the site address in src/config.ts and writes public/CNAME (used by GitHub Pages).
import { readFileSync, writeFileSync } from 'node:fs';
const raw = (process.argv[2] || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(raw)) { console.error('Give a bare domain, for example: npm run set-domain -- mytools.in'); process.exit(1); }
const cfg = readFileSync('src/config.ts', 'utf8');
writeFileSync('src/config.ts', cfg.replace(/url: 'https?:\/\/[^']*',/, `url: 'https://${raw}',`).replace(/\/\/ PLACEHOLDER: [^\n]*\n\s*/, ''));
writeFileSync('public/CNAME', raw + '\n');
console.log(`Site address set to https://${raw} and public/CNAME written. Now run: npm run build && npm run check`);
