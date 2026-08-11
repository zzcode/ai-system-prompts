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
  { url: '/construction', priority: '0.8', changefreq: 'weekly' },
  // Finance
  { url: '/finance/mortgage-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/loan-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/compound-interest-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/tip-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/salary-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/auto-loan-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/discount-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/sales-tax-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/hourly-to-salary-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/amortization-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/retirement-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/investment-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/savings-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/credit-card-payoff-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/inflation-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/finance/net-worth-calculator', priority: '0.9', changefreq: 'monthly' },
  // Health
  { url: '/health/bmi-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/calorie-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/bmr-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/tdee-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/body-fat-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/macro-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/ideal-weight-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/water-intake-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/pregnancy-due-date-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/ovulation-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/pace-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/health/sleep-calculator', priority: '0.9', changefreq: 'monthly' },
  // Math
  { url: '/math/percentage-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/math/fraction-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/math/gpa-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/math/grade-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/math/average-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/math/ratio-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/math/scientific-calculator', priority: '0.9', changefreq: 'monthly' },
  // Date & Time
  { url: '/date-time/age-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/date-time/date-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/date-time/days-from-today', priority: '0.9', changefreq: 'monthly' },
  { url: '/date-time/time-calculator', priority: '0.9', changefreq: 'monthly' },
  // Converters
  { url: '/converters/unit-converter', priority: '0.9', changefreq: 'monthly' },
  // Everyday
  { url: '/everyday/word-counter', priority: '0.9', changefreq: 'monthly' },
  { url: '/everyday/password-generator', priority: '0.9', changefreq: 'monthly' },
  { url: '/everyday/random-number-generator', priority: '0.9', changefreq: 'monthly' },
  { url: '/everyday/case-converter', priority: '0.9', changefreq: 'monthly' },
  { url: '/everyday/lorem-ipsum-generator', priority: '0.9', changefreq: 'monthly' },
  { url: '/everyday/qr-code-generator', priority: '0.9', changefreq: 'monthly' },
  // Construction
  { url: '/construction/square-footage-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/construction/concrete-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/construction/paint-calculator', priority: '0.9', changefreq: 'monthly' },
  { url: '/construction/tile-calculator', priority: '0.9', changefreq: 'monthly' },
  // Compliance
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
