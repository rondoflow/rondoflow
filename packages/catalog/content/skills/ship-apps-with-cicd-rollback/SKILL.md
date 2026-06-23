---
name: ship-apps-with-cicd-rollback
description: "Ship applications reliably with CI/CD, rollback strategies, and zero-downtime deployment patterns."
category: "DevOps & Infra"
author: community
version: "1.0.0"
icon: server
---

# Deployment Rules

## Pre-Deploy Checklist
- Tests passing in CI — never deploy with failing tests
- Environment variables set in target — missing secrets cause silent failures
- Database migrations run before code deploy — new code expecting new schema fails
- Rollback plan ready — know exactly how to revert before you need to

## Deployment Strategies
- **Rolling**: update instances one by one — safe, slower, no extra resources
- **Blue-green**: full parallel environment, instant switch — fast rollback, 2x resources
- **Canary**: route percentage to new version — catch issues early, complex routing
- Choose based on risk tolerance and resources — no universal best

## Zero-Downtime Deploys
- Health checks must pass before traffic routes — unhealthy instances stay out
- Graceful shutdown: finish in-flight requests before terminating
- Database changes must be backwards compatible — old code still running during deploy
- Session handling: sticky sessions or external session store — don't lose user state

## CI/CD Pipeline
- Build once, deploy everywhere — same artifact to staging and prod
- Cache dependencies between builds — save minutes per deploy
- Parallel steps where possible — tests, linting, security scans
- Fail fast: quick checks first — don't wait for slow tests to catch typos
- Pin action versions with SHA — tags can change unexpectedly

## Environment Management
- Staging mirrors prod — different configs cause "works in staging" bugs
- Secrets in secret manager, not environment files — rotation without redeploy
- Feature flags decouple deploy from release — ship dark, enable later
- Config as code in version control — except secrets

## Database Migrations
- Migrations must be backwards compatible during deploy window
- Add columns nullable first, then backfill, then add constraint
- Never rename columns in one step — add new, migrate data, remove old
- Test migrations on prod-size data — 10 rows is fast, 10 million isn't
- Rollback script for every migration

## Rollback
- Automated rollback on health check failure
- Keep previous version artifacts available — can't rollback what you deleted
- Database rollbacks are hard — design migrations to not need them
- Feature flags for instant rollback of functionality without deploy
- Document rollback procedure — panic time is not learning time

## Monitoring Post-Deploy
- Watch error rates for 15 minutes after deploy — most issues surface quickly
- Compare key metrics to pre-deploy baseline
- Alerting on anomalies: latency spike, error rate increase
- Log correlation: trace requests through systems
- User-facing smoke tests after deploy

## Platform-Specific

### Containers
- Image tagged with git SHA — know exactly what's running
- Health check endpoint that verifies dependencies
- Resource limits set — prevent runaway containers

### Serverless
- Cold start optimization — keep bundles small
- Provisioned concurrency for latency-sensitive paths
- Timeout set appropriately — default is often too short

### Static Sites
- CDN cache invalidation after deploy
- Immutable assets with content hashes — cache forever
- Preview deploys for PRs

## Common Mistakes
- Deploying Friday afternoon — issues surface when nobody's watching
- No rollback plan — hoping nothing goes wrong isn't a strategy
- Mixing code and migration deploys — one thing at a time
- Manual deploy steps — if it's not automated, it's wrong sometimes
- Deploying without monitoring — you won't know it's broken until users complain
