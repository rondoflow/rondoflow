---
name: avoid-common-grafana-mistakes
description: "Avoid common Grafana mistakes — query pitfalls, variable templating, alerting traps, and provisioning gotchas."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

## Variables and Templating
- Multi-value variable needs `$__all` in regex — or only first value used
- `${var:csv}` for comma-separated — `${var:pipe}` for pipe-separated in regex
- Variable in query: `$var` or `${var}` — different escaping per data source
- `$__interval` auto-adjusts to time range — use for aggregation window
- Chained variables: child depends on parent — set "Refresh" to "On time range change"

## Prometheus Queries
- `rate()` needs range vector — `rate(requests_total[5m])` not `rate(requests_total)`
- `rate()` for counters, `deriv()` for gauges — rate handles counter resets
- `$__rate_interval` over hardcoded — adapts to scrape interval and dashboard range
- Labels in legend: `{{label}}` — multiple: `{{instance}} - {{job}}`
- Regex filter: `metric{label=~"val1|val2"}` — `!~` for negative match

## Panel Configuration
- "No data" vs "null" are different — configure in display options
- Thresholds work on last value — not all values in range
- Min/max must match your data range — auto-scaling can hide anomalies
- Time series for trends, stat for current value — choose visualization wisely

## Alerting
- Alert evaluates on server — not browser, query must work without variables
- Variables not supported in alerts — hardcode values or use templates
- Multiple conditions: AND is default — configure for OR if needed
- Alert state "Pending" before "Firing" — for duration, prevents flapping
- Notification channel must be configured — alert without channel = no notification

## Dashboard Provisioning
- JSON export includes data source UID — will fail if different on import
- Use data source variables — `${DS_PROMETHEUS}` substituted at runtime
- Provisioned dashboards read-only by default — `allowEditing: true` in provisioning
- Folder must exist before dashboard provisioning — or import fails silently

## Data Sources
- "Server" mode proxies through Grafana — hides credentials from browser
- "Browser" mode direct from browser — faster but exposes URL/auth
- Test connection catches most issues — but not query-specific problems
- TLS skip verify for self-signed — but fix proper certs for production

## Transformations
- Order matters — transformations apply in sequence
- Outer join for combining queries — match on time or label
- Reduce for aggregating time series — last, mean, max, etc.
- Add field from calculation — combine metrics client-side

## Common Mistakes
- Time range selector affects variable queries — unexpected results with "All time"
- Dashboard saved but datasource not — works locally, breaks on import
- Alert rule in dashboard vs Grafana alerting — different systems, don't mix
- Panel queries run on every refresh — high-cardinality queries slow dashboard
- Annotation queries add DB load — use sparingly on busy dashboards
