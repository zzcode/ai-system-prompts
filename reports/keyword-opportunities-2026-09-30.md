# Keyword opportunities: September 30, 2026

## Decision and confidence

Focus this release on three existing English construction tools. These queries describe material-planning tasks before a purchase, fit the current product, and can be served with verifiable calculations. This is a qualitative opportunity assessment, not a paid keyword-volume study. Search volume, CPC, keyword difficulty and expected AdSense RPM are **not available**. Search results show competition, not proof of demand magnitude or easy rankings. Buying intent does not guarantee ad clicks or revenue.

The site's existing Search Console review informs prioritization, but this report does not claim that the candidate phrases already receive impressions. Account-specific metrics stay outside the public repository.

## Query-to-page mapping

| Priority | Query cluster | Existing destination | User need and implementation | Evidence / limitation |
|---|---|---|---|---|
| 1 | concrete bag calculator; how many 80 lb bags of concrete for a 10x10 slab; concrete calculator 12x12 slab; 60 lb concrete bag calculator | /construction/concrete-calculator | Compare 40/50/60/80 lb yields, slab sizes and allowance. Worked table uses the same calculation as the tool. | Manufacturer bag calculator and yield data establish the task and formula. Generic concrete terms face established competition. |
| 1 | tile calculator boxes; 12x24 tile calculator; how many boxes of tile do I need; backsplash tile calculator | /construction/tile-calculator | Actual pack count, adjustable allowance, whole-box purchase and optional quoted cost. 100 sq ft floor and subway-tile backsplash examples. | Current results explicitly feature size and box-count tools. Differentiate through accurate rounding and clear product assumptions, not a new URL per size. |
| 2 | paint calculator two coats; how much paint for a 12x12 room; paint calculator walls and ceiling | /construction/paint-calculator | Editable opening sizes and optional ceiling, product coverage and coat count; walls-only versus ceiling example. | BEHR's own calculator separates surfaces and coat coverage. Manufacturer tools are strong competition; narrow scenario relevance remains a hypothesis. |
| Later research | gravel driveway calculator tons and cost | No new page in this release | Requires supplier-specific density and compaction assumptions plus distinct functionality. | Search results are crowded with specialist calculators. Do not expand solely because the topic sounds commercial. |

## Research sources (checked September 30, 2026)

- [QUIKRETE calculator](https://www.quikrete.com/calculator/main.asp): manufacturer example of slab/bag planning intent.
- [QUIKRETE Concrete Mix data sheet](https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf): approximate yields for each bag size, used by the implementation.
- [BEHR coverage calculator](https://www.behr.com/pro/products/paint-and-stain-calculator): room measurements, openings, surfaces and per-coat coverage.
- [Tile carton planning guide hosted by The Home Depot](https://www.homedepot.com/catalog/pdfImages/3e/3e604f2d-eba8-40cf-93bc-48de440622da.pdf): product-specific carton quantities and overage.
- [12x24 competitor result](https://tilecalcs.com/tile-sizes/12x24/): observed query intent and competition only; not used as an authority for installation advice.
- [Gravel competitor result](https://numeravo.com/construction/gravel-driveway-calculator): observed competition only; no volume or ranking forecast inferred.

## Changes shipped in this cohort

- Titles and descriptions match the implemented features; questions are answered in visible content and existing FAQ structured data.
- Corrected tile double-rounding / floating-point overcounts and the hardcoded 10-piece box assumption. Removed unsupported grout-estimate promises.
- Added manufacturer references, explicit units and scope, interactive examples, optional supplier prices and invalid-input clearing.
- Updated homepage and construction-category links plus site-search descriptions.
- Kept the same tool URLs; no doorway pages or numeric URL expansion. Core sitemap now includes tile, and lastmod changes only for the five materially edited pages.

## Review plan

After Google recrawls the changed pages, compare two complete, equivalent 28-day periods. Start with a 14-day diagnostic review of crawl/index status and impressions; treat low counts as insufficient evidence rather than failure.

1. In Search Console, filter each exact landing page and Web search. Record report date, last crawl, indexing, impressions, clicks, CTR, country and device. Use query filters such as `concrete|slab|bags`, `tile|backsplash|12.?24`, `paint|ceiling|coats`. An empty query table can reflect privacy thresholds.
2. If unindexed, inspect crawl/technical signals before changing keywords. If indexed with impressions but weak CTR, review actual queries and snippets. If indexed without impressions after sufficient observation, reassess intent and competition; do not generate more variants automatically.
3. Keep an independent AdSense site/page view: page views, coverage, estimated earnings and page RPM, compared over the same completed dates. More clicks in Search Console alone do not establish higher advertising revenue.
4. Expand only when query evidence reveals a distinct task the current tools cannot satisfy. Avoid repeated indexing requests for unchanged URLs.

This is a documented review plan, not an automatically scheduled monitor.

## Release validation

- 74 automated tests passed, including area-before-rounding, variable packs, zero/blank optional prices, bag yields, custom paint openings, ceiling inclusion and invalid-input clearing.
- Production build and internal-link/sitemap validation passed for 268 HTML pages; SEO audit passed for all 50 tools.
- Browser checks exercised all eight scenario buttons across the three tools, tile box pricing, invalid tile packs, blank paint coverage and zero concrete allowance.
- At 375 px, all three pages had no document horizontal overflow. Desktop concrete layout verified at 1280 px. Local testing disabled ad/analytics services.
