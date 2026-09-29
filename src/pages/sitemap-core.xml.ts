import { reviewedPages } from '../data/search-focus.js';
export function GET() {
  const urls = Object.entries(reviewedPages).map(([path, date]) => `<url><loc>https://www.kodatools.com${path}</loc><lastmod>${date}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
