---
name: lookup-domain-whois-rdap-info
description: "Look up domain WHOIS/RDAP info and check marketplace listings. Free API, no auth required."
category: "Development"
author: community
version: "1.2.0"
icon: code
---

# domaindetails

Domain lookup and marketplace search. Free API, just curl.

## Domain Lookup

```bash
curl -s "https://mcp.domaindetails.com/lookup/example.com" | jq
```

Returns: registrar, created/expires dates, nameservers, DNSSEC, contacts.

## Marketplace Search

```bash
curl -s "https://api.domaindetails.com/api/marketplace/search?domain=example.com" | jq
```

Returns listings from: Sedo, Afternic, Atom, Dynadot, Namecheap, NameSilo, Unstoppable Domains.

## Rate Limits

- 100 requests/minute (no auth needed)

## CLI (Optional)

```bash
npx domaindetails example.com
```
