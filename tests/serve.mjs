// Minimal static server for testing the built site in dist/ (directory URLs with trailing slash).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
export function serve(port = 4399, root = 'dist') {
  const s = http.createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = join(root, p);
    try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch { f = join(root, '404.html'); res.statusCode = 404; }
    try { const b = await readFile(f); res.setHeader('Content-Type', types[extname(f)] ?? 'application/octet-stream'); res.end(b); } catch { res.statusCode = 404; res.end('nf'); }
  });
  return new Promise((r) => s.listen(port, () => r(s)));
}
if (import.meta.url === `file://${process.argv[1]}`) { await serve(+process.argv[2] || 4399); console.log('serving dist on', process.argv[2] || 4399); }
