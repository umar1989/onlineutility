import { getCollection } from 'astro:content';
import { SITE } from '../config';
import { TOOLS } from '../data/tools';

// Generated at build time. Each URL has a lastmod date.
export async function GET() {
  const guides = await getCollection('guides');
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const entries: { path: string; lastmod: string }[] = [
    { path: '/', lastmod: SITE.lastUpdated },
    { path: '/guides/', lastmod: iso(new Date(Math.max(...guides.map((g) => g.data.updated.getTime())))) },
    ...['about', 'contact', 'privacy-policy', 'terms-and-disclaimer'].map((p) => ({ path: `/${p}/`, lastmod: SITE.lastUpdated })),
    ...TOOLS.map((t) => ({ path: `/${t.slug}/`, lastmod: t.lastUpdated })),
    ...guides.map((g) => ({ path: `/guides/${g.id}/`, lastmod: iso(g.data.updated) })),
  ];
  const body = entries
    .map((e) => `  <url><loc>${new URL(e.path, SITE.url).href}</loc><lastmod>${e.lastmod}</lastmod></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
