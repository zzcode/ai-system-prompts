# Search growth rollout: September 29, 2026

## First cohort

Improve existing pages before expanding the number of indexed URLs:

- `/finance/loan-calculator`: monthly payment and zero-interest loans; distinguish interest rate from APR.
- `/finance/compound-interest-calculator`: monthly deposits and contribution timing; examples use the same calculation as the tool.
- `/date-time/age-calculator`: age on a specific date, month ends and leap-day conventions.
- `/construction/concrete-calculator`: rectangular slab volume, allowance and bag quantities.
- `/construction/paint-calculator`: room walls, coats, openings and product-specific coverage.

Each page includes interactive examples, assumptions and relevant next steps. Homepage scenario links and category guidance connect these pages to the rest of the site. Existing conversion URLs remain available; no new numeric variants were added.

## Indexing workflow

The main sitemap remains `/sitemap.xml`. The additional `/sitemap-core.xml` contains the five tools, homepage and three supporting category pages for cohort-level inspection in Search Console. It is a reporting aid, not a priority instruction to Google. `lastmod` is recorded only for material content changes, not reset automatically on every build.

After deployment, verify the URLs, submit the core sitemap, and request indexing for a small number of the improved tools. Record submission outcomes separately from actual indexing outcomes. Do not repeatedly request the same URLs; submission does not guarantee inclusion.

Legacy `/terms-of-service` and `/time-tools-index` addresses (including `.html` versions) redirect to their corresponding current pages. Unrelated removed content should not be redirected merely to clear a report.

## Measurement

Keep private Search Console and AdSense exports outside this public repository. At the next review, record report update dates and compare equivalent completed periods. Track the cohort's indexed URLs, last crawl dates, non-brand search impressions, clicks and landing pages. Separately filter AdSense to KodaTools and compare page views, coverage and page RPM. A sitemap acceptance or successful live URL test is not evidence of search traffic growth.

After enough fresh data accumulates, improve pages with impressions but weak engagement, review persistent discovered-but-not-indexed pages individually, and expand topics only where users have a distinct need. Do not buy traffic or mass-produce numeric variants to manufacture volume.

## Verification

Run `npm test`, `npm run build`, `npm run check:build`, and `npm run audit:seo`. Preview locally with external services disabled. Verify each example button in a browser, invalid inputs, and narrow-screen layout before publication.

## September 30: material-planning long tails

See [keyword opportunity research](reports/keyword-opportunities-2026-09-30.md) for query clusters, evidence, limitations and measurement rules. The second cohort improves concrete bags, paint walls/ceiling and tile boxes within existing URLs. Tile joins the core sitemap, bringing it to ten URLs. Homepage, construction category and these three tools have material updates dated September 30. No search-volume or revenue forecast is implied.
