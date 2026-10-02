---
version: 1
slug: "views-admin-dashboard-ejs"
primary_target: "views/admin/dashboard.ejs"
related_targets: []
---

# Surface brief: admin panel

Mode: Operate. Owner of a small LPG shop, mostly on a phone, daylight, mid-call; sometimes at a desk. Tasks: record a sale, check stock, update order status, watch vendor yearly purchase limits. Constraints: Express + EJS, plain CSS, no JS framework, content full-width on desktop.

## Direction contract

THESIS: The admin is a well-kept counter ledger, not a card dashboard. Hairline-ruled rows, big tabular figures and one live accent replace boxed cards.

OWN-WORLD: Warm paper-grey ground (#f6f5f2), white ruled surfaces, ink #14110f, hairlines #e7e3dc, one flame-orange accent used only for the live thing (primary action, today, active nav). Geist for everything; large semibold tabular numerals; 1px rules and 14px radii; soft single-layer shadows. Light rail on desktop, floating tab bar on phone.

STORY: The owner sees today's takings and what needs attention within a second, records a sale in under ten seconds, and is warned before a vendor limit is crossed.

FIRST VIEWPORT: Desktop: light left rail (232px), full-width content. Page title left, "Record sale" primary right. Below, a single four-cell KPI strip divided by hairlines (today's sales, yet to receive, pending orders, running low), then a 7-day sales bar chart (today in orange) beside a restock list. Phone: top bar, KPI cells in a 2x2 grid, floating bottom tab bar.

FORM: Counter ledger. Seed: none (user declined the direction round; chose by judgement, ordered first on my own list).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
