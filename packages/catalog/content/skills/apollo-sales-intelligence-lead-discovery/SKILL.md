---
name: apollo-sales-intelligence-lead-discovery
description: "Sales intelligence and lead discovery via Apollo.io's REST API."
category: "Development"
author: community
version: "1.0.0"
icon: code
---

# Apollo.io Skill

Sales intelligence and lead discovery via Apollo.io's REST API.

## Setup

1. Get your API key from [Apollo Settings → API](https://apollo.io/settings/api)
2. Set environment variable: `export APOLLO_API_KEY=your_key_here`

## Capabilities

### People Search
Find prospects by job title, location, company, and more.

```bash
python <skill>/scripts/search_people.py --title "VP Engineering" --company Stripe
```

### Person Enrichment
Enrich a person's data from email or LinkedIn URL.

```bash
python <skill>/scripts/enrich_person.py --email john@example.com
python <skill>/scripts/enrich_person.py --linkedin https://linkedin.com/in/johndoe
```

### Company Search
Find companies by industry, size, location.

```bash
python <skill>/scripts/search_companies.py --industry "Software" --size "50-200"
```

### Company Enrichment
Enrich company data by domain or name.

```bash
python <skill>/scripts/enrich_company.py --domain stripe.com
```

## Usage

The agent will use these scripts automatically when you ask about:
- Finding contacts at specific companies
- Looking up email addresses or phone numbers
- Researching company details
- Prospecting by job title/industry

## API Reference

- [Apollo API Docs](https://docs.apollo.io/)
- Base URL: `https://api.apollo.io/v1`
- Auth: `X-Api-Key` header
