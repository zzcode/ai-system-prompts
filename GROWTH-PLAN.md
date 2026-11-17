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


## November 17: restore a real legacy tool and test complete workflows

A migration review found that `/tools/excel-to-json` and its `.html` variant were redirected to an unrelated calculator homepage. Restore useful functionality at the original canonical route; permanently map only its HTML alias. Remove the generic `/tools/:path*` and `/blog-:slug*` homepage fallbacks. Keep matching date/terms mappings. A URL classified as a redirect does not itself need to be indexed; inspect its destination.

The restored converter accepts local XLSX/UTF-8 CSV files, selects worksheets, handles blank/duplicate headers without overwriting columns, preserves CSV identifiers as strings and supports JSON copy/download. It does not upload file contents. A small public sample workbook contains invented data.

The new material planner serves a distinct task, not another numeric keyword variant. It combines matching product quantities before purchasing-rounding, provides per-product prices and a clearly incomplete subtotal when quotes are absent, supports optional local saving and CSV/print output, and connects to existing concrete/tile/paint tools. Whole US gallons are the paint purchase unit; different products/finishes remain separate. Material pages remove ads for the initial usability experiment.

### Operating priorities

1. Verify production routes, migration destinations, core sitemap and local input handling after release. Submit only a few changed core URLs after successful live testing; record request status separately from actual indexing.
2. Revisit completed, comparable reporting periods. Inspect last crawl, actual indexed status, non-brand impressions, clicks and destination URLs. GSC validation passed is not a guarantee of inclusion. Avoid repeated indexing requests for unchanged pages.
3. Measure actual tasks with `material_plan_action` (add/update area, save, load, export, print). These events exclude all raw inputs and follow the site's existing analytics setup; respect Do Not Track and Global Privacy Control for these new events. Do not optimize for ad clicks.
4. Test real tasks with 5–10 intended users. Prepare demonstrations and relevant outreach drafts, but send messages only with explicit authorization. Do not buy traffic, links or ads without a specified budget.
5. Review the two product hypotheses separately: recovered file conversion and material shopping lists. Keep indexed/used legacy pages stable. After six weeks of sufficient product and distribution work, retain what users use and reconsider weak directions; six weeks does not establish SEO's long-term ceiling.
6. Keep changes small, run all repository checks, inspect responsive UI and preserve rollback through Git. Store private account data outside the public repo. Do not infer demand or income from successful builds, sitemap acceptance, a single ranking or tiny revenue samples.

This release also updates the obsolete Astro build toolchain and aligns CI with Node 24. This is maintenance, not a claim that framework upgrades improve Google rankings.
