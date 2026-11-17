# KodaTools

Free browser tools at https://www.kodatools.com, built with Astro and deployed as static files on Vercel.

## Current product

- The original `/tools/excel-to-json` route provides a working local XLSX/CSV converter. Its `.html` alias redirects to that tool rather than the homepage.
- `/construction/material-planner` combines compatible products across areas before rounding purchases. It supports editing, local saving, CSV export and printing.
- Concrete, tile and paint calculators transfer valid measurements into the planner without putting input values in URLs.
- Existing calculators and 205 numeric conversion routes remain available. Numeric page expansion is paused; new pages need a distinct user task.
- The planner, restored file converter and three material calculators do not load AdSense. Other pages retain their existing ad configuration.

## Development

Use Node 24 LTS (`.nvmrc`). The project pins Node 24 for Vercel and CI; Astro requires at least Node 22.23.4.

```sh
npm ci
npm test
npm run build
npm run check:build
npm run audit:seo
```

Build output is `dist/`. Vercel uses `npm run build` and `dist`; keep the existing production branch and custom domain. `vercel.json` contains the reviewed legacy mappings. Removed content without a relevant replacement returns a real 404; do not restore broad redirects to the homepage.

For a local preview without ads or analytics:

```sh
PUBLIC_EXTERNAL_SERVICES=off npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

Use a normal production build before publication. Preview deployments also disable external services using `VERCEL_ENV`.

## Content and discovery

`src/data/tools.json` is the search/category registry. A tool outside its category URL tree must declare `categoryHref`. Add actual tools to both the registry and `src/pages/sitemap.xml.ts`; record only material content update dates in `src/data/search-focus.js`. The core sitemap is a reporting cohort, not a Google priority instruction.

## Data handling

All calculations and file parsing happen on the device. The material planner uses session storage for the current tab draft and temporary calculator transfers, and local storage only when the user explicitly saves. Saved plan format is versioned and validated. CSV exports escape spreadsheet formula prefixes.

`material_plan_action` analytics events contain fixed action names and material types only. Never send project names, product names, measurements, prices, file names or spreadsheet contents. External services are disabled for local QA. Keep private Search Console, GA4 and AdSense records outside this public repository.

See `GROWTH-PLAN.md` for the evidence-based review process and current rollout.
