import { allConversionPages } from '../data/conversions.js';

const SITE = 'https://www.kodatools.com';

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/finance', priority: '0.8', changefreq: 'weekly' },
  { url: '/health', priority: '0.8', changefreq: 'weekly' },
  { url: '/math', priority: '0.8', changefreq: 'weekly' },
  { url: '/date-time', priority: '0.8', changefreq: 'weekly' },
  { url: '/converters', priority: '0.8', changefreq: 'weekly' },
  { url: '/everyday', priority: '0.8', changefreq: 'weekly' },
  { url: '/finance/mortgage-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/loan-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/compound-interest-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/tip-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/bmi-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/calorie-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/math/percentage-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/date-time/age-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/converters/unit-converter', priority: '0.9', changefreq: 'monthly' },
  { url: '/everyday/word-counter', priority: '0.9', changefreq: 'monthly' },
  { url: '/about', priority: '0.4', changefreq: 'yearly' },
  { url: '/contact', priority: '0.4', changefreq: 'yearly' },
  { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly' }
];

export function GET() {
  const allPages = [
    ...staticPages,
    ...allConversionPages().map((p) => ({
      url: `/convert/${p.slug}`,
      priority: '0.7',
      changefreq: 'monthly'
    }))
  ];

  const urls = allPages
    .map(
      (p) => `  <url>
    <loc>${SITE}${p.url}</loc>
    <priority>${p.priority}</priority>
    <changefreq>${p.changefreq}</changefreq>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
